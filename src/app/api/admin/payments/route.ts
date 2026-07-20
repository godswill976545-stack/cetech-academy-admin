import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { createMainRepoAdminClient } from '@/lib/supabase/admin';

export const GET = withAdminAuth(async (_req: NextRequest) => {
  const supabase = createMainRepoAdminClient();
  const { searchParams } = new URL(_req.url);
  const status = searchParams.get('status');
  const currency = searchParams.get('currency');

  // Left join on cohorts (some invoices may not have a cohort)
  let query = supabase
    .from('invoices')
    .select(`
      id,
      student_id,
      cohort_id,
      amount,
      currency,
      due_date,
      status,
      paystack_reference,
      created_at,
      paid_at,
      users(id, email, full_name, student_code, payment_status),
      cohorts(name, track_id)
    `, { count: 'exact' })
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  if (currency) {
    query = query.eq('currency', currency);
  }

  const { data: invoices, error, count } = await query;

  if (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }

  // Transform to match Payment interface expected by UI
  const transformed = invoices?.map(inv => ({
    id: inv.id,
    studentId: inv.student_id,
    studentName: (inv.users as any)?.full_name || (inv.users as any)?.email || '',
    amount: parseFloat(inv.amount),
    status: inv.status?.toLowerCase() || 'pending',
    method: 'card',
    createdAt: inv.created_at,
  })) || [];

  // Calculate stats
  const totalAmount = invoices?.reduce((sum, inv) => sum + parseFloat(inv.amount), 0) || 0;
  const paidAmount = invoices?.reduce((sum, inv) =>
    inv.status === 'PAID' ? sum + parseFloat(inv.amount) : sum, 0) || 0;
  const pendingAmount = totalAmount - paidAmount;
  const overdueAmount = invoices?.
    filter(inv => inv.status === 'OVERDUE')
    .reduce((sum, inv) => sum + parseFloat(inv.amount), 0) || 0;

  // Payments by currency
  const paymentsByCurrency = invoices?.reduce((acc, inv) => {
    acc[inv.currency] = (acc[inv.currency] || 0) + parseFloat(inv.amount);
    return acc;
  }, {} as Record<string, number>) || {};

  return NextResponse.json({
    success: true,
    data: transformed,
    total: count || 0,
    page: 1,
    pageSize: 50,
    stats: {
      totalAmount,
      paidAmount,
      pendingAmount,
      overdueAmount,
      paymentRate: totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0,
      paymentsByCurrency,
    },
  });
});
