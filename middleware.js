import { auth } from '@/lib/auth.js';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Public routes that don't need auth
  const publicPaths = [
    '/sign-in',
    '/api/auth',
    '/api/health',
    '/api/public',
    '/api/dev/login',
    '/api/stripe/webhook',
    '/api/inngest',
    '/api/t/',
    '/s/',
  ];

  const isPublic = publicPaths.some((p) => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  // If not authenticated, redirect to sign-in
  if (!req.auth) {
    const signInUrl = new URL('/sign-in', req.nextUrl.origin);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all routes except static files and _next internals
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
