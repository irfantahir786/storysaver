
"use client";

import { useState, useRef, useEffect } from 'react';
import { Download, Check, ShieldCheck, Zap, Globe, Unlock, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { fetchHighlightMedia } from '@/app/actions';
import type { ContentItem } from '@/lib/types';
import { LoadingSpinner } from '@/components/snapsaver/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';
import { ContentGrid } from '@/components/snapsaver/ContentGrid';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { BannerAd } from '@/components/snapsaver/BannerAd';
import { AdDialog } from '@/components/snapsaver/AdDialog';
import { PublicHeader } from '@/components/snapsaver/PublicHeader';

interface HighlightsDownloaderPageProps {
  seoTitle?: string;
  seoDescription?: string;
}

export default function HighlightsDownloaderPage({ seoTitle, seoDescription }: HighlightsDownloaderPageProps) {
  const [link, setLink] = useState('');
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdDialogOpen, setIsAdDialogOpen] = useState(false);
  const [pendingResults, setPendingResults] = useState<ContentItem[]>([]);
  const { toast } = useToast();
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (content.length > 0 && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [content]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!link) {
      toast({
        variant: 'destructive',
        title: 'Link Required',
        description: 'Please paste a specific Instagram highlight link or ID to continue.',
      });
      return;
    }

    setIsLoading(true);
    setContent([]);

    try {
      let numericId = '';
      if (link.includes('instagram.com/stories/highlights/')) {
        const urlString = link.trim().startsWith('http') ? link.trim() : `https://${link.trim()}`;
        try {
            const url = new URL(urlString);
            const pathSegments = url.pathname.split('/').filter(Boolean);
            numericId = pathSegments[pathSegments.length - 1];
        } catch (e) {
            const segments = link.split('/').filter(Boolean);
            numericId = segments[segments.length - 1];
        }
      } else {
        numericId = link.trim().split('/').filter(Boolean).pop() || '';
      }

      if (!numericId || isNaN(Number(numericId))) {
        throw new Error("Could not extract a valid Highlight ID from the provided link.");
      }

      const highlightIdWithPrefix = `highlight:${numericId}`;
      const result = await fetchHighlightMedia(highlightIdWithPrefix);

      if (result && result.items.length > 0) {
        setPendingResults(result.items);
        setIsAdDialogOpen(true);
      } else {
        toast({
          variant: 'destructive',
          title: 'Highlights Not Found',
          description: "This highlight collection may be private or no longer available.",
        });
        setIsLoading(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      toast({
        variant: 'destructive',
        title: 'Error Processing Request',
        description: errorMessage,
      });
      setIsLoading(false);
    }
  };

  const handleAdClose = () => {
    setIsAdDialogOpen(false);
    setContent(pendingResults);
    setIsLoading(false);
  };

  return (
    <>
      <AdDialog isOpen={isAdDialogOpen} onClose={handleAdClose} />
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <PublicHeader />
        
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-gray-900 dark:text-white mb-3 leading-tight">
                  {seoTitle || 'SnapSaver'}
                </h1>
                <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 font-medium">
                  {seoDescription || 'Download high-quality Instagram Highlights effortlessly.'}
                </p>
              </div>

              <Card className="shadow-lg border-none">
                <CardContent className="p-6 md:p-8 space-y-6">
                  <Tabs defaultValue="highlights" className="w-full">
                      <TabsList className="grid w-full grid-cols-4 bg-red-100 dark:bg-red-900/40 p-1 h-auto rounded-lg shadow-inner">
                          <TabsTrigger value="story" asChild><Link href="/" className="w-full">Story</Link></TabsTrigger>
                          <TabsTrigger value="highlights" asChild><Link href="/highlights" className="w-full">Highlights</Link></TabsTrigger>
                          <TabsTrigger value="dp" asChild><Link href="/insta-dp-viewer" className="w-full">DP</Link></TabsTrigger>
                          <TabsTrigger value="reels" asChild><Link href="/instagram-reels-downloader" className="w-full">Reels / Post</Link></TabsTrigger>
                      </TabsList>
                  </Tabs>
                  <hr className="border-gray-200 dark:border-gray-700" />
                  <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100">
                    Download Instagram Highlights
                  </h2>
                  <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                    <Input
                      type="text"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      placeholder="Paste highlight link or ID here..."
                      className="flex-grow text-base bg-gray-100 border-none focus-visible:ring-2 focus-visible:ring-red-500 h-12 rounded-xl"
                    />
                    <Button type="submit" disabled={isLoading} className="bg-red-600 hover:bg-red-700 text-white shrink-0 h-12 px-8 rounded-xl font-bold text-base transition-all">
                      {isLoading ? <LoadingSpinner className="mr-2" /> : <Download className="mr-2 h-5 w-5" />}
                      <span>{isLoading ? 'Fetching...' : 'Download'}</span>
                    </Button>
                  </form>
                  <BannerAd />
                </CardContent>
              </Card>
          </div>
          
          {isLoading && !isAdDialogOpen && (
            <div className="flex justify-center py-12">
              <LoadingSpinner className="h-12 w-12 text-red-600" />
            </div>
          )}
          
          {content.length > 0 && !isLoading && (
            <div ref={resultsRef} className="max-w-4xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <h3 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-200">
                Highlight Media Found
              </h3>
              <ContentGrid items={content} downloadType="Story" />
            </div>
          )}

          {!isLoading && content.length === 0 && (
            <div className="max-w-4xl mx-auto mt-16 space-y-20">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-10 text-gray-800 dark:text-gray-100">Quick Guide</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xl">1</div>
                    <p className="text-lg text-gray-600 dark:text-gray-400">Go to Instagram and copy the profile URL or the specific Highlight link.</p>
                  </div>
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xl">2</div>
                    <p className="text-lg text-gray-600 dark:text-gray-400">Paste the link into our tool and hit the <strong>Download</strong> button.</p>
                  </div>
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xl">3</div>
                    <p className="text-lg text-gray-600 dark:text-gray-400">Save the high-quality photos or videos directly to your device.</p>
                  </div>
                </div>
              </div>

              <div className="text-gray-700 dark:text-gray-300">
                <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100 text-left">About Instagram Highlights Downloader</h2>
                <div className="space-y-4 text-lg">
                  <p>
                    Instagram Highlights are a beautiful way to keep your best stories alive — but what happens when you want them on your phone, laptop, or backed up safely?
                  </p>
                  <p>
                    Our Instagram Highlights Downloader lets you save any public Highlight reel directly to your device in high quality. Whether it's your own content, inspiration from your favorite creator, or memories you never want to lose — we've got you covered.
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    <li className="flex items-center gap-2 font-medium"><Check className="h-5 w-5 text-green-500" /> No signup required</li>
                    <li className="flex items-center gap-2 font-medium"><Check className="h-5 w-5 text-green-500" /> 100% free to use</li>
                    <li className="flex items-center gap-2 font-medium"><Check className="h-5 w-5 text-green-500" /> Works on mobile & desktop</li>
                    <li className="flex items-center gap-2 font-medium"><Check className="h-5 w-5 text-green-500" /> High-quality video & image downloads</li>
                    <li className="flex items-center gap-2 font-medium"><Check className="h-5 w-5 text-green-500" /> Fast & secure</li>
                  </ul>
                </div>

                <div className="mt-12">
                  <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Key Features</h3>
                  <Card className="border-none shadow-sm overflow-hidden rounded-2xl bg-white dark:bg-gray-800">
                    <Table>
                      <TableHeader className="bg-slate-50 dark:bg-slate-900">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="font-bold text-slate-900 dark:text-white h-12 px-6">Feature</TableHead>
                          <TableHead className="font-bold text-slate-900 dark:text-white h-12 px-6">Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="border-slate-100 dark:border-slate-700">
                          <TableCell className="font-bold px-6 py-4 flex items-center gap-2"><Unlock className="h-4 w-4 text-blue-500" /> No Login Needed</TableCell>
                          <TableCell className="px-6 py-4">Download without connecting your Instagram account</TableCell>
                        </TableRow>
                        <TableRow className="border-slate-100 dark:border-slate-700">
                          <TableCell className="font-bold px-6 py-4 flex items-center gap-2"><Globe className="h-4 w-4 text-purple-500" /> Cross-Platform</TableCell>
                          <TableCell className="px-6 py-4">Works on Android, iPhone, Windows & Mac</TableCell>
                        </TableRow>
                        <TableRow className="border-slate-100 dark:border-slate-700">
                          <TableCell className="font-bold px-6 py-4 flex items-center gap-2"><Zap className="h-4 w-4 text-yellow-500" /> HD Quality</TableCell>
                          <TableCell className="px-6 py-4">Get original resolution videos and images</TableCell>
                        </TableRow>
                        <TableRow className="border-slate-100 dark:border-slate-700">
                          <TableCell className="font-bold px-6 py-4 flex items-center gap-2"><Zap className="h-4 w-4 text-orange-500" /> Fast Downloads</TableCell>
                          <TableCell className="px-6 py-4">No waiting — results in seconds</TableCell>
                        </TableRow>
                        <TableRow className="border-slate-100 dark:border-slate-700">
                          <TableCell className="font-bold px-6 py-4 flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-green-500" /> Privacy Safe</TableCell>
                          <TableCell className="px-6 py-4">We don't store your data or downloads</TableCell>
                        </TableRow>
                        <TableRow className="border-none">
                          <TableCell className="font-bold px-6 py-4 flex items-center gap-2"><Globe className="h-4 w-4 text-indigo-500" /> Unlimited Use</TableCell>
                          <TableCell className="px-6 py-4">Download as many Highlights as you need</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Card>
                </div>
              </div>

              <div className="text-gray-700 dark:text-gray-300 pb-20">
                <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100 text-left flex items-center gap-2">
                  <HelpCircle className="h-8 w-8 text-red-600" /> Frequently Asked Questions
                </h2>
                <Accordion type="single" collapsible className="w-full bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-sm border">
                  <AccordionItem value="faq-1" className="border-none px-4">
                    <AccordionTrigger className="text-lg font-bold hover:no-underline py-5 text-left">Is it free to use?</AccordionTrigger>
                    <AccordionContent className="text-base text-gray-500 dark:text-gray-400 pb-5">
                      Yes, completely free. No hidden charges, no premium tiers.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-2" className="border-none px-4">
                    <AccordionTrigger className="text-lg font-bold hover:no-underline py-5 text-left">Do I need an Instagram account to use this tool?</AccordionTrigger>
                    <AccordionContent className="text-base text-gray-500 dark:text-gray-400 pb-5">
                      No. You only need the public profile or Highlight URL.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-3" className="border-none px-4">
                    <AccordionTrigger className="text-lg font-bold hover:no-underline py-5 text-left">Can I download private Instagram Highlights?</AccordionTrigger>
                    <AccordionContent className="text-base text-gray-500 dark:text-gray-400 pb-5">
                      No. The tool only works with publicly accessible profiles and Highlights.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-4" className="border-none px-4">
                    <AccordionTrigger className="text-lg font-bold hover:no-underline py-5 text-left">Is it safe to use?</AccordionTrigger>
                    <AccordionContent className="text-base text-gray-500 dark:text-gray-400 pb-5">
                      Absolutely. We don't ask for your Instagram credentials, and your data is never stored on our servers.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-5" className="border-none px-4">
                    <AccordionTrigger className="text-lg font-bold hover:no-underline py-5 text-left">What formats can I download in?</AccordionTrigger>
                    <AccordionContent className="text-base text-gray-500 dark:text-gray-400 pb-5">
                      You can download Highlights as MP4 (videos) or JPG/PNG (images) depending on the content type.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-6" className="border-none px-4">
                    <AccordionTrigger className="text-lg font-bold hover:no-underline py-5 text-left">How many Highlights can I download at once?</AccordionTrigger>
                    <AccordionContent className="text-base text-gray-500 dark:text-gray-400 pb-5">
                      There's no limit — download as many as you need, one at a time.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          )}
        </main>
        
        <footer className="bg-gray-800 text-gray-300 py-10 mt-auto">
            <div className="container mx-auto text-center">
                <div className="flex justify-center gap-8 mb-6">
                    <Link href="/contact" className="text-sm font-medium hover:text-white transition-colors">Contact</Link>
                    <Link href="/privacy-policy" className="text-sm font-medium hover:text-white transition-colors">Privacy Policy</Link>
                    <Link href="/terms-and-conditions" className="text-sm font-medium hover:text-white transition-colors">Terms & Conditions</Link>
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">SnapSaver &copy; {new Date().getFullYear()}. For educational purposes only.</p>
            </div>
        </footer>
      </div>
    </>
  );
}
