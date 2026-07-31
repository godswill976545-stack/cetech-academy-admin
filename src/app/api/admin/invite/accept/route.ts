import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/neon/server';
import { hashPassword } from '@/lib/auth-utils';
import { createSession } from '@/lib/session';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { token, password, fullName } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: 'Token and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const pool = getPool();

    const inviteRes = await pool.query(
      `SELECT id, email, role, assigned_tracks
       FROM admin_invitations
       WHERE token = $1 AND accepted_at IS NULL AND expires_at > NOW()`,
      [token]
    );

    if (inviteRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired invitation link' },
        { status: 400 }
      );
    }

    const invitation = inviteRes.rows[0];

    const existingUserRes = await pool.query(
      `SELECT id FROM users WHERE email = $1`,
      [invitation.email]
    );

    if (existingUserRes.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const newUserId = crypto.randomUUID();

    const insertRes = await pool.query(
      `INSERT INTO users (id, email, full_name, role, assigned_tracks, password_hash, is_verified, payment_status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, true, 'paid', NOW())
       RETURNING id, email, full_name, role, assigned_tracks`,
      [newUserId, invitation.email, fullName || invitation.email.split('@')[0], invitation.role, invitation.assigned_tracks || []]
    );

    const newUser = insertRes.rows[0];

    await pool.query(
      `UPDATE admin_invitations SET accepted_at = NOW() WHERE id = $1`,
      [invitation.id]
    );

    const res = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.full_name,
        role: newUser.role,
        assignedTracks: newUser.assigned_tracks || [],
      },
    });

    const userAgent = req.headers.get('user-agent') || undefined;
    await createSession(res, newUser.id, userAgent);

    return res;
  } catch (err) {
    console.error('Accept invitation error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
