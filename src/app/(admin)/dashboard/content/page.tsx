import { Title, Text, Card, Tree, Group, Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

export const metadata = {
  title: 'Content',
};

const contentTree = [
  {
    label: 'UI/UX Design',
    value: 'ui-ux',
    children: [
      { label: 'Module 1: Introduction', value: 'm1' },
      { label: 'Module 2: Design Systems', value: 'm2' },
      { label: 'Module 3: Prototyping', value: 'm3' },
    ],
  },
  {
    label: 'Software Engineering',
    value: 'swe',
    children: [
      { label: 'Module 1: Foundations', value: 'swe-m1' },
      { label: 'Module 2: Frontend', value: 'swe-m2' },
    ],
  },
];

export default function ContentPage() {
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
        <Tree data={contentTree} />
      </Card>
    </div>
  );
}
