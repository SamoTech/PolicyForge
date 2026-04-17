import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PolicyForge — Windows Policy Search',
  description: 'Search 140+ Windows security policies, registry paths, PowerShell commands, and Intune OMA-URIs. MITRE ATT&CK mapped.',
  openGraph: {
    title: 'PolicyForge — Windows Policy Search',
    description: 'Search 140+ Windows security policies, registry paths, PowerShell commands, and Intune OMA-URIs.',
    type: 'website',
    siteName: 'PolicyForge',
  },
  twitter: {
    card: 'summary',
    title: 'PolicyForge — Windows Policy Search',
    description: 'Search 140+ Windows security policies, registry paths, PowerShell commands, and Intune OMA-URIs.',
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&f[]=jetbrains-mono@400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
