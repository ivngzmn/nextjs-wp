import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'TechCrunch | The latest technology news and information on startups',
  description:
    'Get the latest technology news, including new product releases, sales figures, and tech industry performance information.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased grid grid-rows-[auto_1fr_auto]`}
      >
        <header>
          {/* header goes here  */}
          Our header
        </header>
        {children}
        <footer className=''>
          {/* footer goes here */}
          This is my footer
        </footer>
      </body>
    </html>
  );
}
