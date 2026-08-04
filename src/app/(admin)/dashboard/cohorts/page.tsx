'use client';

import { Alert, Badge, Card, Center, Group, Loader, Progress, Table, Text } from '@mantine/core';
import { IconAlertCircle, IconSchool } from '@tabler/icons-react';
import { useCohorts } from '@/lib/hooks';

export default function CohortsPage() {
  const { data: rows = [], isLoading, error } = useCohorts();
  if (isLoading) return <Center className="min-h-[60vh]"><Loader color="brand" size="lg" /></Center>;
  if (error) return <Alert icon={<IconAlertCircle size={17} />} title="Cohorts are unavailable" color="red" variant="light">{error.message}</Alert>;
  const statusColor = (status: string) => ({ open: 'green', in_progress: 'blue', planning: 'yellow', completed: 'gray', cancelled: 'red' }[status] || 'gray');

  return <div><div className="admin-page-header"><div><div className="admin-eyebrow">Class operations</div><h1 className="admin-page-title">Cohorts & assessments.</h1><Text className="admin-page-subtitle">Monitor capacity, enrollment pace, and the next assessment windows across every learning track.</Text></div><Badge color="brand" variant="light" size="lg" leftSection={<IconSchool size={15} />}>{rows.length} cohorts</Badge></div><Card className="admin-surface" padding={0}><Group justify="space-between" p="lg"><div><Text className="admin-kicker">Cohort register</Text><Text c="white" fw={800} size="lg" mt={4}>Capacity overview</Text></div><Text c="dimmed" size="sm">{rows.length} total records</Text></Group><div className="admin-table-wrap">{rows.length === 0 ? <Text c="dimmed" ta="center" py={50}>No cohorts found. Create your first cohort to begin tracking capacity.</Text> : <Table highlightOnHover verticalSpacing="md"><Table.Thead><Table.Tr><Table.Th>Cohort</Table.Th><Table.Th>Track</Table.Th><Table.Th>Capacity</Table.Th><Table.Th>Enrolled</Table.Th><Table.Th>Fill rate</Table.Th><Table.Th>Start date</Table.Th><Table.Th>Status</Table.Th></Table.Tr></Table.Thead><Table.Tbody>{rows.map((row) => { const fillRate = row.capacity > 0 ? Math.round((row.enrolled / row.capacity) * 100) : 0; return <Table.Tr key={row.id}><Table.Td><Text fw={700} c="white" size="sm">{row.name}</Text></Table.Td><Table.Td><Badge color="gray" variant="light">{row.track || '—'}</Badge></Table.Td><Table.Td>{row.capacity}</Table.Td><Table.Td>{row.enrolled}</Table.Td><Table.Td><Group gap="xs" wrap="nowrap"><Progress value={fillRate} size="sm" w={70} color={fillRate >= 80 ? 'red' : fillRate >= 50 ? 'yellow' : 'green'} /><Text size="xs" c="dimmed">{fillRate}%</Text></Group></Table.Td><Table.Td>{row.startDate ? new Date(row.startDate).toLocaleDateString() : '—'}</Table.Td><Table.Td><Badge color={statusColor(row.status)} variant="dot">{row.status}</Badge></Table.Td></Table.Tr>; })}</Table.Tbody></Table>}</div></Card></div>;
}
