import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { createMainRepoAdminClient } from '@/lib/supabase/admin';
import { generateInviteToken } from '@/lib/auth-utils';

export const GET = withAdminAuth(async (_req: NextRequest, supabase: any, user: any) => {
  const { data: invitations, error } = await supabase
    .from('admin_invitations')
    .select('id, email, role, assigned_tracks, expires_at, accepted_at, created_at')
    .is('accepted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch invitations' }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: invitations || [] });
});

export const POST = withAdminAuth(async (req: NextRequest, supabase: any, user: any) => {
  const { email, role, assignedTracks } = await req.json();

  // Role-based invite permissions
  if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, error: 'Only admins can send invitations' },
      { status: 403 }
    );
  }

  // Only SUPER_ADMIN can invite other SUPER_ADMINs
  if (role === 'SUPER_ADMIN' && user.role !== 'SUPER_ADMIN') {
    return NextResponse.json(
      { success: false, error: 'Only Super Admins can invite other Super Admins' },
      { status: 403 }
    );
  }

  // ADMIN can only invite TUTOR
  if (user.role === 'ADMIN' && role !== 'TUTOR') {
    return NextResponse.json(
      { success: false, error: 'Admins can only invite Tutors' },
      { status: 403 }
    );
  }

  // TUTOR cannot invite anyone
  if (user.role === 'TUTOR' || user.role === 'STAFF') {
    return NextResponse.json(
      { success: false, error: 'Tutors cannot send invitations' },
      { status: 403 }
    );
  }

  if (!email || !role) {
    return NextResponse.json(
      { success: false, error: 'Email and role are required' },
      { status: 400 }
    );
  }

  // Check if user already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', email.toLowerCase().trim())
    .single();

  if (existingUser) {
    return NextResponse.json(
      { success: false, error: 'A user with this email already exists' },
      { status: 409 }
    );
  }

  // Check for pending invitation
  const { data: existingInvite } = await supabase
    .from('admin_invitations')
    .select('id')
    .eq('email', email.toLowerCase().trim())
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (existingInvite) {
    return NextResponse.json(
      { success: false, error: 'A pending invitation already exists for this email' },
      { status: 409 }
    );
  }

  const token = generateInviteToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

  const { data: invitation, error } = await supabase
    .from('admin_invitations')
    .insert({
      email: email.toLowerCase().trim(),
      role,
      invited_by: user.id,
      token,
      assigned_tracks: assignedTracks || [],
      expires_at: expiresAt,
    })
    .select('id, email, role, token, expires_at, created_at')
    .single();

  if (error) {
    console.error('Error creating invitation:', error);
    return NextResponse.json({ success: false, error: 'Failed to create invitation' }, { status: 500 });
  }

  // Generate the invite link
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cetech-academy-admin.vercel.app';
  const inviteLink = `${baseUrl}/invite/accept?token=${token}`;

  return NextResponse.json({
    success: true,
    data: {
      ...invitation,
      inviteLink,
    },
  }, { status: 201 });
});
