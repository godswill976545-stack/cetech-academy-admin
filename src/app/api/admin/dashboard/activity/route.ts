import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { Pool } from 'pg';

export const GET = withAdminAuth(async (_req: NextRequest, pool: Pool) => {
  const { searchParams } = new URL(_req.url);
  const limit = parseInt(searchParams.get('limit') || '50');

  const auditRes = await pool.query(
    `SELECT id, actor_id, action, target, target_id, created_at
     FROM audit_log
     ORDER BY created_at DESC
     LIMIT $1`,
    [limit]
  );

  const auditLogs = auditRes.rows;

  const actorIds = [...new Set(auditLogs.map(log => log.actor_id).filter(Boolean))];
  const userMap: Record<string, { full_name: string; email: string }> = {};

  if (actorIds.length > 0) {
    const userRes = await pool.query(
      `SELECT clerk_id, full_name, email FROM users WHERE clerk_id = ANY($1::text[])`,
      [actorIds]
    );
    for (const u of userRes.rows) {
      userMap[u.clerk_id] = u;
    }
  }

  const recentActivity = auditLogs.map(log => {
    const actor = userMap[log.actor_id];
    return {
      id: log.id,
      type: log.action?.toLowerCase().replace(/_/g, ' ') || 'unknown',
      description: `${actor?.full_name || actor?.email || 'System'} ${log.action} ${log.target}`,
      userId: log.actor_id,
      createdAt: log.created_at,
    };
  });

  return NextResponse.json({
    success: true,
    data: recentActivity,
  });
});
