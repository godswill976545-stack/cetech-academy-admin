'use client';

import { Title, Text, Card, Table, Badge, Group, Loader, Alert, Center, SimpleGrid, TextInput } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { usePayments } from '@/lib/hooks';
import { useState } from 'react';

export default function PaymentsPage() {
  const { data, isLoading, error } = usePayments();
  const [search, setSearch] = useState('');

  if (isLoading) {
    return (
      <Center className="min-h-[60vh]">
        <Loader color="brand" size="xl" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="Error loading payments" color="red">
        {error.message}
      </Alert>
    );
  }

  const rows = Array.isArray(data) ? data : [];
  const filtered = search
    ? rows.filter((r) =>
        r.studentName?.toLowerCase().includes(search.toLowerCase()) ||
        r.studentEmail?.toLowerCase().includes(search.toLowerCase())
      )
    : rows;

  // Calculate stats from the data
  const totalPaid = rows.filter((r) => r.status === 'paid').reduce((sum, r) => sum + r.amount, 0);
  const totalPending = rows.filter((r) => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0);
  const totalOverdue = rows.filter((r) => r.status === 'overdue').reduce((sum, r) => sum + r.amount, 0);

  const statusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'green';
      case 'pending': return 'yellow';
      case 'overdue': return 'red';
      case 'refunded': return 'blue';
      default: return 'gray';
    }
  };

  return (
    <div>
      <Title order={2} className="mb-6 text-white">Payments & Ledger</Title>

      {/* Stats */}
      <SimpleGrid cols={{ base: 1, sm: 3 }} className="mb-6">
        <Card withBorder className="bg-slate-900/50 border-slate-800">
          <Text size="sm" c="dimmed">Total Paid</Text>
          <Text size="xl" fw={700} c="green">₦{totalPaid.toLocaleString()}</Text>
        </Card>
        <Card withBorder className="bg-slate-900/50 border-slate-800">
          <Text size="sm" c="dimmed">Pending</Text>
          <Text size="xl" fw={700} c="yellow">₦{totalPending.toLocaleString()}</Text>
        </Card>
        <Card withBorder className="bg-slate-900/50 border-slate-800">
          <Text size="sm" c="dimmed">Overdue</Text>
          <Text size="xl" fw={700} c="red">₦{totalOverdue.toLocaleString()}</Text>
        </Card>
      </SimpleGrid>

      <Group justify="space-between" className="mb-4">
        <Text c="dimmed" size="sm">
          {filtered.length} payment{filtered.length !== 1 ? 's' : ''} found
        </Text>
        <TextInput
          placeholder="Search by student name..."
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          w={300}
          styles={{
            input: { backgroundColor: '#0f172a', borderColor: '#334155', color: 'white' },
          }}
        />
      </Group>

      <Card withBorder className="bg-slate-900/50 border-slate-800">
        {filtered.length === 0 ? (
          <Text c="dimmed" className="text-center py-8">No payments found</Text>
        ) : (
          <Table highlightOnHover>
            <thead>
              <tr>
                <th>Student</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  <td>{row.studentName}</td>
                  <td>₦{row.amount.toLocaleString()}</td>
                  <td>
                    <Badge color="gray" variant="light">
                      {row.method === 'bank_transfer' ? 'Bank Transfer' : row.method === 'offline' ? 'Offline' : row.method}
                    </Badge>
                  </td>
                  <td>
                    <Badge color={statusColor(row.status)}>{row.status}</Badge>
                  </td>
                  <td>{row.date ? new Date(row.date).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
