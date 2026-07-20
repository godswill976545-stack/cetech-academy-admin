import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { createMainRepoAdminClient } from '@/lib/supabase/admin';

export const GET = withAdminAuth(async (_req: NextRequest) => {
  const supabase = createMainRepoAdminClient();

  // 1. Total users
  const { count: userCount } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true });

  // 2. Total applications
  const { count: applicationCount } = await supabase
    .from('applications')
    .select('id', { count: 'exact', head: true });

  // 3. Revenue from ledger entries
  const { data: ledgerEntries } = await supabase
    .from('ledger_entries')
    .select('amount, currency, type');

  // 4. Active cohorts
  const { data: cohorts, count: cohortCount } = await supabase
    .from('cohorts')
    .select('id, enrolled, capacity', { count: 'exact' })
    .eq('status', 'OPEN');

  // 5. Quiz results for completion rate
  const { data: quizResults } = await supabase
    .from('quiz_results')
    .select('passed');

  // 6. Recent activity (no join — fetch users separately)
  const { data: recentActivity } = await supabase
    .from('audit_log')
    .select('id, actor_id, action, target, target_id, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  // Fetch actor info for activity
  const actorIds = [...new Set(recentActivity?.map(log => log.actor_id).filter(Boolean) || [])];
  let actorMap: Record<string, { full_name: string; email: string }> = {};
  if (actorIds.length > 0) {
    const { data: actors } = await supabase
      .from('users')
      .select('clerk_id, full_name, email')
      .in('clerk_id', actorIds);
    actorMap = actors?.reduce((acc, u) => { acc[u.clerk_id] = u; return acc; }, {}) || {};
  }

  // Calculate metrics
  const totalStudents = userCount || 0;
  const applicationsCount = applicationCount || 0;

  const revenueMTD = ledgerEntries?.
    filter((entry: any) => entry.type === 'TUITION')
    .reduce((sum: number, entry: any) => sum + parseFloat(entry.amount), 0) || 0;

  const totalCohorts = cohortCount || 0;

  const totalQuizzes = quizResults?.length || 0;
  const passedQuizzes = quizResults?.filter((qr: any) => qr.passed).length || 0;
  const completionRate = totalQuizzes > 0 ? (passedQuizzes / totalQuizzes) * 100 : 0;

  const onTrack = cohorts?.
    filter((c: any) => c.enrolled >= 20 && c.enrolled <= c.capacity * 0.8).length || 0;

  const atRisk = cohorts?.
    filter((c: any) => c.enrolled < 15 || c.enrolled > c.capacity * 0.9).length || 0;

  const inactive = (cohorts?.length || 0) - onTrack - atRisk;

  // Format activity log
  const formattedActivity = recentActivity?.map(item => {
    const actor = actorMap[item.actor_id];
    return {
      id: item.id,
      description: `${actor?.full_name || actor?.email || 'System'} ${item.action} ${item.target}`,
      userId: item.actor_id,
      createdAt: item.created_at,
    };
  }) || [];

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
