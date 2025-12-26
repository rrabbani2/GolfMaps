import type { Metadata } from 'next';
import './globals.css';
import NavBar from '@/components/NavBar';

export const metadata: Metadata = {
  title: 'GolfMaps - Discover Golf Courses',
  description: 'Interactive golf course map with weather, busyness, and course fit ratings',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <NavBar />
        <main>{children}</main>
      </body>
    </html>
  );
}

