import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/AdminShell';
import { AdminGate } from '@/components/AdminGate';
import { requireAdmin } from '@/lib/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = await requireAdmin();

  if (!user) {
    if (!isAuthenticated) {
      redirect('/login');
    }
    // Authenticated non-admins: redirect client-side so Clerk's verification iframe isn't interrupted.
    return <AdminGate reason="unauthorized" />;
  }

  return (
    <AdminShell user={user}>
      {children}
    </AdminShell>
  );
}
