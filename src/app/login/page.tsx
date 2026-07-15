'use client';

import { useState } from 'react';
import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Card, TextInput, PasswordInput, Button, Title, Text, Alert, Tabs } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

export default function LoginPage() {
  const { signIn } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn) return;
    setLoading(true);
    setError('');

    if (mode === 'signin') {
      const { error: signInErr } = await signIn.password({
        identifier: email.trim(),
        password,
      });

      if (signInErr) {
        setError('Invalid credentials.');
        setLoading(false);
        return;
      }

      // Role validation happens server-side in the admin layout.
      // If the user is not an admin/staff, they will be redirected back to /login.
      await signIn.finalize({ navigate: () => router.push('/dashboard') });
      return;
    }

    // Sign-up mode is disabled for admin portal — accounts must be invited.
    setError('Admin accounts are invite-only. Please contact a super-admin.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-950 p-6">
      <Card withBorder className="w-full max-w-md bg-slate-900/50 border-slate-800">
        <Title order={2} className="text-center mb-2 text-white">CeTech Admin</Title>
        <Text c="dimmed" size="sm" className="text-center mb-6">
          Staff and admin access only.
        </Text>

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" className="mb-4">
            {error}
          </Alert>
        )}

        <Tabs value={mode} onChange={(v) => setMode(v as 'signin' | 'signup')} className="mb-4">
          <Tabs.List>
            <Tabs.Tab value="signin">Sign In</Tabs.Tab>
            <Tabs.Tab value="signup">Request Access</Tabs.Tab>
          </Tabs.List>
        </Tabs>

        <form onSubmit={handleSubmit}>
          <TextInput
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            className="mb-4"
            required
          />
          <PasswordInput
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            className="mb-6"
            required
          />
          <Button type="submit" color="brand" fullWidth loading={loading}>
            {mode === 'signin' ? 'Sign In' : 'Request Access'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
