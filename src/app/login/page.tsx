'use client';

import { SignIn } from '@clerk/nextjs';
import { Card, Title, Text } from '@mantine/core';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-950 p-6">
      <Card withBorder className="w-full max-w-md bg-slate-900/50 border-slate-800">
        <Title order={2} className="text-center mb-2 text-white">CeTech Admin</Title>
        <Text c="dimmed" size="sm" className="text-center mb-6">
          Staff and admin access only.
        </Text>

        <SignIn
          routing="path"
          path="/login"
          signUpUrl="/login"
          fallbackRedirectUrl="/dashboard"
          forceRedirectUrl="/dashboard"
          // Clerk's appearance types are permissive at runtime but strict in generated types.
          // Cast to `any` so we can theme inputs without fighting the type definitions.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          appearance={{
            variables: {
              colorPrimary: '#007bff',
              colorBackground: 'transparent',
              colorInputBackground: '#0f172a',
              colorInputText: '#f8fafc',
              colorDanger: '#ef4444',
              borderRadius: '0.75rem',
            },
            elements: {
              card: { boxShadow: 'none', background: 'transparent' },
              headerTitle: { color: '#f8fafc' },
              headerSubtitle: { color: '#94a3b8' },
              socialButtonsBlockButton: { background: '#1e293b', color: '#f8fafc' },
              formButtonPrimary: { background: '#007bff', color: '#ffffff' },
              footerActionLink: { color: '#38a9f8' },
            },
          } as any}
        />
      </Card>
    </div>
  );
}
