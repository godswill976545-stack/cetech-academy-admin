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
              <tr key={row.email}>
                <td>{row.name}</td>
                <td>{row.email}</td>
                <td>{row.tracks}</td>
                <td>
                  <Badge color="green">{row.status}</Badge>
                </td>
                <td>
                  <Button variant="subtle" size="xs" leftSection={<IconMail size={14} />}>Resend Invite</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
