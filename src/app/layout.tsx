import type { Metadata } from 'next';
import { Instrument_Sans } from 'next/font/google';
import '@/styles/styles.scss';
import ClientLayout from './ClientLayout'; 

const instrument = Instrument_Sans({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MalukForever',
  description: 'Enhance Your Beauty',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={instrument.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}