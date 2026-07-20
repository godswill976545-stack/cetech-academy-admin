import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { createMainRepoAdminClient } from '@/lib/supabase/admin';

export const GET = withAdminAuth(async (_req: NextRequest) => {
  const supabase = createMainRepoAdminClient();
  const { searchParams } = new URL(_req.url);
  const status = searchParams.get('status');
  const track = searchParams.get('track');
  
  // Start building the query - we need to join multiple tables
  let query = supabase
    .from('applications')
    .select(`
      id,
      user_id,
      track_id,
      declared_level,
      status,
      cohort_id,
      assessment_slot_id,
      created_at,
      updated_at
    `, { count: 'exact' })
    .order('created_at', { ascending: false });
  
  if (status) {
    query = query.eq('status', status);
  }
  
  if (track) {
    query = query.eq('track_id', track);
  }
  
  const { data: applications, count, error } = await query;
  
  if (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
  
  // Get user data for each application
  const appIds = applications?.map(app => app.id) || [];
  let userData = {};
  
  if (appIds.length > 0) {
    const { data: users } = await supabase
      .from('users')
      .select('id, email, full_name, role, student_code')
      .in('id', appIds);
    
    userData = users?.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {}) || {};
  }
  
  // Get track data
  const trackIds = applications?.map(app => app.track_id).filter(Boolean) || [];
  let trackData = {};
  
  if (trackIds.length > 0) {
    const { data: tracks } = await supabase
      .from('tracks')
      .select('id, name, slug')
      .in('id', trackIds);
    
    trackData = tracks?.reduce((acc, track) => {
      acc[track.id] = track;
      return acc;
    }, {}) || {};
  }
  
  // Get cohort data for applications that have one
  const cohortIds = applications?.map(app => app.cohort_id).filter(Boolean) || [];
  let cohortData = {};
  
  if (cohortIds.length > 0) {
    const { data: cohorts } = await supabase
      .from('cohorts')
      .select('id, name, track_id, start_date, end_date, status')
      .in('id', cohortIds);
    
    cohortData = cohorts?.reduce((acc, cohort) => {
      acc[cohort.id] = cohort;
      return acc;
    }, {}) || {};
  }
  
  // Transform applications to match expected interface
  const transformedApplications = applications?.map(app => ({
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
  })) || [];
  
  return NextResponse.json({
    success: true,
    data: transformedApplications,
    total: count || 0,
    page: 1,
    pageSize: 50,
  });
});

export const POST = withAdminAuth(async (req: NextRequest) => {
  const { userId, trackId, declaredLevel, cohortId } = await req.json();
  
  const supabase = createMainRepoAdminClient();
  
  // Check if user exists in main repo
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, email, full_name, role')
    .eq('id', userId)
    .single();
  
  if (!user || userError) {
    return NextResponse.json(
      { success: false, error: 'User not found in main database' },
      { status: 404 }
    );
  }
  
  // Check if track exists
  const { data: track } = await supabase
    .from('tracks')
    .select('id, name')
    .eq('id', trackId)
    .single();
  
  if (!track) {
    return NextResponse.json(
      { success: false, error: 'Track not found' },
      { status: 404 }
    );
  }
  
  // Check if cohort exists (if provided)
  if (cohortId) {
    const { data: cohort } = await supabase
      .from('cohorts')
      .select('id, name, track_id')
      .eq('id', cohortId)
      .single();
    
    if (!cohort) {
      return NextResponse.json(
        { success: false, error: 'Cohort not found' },
        { status: 404 }
      );
    }
  }
  
  // Create application
  const { data: application, error } = await supabase
    .from('applications')
    .insert({
      user_id: userId,
      track_id: trackId,
      declared_level: declaredLevel,
      cohort_id: cohortId,
      status: 'ASSESSMENT_SCHEDULED',
    })
    .select(`
      id,
      user_id,
      track_id,
      declared_level,
      status,
      cohort_id,
      assessment_slot_id,
      created_at,
      updated_at
    `)
    .single();
  
  if (error) {
    console.error('Error creating application:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create application' },
      { status: 500 }
    );
  }
  
  // Schedule assessment automatically (for demo purposes)
  const assessmentSlotId = `slot_${Date.now()}`;
  const { error: updateError } = await supabase
    .from('applications')
    .update({ assessment_slot_id: assessmentSlotId })
    .eq('id', application.id);
  
  if (updateError) {
    console.error('Error scheduling assessment:', updateError);
  }
  
  // Create audit log entry
  await supabase.from('audit_log').insert({
    actor_id: user.id,
    action: 'CREATE',
    target: 'application',
    target_id: application.id,
    after: application,
  });
  
  return NextResponse.json(
    { success: true, data: application },
    { status: 201 }
  );
});