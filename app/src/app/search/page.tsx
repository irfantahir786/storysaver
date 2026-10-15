import type { Metadata } from 'next';
import SearchPage from '@/components/snapsaver/SearchPage';
import { fetchSettings } from '@/app/actions';

async function getSeoData() {
  try {
    const data = await fetchSettings();
    const settings = data?.web || {};
    const seoSetting = settings['seo_search'];
    if (seoSetting?.value) {
      return JSON.parse(seoSetting.value);
    }
  } catch (e) {}
  return null;
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoData();
  return {
    title: seo?.title || 'Search Instagram Profiles | View & Download User Stories',
    description: seo?.description || 'Search for any Instagram profile to view and download their stories, posts, and profile pictures instantly. Fast, free, and anonymous profile search.',
    alternates: {
      canonical: '/search',
    },
  };
}

export default async function Search() {
  const seo = await getSeoData();
  return <SearchPage seoTitle={seo?.title} seoDescription={seo?.description} />;
}