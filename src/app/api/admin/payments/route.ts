import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { createMainRepoAdminClient } from '@/lib/supabase/admin';

export const GET = withAdminAuth(async (_req: NextRequest) => {
  const supabase = createMainRepoAdminClient();
  const { searchParams } = new URL(_req.url);
  const status = searchParams.get('status');
  const currency = searchParams.get('currency');
  
  // Get invoices with comprehensive data
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
      users!inner(id, email, full_name, student_code, payment_status),
      cohorts!inner(name, track_id)
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
  
  // Calculate payment statistics
  const totalAmount = invoices?.reduce((sum, inv) => sum + parseFloat(inv.amount), 0) || 0;
  const paidAmount = invoices?.reduce((sum, inv) => 
    inv.status === 'paid' ? sum + parseFloat(inv.amount) : sum, 0) || 0;
  const pendingAmount = totalAmount - paidAmount;
  const overdueAmount = invoices?.
    filter(inv => inv.status === 'overdue')
    .reduce((sum, inv) => sum + parseFloat(inv.amount), 0) || 0;
  
  // Get ledger entries for payment breakdown
  const { data: ledgerEntries } = await supabase
    .from('ledger_entries')
    .select('amount, type')
    .order('at', { ascending: false });
  
  const ledgerByType = ledgerEntries?.reduce((acc, entry) => {
    acc[entry.type] = (acc[entry.type] || 0) + parseFloat(entry.amount);
    return acc;
  }, {}) || {};
  
  // Get payments by currency
  const paymentsByCurrency = invoices?.reduce((acc, inv) => {
    acc[inv.currency] = (acc[inv.currency] || 0) + parseFloat(inv.amount);
    return acc;
  }, {}) || {};
  
  return NextResponse.json({
    success: true,
    data: invoices || [],
    total: count || 0,
    page: 1,
    pageSize: 50,
    stats: {
      totalAmount,
      paidAmount,
      pendingAmount,
      overdueAmount,
      paymentRate: totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0,
      ledgerByType,
      paymentsByCurrency,
    },
  });
});