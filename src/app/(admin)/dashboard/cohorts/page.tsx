'use client';

import { Title, Text, Card, Table, Badge, Group, Button, Loader, Alert, Center } from '@mantine/core';
import { IconUsers, IconAlertCircle } from '@tabler/icons-react';
import { useCohorts } from '@/lib/hooks';

export default function CohortsPage() {
  const { data: rows = [], isLoading, error } = useCohorts();

  if (isLoading) {
    return (
      <Center className="min-h-[60vh]">
        <Loader color="brand" size="xl" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="Error loading cohorts" color="red">
        {error.message}
      </Alert>
    );
  }

  return (
    <div>
      <Group justify="space-between" className="mb-6">
        <Title order={2} className="text-white">Cohorts & Assessments</Title>
        <Button color="brand">Create Cohort</Button>
      </Group>

      <Card withBorder className="bg-slate-900/50 border-slate-800">
        <Text c="dimmed" size="sm" className="mb-4">
          Create cohorts, set capacity, schedule assessment slots, and record assessment outcomes.
        </Text>
        {rows.length === 0 ? (
          <Text c="dimmed" className="text-center py-8">No cohorts found</Text>
        ) : (
          <Table highlightOnHover>
            <thead>
              <tr>
                <th>Cohort</th>
                <th>Capacity</th>
                <th>Enrolled</th>
                <th>Start Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td>{row.capacity}</td>
                  <td>{row.enrolled}</td>
                  <td>{new Date(row.startDate).toLocaleDateString()}</td>
                  <td>
                    <Badge color={row.status === 'open' ? 'green' : row.status === 'planning' ? 'blue' : 'gray'}>
                      {row.status}
                    </Badge>
                  </td>
                  <td>
                    <Button variant="subtle" size="xs" leftSection={<IconUsers size={14} />}>Manage</Button>
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
