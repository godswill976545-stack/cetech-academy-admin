'use client';

import { Title, Text, Card, Table, Badge, Group, Loader, Alert, Center, Progress } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
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

  const statusColor = (status: string) => {
    switch (status) {
      case 'open': return 'green';
      case 'in_progress': return 'blue';
      case 'planning': return 'yellow';
      case 'completed': return 'gray';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  return (
    <div>
      <Title order={2} className="mb-6 text-white">Cohorts & Assessments</Title>

      <Card withBorder className="bg-slate-900/50 border-slate-800">
        <Text c="dimmed" size="sm" className="mb-4">
          {rows.length} cohort{rows.length !== 1 ? 's' : ''} found
        </Text>
        {rows.length === 0 ? (
          <Text c="dimmed" className="text-center py-8">No cohorts found</Text>
        ) : (
          <Table highlightOnHover>
            <thead>
              <tr>
                <th>Cohort</th>
                <th>Track</th>
                <th>Capacity</th>
                <th>Enrolled</th>
                <th>Fill Rate</th>
                <th>Start Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const fillRate = row.capacity > 0 ? Math.round((row.enrolled / row.capacity) * 100) : 0;
                return (
                  <tr key={row.id}>
                    <td>{row.name}</td>
                    <td>
                      <Badge color="gray" variant="light">{row.track || '—'}</Badge>
                    </td>
                    <td>{row.capacity}</td>
                    <td>{row.enrolled}</td>
                    <td>
                      <Group gap="xs">
                        <Progress
                          value={fillRate}
                          size="sm"
                          w={60}
                          color={fillRate >= 80 ? 'red' : fillRate >= 50 ? 'yellow' : 'green'}
                        />
                        <Text size="xs" c="dimmed">{fillRate}%</Text>
                      </Group>
                    </td>
                    <td>{row.startDate ? new Date(row.startDate).toLocaleDateString() : '—'}</td>
                    <td>
                      <Badge color={statusColor(row.status)}>{row.status}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
