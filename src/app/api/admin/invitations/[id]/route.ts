import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';

export const DELETE = withAdminAuth(async (req: NextRequest, supabase: any, user: any) => {
  // Extract ID from the URL path: /api/admin/invitations/[id]
  const segments = req.nextUrl.pathname.split('/');
  const id = segments[segments.length - 1];

  if (!id) {
    return NextResponse.json({ success: false, error: 'Invalid invitation ID' }, { status: 400 });
  }

  // Only admins can revoke invitations
  if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, error: 'Only admins can revoke invitations' },
      { status: 403 }
    );
  }

  const { error } = await supabase
    .from('admin_invitations')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error revoking invitation:', error);
    return NextResponse.json({ success: false, error: 'Failed to revoke invitation' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
});
