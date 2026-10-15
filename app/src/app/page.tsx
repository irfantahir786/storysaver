import type { Metadata } from 'next';
import StoryDownloaderPage from '@/components/snapsaver/StoryDownloaderPage';
import { fetchSettings } from '@/app/actions';

async function getSeoData() {
  try {
    const data = await fetchSettings();
    const settings = data?.web || {};
    const seoSetting = settings['seo_home'];
    if (seoSetting?.value) {
      return JSON.parse(seoSetting.value);
    }
  } catch (e) { }
  return null;
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoData();
  return {
    title: seo?.title || 'Instagram Story Downloader | Save Stories & Highlights Anonymously',
    description: seo?.description || 'Anonymously view and download Instagram stories in high quality. Enter a specific story link to save videos and photos instantly with SnapSaver.',
    alternates: {
      canonical: '/',
    },
  };
}

export default async function HomePage() {
  const seo = await getSeoData();
  return <StoryDownloaderPage seoTitle={seo?.title} seoDescription={seo?.description} />;
}