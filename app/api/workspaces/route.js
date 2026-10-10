import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth.js';
import { createWorkspace } from '@/modules/workspaces/service.js';

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Not signed in' } }, { status: 401 });
  }

  try {
    const body = await request.json();
    const workspace = await createWorkspace(session.user.id, body);
    return NextResponse.json({ ok: true, workspace }, { status: 201 });
  } catch (error) {
    if (error.code) {
      return NextResponse.json(error.toJSON(), { status: error.status });
    }
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'Internal error' } }, { status: 500 });
  }
}
