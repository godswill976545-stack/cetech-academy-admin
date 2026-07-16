'use client';

import { Title, Text, Card, Table, Badge, Group, Button, Loader, Alert, Center } from '@mantine/core';
import { IconReceipt, IconAlertCircle } from '@tabler/icons-react';
import { usePayments } from '@/lib/hooks';

export default function PaymentsPage() {
  const { data, isLoading, error } = usePayments();

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

  const rows = data?.data || [];

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
        {rows.length === 0 ? (
          <Text c="dimmed" className="text-center py-8">No payments found</Text>
        ) : (
          <Table highlightOnHover>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Student</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{row.studentName}</td>
                  <td>₦{row.amount.toLocaleString()}</td>
                  <td>{new Date(row.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Badge color={row.status === 'paid' ? 'green' : row.status === 'pending' ? 'yellow' : 'red'}>
                      {row.status}
                    </Badge>
                  </td>
                  <td>
                    <Button variant="subtle" size="xs" leftSection={<IconReceipt size={14} />}>Receipt</Button>
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
