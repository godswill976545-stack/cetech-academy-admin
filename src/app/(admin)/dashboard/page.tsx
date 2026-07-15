import { Card, Text, Title, Group, Badge, SimpleGrid, RingProgress, Center } from '@mantine/core';
import { IconUsers, IconCash, IconBook, IconSchool } from '@tabler/icons-react';

export const metadata = {
  title: 'Dashboard',
};

export default function DashboardPage() {
  return (
    <div>
      <Title order={2} className="mb-6 text-white">Dashboard</Title>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} className="mb-8">
        <MetricCard label="Total Students" value="128" icon={<IconUsers size={24} />} trend="+12 this cohort" />
        <MetricCard label="Applications" value="47" icon={<IconBook size={24} />} trend="8 pending review" />
        <MetricCard label="Revenue (MTD)" value="₦4.2M" icon={<IconCash size={24} />} trend="+18% vs last month" />
        <MetricCard label="Active Cohorts" value="3" icon={<IconSchool size={24} />} trend="Q3 2026 open" />
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
                { value: 68, color: 'brand' },
                { value: 24, color: 'cyan' },
                { value: 8, color: 'gray' },
              ]}
              label={
                <Text c="white" fw={700} ta="center" size="xl">
                  68%
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
            {[
              'New application: Adaobi N. — UI/UX Design',
              'Payment received: Chidi O. — ₦150,000',
              'Assessment passed: Ngozi E. — Software Engineering',
              'Staff invited: Emeka K. — Growth Marketing',
            ].map((item, i) => (
              <Text key={i} size="sm" c="dimmed">
                {item}
              </Text>
            ))}
          </div>
        </Card>
      </SimpleGrid>
    </div>
  );
}

function MetricCard({ label, value, icon, trend }: { label: string; value: string; icon: React.ReactNode; trend: string }) {
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
