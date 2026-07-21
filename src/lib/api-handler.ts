import { NextRequest, NextResponse } from 'next/server';
import { createMainRepoAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth';

export function withAdminAuth(
  handler: (req: NextRequest, supabase: any, user: any) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      const { user, isAuthenticated } = await requireAdmin(req);

      if (!user) {
        return NextResponse.json(
          { success: false, error: isAuthenticated ? 'Forbidden' : 'Unauthorized' },
          { status: isAuthenticated ? 403 : 401 }
        );
      }

      const supabase = createMainRepoAdminClient();

      // Best-effort audit log
      try {
        await supabase.from('audit_log').insert({
          actor_id: user.id,
          action: 'API_CALL',
          target: req.nextUrl.pathname,
          target_id: req.nextUrl.searchParams.get('id'),
          ip: req.headers.get('x-forwarded-for') || 'unknown',
        });
      } catch (auditErr) {
        console.error('Audit log insert failed:', auditErr);
      }

      return await handler(req, supabase, user);
    } catch (err) {
      console.error('withAdminAuth error:', err);
      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}
