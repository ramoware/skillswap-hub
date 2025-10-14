import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user's skills
    const currentUser = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        skillsOffered: true,
        skillsWanted: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all other users
    const otherUsers = await prisma.user.findMany({
      where: { id: { not: session.userId } },
      include: {
        skillsOffered: true,
        skillsWanted: true,
      },
    });

    // Simple matching algorithm
    const matches = otherUsers
      .map(user => {
        let score = 0;
        const matchReasons = [];

        // Check if they offer what I want
        const theyOfferIWant = currentUser.skillsWanted.filter(myWant =>
          user.skillsOffered.some(theirOffer => 
            theirOffer.category === myWant.category
          )
        );

        // Check if I offer what they want
        const iOfferTheyWant = user.skillsWanted.filter(theirWant =>
          currentUser.skillsOffered.some(myOffer => 
            myOffer.category === theirWant.category
          )
        );

        score += theyOfferIWant.length * 30;
        score += iOfferTheyWant.length * 30;

        if (theyOfferIWant.length > 0) {
          matchReasons.push(`They offer: ${theyOfferIWant.map(s => s.title).join(', ')}`);
        }
        if (iOfferTheyWant.length > 0) {
          matchReasons.push(`They want: ${iOfferTheyWant.map(s => s.title).join(', ')}`);
        }

        return {
          user: {
            id: user.id,
            name: user.name,
            bio: user.bio,
          },
          skillsOffered: user.skillsOffered,
          skillsWanted: user.skillsWanted,
          matchScore: score,
          matchReasons: matchReasons.join(' | '),
        };
      })
      .filter(m => m.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);

    return NextResponse.json({ matches });
  } catch (error) {
    console.error('Match API error:', error);
    return NextResponse.json({ error: 'Failed to find matches' }, { status: 500 });
  }
}