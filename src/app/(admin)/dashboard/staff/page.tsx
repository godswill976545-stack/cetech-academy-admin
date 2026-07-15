import { Title, Text, Card, Table, Badge, Group, Button } from '@mantine/core';
import { IconMail } from '@tabler/icons-react';

export const metadata = {
  title: 'Staff',
};

export default function StaffPage() {
  const rows = [
    { name: 'Emeka Kalu', email: 'emeka@cetechacademy.com', tracks: 'Growth Marketing', status: 'active' },
    { name: 'Obinna John', email: 'obinna@cetechacademy.com', tracks: 'UI/UX Design', status: 'active' },
  ];

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
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Assigned Tracks</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((row) => (
              <Table.Tr key={row.email}>
                <Table.Td>{row.name}</Table.Td>
                <Table.Td>{row.email}</Table.Td>
                <Table.Td>{row.tracks}</Table.Td>
                <Table.Td>
                  <Badge color="green">{row.status}</Badge>
                </Table.Td>
                <Table.Td>
                  <Button variant="subtle" size="xs" leftSection={<IconMail size={14} />}>Resend Invite</Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>
    </div>
  );
}
