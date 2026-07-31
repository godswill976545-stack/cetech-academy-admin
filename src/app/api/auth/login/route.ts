import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/neon/server';
import { verifyPassword } from '@/lib/auth-utils';
import { createSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

const pool = getPool();

    const result = await pool.query(
      `SELECT id, email, full_name, role, password_hash, assigned_tracks
       FROM users
       WHERE email = $1 AND role IN ('ADMIN', 'SUPER_ADMIN', 'STAFF', 'TUTOR')`,
      [email.toLowerCase().trim()]
    );

    const user = result.rows[0];

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!user.password_hash) {
      return NextResponse.json(
        { success: false, error: 'Your account has not been set up yet. Please accept your invitation first.' },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const res = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        assignedTracks: user.assigned_tracks || [],
      },
    });

    const userAgent = req.headers.get('user-agent') || undefined;
    await createSession(res, user.id, userAgent);

    return res;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
