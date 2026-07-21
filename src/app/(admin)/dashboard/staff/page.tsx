'use client';

import { useState } from 'react';
import { Title, Text, Card, Table, Badge, Group, Button, Loader, Alert, Center, Modal, TextInput, Select, Stack, ActionIcon, CopyButton, Tooltip } from '@mantine/core';
import { IconMail, IconAlertCircle, IconPlus, IconCopy, IconCheck, IconTrash } from '@tabler/icons-react';
import { useStaff, useInvitations, useCreateInvitation, useRevokeInvitation } from '@/lib/hooks';
import { useQueryClient } from '@tanstack/react-query';

export default function StaffPage() {
  const { data: staff = [], isLoading: staffLoading, error: staffError } = useStaff();
  const { data: invitations = [], isLoading: invitesLoading } = useInvitations();
  const createInvite = useCreateInvitation();
  const revokeInvite = useRevokeInvitation();

  const [modalOpen, setModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<string | null>('TUTOR');
  const [inviteTracks, setInviteTracks] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const handleInvite = async () => {
    setInviteError('');
    setInviteLink('');
    setInviteSuccess(false);

    if (!inviteEmail || !inviteRole) {
      setInviteError('Email and role are required.');
      return;
    }

    try {
      const tracks = inviteTracks ? inviteTracks.split(',').map(t => t.trim()).filter(Boolean) : [];
      const result = await createInvite.mutateAsync({
        email: inviteEmail,
        role: inviteRole,
        assignedTracks: tracks,
      });

      setInviteLink(result.inviteLink || '');
      setInviteSuccess(true);
      setInviteEmail('');
      setInviteRole('TUTOR');
      setInviteTracks('');
    } catch (err: any) {
      setInviteError(err?.response?.data?.error || err?.message || 'Failed to send invitation');
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Revoke this invitation?')) return;
    try {
      await revokeInvite.mutateAsync(id);
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to revoke invitation');
    }
  };

  if (staffLoading || invitesLoading) {
    return (
      <Center className="min-h-[60vh]">
        <Loader color="brand" size="xl" />
      </Center>
    );
  }

  if (staffError) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="Error loading staff" color="red">
        {staffError.message}
      </Alert>
    );
  }

  return (
    <div>
      <Group justify="space-between" className="mb-6">
        <Title order={2} className="text-white">Staff & Tutors</Title>
        <Button color="brand" leftSection={<IconPlus size={16} />} onClick={() => setModalOpen(true)}>
          Invite Staff
        </Button>
      </Group>

      {/* Active Staff */}
      <Card withBorder className="bg-slate-900/50 border-slate-800 mb-6">
        <Text c="dimmed" size="sm" className="mb-4">
          Active staff members and their assigned tracks.
        </Text>
        {staff.length === 0 ? (
          <Text c="dimmed" className="text-center py-8">No staff members found</Text>
        ) : (
          <Table highlightOnHover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Assigned Tracks</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td>{row.email}</td>
                  <td>
                    <Badge color={row.role === 'super_admin' ? 'red' : row.role === 'admin' ? 'blue' : 'gray'}>
                      {row.role}
                    </Badge>
                  </td>
                  <td>{row.assignedTracks?.join(', ') || '—'}</td>
                  <td>
                    <Badge color={row.status === 'active' ? 'green' : 'blue'}>
                      {row.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card withBorder className="bg-slate-900/50 border-slate-800">
          <Text c="dimmed" size="sm" className="mb-4">
            Pending invitations (expire after 7 days).
          </Text>
          <Table highlightOnHover>
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Tracks</th>
                <th>Expires</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {invitations.map((inv) => (
                <tr key={inv.id}>
                  <td>{inv.email}</td>
                  <td>
                    <Badge color={inv.role === 'SUPER_ADMIN' ? 'red' : inv.role === 'ADMIN' ? 'blue' : 'gray'}>
                      {inv.role}
                    </Badge>
                  </td>
                  <td>{inv.assigned_tracks?.join(', ') || '—'}</td>
                  <td>{new Date(inv.expires_at).toLocaleDateString()}</td>
                  <td>
                    <ActionIcon color="red" variant="subtle" onClick={() => handleRevoke(inv.id)}>
                      <IconTrash size={16} />
                    </ActionIcon>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      {/* Invite Modal */}
      <Modal
        opened={modalOpen}
        onClose={() => { setModalOpen(false); setInviteLink(''); setInviteSuccess(false); setInviteError(''); }}
        title="Invite Staff Member"
        centered
        styles={{ content: { backgroundColor: '#1e293b' }, header: { backgroundColor: '#1e293b' }, title: { color: 'white' } }}
      >
        {inviteSuccess && inviteLink ? (
          <Stack gap="md">
            <Alert color="green" variant="light">
              Invitation sent! Share this link with {inviteEmail}:
            </Alert>
            <Group>
              <TextInput
                value={inviteLink}
                readOnly
                flex={1}
                styles={{ input: { backgroundColor: '#0f172a', borderColor: '#334155', color: 'white' } }}
              />
              <CopyButton value={inviteLink}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? 'Copied!' : 'Copy link'}>
                    <ActionIcon color={copied ? 'teal' : 'brand'} variant="light" onClick={copy}>
                      {copied ? <IconCheck size={18} /> : <IconCopy size={18} />}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
            <Button variant="light" onClick={() => { setModalOpen(false); setInviteLink(''); setInviteSuccess(false); }}>
              Done
            </Button>
          </Stack>
        ) : (
          <Stack gap="md">
            {inviteError && (
              <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
                {inviteError}
              </Alert>
            )}
            <TextInput
              label="Email"
              placeholder="tutor@cetechacademy.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.currentTarget.value)}
              required
              styles={{ input: { backgroundColor: '#0f172a', borderColor: '#334155', color: 'white' }, label: { color: '#94a3b8' } }}
            />
            <Select
              label="Role"
              value={inviteRole}
              onChange={setInviteRole}
              data={[
                { value: 'TUTOR', label: 'Tutor' },
                { value: 'ADMIN', label: 'Admin' },
              ]}
              styles={{ input: { backgroundColor: '#0f172a', borderColor: '#334155', color: 'white' }, label: { color: '#94a3b8' } }}
            />
            {inviteRole === 'TUTOR' && (
              <TextInput
                label="Assigned Tracks (comma-separated)"
                placeholder="e.g. UI/UX Design, Software Engineering"
                value={inviteTracks}
                onChange={(e) => setInviteTracks(e.currentTarget.value)}
                styles={{ input: { backgroundColor: '#0f172a', borderColor: '#334155', color: 'white' }, label: { color: '#94a3b8' } }}
              />
            )}
            <Button
              color="brand"
              onClick={handleInvite}
              loading={createInvite.isPending}
              leftSection={<IconMail size={16} />}
            >
              Send Invitation
            </Button>
          </Stack>
        )}
      </Modal>
    </div>
  );
}
