import { Title, Text, Card, Badge, Table, Group, Button } from '@mantine/core';
import { IconEye } from '@tabler/icons-react';

export const metadata = {
  title: 'Students',
};

export default function StudentsPage() {
  const rows = [
    { id: 'CET-26A-SWE-0042', name: 'Chidi Okonkwo', track: 'Software Engineering', status: 'active', cohort: 'Q3 2026' },
    { id: 'CET-26A-UXD-0018', name: 'Adaobi Nwosu', track: 'UI/UX Design', status: 'active', cohort: 'Q3 2026' },
    { id: 'CET-26A-GMK-0007', name: 'Ngozi Eze', track: 'Growth Marketing', status: 'payment_due', cohort: 'Q3 2026' },
  ];

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
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Student ID</Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Track</Table.Th>
              <Table.Th>Cohort</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((row) => (
              <Table.Tr key={row.id}>
                <Table.Td>{row.id}</Table.Td>
                <Table.Td>{row.name}</Table.Td>
                <Table.Td>{row.track}</Table.Td>
                <Table.Td>{row.cohort}</Table.Td>
                <Table.Td>
                  <Badge color={row.status === 'active' ? 'green' : 'yellow'}>{row.status}</Badge>
                </Table.Td>
                <Table.Td>
                  <Button variant="subtle" size="xs" leftSection={<IconEye size={14} />}>View</Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>
    </div>
  );
}
