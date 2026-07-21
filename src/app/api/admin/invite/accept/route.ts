import { NextRequest, NextResponse } from 'next/server';
import { createMainRepoAdminClient } from '@/lib/supabase/admin';
import { hashPassword } from '@/lib/auth-utils';
import { createSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const { token, password, fullName } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: 'Token and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const supabase = createMainRepoAdminClient();

    // Find valid invitation
    const { data: invitation, error } = await supabase
      .from('admin_invitations')
      .select('*')
      .eq('token', token)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !invitation) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired invitation link' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', invitation.email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        email: invitation.email,
        full_name: fullName || invitation.email.split('@')[0],
        role: invitation.role,
        assigned_tracks: invitation.assigned_tracks || [],
        password_hash: passwordHash,
        is_verified: true,
        payment_status: 'paid',
      })
      .select('id, email, full_name, role, assigned_tracks')
      .single();

    if (createError) {
      console.error('Error creating user:', createError);
      return NextResponse.json(
        { success: false, error: 'Failed to create account' },
        { status: 500 }
      );
    }

    // Mark invitation as accepted
    await supabase
      .from('admin_invitations')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invitation.id);

    // Auto-login: create session
    const userAgent = req.headers.get('user-agent') || undefined;
    const sessionRes = await createSession(newUser.id, userAgent);

    // Add user data to response
    const body = await sessionRes.json();
    return NextResponse.json({
      ...body,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.full_name,
        role: newUser.role,
        assignedTracks: newUser.assigned_tracks || [],
      },
    }, { status: 200 });
  } catch (err) {
    console.error('Accept invitation error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
