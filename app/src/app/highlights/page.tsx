import type { Metadata } from 'next';
import HighlightsDownloaderPage from '@/components/snapsaver/HighlightsDownloaderPage';
import { fetchSettings } from '@/app/actions';

async function getSeoData() {
  try {
    const data = await fetchSettings();
    const settings = data?.web || {};
    const seoSetting = settings['seo_highlights'];
    if (seoSetting?.value) {
      return JSON.parse(seoSetting.value);
    }
    console.log(settings);
  } catch (e) {}
  return null;
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoData();
  return {
    title: seo?.title || 'Instagram Highlights Downloader | Save Highlights Anonymously',
    description: seo?.description || 'Download Instagram Highlights in high quality. Save highlight videos and photos instantly with SnapSaver by entering a username or specific link.',
    alternates: {
      canonical: '/highlights',
    },
  };
}

export default async function HighlightsPage() {
  const seo = await getSeoData();
  return <HighlightsDownloaderPage seoTitle={seo?.title} seoDescription={seo?.description} />;
}