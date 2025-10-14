import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth';
import { z } from 'zod';
import { ZodError } from "zod";


const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  github: z.string().optional(),
  linkedIn: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);
    
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }
    
    const passwordHash = await hashPassword(validatedData.password);
    
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        passwordHash,
        github: validatedData.github,
        linkedIn: validatedData.linkedIn,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
    
    const token = await createToken({
      userId: user.id,
      email: user.email,
    });
    
    await setAuthCookie(token);
    
    return NextResponse.json({ success: true, user });
  } catch (error) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { errors: error.issues },
      { status: 400 }
    );
  }

  console.error(error);
  return NextResponse.json(
    { message: "Internal server error" },
    { status: 500 }
  );
}
}