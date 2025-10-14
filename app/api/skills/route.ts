import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { z, ZodError } from 'zod';
import { Prisma } from '@prisma/client';

const skillSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  category: z.string().min(2),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  type: z.enum(['offer', 'want']),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');

    const where: Prisma.SkillWhereInput = {};
    if (userId) where.userId = userId;
    if (type) where.type = type;

    const skills = await prisma.skill.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(skills);
  } catch (error) {
    console.error('GET skills error:', error);
    return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = skillSchema.parse(body);

    const skill = await prisma.skill.create({
      data: {
        ...data,
        userId: session.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(skill);
  } catch (error) {
    if (error instanceof ZodError) {
      // Return the full Zod issues objects (path, message, code) so frontend can show field-specific messages.
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
      // If you prefer just an array of messages:
      // return NextResponse.json({ error: 'Invalid input', details: error.issues.map(i => i.message) }, { status: 400 });
    }
    console.error('POST skill error:', error);
    return NextResponse.json({ error: 'Failed to create skill' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Skill ID required' }, { status: 400 });
    }

    const skill = await prisma.skill.findUnique({ where: { id } });

    if (!skill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    if (skill.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate partial data with the schema's partial() variant
    const validated = skillSchema.partial().parse(data);

    const updated = await prisma.skill.update({
      where: { id },
      data: validated,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }
    console.error('PUT skill error:', error);
    return NextResponse.json({ error: 'Failed to update skill' }, { status: 500 });
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
      return NextResponse.json({ error: 'Skill ID required' }, { status: 400 });
    }

    const skill = await prisma.skill.findUnique({ where: { id } });

    if (!skill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    if (skill.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.skill.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Skill deleted' });
  } catch (error) {
    console.error('DELETE skill error:', error);
    return NextResponse.json({ error: 'Failed to delete skill' }, { status: 500 });
  }
}
