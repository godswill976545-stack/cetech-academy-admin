import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { createMainRepoAdminClient } from '@/lib/supabase/admin';

export const GET = withAdminAuth(async (_req: NextRequest) => {
  const supabase = createMainRepoAdminClient();
  const { searchParams } = new URL(_req.url);
  const limit = parseInt(searchParams.get('limit') || '50');

  // Fetch recent activity from audit log (no join — actor_id is Clerk ID, not FK)
  const { data: auditLogs, error } = await supabase
    .from('audit_log')
    .select('id, actor_id, action, target, target_id, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching activity log:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activity log' },
      { status: 500 }
    );
  }

  // Fetch actor user info separately (actor_id stores Clerk IDs)
  const actorIds = [...new Set(auditLogs?.map(log => log.actor_id).filter(Boolean) || [])];
  let userMap: Record<string, { full_name: string; email: string }> = {};

  if (actorIds.length > 0) {
    const { data: actors } = await supabase
      .from('users')
      .select('clerk_id, full_name, email')
      .in('clerk_id', actorIds);

    userMap = actors?.reduce((acc, u) => {
      acc[u.clerk_id] = u;
      return acc;
    }, {}) || {};
  }

  const recentActivity = auditLogs?.map(log => {
    const actor = userMap[log.actor_id];
    return {
      id: log.id,
      type: log.action?.toLowerCase().replace(/_/g, ' ') || 'unknown',
      description: `${actor?.full_name || actor?.email || 'System'} ${log.action} ${log.target}`,
      userId: log.actor_id,
      createdAt: log.created_at,
    };
  }) || [];

  return NextResponse.json({
    success: true,
    data: recentActivity,
  });
});
