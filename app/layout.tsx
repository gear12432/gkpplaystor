import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AppChromeShell } from '@/components/AppChromeShell';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'APK Hub – Fast & Secure APK Downloader',
  description:
    'Download your favourite Android apps and games for free with APK Hub. Explore trending APKs, top charts, categories, and verified open-source packages.',
  openGraph: {
    title: 'APK Hub – Fast & Secure APK Downloader',
    description:
      'Download your favourite Android apps and games for free with APK Hub. Explore trending APKs, top charts, categories, and verified open-source packages.',
    type: 'website',
    siteName: 'APK Hub',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'APK Hub – Fast & Secure APK Downloader',
    description:
      'Download your favourite Android apps and games for free with APK Hub. Explore trending APKs, top charts, categories, and verified open-source packages.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body
        suppressHydrationWarning
        className="font-sans antialiased min-h-screen flex flex-col bg-[#F5F8FF] dark:bg-[#0B1229] text-[#111827] dark:text-slate-100 transition-colors"
      >
        <ThemeProvider>
          <AppChromeShell>{children}</AppChromeShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
