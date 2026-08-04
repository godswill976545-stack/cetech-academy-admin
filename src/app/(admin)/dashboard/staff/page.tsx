'use client';

import { useMemo, useState } from 'react';
import {
  ActionIcon,
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Center,
  CopyButton,
  Divider,
  Group,
  Modal,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconCheck,
  IconCopy,
  IconInfoCircle,
  IconMailForward,
  IconPlus,
  IconSearch,
  IconShieldCheck,
  IconTrash,
  IconUserCog,
  IconUsersGroup,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useCurrentAdmin, useInvitations, useCreateInvitation, useRevokeInvitation, useStaff } from '@/lib/hooks';
import type { StaffMember } from '@/types';

export default function StaffPage() {
  const { data: currentAdmin, isLoading: adminLoading, isError: adminError, refetch: refetchAdmin } = useCurrentAdmin();
  const { data: staff, isLoading: staffLoading, error: staffError, refetch: refetchStaff } = useStaff();
  const { data: invitations, isLoading: invitesLoading, error: invitesError, refetch: refetchInvitations } = useInvitations();
  const createInvite = useCreateInvitation();
  const revokeInvite = useRevokeInvitation();
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<string | null>('TUTOR');
  const [inviteTracks, setInviteTracks] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [inviteSent, setInviteSent] = useState<boolean | null>(null);
  const [inviteError, setInviteError] = useState('');
  const [inviteEmailError, setInviteEmailError] = useState('');

  const staffRows = Array.isArray(staff) ? staff : [];
  const inviteRows = Array.isArray(invitations) ? invitations : [];
  const filteredStaff = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return staffRows;
    return staffRows.filter((person) => [person.name, person.email, person.role, ...(person.assignedTracks || [])].join(' ').toLowerCase().includes(needle));
  }, [search, staffRows]);

  const activeCount = staffRows.filter((person) => person.status === 'active').length;
  const adminRoleLoading = adminLoading || (!currentAdmin && !adminError);
  const canInviteAdmins = currentAdmin?.role === 'SUPER_ADMIN';
  const roleOptions = canInviteAdmins
    ? [
        { value: 'TUTOR', label: 'Tutor · track-scoped access' },
        { value: 'ADMIN', label: 'Admin · operational access' },
        { value: 'SUPER_ADMIN', label: 'Super Admin · full access' },
      ]
    : [{ value: 'TUTOR', label: 'Tutor · track-scoped access' }];
  const tutorCount = staffRows.filter((person) => person.role === 'tutor').length;

  const resetInvite = () => {
    setInviteEmail('');
    setInviteRole('TUTOR');
    setInviteTracks('');
    setInviteLink('');
    setInviteSent(null);
    setInviteError('');
    setInviteEmailError('');
  };

  const handleInvite = async () => {
    setInviteError('');
    setInviteEmailError('');
    if (!inviteEmail.trim() || !inviteRole) {
      setInviteError('Add an email address and role to continue.');
      return;
    }

    try {
      const result = await createInvite.mutateAsync({
        email: inviteEmail.trim(),
        role: inviteRole,
        assignedTracks: inviteRole === 'TUTOR' ? inviteTracks.split(',').map((track) => track.trim()).filter(Boolean) : [],
      });
      setInviteLink(result.inviteLink || '');
      setInviteSent(result.emailSent ?? false);
      setInviteEmailError(result.emailError || '');
      setInviteEmail('');
      setInviteTracks('');
    } catch (error: any) {
      setInviteError(error?.response?.data?.error || error?.message || 'Unable to create invitation.');
    }
  };

  const handleRevoke = async (id: string, email: string) => {
    try {
      await revokeInvite.mutateAsync(id);
      notifications.show({ title: 'Invitation revoked', message: `${email} no longer has a pending invite.`, color: 'green' });
    } catch (error: any) {
      notifications.show({ title: 'Could not revoke invite', message: error?.response?.data?.error || 'Please try again.', color: 'red' });
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <div className="admin-eyebrow">Access management</div>
          <h1 className="admin-page-title">People behind the academy.</h1>
          <Text className="admin-page-subtitle">Invite the right operators, keep track assignments clear, and see who has access at a glance.</Text>
        </div>
        <Button color="brand" size="md" leftSection={<IconPlus size={17} />} onClick={() => { resetInvite(); setModalOpen(true); }}>Invite a teammate</Button>
      </div>

      <SimpleGrid cols={{ base: 1, xs: 3 }} spacing="md" mb="xl">
        <StatCard label="Active operators" value={activeCount} icon={<IconShieldCheck size={18} />} color="green" />
        <StatCard label="Tutors" value={tutorCount} icon={<IconUsersGroup size={18} />} color="brand" />
        <StatCard label="Pending invites" value={inviteRows.length} icon={<IconMailForward size={18} />} color="orange" />
      </SimpleGrid>

      <Card className="admin-surface" padding={0} mb="md">
        <Group justify="space-between" p="lg" wrap="wrap" gap="md">
          <div><Text className="admin-kicker">Current access</Text><Text c="white" fw={800} size="lg" mt={4}>Staff directory</Text></div>
          <TextInput value={search} onChange={(event) => setSearch(event.currentTarget.value)} placeholder="Search people or tracks" leftSection={<IconSearch size={16} />} w={{ base: '100%', sm: 260 }} radius="md" />
        </Group>
        <Divider color="rgba(148, 163, 184, .1)" />
        {staffError ? <ErrorPanel message={staffError.message} onRetry={() => refetchStaff()} /> : <div className="admin-table-wrap">{staffLoading ? <TableSkeleton rows={4} /> : filteredStaff.length === 0 ? <EmptyDirectory hasSearch={Boolean(search)} /> : <StaffTable rows={filteredStaff} />}</div>}
      </Card>

      <Card className="admin-surface" padding={0}>
        <Group justify="space-between" p="lg"><div><Text className="admin-kicker">Awaiting acceptance</Text><Text c="white" fw={800} size="lg" mt={4}>Pending invitations</Text></div><Badge color="orange" variant="light">7 day expiry</Badge></Group>
        <Divider color="rgba(148, 163, 184, .1)" />
        {invitesError ? <ErrorPanel message={invitesError.message} onRetry={() => refetchInvitations()} /> : <div className="admin-table-wrap">{invitesLoading ? <TableSkeleton rows={2} /> : inviteRows.length === 0 ? <EmptyInvites onInvite={() => { resetInvite(); setModalOpen(true); }} /> : <InvitationTable rows={inviteRows} onRevoke={handleRevoke} revoking={revokeInvite.isPending} />}</div>}
      </Card>

      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title={inviteLink ? 'Invitation ready' : 'Invite a teammate'} centered size="md" radius="lg" overlayProps={{ backgroundOpacity: 0.55, blur: 4 }}>
        {inviteLink ? <InviteSuccess link={inviteLink} emailSent={inviteSent} emailError={inviteEmailError} onDone={() => { setModalOpen(false); resetInvite(); }} /> : <Stack gap="md">
          {inviteError && <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">{inviteError}</Alert>}
          <div><Text fw={700} c="white">Create a secure access link</Text><Text size="sm" c="dimmed" mt={4}>The teammate sets their password after accepting. No password is shared here.</Text></div>
          <TextInput label="Work email" placeholder="name@cetechacademy.com" value={inviteEmail} onChange={(event) => setInviteEmail(event.currentTarget.value)} leftSection={<IconMailForward size={16} />} required />
          <Select label="Permission level" value={inviteRole} onChange={setInviteRole} data={roleOptions} disabled={adminRoleLoading} required />
          {inviteRole === 'TUTOR' && <TextInput label="Assigned tracks" description="Optional, comma-separated" placeholder="UI/UX Design, Software Engineering" value={inviteTracks} onChange={(event) => setInviteTracks(event.currentTarget.value)} />}
          <Paper p="sm" radius="md" className="admin-surface-muted"><Group gap="sm" wrap="nowrap"><ThemeIcon color={adminError ? 'red' : 'brand'} variant="light" radius="xl"><IconInfoCircle size={16} /></ThemeIcon><Text size="xs" c="dimmed">{adminError ? 'Could not confirm your permissions.' : adminRoleLoading ? 'Confirming your invitation permissions…' : canInviteAdmins ? 'You can invite any admin or tutor role.' : 'Your admin role can invite tutors. Super Admins can invite other admins.'}</Text>{adminError && <Button size="compact-xs" variant="subtle" color="red" onClick={() => refetchAdmin()}>Retry</Button>}</Group></Paper>
          <Button color="brand" onClick={handleInvite} loading={createInvite.isPending} disabled={adminRoleLoading || adminError} leftSection={<IconMailForward size={16} />}>Create invitation</Button>
        </Stack>}
      </Modal>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return <Card className="admin-surface" padding="lg"><Group justify="space-between"><div><Text className="admin-kicker">{label}</Text><Text size="2rem" fw={800} c="white" mt={6} lh={1}>{value}</Text></div><ThemeIcon color={color} variant="light" radius="xl" size={38}>{icon}</ThemeIcon></Group></Card>;
}

function StaffTable({ rows }: { rows: StaffMember[] }) {
  return <Table highlightOnHover verticalSpacing="md"><Table.Thead><Table.Tr><Table.Th>Person</Table.Th><Table.Th>Role</Table.Th><Table.Th>Tracks</Table.Th><Table.Th>Status</Table.Th><Table.Th>Joined</Table.Th></Table.Tr></Table.Thead><Table.Tbody>{rows.map((row) => <Table.Tr key={row.id}><Table.Td><Group gap="sm" wrap="nowrap"><Avatar color={roleColor(row.role)} variant="light" radius="xl">{row.name?.charAt(0)?.toUpperCase() || 'U'}</Avatar><div><Text size="sm" fw={700} c="white">{row.name}</Text><Text size="xs" c="dimmed">{row.email}</Text></div></Group></Table.Td><Table.Td><Badge color={roleColor(row.role)} variant="light">{formatRole(row.role)}</Badge></Table.Td><Table.Td><Text size="sm" c="dimmed">{row.assignedTracks?.length ? row.assignedTracks.join(', ') : 'All academy tracks'}</Text></Table.Td><Table.Td><Badge color={row.status === 'active' ? 'green' : 'gray'} variant="dot">{row.status}</Badge></Table.Td><Table.Td><Text size="sm" c="dimmed">{row.joinedDate ? new Date(row.joinedDate).toLocaleDateString() : '—'}</Text></Table.Td></Table.Tr>)}</Table.Tbody></Table>;
}

function InvitationTable({ rows, onRevoke, revoking }: { rows: Array<{ id: string; email: string; role: string; assigned_tracks: string[]; expires_at: string }>; onRevoke: (id: string, email: string) => void; revoking: boolean }) {
  return <Table highlightOnHover verticalSpacing="md"><Table.Thead><Table.Tr><Table.Th>Invitee</Table.Th><Table.Th>Role</Table.Th><Table.Th>Tracks</Table.Th><Table.Th>Expires</Table.Th><Table.Th /></Table.Tr></Table.Thead><Table.Tbody>{rows.map((invite) => <Table.Tr key={invite.id}><Table.Td><Text size="sm" fw={700} c="white">{invite.email}</Text></Table.Td><Table.Td><Badge color={roleColor(invite.role)} variant="light">{formatRole(invite.role)}</Badge></Table.Td><Table.Td><Text size="sm" c="dimmed">{invite.assigned_tracks?.length ? invite.assigned_tracks.join(', ') : 'All academy tracks'}</Text></Table.Td><Table.Td><Text size="sm" c="dimmed">{invite.expires_at ? new Date(invite.expires_at).toLocaleDateString() : '—'}</Text></Table.Td><Table.Td><Tooltip label="Revoke invitation"><ActionIcon color="red" variant="subtle" loading={revoking} onClick={() => onRevoke(invite.id, invite.email)}><IconTrash size={16} /></ActionIcon></Tooltip></Table.Td></Table.Tr>)}</Table.Tbody></Table>;
}

function InviteSuccess({ link, emailSent, emailError, onDone }: { link: string; emailSent: boolean | null; emailError: string; onDone: () => void }) {
  return <Stack gap="md"><Center><ThemeIcon color={emailSent ? 'green' : 'orange'} variant="light" size={54} radius="xl"><IconCheck size={26} /></ThemeIcon></Center><Text ta="center" c="white" fw={800} size="lg">Invitation created</Text><Alert color={emailSent ? 'green' : 'orange'} variant="light">{emailSent ? 'The invitation email was sent successfully.' : `The invite is ready, but email delivery needs attention. ${emailError || 'Share the link manually.'}`}</Alert><TextInput label="Secure invitation link" value={link} readOnly rightSection={<CopyButton value={link}>{({ copied, copy }) => <Tooltip label={copied ? 'Copied' : 'Copy link'}><ActionIcon color={copied ? 'green' : 'brand'} variant="light" onClick={copy}>{copied ? <IconCheck size={16} /> : <IconCopy size={16} />}</ActionIcon></Tooltip>}</CopyButton>} /><Button color="brand" onClick={onDone}>Done</Button></Stack>;
}

function ErrorPanel({ message, onRetry }: { message: string; onRetry: () => void }) { return <Alert m="lg" icon={<IconAlertCircle size={17} />} title="Could not load this section" color="red" variant="light" closeButtonLabel="Dismiss"><Group justify="space-between" align="center" gap="md"><Text size="sm">{message || 'Please refresh and try again.'}</Text><Button size="compact-xs" variant="light" color="red" onClick={onRetry}>Retry</Button></Group></Alert>; }
function EmptyDirectory({ hasSearch }: { hasSearch: boolean }) { return <div style={{ padding: '44px 24px', textAlign: 'center' }}><ThemeIcon color="brand" variant="light" size={48} radius="xl" mx="auto" mb="md"><IconUserCog size={24} /></ThemeIcon><Text c="white" fw={700}>{hasSearch ? 'No matching people' : 'No staff members yet'}</Text><Text c="dimmed" size="sm" mt={5}>{hasSearch ? 'Try a different name, email, or track.' : 'Invite a teammate to start building your operations team.'}</Text></div>; }
function EmptyInvites({ onInvite }: { onInvite: () => void }) { return <div style={{ padding: '38px 24px', textAlign: 'center' }}><ThemeIcon color="orange" variant="light" size={45} radius="xl" mx="auto" mb="md"><IconMailForward size={22} /></ThemeIcon><Text c="white" fw={700}>No pending invitations</Text><Text c="dimmed" size="sm" mt={5}>Everyone invited has either joined or there is nothing waiting.</Text><Button variant="subtle" color="brand" mt="md" onClick={onInvite}>Invite someone</Button></div>; }
function TableSkeleton({ rows }: { rows: number }) { return <Stack p="lg">{Array.from({ length: rows }).map((_, index) => <div key={index} style={{ height: 48, borderRadius: 10, background: 'rgba(148,163,184,.08)' }} />)}</Stack>; }
function formatRole(role: string | null | undefined) { return (role || 'staff').replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function roleColor(role: string | null | undefined) { const normalized = (role || '').toLowerCase(); if (normalized.includes('super')) return 'red'; if (normalized.includes('admin')) return 'blue'; if (normalized.includes('tutor')) return 'green'; return 'gray'; }
