import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { createMainRepoAdminClient } from '@/lib/supabase/admin';

export const GET = withAdminAuth(async (_req: NextRequest) => {
  const supabase = createMainRepoAdminClient();
  const { searchParams } = new URL(_req.url);
  const limit = parseInt(searchParams.get('limit') || '50');
  
  // Fetch recent activity from audit log
  const { data: auditLogs, error } = await supabase
    .from('audit_log')
    .select(`
      id,
      actor_id,
      action,
      target,
      target_id,
      created_at,
      users!inner(full_name, email)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activity log' },
      { status: 500 }
    );
  }
  
  const recentActivity = auditLogs?.map(log => ({
    id: log.id,
    type: log.action.toLowerCase().replace('_', ' '),
    description: `${log.users?.full_name || log.users?.email} ${log.action} ${log.target}`,
    userId: log.actor_id,
    createdAt: log.created_at,
  })) || [];
  
  return NextResponse.json({
    success: true,
    data: recentActivity,
  });
});