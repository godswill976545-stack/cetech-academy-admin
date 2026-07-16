'use client';

import { Title, Text, Card, Badge, Table, Group, Button, Loader, Alert, Center } from '@mantine/core';
import { IconEye, IconAlertCircle } from '@tabler/icons-react';
import { useStudents } from '@/lib/hooks';

export default function StudentsPage() {
  const { data, isLoading, error } = useStudents();

  if (isLoading) {
    return (
      <Center className="min-h-[60vh]">
        <Loader color="brand" size="xl" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="Error loading students" color="red">
        {error.message}
      </Alert>
    );
  }

  const rows = data?.data || [];

  return (
    <div>
      <Group justify="space-between" className="mb-6">
        <Title order={2} className="text-white">Students</Title>
        <Button color="brand">Add Student</Button>
      </Group>

      <Card withBorder className="bg-slate-900/50 border-slate-800">
        <Text c="dimmed" size="sm" className="mb-4">
          View, filter, and manage all enrolled students. Track-scoped staff see only their assigned tracks.
        </Text>
        {rows.length === 0 ? (
          <Text c="dimmed" className="text-center py-8">No students found</Text>
        ) : (
          <Table highlightOnHover>
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Track</th>
                <th>Cohort</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{row.name}</td>
                  <td>{row.track}</td>
                  <td>{row.cohort}</td>
                  <td>
                    <Badge color={row.status === 'active' ? 'green' : 'yellow'}>{row.status}</Badge>
                  </td>
                  <td>
                    <Button variant="subtle" size="xs" leftSection={<IconEye size={14} />}>View</Button>
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
