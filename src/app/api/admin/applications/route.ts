import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { Pool } from 'pg';

export const GET = withAdminAuth(async (_req: NextRequest, pool: Pool) => {
  const { searchParams } = new URL(_req.url);
  const status = searchParams.get('status');
  const track = searchParams.get('track');

  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIdx = 1;

  if (status) {
    conditions.push(`status = $${paramIdx++}`);
    params.push(status);
  }
  if (track) {
    conditions.push(`track_id = $${paramIdx++}`);
    params.push(track);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const sql = `SELECT id, user_id, track_id, declared_level, status, cohort_id, assessment_slot_id, created_at, updated_at
               FROM applications
               ${whereClause}
               ORDER BY created_at DESC`;

  const { rows: applications, rowCount: count } = await pool.query(sql, params);

  const userIds = applications.map(app => app.user_id).filter(Boolean);
  const trackIds = applications.map(app => app.track_id).filter(Boolean);
  const cohortIds = applications.map(app => app.cohort_id).filter(Boolean);

  const userData: Record<string, any> = {};
  if (userIds.length > 0) {
    const userRes = await pool.query(
      `SELECT id, email, full_name, role, student_code FROM users WHERE id = ANY($1::text[])`,
      [userIds]
    );
    for (const u of userRes.rows) userData[u.id] = u;
  }

  const trackData: Record<string, any> = {};
  if (trackIds.length > 0) {
    const trackRes = await pool.query(
      `SELECT id, name, slug FROM tracks WHERE id = ANY($1::text[])`,
      [trackIds]
    );
    for (const t of trackRes.rows) trackData[t.id] = t;
  }

  const cohortData: Record<string, any> = {};
  if (cohortIds.length > 0) {
    const cohortRes = await pool.query(
      `SELECT id, name, track_id, start_date, end_date, status FROM cohorts WHERE id = ANY($1::text[])`,
      [cohortIds]
    );
    for (const c of cohortRes.rows) cohortData[c.id] = c;
  }

  const transformedApplications = applications.map(app => ({
    id: app.id,
    userId: app.user_id,
    trackId: app.track_id,
    declaredLevel: app.declared_level,
    status: app.status,
    cohortId: app.cohort_id,
    assessmentSlotId: app.assessment_slot_id,
    createdAt: app.created_at,
    updatedAt: app.updated_at,
    user: userData[app.user_id] ? {
      id: userData[app.user_id].id,
      email: userData[app.user_id].email,
      fullName: userData[app.user_id].full_name,
      studentCode: userData[app.user_id].student_code,
    } : null,
    track: trackData[app.track_id] ? {
      id: trackData[app.track_id].id,
      name: trackData[app.track_id].name,
      slug: trackData[app.track_id].slug,
    } : null,
    cohort: app.cohort_id ? cohortData[app.cohort_id] : null,
  }));

  return NextResponse.json({
    success: true,
    data: transformedApplications,
    total: count || 0,
    page: 1,
    pageSize: 50,
  });
});

export const POST = withAdminAuth(async (req: NextRequest, pool: Pool) => {
  const { userId, trackId, declaredLevel, cohortId } = await req.json();

  const userRes = await pool.query(
    `SELECT id, email, full_name, role FROM users WHERE id = $1`,
    [userId]
  );

  if (userRes.rows.length === 0) {
    return NextResponse.json(
      { success: false, error: 'User not found in main database' },
      { status: 404 }
    );
  }

  const trackRes = await pool.query(`SELECT id, name FROM tracks WHERE id = $1`, [trackId]);
  if (trackRes.rows.length === 0) {
    return NextResponse.json(
      { success: false, error: 'Track not found' },
      { status: 404 }
    );
  }

  if (cohortId) {
    const cohortRes = await pool.query(`SELECT id, name, track_id FROM cohorts WHERE id = $1`, [cohortId]);
    if (cohortRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cohort not found' },
        { status: 404 }
      );
    }
  }

  const insertRes = await pool.query(
    `INSERT INTO applications (user_id, track_id, declared_level, cohort_id, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, 'APPLIED', NOW(), NOW())
     RETURNING id, user_id, track_id, declared_level, status, cohort_id, assessment_slot_id, created_at, updated_at`,
    [userId, trackId, declaredLevel, cohortId || null]
  );

  const application = insertRes.rows[0];

  return NextResponse.json(
    { success: true, data: application },
    { status: 201 }
  );
});
