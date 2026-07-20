import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { createMainRepoAdminClient } from '@/lib/supabase/admin';

export const GET = withAdminAuth(async (_req: NextRequest) => {
  const supabase = createMainRepoAdminClient();
  const { searchParams } = new URL(_req.url);
  const track = searchParams.get('track');
  
  // Get users with admin/staff roles
  let query = supabase
    .from('users')
    .select(`
      id,
      email,
      full_name,
      role,
      assigned_tracks,
      student_code,
      is_verified,
      payment_status,
      created_at
    `, { count: 'exact' })
    .in('role', ['ADMIN', 'STAFF', 'SUPER_ADMIN'])
    .order('created_at', { ascending: false });
  
  if (track) {
    query = query.contains('assigned_tracks', [track]);
  }
  
  const { data: users, error, count } = await query;
  
  if (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch staff' },
      { status: 500 }
    );
  }
  
  // Transform users to staff format
  const transformedStaff = users?.map(user => ({
    id: user.id,
    name: user.full_name || user.email.split('@')[0],
    email: user.email,
    role: user.role,
    assignedTracks: user.assigned_tracks || [],
    studentCode: user.student_code,
    status: user.payment_status === 'paid' ? 'active' : 'invited',
    createdAt: user.created_at,
  })) || [];
  
  return NextResponse.json({
    success: true,
    data: transformedStaff,
    total: count || 0,
    page: 1,
    pageSize: 50,
  });
});