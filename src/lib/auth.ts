import { auth } from '@clerk/nextjs/server';
import type { AdminUser } from '@/types';

/**
 * Resolve the current Clerk session and enforce an admin or staff role.
 * In production this should validate against the backend API / database,
 * checking the user's role (SUPER_ADMIN | ADMIN | STAFF) and track scopes.
 */
export async function requireAdmin(): Promise<AdminUser | null> {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return null;
  }

  // TODO: Replace with a real backend lookup that returns role + track scopes.
  // For now, any authenticated Clerk user can access the admin shell during scaffolding.
  return {
    id: userId,
    email: (sessionClaims?.email as string) || '',
    fullName: (sessionClaims?.fullName as string) || '',
    role: 'ADMIN',
    assignedTracks: [],
  };
}
