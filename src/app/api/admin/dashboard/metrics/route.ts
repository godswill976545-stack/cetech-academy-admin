import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { createMainRepoAdminClient } from '@/lib/supabase/admin';

export const GET = withAdminAuth(async (_req: NextRequest) => {
  const supabase = createMainRepoAdminClient();
  
  // Get comprehensive dashboard metrics from the main repo database
  
  // 1. Total users (all roles)
  const { data: users, count: userCount, error: usersError } = await supabase
    .from('users')
    .select('*', { count: 'exact' });
  
  // 2. Total applications (enrollment funnel)
  const { data: applications, count: applicationCount, error: applicationsError } = await supabase
    .from('applications')
    .select('*', { count: 'exact' });
  
  // 3. Total payments
  const { data: ledgerEntries, error: ledgerError } = await supabase
    .from('ledger_entries')
    .select('amount, currency, type');
  
  // 4. Active cohorts
  const { data: cohorts, count: cohortCount, error: cohortsError } = await supabase
    .from('cohorts')
    .select('*', { count: 'exact' })
    .eq('status', 'OPEN');
  
  // 5. Quiz results for completion rate calculation
  const { data: quizResults, error: quizError } = await supabase
    .from('quiz_results')
    .select('passed');
  
  // 6. Recent activity
  const { data: recentActivity } = await supabase
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
    .limit(10);
  
  // Calculate metrics
  const totalStudents = users?.filter(u => u.role === 'STUDENT').length || 0;
  const applicationsCount = applicationCount || 0;
  
  // Calculate revenue from ledger entries
  const revenueMTD = ledgerEntries?.
    filter(entry => entry.type === 'TUITION')
    .reduce((sum, entry) => sum + parseFloat(entry.amount), 0) || 0;
  
  // Calculate cohort statistics
  const totalCohorts = cohortCount || 0;
  const enrolledStudents = cohorts?.reduce((sum, cohort) => sum + cohort.enrolled, 0) || 0;
  
  // Calculate completion rate from quiz results
  const totalQuizzes = quizResults?.length || 0;
  const passedQuizzes = quizResults?.filter(qr => qr.passed).length || 0;
  const completionRate = totalQuizzes > 0 ? (passedQuizzes / totalQuizzes) * 100 : 0;
  
  // Calculate cohort progression metrics
  const onTrack = cohorts?.
    filter(cohort => cohort.enrolled >= 20 && cohort.enrolled <= cohort.capacity * 0.8)
    .length || 0;
  
  const atRisk = cohorts?.
    filter(cohort => cohort.enrolled < 15 || cohort.enrolled > cohort.capacity * 0.9)
    .length || 0;
  
  const inactive = cohorts?.length - onTrack - atRisk || 0;
  
  // Format activity log
  const formattedActivity = recentActivity?.map(item => ({
    id: item.id,
    description: `${item.users?.full_name || item.users?.email} ${item.action} ${item.target} at ${new Date(item.created_at).toLocaleString()}`, // Simplified description
    userId: item.actor_id,
    createdAt: item.created_at,
  })) || [];
  
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