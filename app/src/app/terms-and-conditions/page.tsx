
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Read the Terms and Conditions for using SnapSaver. By using our website, you agree to comply with our terms of service. Please review them carefully.',
  alternates: {
    canonical: '/terms-and-conditions',
  },
};

export default function TermsAndConditionsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
            <Card className="shadow-xl p-4 md:p-8">
                <CardHeader>
                    <CardTitle className="text-3xl md:text-4xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">Terms & Conditions</CardTitle>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none space-y-4 text-gray-700 dark:text-gray-300">
                    <p>By using our website, you agree to comply with and be bound by the following terms and conditions of use. Please review these terms and conditions carefully. If you do not agree to these terms and conditions, you should not use this site.</p>
                    
                    <h2 className="text-xl font-semibold mt-6">1. Acceptance of Agreement.</h2>
                    <p>You agree to the terms and conditions outlined in this Terms and Conditions of use Agreement (Agreement) with respect to our site. This Agreement constitutes the entire and only agreement between us and you, and supersedes all prior or contemporaneaous agreements, representations, warranties and understandings with respect to the Site, the content, products or services provided by or through the Site, and the subject matter of this Agreement.</p>

                    <h2 className="text-xl font-semibold mt-6">2. Copyright.</h2>
                    <p>The content, organization, graphics, design, compilation, magnetic translation, digital conversion and other matters related to the Site are protected under applicable copyrights, trademarks and other proprietary (including but not limited to intellectual property) rights. The copying, redistribution, use or publication by you of any such matters or any part of the Site is strictly prohibited.</p>

                    <h2 className="text-xl font-semibold mt-6">3. Limited Right to Use.</h2>
                    <p>The viewing, printing or downloading of any content, graphic, form or document from the Site grants you only a limited, nonexclusive license for use solely by you for your own personal use and not for republication, distribution, assignment, sublicense, sale, preparation of derivative works or other use.</p>

                    <h2 className="text-xl font-semibold mt-6">4. Disclaimer.</h2>
                    <p>We are not affiliated with Instagram or any other social media site. We do not host any of the Instagram Photos, Videos or Stories on our server. All the content is served from their respective social media site.</p>

                    <h2 className="text-xl font-semibold mt-6">Contact Us</h2>
                    <p>
                        If you have any questions about these Terms, please <Link href="/contact" className="text-primary hover:underline">contact us</Link>.
                    </p>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
