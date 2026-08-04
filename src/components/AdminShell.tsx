'use client';

import {
  AppShell,
  Avatar,
  Badge,
  Burger,
  Group,
  NavLink,
  ScrollArea,
  Text,
  ThemeIcon,
  UnstyledButton,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import {
  IconBook2,
  IconCash,
  IconChevronRight,
  IconLayoutDashboard,
  IconLogout,
  IconSchool,
  IconSettings,
  IconShieldCheck,
  IconUsers,
  IconUserCog,
} from '@tabler/icons-react';
import type { AdminUser } from '@/types';

interface AdminShellProps {
  children: React.ReactNode;
  user: AdminUser;
}

const primaryNav = [
  { href: '/dashboard', label: 'Overview', description: 'Live academy pulse', icon: IconLayoutDashboard },
  { href: '/dashboard/students', label: 'Students', description: 'Learners and progress', icon: IconUsers },
  { href: '/dashboard/payments', label: 'Payments', description: 'Invoices and ledger', icon: IconCash },
];

const operationsNav = [
  { href: '/dashboard/content', label: 'Content', description: 'Curriculum library', icon: IconBook2 },
  { href: '/dashboard/cohorts', label: 'Cohorts', description: 'Classes and capacity', icon: IconSchool },
  { href: '/dashboard/staff', label: 'Staff', description: 'People and access', icon: IconUserCog },
];

export function AdminShell({ children, user }: AdminShellProps) {
  const [opened, { close, toggle }] = useDisclosure(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    close();
  }, [pathname, close]);

  const handleSignOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const initials = (user.fullName || user.email || 'A')
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const renderNav = (items: typeof primaryNav) =>
    items.map((item) => {
      const active = item.href === '/dashboard'
        ? pathname === item.href
        : pathname === item.href || pathname.startsWith(`${item.href}/`);
      const Icon = item.icon;

      return (
        <NavLink
          key={item.href}
          component={Link}
          href={item.href}
          active={active}
          label={item.label}
          description={item.description}
          leftSection={
            <ThemeIcon
              variant={active ? 'filled' : 'light'}
              color={active ? 'brand' : 'gray'}
              size={34}
              radius="md"
            >
              <Icon size={17} stroke={1.8} />
            </ThemeIcon>
          }
          rightSection={active ? <IconChevronRight size={15} /> : null}
          className="admin-nav-link"
        />
      );
    });

  return (
    <AppShell
      header={{ height: 76 }}
      navbar={{ width: 286, breakpoint: 'md', collapsed: { mobile: !opened } }}
      padding={{ base: 'sm', md: 'xl' }}
      className="admin-shell"
    >
      <AppShell.Header className="admin-header">
        <Group h="100%" px={{ base: 'sm', md: 'xl' }} justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <Burger opened={opened} onClick={toggle} hiddenFrom="md" size="sm" color="gray" />
            <Link href="/dashboard" className="admin-brand-link">
              <span className="admin-brand-mark">C</span>
              <span className="admin-brand-copy">
                <Text fw={800} size="md" c="white" lh={1}>CeTech</Text>
                <Text size="xs" c="dimmed" lh={1.2}>Academy control room</Text>
              </span>
            </Link>
          </Group>

          <Group gap="sm" wrap="nowrap">
            <div className="admin-live-indicator" aria-label="System operational">
              <span className="admin-live-dot" />
              <Text size="xs" fw={700} visibleFrom="lg">SYSTEM OPERATIONAL</Text>
            </div>
            <UnstyledButton className="admin-user-chip" onClick={() => router.push('/dashboard/settings')}>
              <Avatar color="brand" variant="light" radius="xl" size="sm">{initials}</Avatar>
              <div className="admin-user-copy" data-hide-mobile>
                <Text size="sm" fw={700} c="white" lh={1.1}>{user.fullName || 'Administrator'}</Text>
                <Text size="xs" c="dimmed" lh={1.1}>{user.role.replace('_', ' ')}</Text>
              </div>
            </UnstyledButton>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar className="admin-sidebar">
        <AppShell.Section p="md" pb="xs">
          <div className="admin-sidebar-label">Workspace</div>
        </AppShell.Section>
        <AppShell.Section grow component={ScrollArea} px="sm">
          {renderNav(primaryNav)}
          <div className="admin-sidebar-label admin-sidebar-label-spaced">Operations</div>
          {renderNav(operationsNav)}
          <NavLink
            component={Link}
            href="/dashboard/settings"
            active={pathname.startsWith('/dashboard/settings')}
            label="Settings"
            description="Rules and security"
            leftSection={<ThemeIcon variant="light" color="gray" size={34} radius="md"><IconSettings size={17} stroke={1.8} /></ThemeIcon>}
            rightSection={pathname.startsWith('/dashboard/settings') ? <IconChevronRight size={15} /> : null}
            className="admin-nav-link"
          />
        </AppShell.Section>
        <AppShell.Section p="sm" pt="xs">
          <div className="admin-sidebar-footer">
            <Badge color="brand" variant="light" size="sm" leftSection={<IconShieldCheck size={13} />}>Admin access</Badge>
            <NavLink
              label="Sign out"
              leftSection={<IconLogout size={17} />}
              onClick={handleSignOut}
              className="admin-signout-link"
            />
          </div>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main className="admin-main">
        <div className="admin-main-inner">{children}</div>
      </AppShell.Main>
    </AppShell>
  );
}
