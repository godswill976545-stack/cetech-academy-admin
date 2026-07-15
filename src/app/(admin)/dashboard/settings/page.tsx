import { Title, Text, Card, Switch, Group, Button, Select } from '@mantine/core';

export const metadata = {
  title: 'Settings',
};

export default function SettingsPage() {
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
            defaultValue="first"
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
          <Switch label="Enable audit-log retention" defaultChecked />
          <Switch label="Allow admin refunds" />
        </Group>
        <Button color="red" className="mt-6">Save Settings</Button>
      </Card>
    </div>
  );
}
