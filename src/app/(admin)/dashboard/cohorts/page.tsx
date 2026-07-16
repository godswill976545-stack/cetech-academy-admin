import { Title, Text, Card, Table, Badge, Group, Button } from '@mantine/core';
import { IconUsers } from '@tabler/icons-react';

export const metadata = {
  title: 'Cohorts',
};

export default function CohortsPage() {
  const rows = [
    { name: 'Q3 2026', capacity: 30, enrolled: 28, status: 'open', start: '2026-09-01' },
    { name: 'Q4 2026', capacity: 30, enrolled: 0, status: 'planning', start: '2026-12-01' },
  ];

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
              <tr key={row.name}>
                <td>{row.name}</td>
                <td>{row.capacity}</td>
                <td>{row.enrolled}</td>
                <td>{row.start}</td>
                <td>
                  <Badge color={row.status === 'open' ? 'green' : 'gray'}>{row.status}</Badge>
                </td>
                <td>
                  <Button variant="subtle" size="xs" leftSection={<IconUsers size={14} />}>Manage</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
