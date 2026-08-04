'use client';

import { Accordion, Alert, Badge, Card, Center, Group, Loader, Table, Text, ThemeIcon } from '@mantine/core';
import { IconAlertCircle, IconBook2, IconSchool } from '@tabler/icons-react';
import { useCurriculum } from '@/lib/hooks';

export default function ContentPage() {
  const { data: modules = [], isLoading, error } = useCurriculum();
  if (isLoading) return <Center className="min-h-[60vh]"><Loader color="brand" size="lg" /></Center>;
  if (error) return <Alert icon={<IconAlertCircle size={17} />} title="Curriculum is unavailable" color="red" variant="light">{error.message}</Alert>;
  const tracks = modules.reduce((acc, mod) => { const track = mod.track || 'General'; (acc[track] ||= []).push(mod); return acc; }, {} as Record<string, typeof modules>);
  const trackEntries = Object.entries(tracks);

  return <div><div className="admin-page-header"><div><div className="admin-eyebrow">Learning library</div><h1 className="admin-page-title">Curriculum & content.</h1><Text className="admin-page-subtitle">A structured view of what learners are studying, from course level down to individual units and lessons.</Text></div><Badge color="brand" variant="light" size="lg" leftSection={<IconBook2 size={15} />}>{modules.length} courses</Badge></div>{trackEntries.length === 0 ? <Card className="admin-surface" padding="xl"><Text c="dimmed" ta="center" py="xl">No curriculum modules found.</Text></Card> : <Accordion multiple defaultValue={trackEntries.map(([track]) => track)}>{trackEntries.map(([track, mods]) => <Accordion.Item key={track} value={track}><Accordion.Control><Group><ThemeIcon color="brand" variant="light" size="sm" radius="xl"><IconSchool size={15} /></ThemeIcon><Text fw={700} c="white">{track}</Text><Badge color="gray" variant="light">{mods.length} course{mods.length !== 1 ? 's' : ''}</Badge></Group></Accordion.Control><Accordion.Panel><Card className="admin-surface" padding={0}><div className="admin-table-wrap"><Table highlightOnHover verticalSpacing="md"><Table.Thead><Table.Tr><Table.Th>Course</Table.Th><Table.Th>Level</Table.Th><Table.Th>Lessons</Table.Th><Table.Th>Units</Table.Th></Table.Tr></Table.Thead><Table.Tbody>{mods.map((mod) => <Table.Tr key={mod.id}><Table.Td><Text fw={700} c="white" size="sm">{mod.title}</Text></Table.Td><Table.Td><Badge color="gray" variant="light">{mod.level || 'General'}</Badge></Table.Td><Table.Td>{Array.isArray(mod.lessons) ? mod.lessons.length : 0}</Table.Td><Table.Td>{Array.isArray(mod.units) ? mod.units.length : 0}</Table.Td></Table.Tr>)}</Table.Tbody></Table></div></Card></Accordion.Panel></Accordion.Item>)}</Accordion>}</div>;
}
