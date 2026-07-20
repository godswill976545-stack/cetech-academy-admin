import { currentUser } from '@clerk/nextjs/server';
import type { AdminUser, AdminRole } from '@/types';

const ADMIN_ROLES: AdminRole[] = ['ADMIN', 'SUPER_ADMIN'];
const STAFF_ROLES: AdminRole[] = ['STAFF', 'ADMIN', 'SUPER_ADMIN'];

interface ClerkPublicMetadata {
  role?: AdminRole;
  assignedTracks?: string[];
}

export async function resolveUser(): Promise<{ user: AdminUser | null; isAuthenticated: boolean }> {
  const clerkUser = await currentUser();
  const isAuthenticated = !!clerkUser;

  if (!clerkUser) {
    return { user: null, isAuthenticated: false };
  }

  const metadata = (clerkUser.publicMetadata || {}) as ClerkPublicMetadata;
  const role = metadata.role;

  if (!role) {
    return { user: null, isAuthenticated: true };
  }

  const fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ');

  return {
    user: {
      id: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
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