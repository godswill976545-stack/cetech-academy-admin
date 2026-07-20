import { NextRequest, NextResponse } from 'next/server';
import { createMainRepoAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth';

export function withAdminAuth(
  handler: (req: NextRequest, supabase: any, user: any) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const { user, isAuthenticated } = await requireAdmin();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: isAuthenticated ? 'Forbidden' : 'Unauthorized' },
        { status: isAuthenticated ? 403 : 401 }
      );
    }
    
    const supabase = createMainRepoAdminClient();
    
    // Create audit log entry
    await supabase.from('audit_log').insert({
      actor_id: user.id,
      action: 'API_CALL',
      target: req.nextUrl.pathname,
      target_id: req.nextUrl.searchParams.get('id'),
      ip: req.headers.get('x-forwarded-for') || 'unknown',
    });
    
    return handler(req, supabase, user);
  };
}