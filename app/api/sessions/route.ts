import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { z, ZodError } from 'zod';
import { Prisma } from '@prisma/client';

const sessionSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  skillId: z.string(),
  date: z.string(),
  duration: z.number().min(15).max(480),
  mode: z.enum(['online', 'in-person']),
  maxParticipants: z.number().min(1).max(50),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const where: Prisma.SessionWhereInput = {};
    if (userId) {
      where.OR = [
        { hostId: userId },
        { participants: { some: { userId: userId } } },
      ];
    }

    const sessions = await prisma.session.findMany({
      where,
      include: {
        host: { select: { id: true, name: true, email: true } },
        skill: true,
        participants: { 
          include: {
            user: { select: { id: true, name: true } }
          }
        },
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('GET sessions error:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = sessionSchema.parse(body);

    const sessionDate = new Date(data.date);
    const newSession = await prisma.session.create({
      data: {
        ...data,
        date: sessionDate,
        startTime: sessionDate,
        hostId: session.userId,
        joinLink: data.mode === 'online' ? `https://meet.jit.si/skillswap-${Date.now()}` : '',
      },
      include: {
        host: { select: { id: true, name: true, email: true } },
        skill: true,
      },
    });

    return NextResponse.json(newSession);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues }, // ✅ FIXED HERE
        { status: 400 }
      );
    }
    console.error('POST session error:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    const sessionData = await prisma.session.findUnique({ where: { id } });

    if (!sessionData) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (sessionData.hostId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.session.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Session deleted' });
  } catch (error) {
    console.error('DELETE session error:', error);
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
  }
}
