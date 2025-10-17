import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

const joinSchema = z.object({
  sessionId: z.string(),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { sessionId } = joinSchema.parse(body);

    // Check if session exists and is not full
    const sessionData = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        participants: true,
      },
    });

    if (!sessionData) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Check if user is already a participant
    const existingParticipant = await prisma.participant.findFirst({
      where: {
        sessionId,
        userId: session.userId,
      },
    });

    if (existingParticipant) {
      return NextResponse.json({ error: 'Already joined this session' }, { status: 400 });
    }

    // Check if session is full
    if (sessionData.participants.length >= sessionData.maxParticipants) {
      return NextResponse.json({ error: 'Session is full' }, { status: 400 });
    }

    // Add user as participant
    await prisma.participant.create({
      data: {
        sessionId,
        userId: session.userId,
        role: 'ATTENDEE',
      },
    });

    return NextResponse.json({ success: true, message: 'Successfully joined session' });
  } catch (error) {
    console.error('Join session error:', error);
    return NextResponse.json({ error: 'Failed to join session' }, { status: 500 });
  }
}
