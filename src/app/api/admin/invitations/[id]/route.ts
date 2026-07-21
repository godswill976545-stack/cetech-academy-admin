import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { createMainRepoAdminClient } from '@/lib/supabase/admin';

export const DELETE = withAdminAuth(async (req: NextRequest, supabase: any, user: any, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

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
