import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Balkan Estate - Find Your Dream Property',
  description: 'Discover the best real estate properties in the Balkans. Search, save, and connect with sellers.',
  keywords: ['real estate', 'balkans', 'properties', 'houses', 'apartments'],
  openGraph: {
    title: 'Balkan Estate',
    description: 'Find Your Dream Property in the Balkans',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Leaflet CSS */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
