import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index.js';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    const result = await db.execute(sql`SELECT 1 as ok`);
    return NextResponse.json({ status: 'ok', db: 'up' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ status: 'degraded', db: 'down' }, { status: 503 });
  }
}
