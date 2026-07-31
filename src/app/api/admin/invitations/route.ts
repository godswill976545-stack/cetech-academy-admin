import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { Pool } from 'pg';
import { generateInviteToken } from '@/lib/auth-utils';
import { sendInviteEmail } from '@/lib/email';

export const GET = withAdminAuth(async (_req: NextRequest, pool: Pool) => {
  const { rows: invitations } = await pool.query(
    `SELECT id, email, role, assigned_tracks, expires_at, accepted_at, created_at
     FROM admin_invitations
     WHERE accepted_at IS NULL
     ORDER BY created_at DESC`
  );

  return NextResponse.json({ success: true, data: invitations || [] });
});

export const POST = withAdminAuth(async (req: NextRequest, pool: Pool, user: any) => {
  const { email, role, assignedTracks } = await req.json();

  if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, error: 'Only admins can send invitations' },
      { status: 403 }
    );
  }

  if (role === 'SUPER_ADMIN' && user.role !== 'SUPER_ADMIN') {
    return NextResponse.json(
      { success: false, error: 'Only Super Admins can invite other Super Admins' },
      { status: 403 }
    );
  }

  if (user.role === 'ADMIN' && role !== 'TUTOR') {
    return NextResponse.json(
      { success: false, error: 'Admins can only invite Tutors' },
      { status: 403 }
    );
  }

  if (user.role === 'TUTOR' || user.role === 'STAFF') {
    return NextResponse.json(
      { success: false, error: 'Tutors cannot send invitations' },
      { status: 403 }
    );
  }

  if (!email || !role) {
    return NextResponse.json(
      { success: false, error: 'Email and role are required' },
      { status: 400 }
    );
  }

  const emailLower = email.toLowerCase().trim();

  const existingUserRes = await pool.query(
    `SELECT id FROM users WHERE email = $1`,
    [emailLower]
  );
  if (existingUserRes.rows.length > 0) {
    return NextResponse.json(
      { success: false, error: 'A user with this email already exists' },
      { status: 409 }
    );
  }

  const existingInviteRes = await pool.query(
    `SELECT id FROM admin_invitations
     WHERE email = $1 AND accepted_at IS NULL AND expires_at > NOW()`,
    [emailLower]
  );
  if (existingInviteRes.rows.length > 0) {
    return NextResponse.json(
      { success: false, error: 'A pending invitation already exists for this email' },
      { status: 409 }
    );
  }

  const token = generateInviteToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const insertRes = await pool.query(
    `INSERT INTO admin_invitations (email, role, invited_by, token, assigned_tracks, expires_at, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     RETURNING id, email, role, token, expires_at, created_at`,
    [emailLower, role, user.id, token, assignedTracks || []]
  );

  const invitation = insertRes.rows[0];

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cetech-academy-admin.vercel.app';
  const inviteLink = `${baseUrl}/invite/accept?token=${token}`;

  const emailResult = await sendInviteEmail({
    to: emailLower,
    inviterName: user.fullName || user.email,
    role,
    inviteLink,
  });

  if (!emailResult.success) {
    console.error('Failed to send invitation email:', emailResult.error);
  }

  return NextResponse.json({
    success: true,
    data: {
      ...invitation,
      inviteLink,
      emailSent: emailResult.success,
      emailError: emailResult.success ? undefined : emailResult.error,
    },
  }, { status: 201 });
});
