'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Card, Title, Text, TextInput, PasswordInput, Button, Alert, Stack } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
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
            Staff and admin access only.
          </Text>

          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              {error && (
                <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
                  {error}
                </Alert>
              )}

              <TextInput
                label="Email"
                placeholder="admin@cetechacademy.com"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                required
                autoComplete="email"
                styles={{
                  input: { backgroundColor: '#0f172a', borderColor: '#334155', color: 'white' },
                  label: { color: '#94a3b8' },
                }}
              />

              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                required
                autoComplete="current-password"
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
              >
                Sign In
              </Button>
            </Stack>
          </form>
        </Card>
      </Container>
    </div>
  );
}
