'use client';

import { Card, Text, Title, Group, Badge, SimpleGrid, RingProgress, Center, Loader, Alert, Stack } from '@mantine/core';
import { IconUsers, IconCash, IconBook, IconSchool, IconAlertCircle } from '@tabler/icons-react';
import { useDashboardMetrics, useActivityLog } from '@/lib/hooks';

export default function DashboardPage() {
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useDashboardMetrics();
  const { data: activity, isLoading: activityLoading, error: activityError } = useActivityLog();

  if (metricsLoading || activityLoading) {
    return (
      <Center className="min-h-[60vh]">
        <Loader color="brand" size="xl" />
      </Center>
    );
  }

  if (metricsError || activityError) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="Error loading dashboard" color="red">
        {metricsError?.message || activityError?.message || 'Failed to load dashboard data'}
      </Alert>
    );
  }

  const totalCohorts = (metrics?.onTrack ?? 0) + (metrics?.atRisk ?? 0) + (metrics?.inactive ?? 0);

  return (
    <div>
      <Title order={2} className="mb-6 text-white">Dashboard</Title>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} className="mb-8">
        <MetricCard
          label="Total Students"
          value={metrics?.totalStudents ?? 0}
          icon={<IconUsers size={24} />}
        />
        <MetricCard
          label="Applications"
          value={metrics?.applications ?? 0}
          icon={<IconBook size={24} />}
        />
        <MetricCard
          label="Revenue (All Time)"
          value={`₦${(metrics?.revenueMTD ?? 0).toLocaleString()}`}
          icon={<IconCash size={24} />}
        />
        <MetricCard
          label="Active Cohorts"
          value={metrics?.activeCohorts ?? 0}
          icon={<IconSchool size={24} />}
        />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }}>
        <Card withBorder className="bg-slate-900/50 border-slate-800">
          <Title order={4} className="mb-4 text-white">Cohort Progress</Title>
          {totalCohorts > 0 ? (
            <>
              <Center>
                <RingProgress
                  size={180}
                  thickness={16}
                  roundCaps
                  sections={[
                    { value: metrics?.onTrack ?? 0, color: 'brand' },
                    { value: metrics?.atRisk ?? 0, color: 'cyan' },
                    { value: metrics?.inactive ?? 0, color: 'gray' },
                  ]}
                  label={
                    <Text c="white" fw={700} ta="center" size="xl">
                      {metrics?.completionRate ?? 0}%
                    </Text>
                  }
                />
              </Center>
              <Group justify="center" gap="sm" mt="md">
                <Badge color="brand">On track ({metrics?.onTrack ?? 0})</Badge>
                <Badge color="cyan">At risk ({metrics?.atRisk ?? 0})</Badge>
                <Badge color="gray">Inactive ({metrics?.inactive ?? 0})</Badge>
              </Group>
            </>
          ) : (
            <Text c="dimmed" ta="center" py="xl">No cohort data yet</Text>
          )}
        </Card>

        <Card withBorder className="bg-slate-900/50 border-slate-800">
          <Title order={4} className="mb-4 text-white">Recent Activity</Title>
          {activity && activity.length > 0 ? (
            <Stack gap="sm">
              {activity.slice(0, 8).map((item) => (
                <Group key={item.id} gap="sm" align="flex-start">
                  <Badge color="gray" size="xs" variant="light" mt={2}>
                    {item.actorName || 'System'}
                  </Badge>
                  <Text size="sm" c="dimmed" flex={1}>
                    {item.description}
                  </Text>
                  <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                  </Text>
                </Group>
              ))}
            </Stack>
          ) : (
            <Text c="dimmed" ta="center" py="xl">No recent activity</Text>
          )}
        </Card>
      </SimpleGrid>
    </div>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <Card withBorder className="bg-slate-900/50 border-slate-800">
      <Group justify="space-between">
        <Text size="sm" c="dimmed">{label}</Text>
        <div className="text-brand-400">{icon}</div>
      </Group>
      <Text size="2rem" fw={700} c="white" mt="xs">
        {value}
      </Text>
    </Card>
  );
}
