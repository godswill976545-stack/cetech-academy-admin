import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { Pool } from 'pg';

export const GET = withAdminAuth(async (_req: NextRequest, pool: Pool) => {
  const { rows } = await pool.query(`SELECT * FROM admin_settings`);

  if (rows.length === 0) {
    return NextResponse.json({
      success: true,
      data: {
        portal_access: 'first',
        audit_log_retention: true,
        allow_admin_refunds: false,
        payment_providers: {
          ngn: ['paystack', 'flutterwave'],
          ghs: ['paystack', 'flutterwave', 'hubtel'],
          xof: ['kkiappay', 'fedapay', 'flutterwave'],
        },
        email_providers: ['resend', 'postmark', 'ses'],
        course_access_policy: 'enrollment_based',
      },
    });
  }

  return NextResponse.json({ success: true, data: rows[0] });
});

export const PATCH = withAdminAuth(async (req: NextRequest, pool: Pool) => {
  const updates = await req.json();

  const existingRes = await pool.query(`SELECT id FROM admin_settings`);

  let result;
  if (existingRes.rows.length > 0) {
    const existingId = existingRes.rows[0].id;

    const columns = Object.keys(updates);
    const values = Object.values(updates);
    const setClauses = columns.map((col, idx) => `"${col}" = $${idx + 1}`);
    setClauses.push(`updated_at = NOW()`);

    result = await pool.query(
      `UPDATE admin_settings SET ${setClauses.join(', ')} WHERE id = $${columns.length + 1} RETURNING *`,
      [...values, existingId]
    );
  } else {
    const columns = Object.keys(updates);
    const values = Object.values(updates);
    const placeholders = columns.map((_, idx) => `$${idx + 1}`);
    columns.push('created_at');
    values.push(new Date().toISOString());

    result = await pool.query(
      `INSERT INTO admin_settings (${columns.map(c => `"${c}"`).join(', ')})
       VALUES (${[...placeholders, `$${columns.length}`].join(', ')})
       RETURNING *`,
      values
    );
  }

  return NextResponse.json({ success: true, data: result.rows[0] });
});
