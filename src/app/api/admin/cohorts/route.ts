import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { Pool } from 'pg';

export const GET = withAdminAuth(async (_req: NextRequest, pool: Pool) => {
  const { searchParams } = new URL(_req.url);
  const track = searchParams.get('track');
  const status = searchParams.get('status');

  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIdx = 1;

  if (track) {
    conditions.push(`track_id = $${paramIdx++}`);
    params.push(track);
  }
  if (status) {
    conditions.push(`status = $${paramIdx++}`);
    params.push(status);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const countSql = `SELECT COUNT(*) as count FROM cohorts ${whereClause}`;

  let orderClause = `ORDER BY created_at DESC`;

  const sql = `SELECT c.id, c.name, c.track_id, c.capacity, c.enrolled, c.start_date, c.end_date, c.status, c.assessment_date, c.assessment_time, c.created_at,
               t.name as track_name, t.slug as track_slug
               FROM cohorts c
               LEFT JOIN tracks t ON c.track_id = t.id
               ${whereClause}
               ${orderClause}`;

  const cohortRes = await pool.query(sql, params);
  const countRes = await pool.query(countSql, params);

  const cohorts = cohortRes.rows;
  const count = parseInt(countRes.rows[0].count);

  const cohortIds = cohorts.map(c => c.id);
  const applicationCounts: Record<string, number> = {};

  if (cohortIds.length > 0) {
    const appRes = await pool.query(
      `SELECT cohort_id, COUNT(*) as count FROM applications
       WHERE cohort_id = ANY($1::text[]) AND status = 'ASSESSED'
       GROUP BY cohort_id`,
      [cohortIds]
    );
    for (const row of appRes.rows) {
      applicationCounts[row.cohort_id] = parseInt(row.count);
    }
  }

  const transformedCohorts = cohorts.map(cohort => ({
    id: cohort.id,
    name: cohort.name,
    track: cohort.track_name || 'Unknown',
    trackId: cohort.track_id,
    capacity: cohort.capacity,
    enrolled: cohort.enrolled,
    startDate: cohort.start_date,
    endDate: cohort.end_date,
    status: (cohort.status || 'planning').toLowerCase(),
    assessmentDate: cohort.assessment_date,
    assessmentTime: cohort.assessment_time,
    createdAt: cohort.created_at,
    applicationCount: applicationCounts[cohort.id] || 0,
  }));

  return NextResponse.json({
    success: true,
    data: transformedCohorts,
    total: count,
    page: 1,
    pageSize: 50,
  });
});

export const POST = withAdminAuth(async (req: NextRequest, pool: Pool) => {
  const { name, trackId, capacity, startDate, endDate, assessmentDate, assessmentTime } = await req.json();

  if (!name || !trackId) {
    return NextResponse.json(
      { success: false, error: 'Name and track are required' },
      { status: 400 }
    );
  }

  const trackRes = await pool.query(
    `SELECT id, name, slug FROM tracks WHERE id = $1`,
    [trackId]
  );

  if (trackRes.rows.length === 0) {
    return NextResponse.json(
      { success: false, error: 'Track not found in main database' },
      { status: 404 }
    );
  }

  const insertRes = await pool.query(
    `INSERT INTO cohorts (name, track_id, capacity, enrolled, start_date, end_date, status, assessment_date, assessment_time, created_at)
     VALUES ($1, $2, $3, 0, $4, $5, 'PLANNING', $6, $7, NOW())
     RETURNING *`,
    [name, trackId, capacity || 30, startDate, endDate, assessmentDate, assessmentTime]
  );

  const cohort = insertRes.rows[0];

  return NextResponse.json(
    { success: true, data: cohort },
    { status: 201 }
  );
});
