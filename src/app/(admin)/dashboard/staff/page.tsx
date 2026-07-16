'use client';

import { Title, Text, Card, Table, Badge, Group, Button, Loader, Alert, Center } from '@mantine/core';
import { IconMail, IconAlertCircle } from '@tabler/icons-react';
import { useStaff } from '@/lib/hooks';

export default function StaffPage() {
  const { data: rows = [], isLoading, error } = useStaff();

  if (isLoading) {
    return (
      <Center className="min-h-[60vh]">
        <Loader color="brand" size="xl" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="Error loading staff" color="red">
        {error.message}
      </Alert>
    );
  }

  return (
    <div>
      <Group justify="space-between" className="mb-6">
        <Title order={2} className="text-white">Staff & Tutors</Title>
        <Button color="brand">Invite Staff</Button>
      </Group>

      <Card withBorder className="bg-slate-900/50 border-slate-800">
        <Text c="dimmed" size="sm" className="mb-4">
          Invite staff, assign tracks, and manage access. Staff see only students and content in their assigned tracks.
        </Text>
        {rows.length === 0 ? (
          <Text c="dimmed" className="text-center py-8">No staff members found</Text>
        ) : (
          <Table highlightOnHover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Assigned Tracks</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td>{row.email}</td>
                  <td>{row.assignedTracks.join(', ')}</td>
                  <td>
                    <Badge color={row.status === 'active' ? 'green' : row.status === 'invited' ? 'blue' : 'gray'}>
                      {row.status}
                    </Badge>
                  </td>
                  <td>
                    <Button variant="subtle" size="xs" leftSection={<IconMail size={14} />}>
                      {row.status === 'invited' ? 'Resend Invite' : 'Edit'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
