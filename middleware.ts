import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;
  
  const publicRoutes = ['/login', '/register', '/'];
  const isPublicRoute = publicRoutes.includes(pathname);
  
  const protectedApiRoutes = ['/api/skills', '/api/sessions', '/api/dashboard', '/api/ai'];
  const isProtectedApi = protectedApiRoutes.some(route => pathname.startsWith(route));
  
  // Allow public access to skills API for fetching available skills
  const isPublicSkillsApi = pathname.startsWith('/api/skills') && request.nextUrl.searchParams.get('type') === 'offer';
  
  const protectedPages = ['/dashboard', '/skills', '/sessions', '/matches', '/profile'];
  const isProtectedPage = protectedPages.some(route => pathname.startsWith(route));
  
  if ((isProtectedPage || (isProtectedApi && !isPublicSkillsApi)) && !token) {
    if (isProtectedApi && !isPublicSkillsApi) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (token) {
    const payload = await verifyToken(token);
    
    if (!payload && (isProtectedPage || (isProtectedApi && !isPublicSkillsApi))) {
      if (isProtectedApi && !isPublicSkillsApi) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
    
    if (payload && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
};