import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getPool } from '@/lib/neon/server';
import { requireAdmin } from '@/lib/auth';

export function withAdminAuth(
  handler: (req: NextRequest, pool: Pool, user: any) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      const { user, isAuthenticated } = await requireAdmin(req);

      if (!user) {
        return NextResponse.json(
          { success: false, error: isAuthenticated ? 'Forbidden' : 'Unauthorized' },
          { status: isAuthenticated ? 403 : 401 }
        );
      }

      const pool = getPool();

      // Best-effort audit log
      try {
        const targetId = req.nextUrl.searchParams.get('id');
        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        await pool.query(
          `INSERT INTO audit_log (actor_id, action, target, target_id, ip, created_at)
           VALUES ($1, 'API_CALL', $2, $3, $4, NOW())`,
          [user.id, req.nextUrl.pathname, targetId, ip]
        );
      } catch (auditErr) {
        console.error('Audit log insert failed:', auditErr);
      }

      return await handler(req, pool, user);
    } catch (err) {
      console.error('withAdminAuth error:', err);
      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}
