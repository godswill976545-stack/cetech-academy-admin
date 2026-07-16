import { currentUser } from '@clerk/nextjs/server';
import type { AdminRole, AdminUser } from '@/types';

const ADMIN_ROLES: AdminRole[] = ['ADMIN', 'SUPER_ADMIN'];
const STAFF_ROLES: AdminRole[] = ['STAFF', 'ADMIN', 'SUPER_ADMIN'];

interface ClerkPublicMetadata {
  role?: AdminRole;
  assignedTracks?: string[];
}

export async function resolveUser(): Promise<{ user: AdminUser | null; isAuthenticated: boolean }> {
  const user = await currentUser();
  const isAuthenticated = !!user;

  if (!user) {
    return { user: null, isAuthenticated: false };
  }

  const metadata = (user.publicMetadata || {}) as ClerkPublicMetadata;
  const role = metadata.role;

  if (!role) {
    return { user: null, isAuthenticated: true };
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');

  return {
    user: {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      fullName,
      role,
      assignedTracks: metadata.assignedTracks || [],
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
