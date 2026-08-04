'use client';

import {
  Alert,
  Button,
  Card,
  Center,
  Group,
  Loader,
  Progress,
  RingProgress,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconArrowUpRight,
  IconBook2,
  IconCash,
  IconChartDonut3,
  IconChevronRight,
  IconCircleCheck,
  IconClock,
  IconSchool,
  IconUsers,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useDashboardMetrics, useActivityLog } from '@/lib/hooks';

export default function DashboardPage() {
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useDashboardMetrics();
  const { data: activity, isLoading: activityLoading, error: activityError } = useActivityLog();

  if (metricsLoading || activityLoading) {
    return <Center className="min-h-[60vh]"><Loader color="brand" size="lg" /></Center>;
  }

  if (metricsError || activityError) {
    return <Alert icon={<IconAlertCircle size={17} />} title="Dashboard data is unavailable" color="red" variant="light">{metricsError?.message || activityError?.message || 'Please refresh and try again.'}</Alert>;
  }

  const totalCohorts = (metrics?.onTrack ?? 0) + (metrics?.atRisk ?? 0) + (metrics?.inactive ?? 0);
  const totalStudents = metrics?.totalStudents ?? 0;
  const completionRate = metrics?.completionRate ?? 0;

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <div className="admin-eyebrow">Academy pulse · Today</div>
          <Title order={1} className="admin-page-title">Good morning, administrator.</Title>
          <Text className="admin-page-subtitle">One view of learner momentum, cash flow, and the people keeping CeTech moving.</Text>
        </div>
        <Button component={Link} href="/dashboard/staff" variant="light" color="brand" rightSection={<IconArrowUpRight size={16} />}>Manage access</Button>
      </div>

      <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }} spacing="md" mb="xl">
        <MetricCard label="Total students" value={totalStudents.toLocaleString()} detail="Across all active records" icon={<IconUsers size={19} />} tone="blue" />
        <MetricCard label="Applications" value={(metrics?.applications ?? 0).toLocaleString()} detail="Current admissions pipeline" icon={<IconBook2 size={19} />} tone="violet" />
        <MetricCard label="Revenue collected" value={`₦${(metrics?.revenueMTD ?? 0).toLocaleString()}`} detail="All-time ledger total" icon={<IconCash size={19} />} tone="green" />
        <MetricCard label="Active cohorts" value={(metrics?.activeCohorts ?? 0).toLocaleString()} detail="Currently open cohorts" icon={<IconSchool size={19} />} tone="orange" />
      </SimpleGrid>

      <div className="admin-dashboard-lower-grid">
        <Card className="admin-surface admin-dashboard-health" padding="xl">
          <Group justify="space-between" mb="xl">
            <div>
              <Text className="admin-kicker">Learner health</Text>
              <Title order={3} c="white" mt={5}>Cohort progress</Title>
            </div>
            <ThemeIcon size={38} radius="xl" variant="light" color="brand"><IconChartDonut3 size={19} /></ThemeIcon>
          </Group>
          {totalCohorts > 0 ? (
            <Group align="center" justify="space-around" gap="xl">
              <RingProgress size={190} thickness={17} roundCaps sections={[{ value: totalCohorts ? ((metrics?.onTrack ?? 0) / totalCohorts) * 100 : 0, color: 'brand' }, { value: totalCohorts ? ((metrics?.atRisk ?? 0) / totalCohorts) * 100 : 0, color: 'orange' }, { value: totalCohorts ? ((metrics?.inactive ?? 0) / totalCohorts) * 100 : 0, color: 'gray' }]} label={<Text c="white" fw={800} ta="center" size="xl">{completionRate}%<Text component="span" display="block" size="xs" c="dimmed" fw={500}>completion</Text></Text>} />
              <Stack gap="md" miw={170}>
                <HealthLine label="On track" value={metrics?.onTrack ?? 0} color="brand" total={totalCohorts} />
                <HealthLine label="At risk" value={metrics?.atRisk ?? 0} color="orange" total={totalCohorts} />
                <HealthLine label="Inactive" value={metrics?.inactive ?? 0} color="gray" total={totalCohorts} />
              </Stack>
            </Group>
          ) : (
            <EmptyState icon={<IconSchool size={25} />} title="Your cohort view is ready" message="Create a cohort to start tracking learner health and completion." href="/dashboard/cohorts" action="Open cohorts" />
          )}
        </Card>

        <Card className="admin-surface admin-dashboard-activity" padding="xl">
          <Group justify="space-between" mb="lg">
            <div><Text className="admin-kicker">System trail</Text><Title order={3} c="white" mt={5}>Recent activity</Title></div>
            <ThemeIcon size={38} radius="xl" variant="light" color="gray"><IconClock size={19} /></ThemeIcon>
          </Group>
          {activity && activity.length > 0 ? <Stack gap="xs">{activity.slice(0, 7).map((item) => <ActivityRow key={item.id} description={item.description} date={item.createdAt} />)}</Stack> : <EmptyState icon={<IconCircleCheck size={25} />} title="Quiet, for now" message="New admin actions will appear here." />}
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ label, value, detail, icon, tone }: { label: string; value: string; detail: string; icon: React.ReactNode; tone: string }) {
  return <Card className="admin-surface" padding="lg"><Group justify="space-between" align="flex-start"><div><Text className="admin-kicker">{label}</Text><Text size="2rem" fw={800} c="white" mt={7} lh={1}>{value}</Text></div><ThemeIcon variant="light" color={tone} size={37} radius="xl">{icon}</ThemeIcon></Group><Text c="dimmed" size="xs" mt="lg">{detail}</Text></Card>;
}

function HealthLine({ label, value, color, total }: { label: string; value: number; color: string; total: number }) {
  return <div><Group justify="space-between" mb={5}><Text size="sm" c="gray.3">{label}</Text><Text size="sm" fw={700} c="white">{value}</Text></Group><Progress value={total ? (value / total) * 100 : 0} color={color} size="xs" radius="xl" /></div>;
}

function ActivityRow({ description, date }: { description: string; date: string }) {
  return <Group gap="sm" wrap="nowrap" className="admin-activity-row"><ThemeIcon size={27} radius="xl" variant="light" color="gray"><IconCircleCheck size={14} /></ThemeIcon><div style={{ minWidth: 0, flex: 1 }}><Text size="sm" c="gray.2" lineClamp={1}>{description}</Text><Text size="xs" c="dimmed" mt={3}>{date ? new Date(date).toLocaleDateString() : 'Recently'}</Text></div><IconChevronRight size={14} color="var(--admin-muted)" /></Group>;
}

function EmptyState({ icon, title, message, href, action }: { icon: React.ReactNode; title: string; message: string; href?: string; action?: string }) {
  return <div className="admin-surface-muted" style={{ padding: '34px 24px', textAlign: 'center' }}><ThemeIcon size={48} radius="xl" variant="light" color="brand" mx="auto" mb="md">{icon}</ThemeIcon><Text c="white" fw={700}>{title}</Text><Text c="dimmed" size="sm" maw={360} mx="auto" mt={5}>{message}</Text>{href && action && <Button component={Link} href={href} variant="subtle" color="brand" mt="lg" rightSection={<IconArrowUpRight size={15} />}>{action}</Button>}</div>;
}
