import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { Pool } from 'pg';

export const GET = withAdminAuth(async (_req: NextRequest, pool: Pool) => {
  const userCountRes = await pool.query(`SELECT COUNT(*) as count FROM users`);
  const totalStudents = parseInt(userCountRes.rows[0].count);

  const applicationCountRes = await pool.query(`SELECT COUNT(*) as count FROM applications`);
  const applicationsCount = parseInt(applicationCountRes.rows[0].count);

  const ledgerRes = await pool.query(`SELECT amount, currency, type FROM ledger_entries`);
  const ledgerEntries = ledgerRes.rows;

  const cohortsRes = await pool.query(
    `SELECT id, enrolled, capacity FROM cohorts WHERE status = 'OPEN'`
  );
  const cohorts = cohortsRes.rows;
  const totalCohorts = cohorts.length;

  const quizRes = await pool.query(`SELECT passed FROM quiz_results`);
  const quizResults = quizRes.rows;

  const recentActivityRes = await pool.query(
    `SELECT id, actor_id, action, target, target_id, created_at
     FROM audit_log
     ORDER BY created_at DESC
     LIMIT 10`
  );
  const recentActivity = recentActivityRes.rows;

  const actorIds = [...new Set(recentActivity.map(log => log.actor_id).filter(Boolean))];
  const actorMap: Record<string, { full_name: string; email: string }> = {};
  if (actorIds.length > 0) {
    const actorRes = await pool.query(
      `SELECT clerk_id, full_name, email FROM users WHERE clerk_id = ANY($1::text[])`,
      [actorIds]
    );
    for (const u of actorRes.rows) {
      actorMap[u.clerk_id] = u;
    }
  }

  const revenueMTD = ledgerEntries
    .filter((entry: any) => entry.type === 'TUITION')
    .reduce((sum: number, entry: any) => sum + parseFloat(entry.amount), 0) || 0;

  const totalQuizzes = quizResults.length;
  const passedQuizzes = quizResults.filter((qr: any) => qr.passed).length;
  const completionRate = totalQuizzes > 0 ? (passedQuizzes / totalQuizzes) * 100 : 0;

  const onTrack = cohorts.filter((c: any) => c.enrolled >= 20 && c.enrolled <= c.capacity * 0.8).length;
  const atRisk = cohorts.filter((c: any) => c.enrolled < 15 || c.enrolled > c.capacity * 0.9).length;
  const inactive = cohorts.length - onTrack - atRisk;

  const formattedActivity = recentActivity.map(item => {
    const actor = actorMap[item.actor_id];
    return {
      id: item.id,
      description: `${actor?.full_name || actor?.email || 'System'} ${item.action} ${item.target}`,
      userId: item.actor_id,
      createdAt: item.created_at,
    };
  });

  return NextResponse.json({
    success: true,
    data: {
      totalStudents,
      applications: applicationsCount,
      revenueMTD,
      activeCohorts: totalCohorts,
      completionRate: Math.round(completionRate * 10) / 10,
      onTrack,
      atRisk,
      inactive,
    },
    activity: formattedActivity,
  });
});
