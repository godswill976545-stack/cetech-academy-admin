import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { hashPassword, verifyPassword } from '@/lib/auth-utils';
import { Pool } from 'pg';

export const POST = withAdminAuth(async (req: NextRequest, pool: Pool, user: any) => {
  const { currentPassword, newPassword } = await req.json();

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { success: false, error: 'Current and new passwords are required' },
      { status: 400 }
    );
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { success: false, error: 'New password must be at least 8 characters' },
      { status: 400 }
    );
  }

  const userRes = await pool.query(
    `SELECT password_hash FROM users WHERE id = $1`,
    [user.id]
  );

  if (userRes.rows.length === 0) {
    return NextResponse.json(
      { success: false, error: 'User not found' },
      { status: 404 }
    );
  }

  const passwordHash = userRes.rows[0].password_hash;

  const valid = await verifyPassword(currentPassword, passwordHash);
  if (!valid) {
    return NextResponse.json(
      { success: false, error: 'Current password is incorrect' },
      { status: 401 }
    );
  }

  const newHash = await hashPassword(newPassword);
  await pool.query(
    `UPDATE users SET password_hash = $1 WHERE id = $2`,
    [newHash, user.id]
  );

  await pool.query(
    `DELETE FROM admin_sessions WHERE user_id = $1`,
    [user.id]
  );

  return NextResponse.json({ success: true, message: 'Password updated successfully' });
});
