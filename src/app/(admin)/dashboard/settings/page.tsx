'use client';

import { useEffect, useState } from 'react';
import { Alert, Button, Card, Center, Group, Loader, Select, Stack, Switch, Text } from '@mantine/core';
import { IconAlertCircle, IconCheck, IconLock } from '@tabler/icons-react';
import { useSettings, useUpdateSettings } from '@/lib/hooks';

export default function SettingsPage() {
  const { data: settings, isLoading, error } = useSettings();
  const updateSettings = useUpdateSettings();
  const [portalAccess, setPortalAccess] = useState('first');
  const [auditLogRetention, setAuditLogRetention] = useState(true);
  const [allowAdminRefunds, setAllowAdminRefunds] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => { if (settings) { setPortalAccess(settings.portalAccess || 'first'); setAuditLogRetention(settings.auditLogRetention ?? true); setAllowAdminRefunds(settings.allowAdminRefunds ?? false); } }, [settings]);
  if (isLoading) return <Center className="min-h-[60vh]"><Loader color="brand" size="lg" /></Center>;
  if (error) return <Alert icon={<IconAlertCircle size={17} />} title="Settings are unavailable" color="red" variant="light">{error.message}</Alert>;
  const markChanged = () => setHasChanges(true);
  const handleSave = async () => { try { await updateSettings.mutateAsync({ portalAccess: portalAccess as 'first' | 'full', auditLogRetention, allowAdminRefunds }); setHasChanges(false); } catch (saveError) { console.error('Failed to save settings:', saveError); } };

  return <div><div className="admin-page-header"><div><div className="admin-eyebrow">Governance & policy</div><h1 className="admin-page-title">Settings.</h1><Text className="admin-page-subtitle">Control how access, payments, and operational audit data behave across the academy.</Text></div><div className="admin-eyebrow"><IconLock size={15} /> Protected workspace</div></div><Stack gap="md"><Card className="admin-surface" padding="xl"><Text className="admin-kicker">Access & payment policy</Text><Text c="white" fw={800} size="lg" mt={5}>When should learning access unlock?</Text><Text c="dimmed" size="sm" mt={5} mb="lg">Choose the payment milestone that unlocks the student portal.</Text><Select label="Portal access" value={portalAccess} onChange={(value) => { setPortalAccess(value || 'first'); markChanged(); }} data={[{ value: 'first', label: 'Unlock on first instalment' }, { value: 'full', label: 'Unlock on full payment' }]} /></Card><Card className="admin-surface" padding="xl"><Text className="admin-kicker">Security & audit</Text><Text c="white" fw={800} size="lg" mt={5}>Keep the control room accountable.</Text><Text c="dimmed" size="sm" mt={5} mb="lg">These policies affect administrative actions and audit history.</Text><Stack gap="lg"><Switch label="Enable audit-log retention" checked={auditLogRetention} onChange={(event) => { setAuditLogRetention(event.currentTarget.checked); markChanged(); }} /><Switch label="Allow admin refunds" description="Use only when your finance workflow requires it." checked={allowAdminRefunds} onChange={(event) => { setAllowAdminRefunds(event.currentTarget.checked); markChanged(); }} /></Stack></Card></Stack><Group justify="flex-end" mt="lg"><Button color="brand" loading={updateSettings.isPending} disabled={!hasChanges} onClick={handleSave} leftSection={<IconCheck size={16} />}>Save settings</Button></Group></div>;
}
