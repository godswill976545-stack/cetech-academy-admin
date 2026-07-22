import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { hashPassword, verifyPassword } from '@/lib/auth-utils';

export const POST = withAdminAuth(async (req: NextRequest, supabase: any, user: any) => {
  const { currentPassword, newPassword } = await req.json();

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { success: false, error: 'Current and new passwords are required' },
      { status: 400 }
    );
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { success: false, error: 'New password must be at least 8 characters' },
      { status: 400 }
    );
  }

  // Fetch current password hash
  const { data: dbUser, error } = await supabase
    .from('users')
    .select('password_hash')
    .eq('id', user.id)
    .single();

  if (error || !dbUser) {
    return NextResponse.json(
      { success: false, error: 'User not found' },
      { status: 404 }
    );
  }

  // Verify current password
  const valid = await verifyPassword(currentPassword, dbUser.password_hash);
  if (!valid) {
    return NextResponse.json(
      { success: false, error: 'Current password is incorrect' },
      { status: 401 }
    );
  }

  // Hash new password and update
  const newHash = await hashPassword(newPassword);
  const { error: updateError } = await supabase
    .from('users')
    .update({ password_hash: newHash })
    .eq('id', user.id);

  if (updateError) {
    return NextResponse.json(
      { success: false, error: 'Failed to update password' },
      { status: 500 }
    );
  }

  // Invalidate all other sessions for this user (force re-login on other devices)
  await supabase
    .from('admin_sessions')
    .delete()
    .eq('user_id', user.id);

  return NextResponse.json({ success: true, message: 'Password updated successfully' });
});
