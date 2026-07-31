import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { Pool } from 'pg';

export const GET = withAdminAuth(async (_req: NextRequest, pool: Pool) => {
  const { searchParams } = new URL(_req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');
  const status = searchParams.get('status');
  const track = searchParams.get('track');

  const conditions: string[] = [`role = 'STUDENT'`];
  const params: unknown[] = [];
  let paramIdx = 1;

  if (status) {
    conditions.push(`payment_status = $${paramIdx++}`);
    params.push(status);
  }

  if (track && track !== 'all') {
    conditions.push(`assigned_tracks @> $${paramIdx}::text[]`);
    params.push(`{${track}}`);
  }

  const whereClause = conditions.join(' AND ');
  const offset = (page - 1) * pageSize;

  const sql = `SELECT id, email, full_name, role, assigned_tracks, payment_status, is_verified, student_code, created_at
               FROM users
               WHERE ${whereClause}
               ORDER BY created_at DESC
               LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`;

  params.push(pageSize, offset);

  const countRes = await pool.query(
    `SELECT COUNT(*) as count FROM users WHERE ${whereClause}`,
    params.slice(0, paramIdx - 1)
  );
  const count = parseInt(countRes.rows[0].count);

  const { rows: users } = await pool.query(sql, params);

  const transformed = users.map(user => {
    const assignedTracks = user.assigned_tracks || [];
    return ({
      id: user.id,
      name: user.full_name || user.email.split('@')[0],
      email: user.email,
      track: assignedTracks[0] || '',
      cohort: '',
      status: user.payment_status === 'paid' ? 'active' : 'payment_due',
      paymentStatus: user.payment_status || 'unpaid',
      studentCode: user.student_code || '',
      joinedDate: user.created_at,
    });
  });

  return NextResponse.json({
    success: true,
    data: transformed,
    total: count,
    page,
    pageSize,
  });
});

export const POST = withAdminAuth(async (req: NextRequest, pool: Pool) => {
  const { email, fullName, role, assignedTracks, paymentStatus, isVerified, studentCode } = await req.json();

  const existingRes = await pool.query(
    `SELECT id FROM users WHERE email = $1`,
    [email]
  );

  if (existingRes.rows.length > 0) {
    return NextResponse.json(
      { success: false, error: 'User with this email already exists' },
      { status: 409 }
    );
  }

  const insertRes = await pool.query(
    `INSERT INTO users (id, email, full_name, role, assigned_tracks, payment_status, is_verified, student_code, created_at)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW())
     RETURNING *`,
    [email, fullName, role || 'STUDENT', assignedTracks || [], paymentStatus || 'unpaid', isVerified || false, studentCode]
  );

  return NextResponse.json(
    { success: true, data: insertRes.rows[0] },
    { status: 201 }
  );
});
