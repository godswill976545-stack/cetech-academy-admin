import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { Pool } from 'pg';

export const DELETE = withAdminAuth(async (req: NextRequest, pool: Pool, user: any) => {
  const segments = req.nextUrl.pathname.split('/');
  const id = segments[segments.length - 1];

  if (!id) {
    return NextResponse.json({ success: false, error: 'Invalid invitation ID' }, { status: 400 });
  }

  if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, error: 'Only admins can revoke invitations' },
      { status: 403 }
    );
  }

  await pool.query(
    `DELETE FROM admin_invitations WHERE id = $1`,
    [id]
  );

  return NextResponse.json({ success: true });
});
