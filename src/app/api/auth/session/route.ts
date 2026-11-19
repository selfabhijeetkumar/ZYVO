import { NextRequest, NextResponse } from 'next/server';
import { createSession, validateSession, getDemoUsers } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('zyvo_session')?.value;
  let currentUser = null;

  if (token) {
    currentUser = validateSession(token);
  }

  // If no session exists, default to operator for easy demo evaluation
  if (!currentUser) {
    const demoUsers = getDemoUsers();
    currentUser = demoUsers[0] || null;
  }

  return NextResponse.json({
    user: currentUser,
    demoUsers: getDemoUsers(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.userId || (body.role === 'customer' ? 'user_customer_01' : 'user_operator_01');
    
    const { token, expiresAt } = createSession(userId);
    const demoUsers = getDemoUsers();
    const user = demoUsers.find((u) => u.id === userId) || null;

    const res = NextResponse.json({
      success: true,
      user,
      expiresAt,
    });

    res.cookies.set('zyvo_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return res;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
