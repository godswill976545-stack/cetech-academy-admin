'use client';

import { useState } from 'react';
import { Alert, Badge, Card, Center, Group, Loader, Table, Text, TextInput } from '@mantine/core';
import { IconAlertCircle, IconSearch, IconUsers } from '@tabler/icons-react';
import { useStudents } from '@/lib/hooks';

export default function StudentsPage() {
  const { data, isLoading, error } = useStudents();
  const [search, setSearch] = useState('');

  if (isLoading) return <Center className="min-h-[60vh]"><Loader color="brand" size="lg" /></Center>;
  if (error) return <Alert icon={<IconAlertCircle size={17} />} title="Students are unavailable" color="red" variant="light">{error.message}</Alert>;

  const rows = Array.isArray(data) ? data : [];
  const needle = search.toLowerCase();
  const filtered = search ? rows.filter((row) => [row.name, row.email, row.track, row.studentCode].some((value) => value?.toLowerCase().includes(needle))) : rows;
  const statusColor = (status: string) => ({ active: 'green', suspended: 'red', graduated: 'blue', payment_due: 'yellow' }[status] || 'gray');

  return <div>
    <div className="admin-page-header"><div><div className="admin-eyebrow">Learner directory</div><h1 className="admin-page-title">Students.</h1><Text className="admin-page-subtitle">Search the learner register, check payment posture, and see each student’s current track.</Text></div><Badge color="brand" variant="light" size="lg" leftSection={<IconUsers size={15} />}>{rows.length} records</Badge></div>
    <Card className="admin-surface" padding={0}>
      <Group justify="space-between" p="lg" wrap="wrap" gap="md"><div><Text className="admin-kicker">All learners</Text><Text c="white" fw={800} size="lg" mt={4}>{filtered.length} matching students</Text></div><TextInput placeholder="Search name, email, track, code" value={search} onChange={(event) => setSearch(event.currentTarget.value)} leftSection={<IconSearch size={16} />} w={{ base: '100%', sm: 300 }} /></Group>
      <div className="admin-table-wrap">{filtered.length === 0 ? <div style={{ padding: '50px 24px', textAlign: 'center' }}><Text c="white" fw={700}>{search ? 'No matching students' : 'No students found'}</Text><Text c="dimmed" size="sm" mt={5}>{search ? 'Try a different search term.' : 'Student records will appear here.'}</Text></div> : <Table highlightOnHover verticalSpacing="md"><Table.Thead><Table.Tr><Table.Th>Name</Table.Th><Table.Th>Email</Table.Th><Table.Th>Track</Table.Th><Table.Th>Student code</Table.Th><Table.Th>Cohort</Table.Th><Table.Th>Status</Table.Th><Table.Th>Payment</Table.Th></Table.Tr></Table.Thead><Table.Tbody>{filtered.map((row) => <Table.Tr key={row.id}><Table.Td><Text size="sm" fw={700} c="white">{row.name}</Text></Table.Td><Table.Td><Text size="sm" c="dimmed">{row.email}</Text></Table.Td><Table.Td>{row.track || '—'}</Table.Td><Table.Td>{row.studentCode || '—'}</Table.Td><Table.Td>{row.cohort || '—'}</Table.Td><Table.Td><Badge color={statusColor(row.status)} variant="light">{row.status}</Badge></Table.Td><Table.Td><Badge color={row.paymentStatus === 'paid' ? 'green' : 'yellow'} variant="dot">{row.paymentStatus || '—'}</Badge></Table.Td></Table.Tr>)}</Table.Tbody></Table>}</div>
    </Card>
  </div>;
}
