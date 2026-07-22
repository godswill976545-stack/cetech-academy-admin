'use client';

import { useState, useEffect } from 'react';
import { Title, Text, Card, Switch, Group, Button, Select, Loader, Alert, Stack, NumberInput } from '@mantine/core';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { useSettings, useUpdateSettings } from '@/lib/hooks';

export default function SettingsPage() {
  const { data: settings, isLoading, error } = useSettings();
  const updateSettings = useUpdateSettings();

  const [portalAccess, setPortalAccess] = useState<string>('first');
  const [auditLogRetention, setAuditLogRetention] = useState(true);
  const [allowAdminRefunds, setAllowAdminRefunds] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings) {
      setPortalAccess(settings.portalAccess || 'first');
      setAuditLogRetention(settings.auditLogRetention ?? true);
      setAllowAdminRefunds(settings.allowAdminRefunds ?? false);
    }
  }, [settings]);

  const handleChange = () => {
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync({
        portalAccess: portalAccess as 'first' | 'full',
        auditLogRetention,
        allowAdminRefunds,
      });
      setHasChanges(false);
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  if (isLoading) {
    return (
      <Center className="min-h-[60vh]">
        <Loader color="brand" size="xl" />
      </Center>
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
        <Stack gap="md">
          <Select
            label="Portal Access"
            value={portalAccess}
            onChange={(val) => { setPortalAccess(val || 'first'); handleChange(); }}
            data={[
              { value: 'first', label: 'Unlock on first instalment' },
              { value: 'full', label: 'Unlock on full payment' },
            ]}
            styles={{
              input: { backgroundColor: '#0f172a', borderColor: '#334155', color: 'white' },
              label: { color: '#94a3b8' },
            }}
          />
        </Stack>
      </Card>

      <Card withBorder className="bg-slate-900/50 border-slate-800 mb-6">
        <Title order={4} className="mb-4 text-white">Security & Audit</Title>
        <Text c="dimmed" size="sm" className="mb-4">
          Configure security policies and audit log retention.
        </Text>
        <Stack gap="md">
          <Switch
            label="Enable audit-log retention"
            checked={auditLogRetention}
            onChange={(e) => { setAuditLogRetention(e.currentTarget.checked); handleChange(); }}
          />
          <Switch
            label="Allow admin refunds"
            checked={allowAdminRefunds}
            onChange={(e) => { setAllowAdminRefunds(e.currentTarget.checked); handleChange(); }}
          />
        </Stack>
      </Card>

      <Group justify="flex-end">
        <Button
          color="brand"
          loading={updateSettings.isPending}
          disabled={!hasChanges}
          onClick={handleSave}
          leftSection={<IconCheck size={16} />}
        >
          Save Settings
        </Button>
      </Group>
    </div>
  );
}
