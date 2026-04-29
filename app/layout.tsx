import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'OmniSee - 360 Social',
  description: 'Share immersive 360 experiences. Connect globally. Own your visual journey.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script src="https://unpkg.com/marzipano@0.10.4/dist/marzipano.js" crossOrigin="anonymous"></script>
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}