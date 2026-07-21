'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container, Card, Title, Text, TextInput, PasswordInput, Button, Alert, Stack, Loader, Center } from '@mantine/core';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';

function AcceptInviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    setTokenValid(!!token);
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/invite/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, fullName }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to accept invitation.');
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-950 p-6">
      <Container size="xs" w="100%">
        <Card withBorder className="bg-slate-900/50 border-slate-800 p-8">
          <Title order={2} className="text-white text-center mb-2">
            CeTech <span className="text-brand-400">Admin</span>
          </Title>
          <Text c="dimmed" size="sm" ta="center" className="mb-8">
            Accept your invitation and set your password.
          </Text>

          {!tokenValid ? (
            <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
              Invalid invitation link.
            </Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                {error && (
                  <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
                    {error}
                  </Alert>
                )}

                <TextInput
                  label="Full Name"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.currentTarget.value)}
                  required
                  styles={{
                    input: { backgroundColor: '#0f172a', borderColor: '#334155', color: 'white' },
                    label: { color: '#94a3b8' },
                  }}
                />

                <PasswordInput
                  label="Password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                  required
                  minLength={8}
                  styles={{
                    input: { backgroundColor: '#0f172a', borderColor: '#334155', color: 'white' },
                    label: { color: '#94a3b8' },
                  }}
                />

                <PasswordInput
                  label="Confirm Password"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.currentTarget.value)}
                  required
                  minLength={8}
                  styles={{
                    input: { backgroundColor: '#0f172a', borderColor: '#334155', color: 'white' },
                    label: { color: '#94a3b8' },
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  size="md"
                  loading={loading}
                  color="brand"
                  mt="sm"
                  leftSection={<IconCheck size={18} />}
                >
                  Accept Invitation
                </Button>
              </Stack>
            </form>
          )}
        </Card>
      </Container>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-brand-950">
          <Loader color="brand" size="xl" />
        </div>
      }
    >
      <AcceptInviteForm />
    </Suspense>
  );
}
