import { NextRequest, NextResponse } from 'next/server';
import { createMainRepoAdminClient } from '@/lib/supabase/admin';
import { verifyPassword } from '@/lib/auth-utils';
import { createSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const supabase = createMainRepoAdminClient();

    // Find user by email (only admin/staff roles — ignore student accounts)
    const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'STAFF', 'TUTOR'];
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, password_hash, assigned_tracks')
      .eq('email', email.toLowerCase().trim())
      .in('role', adminRoles)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check user has a password (was invited)
    if (!user.password_hash) {
      return NextResponse.json(
        { success: false, error: 'Your account has not been set up yet. Please accept your invitation first.' },
        { status: 401 }
      );
    }

    // Verify password
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create session with cookies
    const userAgent = req.headers.get('user-agent') || undefined;
    const res = await createSession(user.id, userAgent);

    // Add user data to response body
    const body = await res.json();
    return NextResponse.json({
      ...body,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        assignedTracks: user.assigned_tracks || [],
      },
    }, { status: 200 });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
