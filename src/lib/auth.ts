import { auth } from '@clerk/nextjs/server';
import type { AdminRole, AdminUser } from '@/types';

const ADMIN_ROLES: AdminRole[] = ['ADMIN', 'SUPER_ADMIN'];
const STAFF_ROLES: AdminRole[] = ['STAFF', 'ADMIN', 'SUPER_ADMIN'];

interface ClerkMetadata {
  role?: AdminRole;
  assignedTracks?: string[];
}

function getRoleFromClaims(sessionClaims: Record<string, unknown> | null): ClerkMetadata {
  const metadata = (sessionClaims?.metadata || {}) as Record<string, unknown>;
  return {
    role: (metadata.role as AdminRole) || undefined,
    assignedTracks: Array.isArray(metadata.assignedTracks)
      ? (metadata.assignedTracks as string[])
      : [],
  };
}

async function resolveUser(): Promise<AdminUser | null> {
  const { userId, sessionClaims } = await auth();
  if (!userId) return null;

  const { role, assignedTracks } = getRoleFromClaims(sessionClaims as Record<string, unknown> | null);
  if (!role) return null;

  return {
    id: userId,
    email: (sessionClaims?.email as string) || '',
    fullName: (sessionClaims?.fullName as string) || '',
    role,
    assignedTracks: assignedTracks || [],
  };
}

/** Require an admin or super-admin. */
export async function requireAdmin(): Promise<AdminUser | null> {
  const user = await resolveUser();
  if (!user || !ADMIN_ROLES.includes(user.role)) return null;
  return user;
}

/** Require staff, admin, or super-admin. */
export async function requireStaff(): Promise<AdminUser | null> {
  const user = await resolveUser();
  if (!user || !STAFF_ROLES.includes(user.role)) return null;
  return user;
}
