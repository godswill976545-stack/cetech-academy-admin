'use client';

import { Title, Text, Card, Badge, Table, Group, Loader, Alert, Center, TextInput } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useStudents } from '@/lib/hooks';
import { useState } from 'react';

export default function StudentsPage() {
  const { data, isLoading, error } = useStudents();
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
      <Alert icon={<IconAlertCircle size={16} />} title="Error loading students" color="red">
        {error.message}
      </Alert>
    );
  }

  const rows = Array.isArray(data) ? data : [];
  const filtered = search
    ? rows.filter((r) =>
        r.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.email?.toLowerCase().includes(search.toLowerCase()) ||
        r.track?.toLowerCase().includes(search.toLowerCase())
      )
    : rows;

  const statusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'suspended': return 'red';
      case 'graduated': return 'blue';
      case 'payment_due': return 'yellow';
      default: return 'gray';
    }
  };

  return (
    <div>
      <Group justify="space-between" className="mb-6">
        <Title order={2} className="text-white">Students</Title>
        <TextInput
          placeholder="Search by name, email, or track..."
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          w={300}
          styles={{
            input: { backgroundColor: '#0f172a', borderColor: '#334155', color: 'white' },
          }}
        />
      </Group>

      <Card withBorder className="bg-slate-900/50 border-slate-800">
        <Text c="dimmed" size="sm" className="mb-4">
          {filtered.length} student{filtered.length !== 1 ? 's' : ''} found
        </Text>
        {filtered.length === 0 ? (
          <Text c="dimmed" className="text-center py-8">No students found</Text>
        ) : (
          <Table highlightOnHover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Track</th>
                <th>Cohort</th>
                <th>Status</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td>{row.email}</td>
                  <td>{row.track || '—'}</td>
                  <td>{row.cohort || '—'}</td>
                  <td>
                    <Badge color={statusColor(row.status)}>{row.status}</Badge>
                  </td>
                  <td>
                    <Badge color={row.paymentStatus === 'paid' ? 'green' : 'yellow'} variant="light">
                      {row.paymentStatus || '—'}
                    </Badge>
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
