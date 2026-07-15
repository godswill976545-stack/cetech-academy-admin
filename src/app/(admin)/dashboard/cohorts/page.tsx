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
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Cohort</Table.Th>
              <Table.Th>Capacity</Table.Th>
              <Table.Th>Enrolled</Table.Th>
              <Table.Th>Start Date</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((row) => (
              <Table.Tr key={row.name}>
                <Table.Td>{row.name}</Table.Td>
                <Table.Td>{row.capacity}</Table.Td>
                <Table.Td>{row.enrolled}</Table.Td>
                <Table.Td>{row.start}</Table.Td>
                <Table.Td>
                  <Badge color={row.status === 'open' ? 'green' : 'gray'}>{row.status}</Badge>
                </Table.Td>
                <Table.Td>
                  <Button variant="subtle" size="xs" leftSection={<IconUsers size={14} />}>Manage</Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>
    </div>
  );
}
