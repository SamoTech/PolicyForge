import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PolicyForge — Windows Policy Intelligence',
  description:
    'Search 110+ Windows security policies with registry paths, PowerShell, Intune OMA-URIs and MITRE ATT&CK mapping.',
  openGraph: {
    title: 'PolicyForge',
    description: 'Windows Group Policy intelligence platform',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body>{children}</body>
    </html>
  );
}