import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [skillsOffered, skillsWanted, sessionsHosted, sessionsJoined, recentSkills] = await Promise.all([
      prisma.skill.count({ 
        where: { userId: session.userId, type: 'offer' } 
      }),
      prisma.skill.count({ 
        where: { userId: session.userId, type: 'want' } 
      }),
      prisma.session.count({ 
        where: { hostId: session.userId } 
      }),
      prisma.session.count({ 
        where: { participants: { some: { userId: session.userId } } } 
      }),
      prisma.skill.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          category: true,
          level: true,
          type: true,
        }
      }),
    ]);

    return NextResponse.json({
      stats: { 
        skillsOffered, 
        skillsWanted, 
        sessionsHosted, 
        sessionsJoined 
      },
      recentSkills,
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}