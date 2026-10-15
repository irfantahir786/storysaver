
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Read the Privacy Policy for SnapSaver. We are committed to protecting your data and privacy. Our policy details the information we collect and how it is used.',
  alternates: {
    canonical: '/privacy-policy',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
            <Card className="shadow-xl p-4 md:p-8">
                <CardHeader>
                    <CardTitle className="text-3xl md:text-4xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">Privacy Policy</CardTitle>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none space-y-4 text-gray-700 dark:text-gray-300">
                    <p>This privacy policy has been compiled to better serve those who are concerned with how their 'Personally identifiable information' (PII) is being used online. PII, as used in US privacy law and information security, is information that can be used on its own or with other information to identify, contact, or locate a single person, or to identify an individual in context. Please read our privacy policy carefully to get a clear understanding of how we collect, use, protect or otherwise handle your Personally Identifiable Information in accordance with our website.</p>

                    <h2 className="text-xl font-semibold mt-6">What personal information do we collect from the people that visit our blog or website?</h2>
                    <p>We do not collect any personal information from visitors of our site.</p>

                    <h2 className="text-xl font-semibold mt-6">When do we collect information?</h2>
                    <p>We do not collect any information from you when you visit or enter information on our site.</p>

                    <h2 className="text-xl font-semibold mt-6">How do we use your information?</h2>
                    <p>We do not use your information in any way.</p>

                    <h2 className="text-xl font-semibold mt-6">Do we use 'cookies'?</h2>
                    <p>Yes. Cookies are small files that a site or its service provider transfers to your computer's hard drive through your Web browser (if you allow) that enables the site's or service provider's systems to recognize your browser and capture and remember certain information. We use cookies to compile aggregate data about site traffic and site interaction so that we can offer better site experiences and tools in the future.</p>

                    <h2 className="text-xl font-semibold mt-6">Third Party Disclosure</h2>
                    <p>We do not sell, trade, or otherwise transfer to outside parties your Personally Identifiable Information.</p>

                    <h2 className="text-xl font-semibold mt-6">Third party links</h2>
                    <p>Occasionally, at our discretion, we may include or offer third party products or services on our website. These third party sites have separate and independent privacy policies. We therefore have no responsibility or liability for the content and activities of these linked sites. Nonetheless, we seek to protect the integrity of our site and welcome any feedback about these sites.</p>

                    <h2 className="text-xl font-semibold mt-6">Google</h2>
                    <p>Google's advertising requirements can be summed up by Google's Advertising Principles. They are put in place to provide a positive experience for users. We use Google AdSense Advertising on our website.</p>
                    
                    <h2 className="text-xl font-semibold mt-6">Contacting Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy, please <Link href="/contact" className="text-primary hover:underline">contact us</Link>.
                    </p>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
