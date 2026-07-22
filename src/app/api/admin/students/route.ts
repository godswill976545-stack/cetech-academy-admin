import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { createMainRepoAdminClient } from '@/lib/supabase/admin';

export const GET = withAdminAuth(async (_req: NextRequest) => {
  const supabase = createMainRepoAdminClient();
  const { searchParams } = new URL(_req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');
  const status = searchParams.get('status');
  const track = searchParams.get('track');

  // Build query - users table has: id, email, full_name, role, assigned_tracks, payment_status, is_verified, created_at
  let query = supabase
    .from('users')
    .select('id, email, full_name, role, assigned_tracks, payment_status, is_verified, student_code, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (status) {
    // users table has payment_status, not status
    query = query.eq('payment_status', status);
  }

  if (track && track !== 'all') {
    const tracks = Array.isArray(track) ? track : [track];
    query = query.contains('assigned_tracks', tracks);
  }

  const { data: users, count, error } = await query;

  if (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }

  // Transform to match Student interface expected by UI
  const transformed = users?.map(user => ({
    id: user.id,
    name: user.full_name || user.email.split('@')[0],
    email: user.email,
    track: user.assigned_tracks?.[0] || '',
    cohort: '',
    status: user.payment_status === 'paid' ? 'active' : 'payment_due',
    paymentStatus: user.payment_status || 'unpaid',
    joinedDate: user.created_at,
  })) || [];

  return NextResponse.json({
    success: true,
    data: transformed,
    total: count || 0,
    page,
    pageSize,
  });
});

export const POST = withAdminAuth(async (req: NextRequest) => {
  const { email, fullName, role, assignedTracks, paymentStatus, isVerified, studentCode } = await req.json();

  const supabase = createMainRepoAdminClient();

  // Check if user with email already exists
  const { data: existingUser, error: findError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (existingUser && !findError) {
    return NextResponse.json(
      { success: false, error: 'User with this email already exists' },
      { status: 409 }
    );
  }

  // Create new user
  const { data: user, error } = await supabase
    .from('users')
    .insert({
      email,
      full_name: fullName,
      role: role || 'STUDENT',
      assigned_tracks: assignedTracks || [],
      payment_status: paymentStatus || 'unpaid',
      is_verified: isVerified || false,
      student_code: studentCode,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { success: true, data: user },
    { status: 201 }
  );
});
