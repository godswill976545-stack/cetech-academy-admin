'use client';

import { Container, Card, Title, Text, Button } from '@mantine/core';
import { useRouter } from 'next/navigation';

export default function UnauthorizedPage() {
  const router = useRouter();

  const handleSignOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-950 p-6">
      <Container size="sm">
        <Card withBorder className="bg-slate-900/50 border-slate-800 text-center p-8">
          <Title order={2} className="text-white mb-4">Access Denied</Title>
          <Text c="dimmed" className="mb-6">
            You are signed in, but your account does not have admin access.
            Contact a CeTech super-admin if you believe this is an error.
          </Text>
          <Button onClick={handleSignOut} variant="light" color="red">
            Sign out and return to login
          </Button>
        </Card>
      </Container>
    </div>
  );
}
