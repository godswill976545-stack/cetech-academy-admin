'use client';

import { useState } from 'react';
import { Alert, Badge, Card, Center, Group, Loader, SimpleGrid, Table, Text, TextInput } from '@mantine/core';
import { IconAlertCircle, IconCash, IconSearch } from '@tabler/icons-react';
import { usePayments } from '@/lib/hooks';

export default function PaymentsPage() {
  const { data, isLoading, error } = usePayments();
  const [search, setSearch] = useState('');
  if (isLoading) return <Center className="min-h-[60vh]"><Loader color="brand" size="lg" /></Center>;
  if (error) return <Alert icon={<IconAlertCircle size={17} />} title="Payments are unavailable" color="red" variant="light">{error.message}</Alert>;

  const rows = Array.isArray(data) ? data : [];
  const needle = search.toLowerCase();
  const filtered = search ? rows.filter((row) => [row.studentName, row.studentEmail].some((value) => value?.toLowerCase().includes(needle))) : rows;
  const totalPaid = rows.filter((row) => row.status === 'paid').reduce((sum, row) => sum + row.amount, 0);
  const totalPending = rows.filter((row) => row.status === 'pending').reduce((sum, row) => sum + row.amount, 0);
  const totalOverdue = rows.filter((row) => row.status === 'overdue').reduce((sum, row) => sum + row.amount, 0);
  const statusColor = (status: string) => ({ paid: 'green', pending: 'yellow', overdue: 'red', refunded: 'blue' }[status] || 'gray');

  return <div>
    <div className="admin-page-header"><div><div className="admin-eyebrow">Finance operations</div><h1 className="admin-page-title">Payments & ledger.</h1><Text className="admin-page-subtitle">Keep collections visible, understand what is outstanding, and follow every invoice back to a learner.</Text></div><Badge color="green" variant="light" size="lg" leftSection={<IconCash size={15} />}>NGN ledger</Badge></div>
    <SimpleGrid cols={{ base: 1, xs: 3 }} spacing="md" mb="md"><FinanceStat label="Collected" value={totalPaid} color="green" /><FinanceStat label="Pending" value={totalPending} color="yellow" /><FinanceStat label="Overdue" value={totalOverdue} color="red" /></SimpleGrid>
    <Card className="admin-surface" padding={0}><Group justify="space-between" p="lg" wrap="wrap" gap="md"><div><Text className="admin-kicker">Transaction register</Text><Text c="white" fw={800} size="lg" mt={4}>{filtered.length} matching payments</Text></div><TextInput placeholder="Search student or email" value={search} onChange={(event) => setSearch(event.currentTarget.value)} leftSection={<IconSearch size={16} />} w={{ base: '100%', sm: 280 }} /></Group><div className="admin-table-wrap">{filtered.length === 0 ? <Text c="dimmed" ta="center" py={50}>No payments found.</Text> : <Table highlightOnHover verticalSpacing="md"><Table.Thead><Table.Tr><Table.Th>Student</Table.Th><Table.Th>Amount</Table.Th><Table.Th>Method</Table.Th><Table.Th>Status</Table.Th><Table.Th>Date</Table.Th><Table.Th>Cohort</Table.Th></Table.Tr></Table.Thead><Table.Tbody>{filtered.map((row) => <Table.Tr key={row.id}><Table.Td><Text size="sm" fw={700} c="white">{row.studentName}</Text><Text size="xs" c="dimmed">{row.studentEmail}</Text></Table.Td><Table.Td><Text size="sm" fw={700} c="white">₦{row.amount.toLocaleString()}</Text></Table.Td><Table.Td><Badge color="gray" variant="light">{row.method === 'bank_transfer' ? 'Bank transfer' : row.method === 'offline' ? 'Offline' : row.method}</Badge></Table.Td><Table.Td><Badge color={statusColor(row.status)} variant="dot">{row.status}</Badge></Table.Td><Table.Td>{row.date ? new Date(row.date).toLocaleDateString() : '—'}</Table.Td><Table.Td>{row.cohortName || '—'}</Table.Td></Table.Tr>)}</Table.Tbody></Table>}</div></Card>
  </div>;
}

function FinanceStat({ label, value, color }: { label: string; value: number; color: string }) { return <Card className="admin-surface" padding="lg"><Text className="admin-kicker">{label}</Text><Text size="1.7rem" fw={800} c={color} mt={7}>₦{value.toLocaleString()}</Text></Card>; }
