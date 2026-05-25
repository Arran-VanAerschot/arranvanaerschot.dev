import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith('/admin') || pathname === '/admin/login') {
    return NextResponse.next();
  }
  const cookieName = process.env.NODE_ENV === 'production' ? '__Host-session' : 'session';
  const token = request.cookies.get(cookieName)?.value;
  if (!token) return NextResponse.redirect(new URL('/admin/login', request.url));
  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET!);
    await jwtVerify(token, secret);
  } catch {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*'] };
