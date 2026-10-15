import type { Metadata } from 'next';
import PhotoDownloaderPage from '@/components/snapsaver/PhotoDownloaderPage';
import { fetchSettings } from '@/app/actions';

async function getSeoData() {
  try {
    const data = await fetchSettings();
    const settings = data?.web || {};
    const seoSetting = settings['seo_photo'];
    if (seoSetting?.value) {
      return JSON.parse(seoSetting.value);
    }
  } catch (e) {}
  return null;
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoData();
  return {
    title: seo?.title || 'Instagram Photo Downloader | Save Posts & Images in HD',
    description: seo?.description || 'Download Instagram photos and image posts by pasting the link. Save any public photo post directly to your device in high resolution with SnapSaver.',
    alternates: {
      canonical: '/instagram-photo-downloader',
    },
  };
}

export default async function PhotoPage() {
    const seo = await getSeoData();
    return <PhotoDownloaderPage seoTitle={seo?.title} seoDescription={seo?.description} />;
}
