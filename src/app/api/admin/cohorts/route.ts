import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { createMainRepoAdminClient } from '@/lib/supabase/admin';

export const GET = withAdminAuth(async (_req: NextRequest) => {
  const supabase = createMainRepoAdminClient();
  const { searchParams } = new URL(_req.url);
  const track = searchParams.get('track');
  const status = searchParams.get('status');

  let query = supabase
    .from('cohorts')
    .select(`
      id,
      name,
      track_id,
      capacity,
      enrolled,
      start_date,
      end_date,
      status,
      assessment_date,
      assessment_time,
      created_at,
      tracks(id, name, slug)
    `, { count: 'exact' })
    .order('created_at', { ascending: false });

  if (track) {
    query = query.eq('track_id', track);
  }

  if (status) {
    query = query.eq('status', status);
  }

  const { data: cohorts, error, count } = await query;

  if (error) {
    console.error('Error fetching cohorts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cohorts' },
      { status: 500 }
    );
  }

  // Count applications per cohort individually (correct way to get counts)
  const cohortIds = cohorts?.map(c => c.id) || [];
  const applicationCounts: Record<string, number> = {};

  for (const cid of cohortIds) {
    const { count: appCount } = await supabase
      .from('applications')
      .select('id', { count: 'exact', head: true })
      .eq('cohort_id', cid)
      .eq('status', 'ASSESSED');
    applicationCounts[cid] = appCount || 0;
  }

  // Transform to match Cohort interface
  const transformedCohorts = cohorts?.map(cohort => ({
    id: cohort.id,
    name: cohort.name,
    track: (cohort.tracks as any)?.name || 'Unknown',
    trackId: cohort.track_id,
    capacity: cohort.capacity,
    enrolled: cohort.enrolled,
    startDate: cohort.start_date,
    endDate: cohort.end_date,
    status: cohort.status?.toLowerCase() || 'planning',
    assessmentDate: cohort.assessment_date,
    assessmentTime: cohort.assessment_time,
    createdAt: cohort.created_at,
    applicationCount: applicationCounts[cohort.id] || 0,
  })) || [];

  return NextResponse.json({
    success: true,
    data: transformedCohorts,
    total: count || 0,
    page: 1,
    pageSize: 50,
  });
});

export const POST = withAdminAuth(async (req: NextRequest) => {
  const { name, trackId, capacity, startDate, endDate, assessmentDate, assessmentTime } = await req.json();

  const supabase = createMainRepoAdminClient();

  if (!name || !trackId) {
    return NextResponse.json(
      { success: false, error: 'Name and track are required' },
      { status: 400 }
    );
  }

  const { data: track, error: trackError } = await supabase
    .from('tracks')
    .select('id, name, slug')
    .eq('id', trackId)
    .single();

  if (!track || trackError) {
    return NextResponse.json(
      { success: false, error: 'Track not found in main database' },
      { status: 404 }
    );
  }

  const { data: cohort, error } = await supabase
    .from('cohorts')
    .insert({
      name,
      track_id: trackId,
      capacity: capacity || 30,
      enrolled: 0,
      start_date: startDate,
      end_date: endDate,
      status: 'PLANNING',
      assessment_date: assessmentDate,
      assessment_time: assessmentTime,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating cohort:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create cohort' },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { success: true, data: cohort },
    { status: 201 }
  );
});
