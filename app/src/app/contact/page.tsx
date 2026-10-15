import type { Metadata } from 'next';
import ContactForm from '@/components/snapsaver/ContactForm';
import { fetchSettings } from '@/app/actions';

async function getSeoData() {
  try {
    const data = await fetchSettings();
    const settings = data?.web || {};
    const seoSetting = settings['seo_contact'];
    if (seoSetting?.value) {
      return JSON.parse(seoSetting.value);
    }
  } catch (e) {}
  return null;
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoData();
  return {
    title: seo?.title || 'Contact Us | SnapSaver',
    description: seo?.description || 'Have questions, feedback, or a bug report? Contact the SnapSaver team. We are here to help you with any issues related to our Instagram downloader service.',
    alternates: {
      canonical: '/contact',
    },
  };
}

export default async function ContactPage() {
  const seo = await getSeoData();
  return <ContactForm seoTitle={seo?.title} seoDescription={seo?.description} />;
}