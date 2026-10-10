import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index.js';
import { users, sessions } from '@/lib/db/schema.js';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

/**
 * DEV-ONLY sign-in route.
 * Signs in as a seeded user by email, creating a database session directly.
 * Enabled ONLY when NODE_ENV !== 'production' AND ALLOW_DEV_LOGIN === 'true'.
 * Returns a session token cookie that Auth.js will recognize.
 */
export async function POST(request) {
  // Hard block: impossible in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 });
  }

  if (process.env.ALLOW_DEV_LOGIN !== 'true') {
    return NextResponse.json({ error: 'Dev login disabled' }, { status: 403 });
  }

  const body = await request.json();
  const email = body?.email?.toLowerCase()?.trim();

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  // Find the user
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Create a database session
  const sessionToken = randomUUID();
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await db.insert(sessions).values({
    sessionToken,
    userId: user.id,
    expires,
  });

  // Set the session cookie
  const response = NextResponse.json({ ok: true, userId: user.id });
  response.cookies.set('authjs.session-token', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires,
  });

  return response;
}
