import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { Pool } from 'pg';

export const GET = withAdminAuth(async (_req: NextRequest, pool: Pool) => {
  const { searchParams } = new URL(_req.url);
  const status = searchParams.get('status');
  const currency = searchParams.get('currency');

  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIdx = 1;

  if (status) {
    conditions.push(`i.status = $${paramIdx++}`);
    params.push(status);
  }
  if (currency) {
    conditions.push(`i.currency = $${paramIdx++}`);
    params.push(currency);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const sql = `SELECT i.id, i.student_id, i.cohort_id, i.amount, i.currency, i.due_date, i.status, i.paystack_reference, i.created_at, i.paid_at,
               u.id as user_id, u.email as user_email, u.full_name as user_full_name, u.student_code, u.payment_status as user_payment_status,
               c.id as cohort_id_col, c.name as cohort_name, c.track_id as cohort_track_id
               FROM invoices i
               LEFT JOIN users u ON i.student_id = u.id
               LEFT JOIN cohorts c ON i.cohort_id = c.id
               ${whereClause}
               ORDER BY i.created_at DESC`;

  const countRes = await pool.query(`SELECT COUNT(*) as count FROM invoices i ${whereClause}`, params);
  const count = parseInt(countRes.rows[0].count);

  const { rows: invoices } = await pool.query(sql, params);

  const transformed = invoices.map(inv => ({
    id: inv.id,
    studentName: inv.user_full_name || inv.user_email || '',
    studentEmail: inv.user_email || '',
    studentCode: inv.student_code,
    amount: parseFloat(inv.amount),
    currency: inv.currency || 'NGN',
    method: inv.paystack_reference ? 'card' : 'offline',
    status: (inv.status || 'pending').toLowerCase(),
    date: inv.paid_at || inv.created_at,
    cohortName: inv.cohort_name || '',
    paymentStatus: inv.user_payment_status || 'unpaid',
  }));

  const totalAmount = invoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0) || 0;
  const paidAmount = invoices.reduce((sum, inv) =>
    inv.status === 'PAID' ? sum + parseFloat(inv.amount) : sum, 0) || 0;
  const pendingAmount = totalAmount - paidAmount;
  const overdueAmount = invoices
    .filter(inv => inv.status === 'OVERDUE')
    .reduce((sum, inv) => sum + parseFloat(inv.amount), 0) || 0;

  const paymentsByCurrency = invoices.reduce((acc, inv) => {
    acc[inv.currency] = (acc[inv.currency] || 0) + parseFloat(inv.amount);
    return acc;
  }, {} as Record<string, number>);

  return NextResponse.json({
    success: true,
    data: transformed,
    total: count,
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
