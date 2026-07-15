import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/AdminShell';
import { requireAdmin } from '@/lib/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  if (!user) {
    redirect('/login');
  }

  return (
    <AdminShell user={user}>
      {children}
    </AdminShell>
  );
}
