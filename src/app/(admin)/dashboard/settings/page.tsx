'use client';

import { Title, Text, Card, Switch, Group, Button, Select, Loader, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface Settings {
  portalAccess: 'first' | 'full';
  auditLogRetention: boolean;
  allowAdminRefunds: boolean;
}

function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data } = await api.get<Settings>('/admin/settings');
      return data;
    },
  });
}

function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Partial<Settings>) => {
      const { data } = await api.patch<Settings>('/admin/settings', settings);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}

export default function SettingsPage() {
  const { data: settings, isLoading, error } = useSettings();
  const updateSettings = useUpdateSettings();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader color="brand" size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="Error loading settings" color="red">
        {error.message}
      </Alert>
    );
  }

  return (
    <div>
      <Title order={2} className="mb-6 text-white">Settings</Title>

      <Card withBorder className="bg-slate-900/50 border-slate-800 mb-6">
        <Title order={4} className="mb-4 text-white">Access & Payment Policy</Title>
        <Text c="dimmed" size="sm" className="mb-4">
          Configure when portal access unlocks and which currencies/gateways are active.
        </Text>
        <Group className="mb-4">
          <Select
            label="Portal Access"
            defaultValue={settings?.portalAccess || 'first'}
            data={[
              { value: 'first', label: 'Unlock on first instalment' },
              { value: 'full', label: 'Unlock on full payment' },
            ]}
          />
        </Group>
      </Card>

      <Card withBorder className="bg-slate-900/50 border-slate-800">
        <Title order={4} className="mb-4 text-white">Super Admin Only</Title>
        <Text c="dimmed" size="sm" className="mb-4">
          Destructive operations and provider configuration require super-admin privileges.
        </Text>
        <Group>
          <Switch
            label="Enable audit-log retention"
            defaultChecked={settings?.auditLogRetention ?? true}
          />
          <Switch
            label="Allow admin refunds"
            defaultChecked={settings?.allowAdminRefunds ?? false}
          />
        </Group>
        <Button
          color="red"
          className="mt-6"
          loading={updateSettings.isPending}
          onClick={() => updateSettings.mutate({})}
        >
          Save Settings
        </Button>
      </Card>
    </div>
  );
}
