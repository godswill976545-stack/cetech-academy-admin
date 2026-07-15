import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import '@/styles/tailwind.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const mantineTheme = createTheme({
  primaryColor: 'brand',
  colors: {
    brand: [
      '#f0f7ff',
      '#e0effe',
      '#bae0fd',
      '#7cc7fb',
      '#38a9f8',
      '#007bff',
      '#0061cc',
      '#004da3',
      '#003e85',
      '#00356e',
    ],
  },
  fontFamily: 'var(--font-inter), Inter, sans-serif',
  headings: {
    fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif',
  },
});

export const metadata: Metadata = {
  title: { default: 'CeTech Academy Admin', template: '%s | CeTech Admin' },
  description: 'Administration console for CeTech Academy.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <ClerkProvider>
          <MantineProvider theme={mantineTheme} defaultColorScheme="dark">
            <Notifications position="top-right" zIndex={1000} />
            {children}
          </MantineProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
