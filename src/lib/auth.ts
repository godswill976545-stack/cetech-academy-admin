import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth-utils';
import { getPool } from '@/lib/neon/server';
import type { AdminUser } from '@/types';

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'];
const STAFF_ROLES = ['STAFF', 'ADMIN', 'SUPER_ADMIN', 'TUTOR'];

async function getUserFromToken(token: string): Promise<{ user: AdminUser | null; isAuthenticated: boolean }> {
  const payload = await verifyAccessToken(token);
  if (!payload) return { user: null, isAuthenticated: false };

  const pool = getPool();
  const result = await pool.query(
    `SELECT id, email, full_name, role, assigned_tracks
     FROM users WHERE id = $1`,
    [payload.userId]
  );

  const dbUser = result.rows[0];
  if (!dbUser) return { user: null, isAuthenticated: true };

  return {
    user: {
      id: dbUser.id,
      email: dbUser.email,
      fullName: dbUser.full_name || dbUser.email.split('@')[0],
      role: dbUser.role,
      assignedTracks: dbUser.assigned_tracks || [],
    },
    isAuthenticated: true,
  };
}

export async function resolveUser(req?: NextRequest): Promise<{ user: AdminUser | null; isAuthenticated: boolean }> {
  const token = req?.cookies?.get('admin_access_token')?.value;
  if (!token) return { user: null, isAuthenticated: false };
  return getUserFromToken(token);
}

export async function resolveUserFromCookies(): Promise<{ user: AdminUser | null; isAuthenticated: boolean }> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_access_token')?.value;
  if (!token) return { user: null, isAuthenticated: false };
  return getUserFromToken(token);
}

export async function requireAdmin(req?: NextRequest): Promise<{ user: AdminUser | null; isAuthenticated: boolean }> {
  const { user, isAuthenticated } = req ? await resolveUser(req) : await resolveUserFromCookies();
  if (!user || !ADMIN_ROLES.includes(user.role)) return { user: null, isAuthenticated };
  return { user, isAuthenticated: true };
}

export async function requireStaff(req?: NextRequest): Promise<{ user: AdminUser | null; isAuthenticated: boolean }> {
  const { user, isAuthenticated } = req ? await resolveUser(req) : await resolveUserFromCookies();
  if (!user || !STAFF_ROLES.includes(user.role)) return { user: null, isAuthenticated };
  return { user, isAuthenticated: true };
}
