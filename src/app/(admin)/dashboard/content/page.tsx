'use client';

import { Title, Text, Card, Table, Badge, Group, Loader, Alert, Center, Accordion } from '@mantine/core';
import { IconAlertCircle, IconBook, IconSchool } from '@tabler/icons-react';
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
    const track = mod.track || 'General';
    if (!acc[track]) acc[track] = [];
    acc[track].push(mod);
    return acc;
  }, {} as Record<string, typeof modules>);

  const trackEntries = Object.entries(tracks);

  return (
    <div>
      <Group justify="space-between" className="mb-6">
        <Title order={2} className="text-white">Curriculum & Content</Title>
        <Group>
          <Badge color="gray" variant="light" size="lg">
            <IconBook size={14} style={{ marginRight: 4 }} />
            {modules.length} course{modules.length !== 1 ? 's' : ''}
          </Badge>
        </Group>
      </Group>

      {trackEntries.length === 0 ? (
        <Card withBorder className="bg-slate-900/50 border-slate-800">
          <Text c="dimmed" className="text-center py-8">No curriculum modules found</Text>
        </Card>
      ) : (
        <Accordion multiple defaultValue={trackEntries.map(([track]) => track)}>
          {trackEntries.map(([track, mods]) => (
            <Accordion.Item key={track} value={track}>
              <Accordion.Control>
                <Group>
                  <IconSchool size={18} className="text-brand-400" />
                  <Text fw={600} c="white">{track}</Text>
                  <Badge color="gray" variant="light">{mods.length} course{mods.length !== 1 ? 's' : ''}</Badge>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <Table highlightOnHover>
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Level</th>
                      <th>Lessons</th>
                      <th>Units</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mods.map((mod) => (
                      <tr key={mod.id}>
                        <td>{mod.title}</td>
                        <td>
                          <Badge color="gray" variant="light">{mod.level || 'General'}</Badge>
                        </td>
                        <td>{Array.isArray(mod.lessons) ? mod.lessons.length : 0}</td>
                        <td>{mod.unitCount || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      )}
    </div>
  );
}
