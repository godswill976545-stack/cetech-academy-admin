'use client';

import { Card, Text, Title, Group, Badge, SimpleGrid, RingProgress, Center, Loader, Alert } from '@mantine/core';
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

  return (
    <div>
      <Title order={2} className="mb-6 text-white">Dashboard</Title>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} className="mb-8">
        <MetricCard label="Total Students" value={metrics?.totalStudents ?? 0} icon={<IconUsers size={24} />} trend="+12 this cohort" />
        <MetricCard label="Applications" value={metrics?.applications ?? 0} icon={<IconBook size={24} />} trend="8 pending review" />
        <MetricCard label="Revenue (MTD)" value={`₦${(metrics?.revenueMTD ?? 0).toLocaleString()}`} icon={<IconCash size={24} />} trend="+18% vs last month" />
        <MetricCard label="Active Cohorts" value={metrics?.activeCohorts ?? 0} icon={<IconSchool size={24} />} trend="Q3 2026 open" />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }}>
        <Card withBorder className="bg-slate-900/50 border-slate-800">
          <Title order={4} className="mb-4 text-white">Cohort Progress</Title>
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
            <Badge color="brand">On track</Badge>
            <Badge color="cyan">At risk</Badge>
            <Badge color="gray">Inactive</Badge>
          </Group>
        </Card>

        <Card withBorder className="bg-slate-900/50 border-slate-800">
          <Title order={4} className="mb-4 text-white">Recent Activity</Title>
          <div className="space-y-4">
            {activity && activity.length > 0 ? (
              activity.slice(0, 5).map((item) => (
                <Text key={item.id} size="sm" c="dimmed">
                  {item.description}
                </Text>
              ))
            ) : (
              <Text size="sm" c="dimmed">No recent activity</Text>
            )}
          </div>
        </Card>
      </SimpleGrid>
    </div>
  );
}

function MetricCard({ label, value, icon, trend }: { label: string; value: string | number; icon: React.ReactNode; trend: string }) {
  return (
    <Card withBorder className="bg-slate-900/50 border-slate-800">
      <Group justify="space-between">
        <Text size="sm" c="dimmed">{label}</Text>
        <div className="text-brand-400">{icon}</div>
      </Group>
      <Text size="2rem" fw={700} c="white" mt="xs">
        {value}
      </Text>
      <Text size="xs" c="dimmed" mt={4}>
        {trend}
      </Text>
    </Card>
  );
}
