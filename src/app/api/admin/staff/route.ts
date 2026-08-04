import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { Pool } from 'pg';

export const GET = withAdminAuth(async (_req: NextRequest, pool: Pool) => {
  const { searchParams } = new URL(_req.url);
  const track = searchParams.get('track');

  const conditions: string[] = [
    `UPPER(BTRIM(role::text)) IN ('ADMIN', 'STAFF', 'SUPER_ADMIN', 'TUTOR')`,
  ];
  const params: unknown[] = [];
  let paramIdx = 1;

  if (track) {
    conditions.push(`assigned_tracks @> $${paramIdx}::text[]`);
    params.push(`{${track}}`);
  }

  const whereClause = conditions.join(' AND ');
  const sql = `SELECT id, email, full_name, role, assigned_tracks, student_code, is_verified, payment_status, created_at
               FROM users
               WHERE ${whereClause}
               ORDER BY created_at DESC`;

  const countRes = await pool.query(
    `SELECT COUNT(*) as count FROM users WHERE ${whereClause}`,
    params
  );
  const count = parseInt(countRes.rows[0].count, 10);

  const { rows: users } = await pool.query(sql, params);

  const transformedStaff = users.map((user) => ({
    id: user.id,
    name: user.full_name || user.email?.split('@')[0] || 'Unknown user',
    email: user.email || '',
    role: (user.role || 'STAFF').toString().trim().toLowerCase(),
    assignedTracks: Array.isArray(user.assigned_tracks) ? user.assigned_tracks : [],
    studentCode: user.student_code,
    status: user.is_verified ? 'active' : 'invited',
    joinedDate: user.created_at,
  }));

  return NextResponse.json({
    success: true,
    data: transformedStaff,
    total: count,
    page: 1,
    pageSize: 50,
  });
});
