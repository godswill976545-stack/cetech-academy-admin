'use client';

import { Title, Text, Card, Tree, Group, Button, Loader, Alert, Center } from '@mantine/core';
import { IconPlus, IconAlertCircle } from '@tabler/icons-react';
import { useCurriculum } from '@/lib/hooks';

export default function ContentPage() {
  const { data: modules = [], isLoading, error } = useCurriculum();

  if (isLoading) {
    return (
      <Center className="min-h-[60vh]">
        <Loader color="brand" size="xl" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="Error loading curriculum" color="red">
        {error.message}
      </Alert>
    );
  }

  // Group modules by track
  const tracks = modules.reduce((acc, mod) => {
    if (!acc[mod.track]) acc[mod.track] = [];
    acc[mod.track].push(mod);
    return acc;
  }, {} as Record<string, typeof modules>);

  const treeData = Object.entries(tracks).map(([track, mods]) => ({
    label: track,
    value: track,
    children: mods.map((mod) => ({
      label: `${mod.title} (${mod.status})`,
      value: mod.id,
    })),
  }));

  return (
    <div>
      <Group justify="space-between" className="mb-6">
        <Title order={2} className="text-white">Curriculum & Content</Title>
        <Button color="brand" leftSection={<IconPlus size={16} />}>New Lesson</Button>
      </Group>

      <Card withBorder className="bg-slate-900/50 border-slate-800">
        <Text c="dimmed" size="sm" className="mb-4">
          Manage curriculum templates, lessons, quizzes, and exams. Track-scoped staff can author for their assigned tracks; admins publish.
        </Text>
        {treeData.length === 0 ? (
          <Text c="dimmed" className="text-center py-8">No curriculum modules found</Text>
        ) : (
          <Tree data={treeData} />
        )}
      </Card>
    </div>
  );
}
