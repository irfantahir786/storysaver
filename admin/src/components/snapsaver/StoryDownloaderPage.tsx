
"use client";

import { useState, useRef, useEffect } from 'react';
import { Download, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { fetchStoryByMediaId, fetchSettings } from '@/app/actions';
import type { ContentItem } from '@/lib/types';
import { LoadingSpinner } from '@/components/snapsaver/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';
import { ContentGrid } from '@/components/snapsaver/ContentGrid';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { BannerAd } from '@/components/snapsaver/BannerAd';
import { AdDialog } from '@/components/snapsaver/AdDialog';
import { PublicHeader } from '@/components/snapsaver/PublicHeader';

interface StoryDownloaderPageProps {
  seoTitle?: string;
  seoDescription?: string;
}

export default function StoryDownloaderPage({ seoTitle, seoDescription }: StoryDownloaderPageProps) {
  const [link, setLink] = useState('');
  const [content, setContent] = useState<ContentItem[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdDialogOpen, setIsAdDialogOpen] = useState(false);
  const [pendingResults, setPendingResults] = useState<{user: any, items: ContentItem[]} | null>(null);
  const [appName, setAppName] = useState('SnapSaver');
  const { toast } = useToast();
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadGlobalBranding() {
      try {
        const data = await fetchSettings();
        if (data?.web?.app_name?.value) {
          setAppName(data.web.app_name.value);
        }
      } catch (e) {}
    }
    loadGlobalBranding();
  }, []);

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
        description: 'Please paste a specific Instagram story link to continue.',
      });
      return;
    }

    setIsLoading(true);
    setContent([]);
    setUserProfile(null);

    try {
      if (!link.includes('instagram.com/stories/')) {
        throw new Error("Invalid URL. Please provide a direct link to a specific story (e.g., /stories/username/1234...).");
      }

      const url = new URL(link.startsWith('http') ? link : `https://${link}`);
      const pathSegments = url.pathname.split('/').filter(Boolean);
      
      if (pathSegments.length < 3) {
        throw new Error("Specific media ID not found in the link. Open the story first, then copy the URL from your browser.");
      }

      const mediaId = pathSegments[2];
      const result = await fetchStoryByMediaId(mediaId);

      if (result && result.items.length > 0) {
        setPendingResults(result);
        setIsAdDialogOpen(true);
      } else {
        toast({
          variant: 'destructive',
          title: 'Media Not Found',
          description: "This story may have expired or is no longer available.",
        });
        setIsLoading(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      toast({
        variant: 'destructive',
        title: 'Error Processing Link',
        description: errorMessage,
      });
      setIsLoading(false);
    }
  };

  const handleAdClose = () => {
    setIsAdDialogOpen(false);
    if (pendingResults) {
      setContent(pendingResults.items);
      setUserProfile(pendingResults.user);
    }
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
                  {seoTitle || appName}
                </h1>
                <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 font-medium">
                  {seoDescription || `Download Instagram stories in high quality with ${appName}.`}
                </p>
              </div>

              <Card className="shadow-lg border-none">
                <CardContent className="p-6 md:p-8 space-y-6">
                  <Tabs defaultValue="story" className="w-full">
                      <TabsList className="grid w-full grid-cols-4 bg-red-100 dark:bg-red-900/40 p-1 h-auto rounded-lg shadow-inner">
                          <TabsTrigger value="story" asChild><Link href="/" className="w-full">Story</Link></TabsTrigger>
                          <TabsTrigger value="highlights" asChild><Link href="/highlights" className="w-full">Highlights</Link></TabsTrigger>
                          <TabsTrigger value="dp" asChild><Link href="/insta-dp-viewer" className="w-full">DP</Link></TabsTrigger>
                          <TabsTrigger value="reels" asChild><Link href="/instagram-reels-downloader" className="w-full">Reels / Post</Link></TabsTrigger>
                      </TabsList>
                  </Tabs>
                  
                  <hr className="border-gray-200 dark:border-gray-700" />
                  
                  <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100">
                    Download Instagram Story
                  </h2>
                  
                  <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                    <Input
                      type="text"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      placeholder="Paste specific story link here..."
                      className="flex-grow text-base bg-gray-100 border-none focus-visible:ring-2 focus-visible:ring-red-500 h-12 rounded-xl"
                      aria-label="Story link"
                    />
                    <Button type="submit" disabled={isLoading} className="bg-red-600 hover:bg-red-700 text-white shrink-0 h-12 px-8 rounded-xl font-bold text-base transition-all">
                      {isLoading ? (
                        <>
                          <LoadingSpinner className="mr-2" />
                          <span>Fetching...</span>
                        </>
                      ) : (
                         <>
                          <Download className="mr-2 h-5 w-5" />
                          <span>Download</span>
                        </>
                      )}
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
          
          {(content.length > 0 || userProfile) && !isLoading && (
            <div ref={resultsRef} className="max-w-4xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <h3 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-200">
                Story Media Found
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
                    <p className="text-lg text-gray-600 dark:text-gray-400">Open the <strong>specific story</strong> you want to save on Instagram.</p>
                  </div>
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xl">2</div>
                    <p className="text-lg text-gray-600 dark:text-gray-400">Copy the <strong>URL from the address bar</strong> (must include the media ID).</p>
                  </div>
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xl">3</div>
                    <p className="text-lg text-gray-600 dark:text-gray-400">Paste it above and click <strong>Download</strong> to get your high-quality file.</p>
                  </div>
                </div>
              </div>

              <div className="text-gray-700 dark:text-gray-300">
                <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">Best Instagram Story Downloader</h2>
                <div className="space-y-4 text-lg">
                  <p>
                    StorySaver.in is an Instagram Story Downloader tool that can help you to download Instagram stories online of your friends easily with a simple step. StorySaver is a powerful Web App that is the best and fast tool for downloading any type of story (photo or video) from Instagram easily. You can download Instagram stories in full hd 60 fps formats.
                  </p>
                  <p>
                    A lot of people are searching for the best and working Story Saver on the internet, but most of the tools are not working properly. But the StorySaver tool is the most usable and reliable tool available on the internet. You can also install the shortcut to visit Story Saver for Instagarm easily without remembering the URL.
                  </p>
                  <p>
                    Insta Story Downloader tool is a superfast tool that works on any device or web browser, you can download any Instagram Story easily without using any third-party App. It can download the Instagram Story of any public user in all HD formats on all devices.
                  </p>
                </div>
              </div>

              <div className="text-gray-700 dark:text-gray-300 pb-20">
                <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100 text-left flex items-center gap-2">
                  <HelpCircle className="h-8 w-8 text-red-600" /> Frequently Asked Questions
                </h2>
                <Accordion type="single" collapsible className="w-full bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-sm border">
                  <AccordionItem value="faq-1" className="border-none px-4">
                    <AccordionTrigger className="text-lg font-bold hover:no-underline py-5 text-left">Do I have to pay to download Instagram Story?</AccordionTrigger>
                    <AccordionContent className="text-base text-gray-500 dark:text-gray-400 pb-5">
                      StorySaver.in is a free Instagram Downloader Web App. You can download any Insta content including Videos, Photos, Reels, Stories, IGTV, Insta DP, without paying or without any limit.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-2" className="border-none px-4">
                    <AccordionTrigger className="text-lg font-bold hover:no-underline py-5 text-left">How to use Story Saver for Instagram?</AccordionTrigger>
                    <AccordionContent className="text-base text-gray-500 dark:text-gray-400 pb-5">
                      Open the Story Saver web app and insert the story link of Instagram and click on the download button. Wait for a while and you will be able to download Insta story to the gallery.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-3" className="border-none px-4">
                    <AccordionTrigger className="text-lg font-bold hover:no-underline py-5 text-left">Can I Download Story With Music?</AccordionTrigger>
                    <AccordionContent className="text-base text-gray-500 dark:text-gray-400 pb-5">
                      Yes you can download the Insta Story with music.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-4" className="border-none px-4">
                    <AccordionTrigger className="text-lg font-bold hover:no-underline py-5 text-left">Can I Download Story Images?</AccordionTrigger>
                    <AccordionContent className="text-base text-gray-500 dark:text-gray-400 pb-5">
                      Yes you can download the Images, also you can download story videos.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          )}
        </main>
        
        <footer className="bg-gray-800 text-gray-300 py-10">
            <div className="container mx-auto text-center">
                <div className="flex justify-center gap-8 mb-6">
                    <Link href="/contact" className="text-sm font-medium hover:text-white transition-colors">Contact</Link>
                    <Link href="/privacy-policy" className="text-sm font-medium hover:text-white transition-colors">Privacy Policy</Link>
                    <Link href="/terms-and-conditions" className="text-sm font-medium hover:text-white transition-colors">Terms & Conditions</Link>
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{appName} &copy; {new Date().getFullYear()}. For educational purposes only.</p>
            </div>
        </footer>
      </div>
    </>
  );
}
