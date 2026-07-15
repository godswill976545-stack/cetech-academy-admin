import { Title, Text, Card, Table, Badge, Group, Button } from '@mantine/core';
import { IconReceipt } from '@tabler/icons-react';

export const metadata = {
  title: 'Payments',
};

export default function PaymentsPage() {
  const rows = [
    { id: 'INV-0001', student: 'Chidi Okonkwo', amount: '₦200,000', status: 'paid', date: '2026-07-10' },
    { id: 'INV-0002', student: 'Adaobi Nwosu', amount: '₦150,000', status: 'paid', date: '2026-07-12' },
    { id: 'INV-0003', student: 'Ngozi Eze', amount: '₦180,000', status: 'pending', date: '2026-07-15' },
  ];

  return (
    <div>
      <Group justify="space-between" className="mb-6">
        <Title order={2} className="text-white">Payments & Ledger</Title>
        <Button color="brand">Record Offline Payment</Button>
      </Group>

      <Card withBorder className="bg-slate-900/50 border-slate-800">
        <Text c="dimmed" size="sm" className="mb-4">
          Reconcile gateway events, view the append-only ledger, and issue receipts. Webhooks are the source of truth.
        </Text>
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Invoice</Table.Th>
              <Table.Th>Student</Table.Th>
              <Table.Th>Amount</Table.Th>
              <Table.Th>Date</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((row) => (
              <Table.Tr key={row.id}>
                <Table.Td>{row.id}</Table.Td>
                <Table.Td>{row.student}</Table.Td>
                <Table.Td>{row.amount}</Table.Td>
                <Table.Td>{row.date}</Table.Td>
                <Table.Td>
                  <Badge color={row.status === 'paid' ? 'green' : 'yellow'}>{row.status}</Badge>
                </Table.Td>
                <Table.Td>
                  <Button variant="subtle" size="xs" leftSection={<IconReceipt size={14} />}>Receipt</Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>
    </div>
  );
}
