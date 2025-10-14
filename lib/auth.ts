import { SignJWT, jwtVerify, JWTPayload as JoseJWTPayload } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

// 🔐 Create a strongly typed payload for your app
export interface AppJWTPayload extends JoseJWTPayload {
  userId: string;
  email: string;
}

// Secret key (must be at least 32 bytes)
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'change-this-secret-in-production'
);

// -----------------------------------------------------
// Password utilities
// -----------------------------------------------------
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// -----------------------------------------------------
// JWT utilities
// -----------------------------------------------------
export async function createToken(payload: AppJWTPayload): Promise<string> {
  // Don't pass jose default fields (iat, exp) manually — jose sets them for you
  const { userId, email } = payload;
  return new SignJWT({ userId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(SECRET_KEY);
}

export async function verifyToken(token: string): Promise<AppJWTPayload | null> {
  try {
    const { payload } = await jwtVerify<AppJWTPayload>(token, SECRET_KEY);
    return payload;
  } catch {
    return null;
  }
}

// -----------------------------------------------------
// Cookie helpers
// -----------------------------------------------------
export async function getSession(): Promise<AppJWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
}
