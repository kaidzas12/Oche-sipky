import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Oche bazár',
  description: 'Bazár pre šípkarov: šípky, terče, surround, osvetlenie a vybavenie z druhej ruky.',
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', colorScheme: 'light dark' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sk">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;800&family=IBM+Plex+Mono:wght@400;500&family=Instrument+Sans:wght@400;500;600&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
