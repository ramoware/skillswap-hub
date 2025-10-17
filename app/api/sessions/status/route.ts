import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

const statusSchema = z.object({
  sessionId: z.string(),
  status: z.enum(['SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED']),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { sessionId, status } = statusSchema.parse(body);

    // Check if user is the host of the session
    const sessionData = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { hostId: true },
    });

    if (!sessionData) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (sessionData.hostId !== session.userId) {
      return NextResponse.json({ error: 'Only the host can update session status' }, { status: 403 });
    }

    // Update session status
    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: { 
        status,
        ...(status === 'LIVE' && { startTime: new Date() }),
        ...(status === 'COMPLETED' && { endTime: new Date() }),
      },
      include: {
        host: { select: { id: true, name: true, email: true } },
        skill: true,
        participants: { 
          include: {
            user: { select: { id: true, name: true } }
          }
        },
      },
    });

    return NextResponse.json({ success: true, session: updatedSession });
  } catch (error) {
    console.error('Update session status error:', error);
    return NextResponse.json({ error: 'Failed to update session status' }, { status: 500 });
  }
}
