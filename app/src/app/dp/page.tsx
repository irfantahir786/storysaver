import type { Metadata } from 'next';
import DpDownloaderPage from '@/components/snapsaver/DpDownloaderPage';
import { fetchSettings } from '@/app/actions';

async function getSeoData() {
  try {
    const data = await fetchSettings();
    const settings = data?.web || {};
    const seoSetting = settings['seo_dp'];
    if (seoSetting?.value) {
      return JSON.parse(seoSetting.value);
    }
  } catch (e) {}
  return null;
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoData();
  return {
    title: seo?.title || 'Instagram DP Downloader | View & Save Profile Pictures in HD',
    description: seo?.description || 'Download full-size, high-quality Instagram profile pictures (DP) for any user. Simply enter the username and save the HD DP instantly with SnapSaver.',
    alternates: {
      canonical: '/dp',
    },
  };
}

export default async function DpPage() {
  const seo = await getSeoData();
  return <DpDownloaderPage seoTitle={seo?.title} seoDescription={seo?.description} />;
}