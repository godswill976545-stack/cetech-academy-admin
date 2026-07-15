'use client';

import { AppShell, Burger, NavLink, ScrollArea, Group, Text, Avatar } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  IconDashboard,
  IconUsers,
  IconCash,
  IconBook,
  IconSchool,
  IconUserCog,
  IconSettings,
  IconLogout,
} from '@tabler/icons-react';
import { useClerk } from '@clerk/nextjs';
import type { AdminUser } from '@/types';

interface AdminShellProps {
  children: React.ReactNode;
  user: AdminUser;
}

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: IconDashboard },
  { href: '/dashboard/students', label: 'Students', icon: IconUsers },
  { href: '/dashboard/payments', label: 'Payments', icon: IconCash },
  { href: '/dashboard/content', label: 'Content', icon: IconBook },
  { href: '/dashboard/cohorts', label: 'Cohorts', icon: IconSchool },
  { href: '/dashboard/staff', label: 'Staff', icon: IconUserCog },
  { href: '/dashboard/settings', label: 'Settings', icon: IconSettings },
];

export function AdminShell({ children, user }: AdminShellProps) {
  const [opened, { toggle }] = useDisclosure();
  const pathname = usePathname();
  const { signOut } = useClerk();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 260, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
      className="bg-brand-950"
    >
      <AppShell.Header className="bg-slate-900 border-slate-800">
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Text fw={700} size="lg" c="white">
              CeTech <span className="text-brand-400">Admin</span>
            </Text>
          </Group>
          <Group gap="sm">
            <Text size="sm" c="dimmed" visibleFrom="sm">
              {user.email}
            </Text>
            <Avatar size="sm" color="brand">
              {user.fullName?.charAt(0) || 'A'}
            </Avatar>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" className="bg-slate-900 border-slate-800">
        <AppShell.Section grow component={ScrollArea}>
          {nav.map((item) => (
            <NavLink
              key={item.href}
              component={Link}
              href={item.href}
              label={item.label}
              leftSection={<item.icon size={18} />}
              active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
              color="brand"
              variant="light"
              className="rounded-lg mb-1"
            />
          ))}
        </AppShell.Section>

        <AppShell.Section>
          <NavLink
            label="Sign Out"
            leftSection={<IconLogout size={18} />}
            onClick={() => signOut({ redirectUrl: '/login' })}
            className="rounded-lg"
            color="red"
          />
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main className="bg-brand-950 min-h-screen">
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
