import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { Pool } from 'pg';

function toSettings(row: Record<string, any>) {
  return {
    ...row,
    portalAccess: row.portalAccess ?? row.portal_access ?? 'first',
    auditLogRetention: row.auditLogRetention ?? row.audit_log_retention ?? true,
    allowAdminRefunds: row.allowAdminRefunds ?? row.allow_admin_refunds ?? false,
  };
}

function toDatabaseUpdates(updates: Record<string, unknown>) {
  const columnMap: Record<string, string> = {
    portalAccess: 'portal_access',
    auditLogRetention: 'audit_log_retention',
    allowAdminRefunds: 'allow_admin_refunds',
  };

  return Object.fromEntries(
    Object.entries(updates)
      .filter(([key]) => key in columnMap)
      .map(([key, value]) => [columnMap[key], value])
  );
}

export const GET = withAdminAuth(async (_req: NextRequest, pool: Pool) => {
  const { rows } = await pool.query(`SELECT * FROM admin_settings`);

  if (rows.length === 0) {
    return NextResponse.json({
      success: true,
      data: toSettings({
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
      }),
    });
  }

  return NextResponse.json({ success: true, data: toSettings(rows[0]) });
});

export const PATCH = withAdminAuth(async (req: NextRequest, pool: Pool) => {
  const rawUpdates = await req.json();
  const updates = toDatabaseUpdates(rawUpdates);
  const columns = Object.keys(updates);

  if (columns.length === 0) {
    return NextResponse.json({ success: false, error: 'No settings provided' }, { status: 400 });
  }

  const values = Object.values(updates);
  const existingRes = await pool.query(`SELECT id FROM admin_settings LIMIT 1`);
  let result;

  if (existingRes.rows.length > 0) {
    const existingId = existingRes.rows[0].id;
    const setClauses = columns.map((column, index) => `"${column}" = $${index + 1}`);
    setClauses.push(`updated_at = NOW()`);
    result = await pool.query(
      `UPDATE admin_settings SET ${setClauses.join(', ')} WHERE id = $${columns.length + 1} RETURNING *`,
      [...values, existingId]
    );
  } else {
    const insertColumns = [...columns, 'created_at'];
    result = await pool.query(
      `INSERT INTO admin_settings (${insertColumns.map((column) => `"${column}"`).join(', ')})
       VALUES (${insertColumns.map((_, index) => `$${index + 1}`).join(', ')})
       RETURNING *`,
      [...values, new Date().toISOString()]
    );
  }

  return NextResponse.json({ success: true, data: toSettings(result.rows[0]) });
});
