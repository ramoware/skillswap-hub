import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { findAIMatches, analyzeMatchPatterns, generateMatchNotifications, type MatchPreferences } from '@/lib/ai-matching';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const level = searchParams.get('level');
    const minScore = parseInt(searchParams.get('minScore') || '70');

    // Fetch user's skills
    const userSkills = await prisma.skill.findMany({
      where: { userId: session.userId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    // Fetch all other users' skills
    const allSkills = await prisma.skill.findMany({
      where: { userId: { not: session.userId } },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    // Set up preferences based on query parameters
    const preferences: MatchPreferences = {
      preferredCategories: category ? [category] : undefined,
      preferredLevels: level ? [level] : undefined,
    };

    // Generate AI matches
    const matches = await findAIMatches(
      session.userId,
      userSkills,
      allSkills,
      preferences
    );

    // Filter by minimum score
    const filteredMatches = matches.filter(match => match.compatibilityScore >= minScore);

    // Analyze match patterns
    const analysis = analyzeMatchPatterns(filteredMatches);

    // Generate notifications
    const notifications = generateMatchNotifications(filteredMatches);

    // Get trending skills data
    const trendingSkills = await prisma.skill.groupBy({
      by: ['category'],
      _count: { category: true },
      orderBy: { _count: { category: 'desc' } },
      take: 5,
    });

    return NextResponse.json({
      success: true,
      matches: filteredMatches,
      analysis,
      notifications,
      trendingSkills: trendingSkills.map(ts => ({
        category: ts.category,
        count: ts._count.category,
      })),
      userStats: {
        totalSkills: userSkills.length,
        totalMatches: filteredMatches.length,
        averageCompatibility: analysis.averageCompatibility,
      },
    });
  } catch (error) {
    console.error('Enhanced matches error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enhanced matches' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { targetUserId, skillId, message } = body;

    // Validate required fields
    if (!targetUserId || !skillId) {
      return NextResponse.json(
        { error: 'Target user ID and skill ID are required' },
        { status: 400 }
      );
    }

    // Check if connection request already exists
    const existingRequest = await prisma.connectionRequest.findFirst({
      where: {
        fromUserId: session.userId,
        toUserId: targetUserId,
        skillId: skillId,
        status: { in: ['PENDING', 'ACCEPTED'] },
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: 'Connection request already exists' },
        { status: 400 }
      );
    }

    // Create connection request
    const connectionRequest = await prisma.connectionRequest.create({
      data: {
        fromUserId: session.userId,
        toUserId: targetUserId,
        skillId: skillId,
        message: message || 'Hi! I\'d like to connect with you for skill exchange.',
        status: 'PENDING',
      },
      include: {
        fromUser: { select: { id: true, name: true, email: true } },
        toUser: { select: { id: true, name: true, email: true } },
        skill: { select: { id: true, title: true, category: true } },
      },
    });

    return NextResponse.json({
      success: true,
      connectionRequest,
      message: 'Connection request sent successfully',
    });
  } catch (error) {
    console.error('Connection request error:', error);
    return NextResponse.json(
      { error: 'Failed to send connection request' },
      { status: 500 }
    );
  }
}
