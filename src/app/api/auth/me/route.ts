import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth-utils';
import { getPool } from '@/lib/neon/server';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('admin_access_token')?.value;
  if (!token) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }

  const payload = await verifyAccessToken(token);
  if (!payload) {
    return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 });
  }

  const pool = getPool();
  const result = await pool.query(
    `SELECT id, email, full_name, role, assigned_tracks
     FROM users WHERE id = $1`,
    [payload.userId]
  );

  const user = result.rows[0];
  if (!user) {
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      assignedTracks: user.assigned_tracks || [],
    },
  });
}
