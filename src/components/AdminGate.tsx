'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Center, Loader, Text } from '@mantine/core';

export function AdminGate({ reason }: { reason: 'unauthorized' | 'unauthenticated' }) {
  const router = useRouter();

  useEffect(() => {
    // Small delay lets Clerk finish any iframe verification before we navigate.
    const timer = setTimeout(() => {
      router.replace(reason === 'unauthorized' ? '/unauthorized' : '/login');
    }, 150);
    return () => clearTimeout(timer);
  }, [reason, router]);

  return (
    <Center className="min-h-screen bg-brand-950">
      <Loader color="brand" />
      <Text ml="sm" c="dimmed">
        Verifying access…
      </Text>
    </Center>
  );
}
