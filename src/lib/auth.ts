import { auth } from '@clerk/nextjs/server';
import type { AdminRole, AdminUser } from '@/types';

const ADMIN_ROLES: AdminRole[] = ['ADMIN', 'SUPER_ADMIN'];
const STAFF_ROLES: AdminRole[] = ['STAFF', 'ADMIN', 'SUPER_ADMIN'];

interface ClerkPublicMetadata {
  role?: AdminRole;
  assignedTracks?: string[];
}

function getRoleFromClaims(sessionClaims: Record<string, unknown> | null): ClerkPublicMetadata {
  // Clerk JWT stores public metadata under `public_metadata`.
  const metadata = (sessionClaims?.public_metadata || {}) as Record<string, unknown>;
  return {
    role: (metadata.role as AdminRole) || undefined,
    assignedTracks: Array.isArray(metadata.assignedTracks)
      ? (metadata.assignedTracks as string[])
      : [],
  };
}

export async function resolveUser(): Promise<{ user: AdminUser | null; isAuthenticated: boolean }> {
  const { userId, sessionClaims } = await auth();
  const isAuthenticated = !!userId;

  if (!userId) {
    return { user: null, isAuthenticated: false };
  }

  const { role, assignedTracks } = getRoleFromClaims(sessionClaims as Record<string, unknown> | null);
  if (!role) {
    return { user: null, isAuthenticated: true };
  }

  const fullName = [
    sessionClaims?.first_name as string | undefined,
    sessionClaims?.last_name as string | undefined,
  ]
    .filter(Boolean)
    .join(' ');

  return {
    user: {
      id: userId,
      email: (sessionClaims?.email as string) || '',
      fullName,
      role,
      assignedTracks: assignedTracks || [],
    },
    isAuthenticated: true,
  };
}

/** Require an admin or super-admin. */
export async function requireAdmin(): Promise<{ user: AdminUser | null; isAuthenticated: boolean }> {
  const { user, isAuthenticated } = await resolveUser();
  if (!user || !ADMIN_ROLES.includes(user.role)) {
    return { user: null, isAuthenticated };
  }
  return { user, isAuthenticated: true };
}

/** Require staff, admin, or super-admin. */
export async function requireStaff(): Promise<{ user: AdminUser | null; isAuthenticated: boolean }> {
  const { user, isAuthenticated } = await resolveUser();
  if (!user || !STAFF_ROLES.includes(user.role)) {
    return { user: null, isAuthenticated };
  }
  return { user, isAuthenticated: true };
}
