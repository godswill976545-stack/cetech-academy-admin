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
  
  // Build query - join with users table to get Clerk user data
  let query = supabase
    .from('users')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);
  
  if (status) {
    query = query.eq('status', status);
  }
  
  if (track && track !== 'all') {
    // Handle track filtering - users can have multiple tracks assigned
    const tracks = Array.isArray(track) ? track : [track];
    query = query.contains('assigned_tracks', tracks);
  }
  
  const { data: users, count, error } = await query;
  
  if (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
  
  return NextResponse.json({
    success: true,
    data: users || [],
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
  
  // Create new user with Clerk-style data structure
  const { data: user, error } = await supabase
    .from('users')
    .insert({
      clerk_id: `clerk_admin_${Date.now()}`, // Generate a Clerk-like ID for admin users
      email,
      full_name: fullName,
      role,
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
