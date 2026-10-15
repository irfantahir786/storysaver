import type { Metadata } from 'next';
import ReelsDownloaderPage from '@/components/snapsaver/ReelsDownloaderPage';
import { fetchSettings } from '@/app/actions';

async function getSeoData() {
  try {
    const data = await fetchSettings();
    const settings = data?.web || {};
    const seoSetting = settings['seo_reels'];
    if (seoSetting?.value) {
      return JSON.parse(seoSetting.value);
    }
  } catch (e) { }
  return null;
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoData();
  return {
    title: seo?.title || 'Instagram Reels & Post Downloader | Save Videos & Photos',
    description: seo?.description || 'Download Instagram Reels, videos, and photo posts by pasting the link. Save any public Reel or post directly to your device in high resolution with SnapSaver.',
    alternates: {
      canonical: '/instagram-reels-downloader',
    },
  };
}

export default async function ReelsPage() {
  const seo = await getSeoData();
  return <ReelsDownloaderPage seoTitle={seo?.title} seoDescription={seo?.description} />;
}