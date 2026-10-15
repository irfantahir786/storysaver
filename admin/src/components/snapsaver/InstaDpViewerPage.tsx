
"use client";

import { useState, useRef, useEffect } from 'react';
import { Download, Check, Lock, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { fetchBaseDP } from '@/app/actions';
import type { ContentItem } from '@/lib/types';
import { LoadingSpinner } from '@/components/snapsaver/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';
import { ContentCard } from '@/components/snapsaver/ContentCard';
import Link from 'next/link';
import { BannerAd } from '@/components/snapsaver/BannerAd';
import { AdDialog } from '@/components/snapsaver/AdDialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PublicHeader } from '@/components/snapsaver/PublicHeader';
import { Badge } from '@/components/ui/badge';

export default function InstaDpViewerPage() {
  const [link, setLink] = useState('');
  const [content, setContent] = useState<ContentItem[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdDialogOpen, setIsAdDialogOpen] = useState(false);
  const [pendingResults, setPendingResults] = useState<{user: any, items: ContentItem[]} | null>(null);
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
        title: 'Input required',
        description: `Please enter a username to download a DP.`,
      });
      return;
    }

    setIsLoading(true);
    setContent([]);
    setUserProfile(null);

    try {
      const username = link.includes('instagram.com')
        ? link.split('/').filter(Boolean).pop() ?? ''
        : link.trim();

      const result = await fetchBaseDP(username);
      
      if (result && result.status === 'ok' && result.user) {
        const dpContent = [{
          id: 'dp1',
          type: 'photo' as const,
          url: result.user.profile_pic,
          thumbnailUrl: result.user.profile_pic,
        }];
        setPendingResults({ user: result.user, items: dpContent });
        setIsAdDialogOpen(true);
      } else {
        throw new Error(result?.message || "Could not find profile picture.");
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      toast({
        variant: 'destructive',
        title: 'Error fetching DP',
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
                <h1 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-3">
                    SnapSaver
                </h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
                    View and download high-resolution Instagram Profile Pictures anonymously.
                </p>
              </div>

              <Card className="shadow-lg border-none">
                <CardContent className="p-6 md:p-8 space-y-6">
                    <Tabs defaultValue="dp" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 bg-red-100 dark:bg-red-900/40 p-1 h-auto rounded-lg shadow-inner">
                            <TabsTrigger value="story" asChild><Link href="/" className="w-full">Story</Link></TabsTrigger>
                            <TabsTrigger value="highlights" asChild><Link href="/highlights" className="w-full">Highlights</Link></TabsTrigger>
                            <TabsTrigger value="dp" asChild><Link href="/insta-dp-viewer" className="w-full">DP</Link></TabsTrigger>
                            <TabsTrigger value="reels" asChild><Link href="/instagram-reels-downloader" className="w-full">Reels / Post</Link></TabsTrigger>
                        </TabsList>
                    </Tabs>
                    
                    <hr className="border-gray-200 dark:border-gray-700" />
                   <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100">
                    Download Instagram Profile Picture
                  </h2>
                  
                  <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                    <Input
                      type="text"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      placeholder="Enter Instagram username..."
                      className="flex-grow text-base bg-gray-100 border-none focus-visible:ring-2 focus-visible:ring-red-500 h-12 rounded-xl dark:bg-gray-800"
                      aria-label="DP username"
                    />
                    <Button type="submit" disabled={isLoading} className="bg-red-600 hover:bg-red-700 text-white shrink-0 h-12 px-6 text-base font-bold rounded-xl transition-all">
                      {isLoading ? (
                        <>
                          <LoadingSpinner className="mr-2" />
                          <span>Searching...</span>
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
            <div className="flex justify-center py-10">
              <LoadingSpinner className="h-10 w-10 text-red-600" />
            </div>
          )}
          
          {content.length > 0 && !isLoading && (
            <div ref={resultsRef} className="max-w-4xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex flex-col items-center mb-6">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">@{userProfile?.username}</h3>
                    {userProfile?.is_verified && (
                        <Badge className="bg-blue-500 hover:bg-blue-500 p-0.5 rounded-full h-5 w-5 flex items-center justify-center">
                            <Check className="h-3 w-3 text-white stroke-[3]" />
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-2 text-slate-500 font-medium">
                    <span>{userProfile?.name}</span>
                    {userProfile?.is_private && (
                        <div className="bg-slate-100 p-1 rounded-md" title="Private Account">
                            <Lock className="h-3 w-3 text-slate-400" />
                        </div>
                    )}
                </div>
             </div>

               <h3 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-200">
                Found Full Size Profile Picture
              </h3>
              <div className="flex justify-center">
                <div className="w-full max-w-md">
                   <ContentCard 
                        item={content[0]} 
                        allItems={content}
                        startIndex={0}
                        downloadType="DP" 
                    />
                </div>
              </div>
            </div>
          )}
          
          {!isLoading && content.length === 0 && (
            <div className="max-w-4xl mx-auto mt-16 space-y-20">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-10 text-gray-800 dark:text-gray-100">Quick Guide</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xl">1</div>
                    <p className="text-lg text-gray-600 dark:text-gray-400">First of all, copy the <strong>username</strong> of the Instagram User from the Instagram App or Website.</p>
                  </div>
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xl">2</div>
                    <p className="text-lg text-gray-600 dark:text-gray-400">Paste the username inside the input bar of the <strong>Insta DP Viewer</strong> and click on download.</p>
                  </div>
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xl">3</div>
                    <p className="text-lg text-gray-600 dark:text-gray-400">Wait for 3-5 seconds and the HD DP will appear. Click <strong>Download</strong> to save it to your gallery.</p>
                  </div>
                </div>
              </div>

              <div className="text-gray-700 dark:text-gray-300">
                <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100 text-left">Best Insta DP Viewer</h2>
                <div className="space-y-4 text-lg text-left">
                    <p>Insta DP Viewer is an Instagram Profile Picture Viewer tool that can help you to view and download Instagram DP online of your friends easily with a simple step. Insta DP is a powerful Web App that is the best and fast tool for downloading HD Insta DP of any user Instagram easily.</p>
                    <p>A lot of people are searching for the best and most working Insta DP Downloader on the internet, but most of the tools are not working properly. But the Insta DP Viewer tool is the most usable and reliable tool available on the internet. You can also install the shortcut to visit Insta DP Downloader easily without remembering the URL.</p>
                </div>
              </div>
              
              <div className="text-gray-700 dark:text-gray-300 pb-20">
                <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">
                    <HelpCircle className="h-8 w-8 text-red-600 inline-block mr-2" /> Frequently Asked Questions
                </h2>
                <Accordion type="single" collapsible className="w-full bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-sm border">
                    <AccordionItem value="item-1" className="border-none px-4">
                        <AccordionTrigger className="text-lg font-semibold hover:no-underline py-5 text-left">Can I Download any Insta DP?</AccordionTrigger>
                        <AccordionContent className="text-base text-gray-500 pb-5">
                            Yes, you can download Insta DP of any public account.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-none px-4">
                        <AccordionTrigger className="text-lg font-semibold hover:no-underline py-5 text-left">How to use Insta DP Viewer?</AccordionTrigger>
                        <AccordionContent className="text-base text-gray-500 pb-5">
                            Open the Insta DP Viewer web app and insert the username of Instagram and click on the download button. Wait for a while and you will be able to download Insta DP to the gallery.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-none px-4">
                        <AccordionTrigger className="text-lg font-semibold hover:no-underline py-5 text-left">Where the Downloaded Insta DP is stored?</AccordionTrigger>
                        <AccordionContent className="text-base text-gray-500 pb-5">
                            The downloaded file will appear in the downloaded section of your browser.
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
                    <Link href="/terms-and-conditions" className="text-sm font-medium hover:text-white transition-colors">Terms & Condition</Link>
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">SnapSaver &copy; {new Date().getFullYear()}. For educational purposes only.</p>
            </div>
        </footer>
      </div>
    </>
  );
}
