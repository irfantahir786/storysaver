
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Inter } from 'next/font/google'
import { fetchSettings } from '@/app/actions';
import { SiteShell } from '@/components/snapsaver/SiteShell';
import { ThemeProvider } from '@/components/snapsaver/ThemeProvider';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export async function generateMetadata(): Promise<Metadata> {
  let keywords = ['Instagram downloader', 'story saver', 'reels downloader'];
  let appName = 'SnapSaver';
  let appSlogan = 'Download Instagram Content';

  try {
    const data = await fetchSettings();
    const settings = data?.web || {};

    if (settings.app_name?.value) {
      appName = settings.app_name.value;
    }
    if (settings.app_slogan?.value) {
      appSlogan = settings.app_slogan.value;
    }

    const keywordsSetting = settings.meta_keywords;
    if (keywordsSetting?.value) {
      keywords = keywordsSetting.value.split(',').map((k: string) => k.trim());
    }
  } catch (e) { }

  return {
    title: {
      default: `${appName} - ${appSlogan}`,
      template: `%s | ${appName}`,
    },
    description: `${appName} is the best free tool for downloading Instagram stories, reels, videos, photos, and profile pictures in HD. Fast, anonymous, and easy to use.`,
    keywords: keywords,
    icons: {
      icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 rx=%2224%22 fill=%22url(%23g)%22/><defs><linearGradient id=%22g%22 x1=%220%22 y1=%220%22 x2=%221%22 y2=%221%22><stop offset=%220%25%22 stop-color=%22%23d40a44%22/><stop offset=%22100%25%22 stop-color=%22%23f9720a%22/></linearGradient></defs><text y=%22.95em%22 x=%2250%25%22 text-anchor=%22middle%22 font-family=%22system-ui, sans-serif%22 font-weight=%22900%22 font-size=%2265%22 fill=%22white%22>SS</text></svg>',
    },
    authors: [{ name: `${appName} Team` }],
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: 'https://snapsaver.in',
      siteName: appName,
      title: `${appName} - Pro Instagram Content Downloader`,
      description: `Save Instagram Stories, Reels, and HD Profile Pictures instantly with ${appName}.`,
      images: [
        {
          url: 'https://snapsaver.in/og-image.png',
          width: 1200,
          height: 630,
          alt: `${appName} - Instagram Downloader`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${appName} - Download Instagram Media in HD`,
      description: `Fast and free downloader for Instagram Stories, Reels, and DP.`,
    },
    robots: {
      index: true,
      follow: true,
    }
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="font-sans antialiased h-full">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SiteShell>
            {children}
          </SiteShell>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
