import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: "Don't Break The Chain",
  description: "Build powerful daily habits using the Seinfeld method. Track streaks, visualize your chain, and stay consistent.",
  keywords: ['habit tracker', 'streak', 'productivity', 'don\'t break the chain', 'Seinfeld'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
