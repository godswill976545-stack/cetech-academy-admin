import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { createMainRepoAdminClient } from '@/lib/supabase/admin';

export const GET = withAdminAuth(async (_req: NextRequest) => {
  const supabase = createMainRepoAdminClient();
  const { searchParams } = new URL(_req.url);
  const track = searchParams.get('track');
  const status = searchParams.get('status');
  
  // Start building the query - join tracks table
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
      tracks!inner(id, name, slug)
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
  
  // Get application counts for each cohort
  const cohortIds = cohorts?.map(c => c.id) || [];
  let applicationCounts = {};
  
  if (cohortIds.length > 0) {
    const { data: applications } = await supabase
      .from('applications')
      .select('cohort_id', { count: 'exact' })
      .in('cohort_id', cohortIds)
      .eq('status', 'ASSESSED');
    
    applicationCounts = applications?.reduce((acc, app) => {
      acc[app.cohort_id] = app.count;
      return acc;
    }, {}) || {};
  }
  
  // Transform cohorts to match expected interface
  const transformedCohorts = cohorts?.map(cohort => ({
    id: cohort.id,
    name: cohort.name,
    track: cohort.tracks?.name || 'Unknown',
    trackId: cohort.track_id,
    capacity: cohort.capacity,
    enrolled: cohort.enrolled,
    startDate: cohort.start_date,
    endDate: cohort.end_date,
    status: cohort.status,
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
  
  // Validate required fields
  if (!name || !trackId) {
    return NextResponse.json(
      { success: false, error: 'Name and track are required' },
      { status: 400 }
    );
  }
  
  // Check if track exists in main repo
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
  
  // Create cohort
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
  
  // Create audit log entry
  await supabase.from('audit_log').insert({
    actor_id: 'current_admin_id', // Should be from auth context
    action: 'CREATE',
    target: 'cohort',
    target_id: cohort.id,
    after: cohort,
  });
  
  return NextResponse.json(
    { success: true, data: cohort },
    { status: 201 }
  );
});