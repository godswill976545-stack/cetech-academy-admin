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
      </Card>
    </div>
  );
}
