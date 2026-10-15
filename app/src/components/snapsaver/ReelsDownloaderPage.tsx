"use client";

import { useState, useRef, useEffect } from 'react';
import { Download, Heart, MessageCircle, Send, Bookmark, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { fetchStoryByMediaId } from '@/app/actions';
import type { ContentItem } from '@/lib/types';
import { LoadingSpinner } from '@/components/snapsaver/LoadingSpinner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ContentGrid } from '@/components/snapsaver/ContentGrid';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BannerAd } from '@/components/snapsaver/BannerAd';
import { AdDialog } from '@/components/snapsaver/AdDialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Image from 'next/image';
import { DownloaderTabs } from '@/components/snapsaver/DownloaderTabs';
import { AdSenseUnit } from '@/components/snapsaver/AdSenseUnit';
import { DpViewer } from './DpViewer';

interface ReelsDownloaderPageProps {
  seoTitle?: string;
  seoDescription?: string;
}

function getIdFromCode(code: string): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  let id = BigInt(0);

  for (let i = 0; i < code.length; i++) {
    const c = code[i];
    const index = alphabet.indexOf(c);
    if (index === -1) continue;
    id = id * BigInt(64) + BigInt(index);
  }

  return id.toString();
}

export default function ReelsDownloaderPage({ seoTitle, seoDescription }: ReelsDownloaderPageProps) {
  const [link, setLink] = useState('');
  const [content, setContent] = useState<ContentItem[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [caption, setCaption] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdDialogOpen, setIsAdDialogOpen] = useState(false);
  const [pendingContent, setPendingContent] = useState<{ user: any, items: ContentItem[], caption?: string | null, likes?: number } | null>(null);
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
        description: `Please enter a Reel or Post link to download.`,
      });
      return;
    }

    if (!link.includes('instagram.com')) {
      toast({
        variant: 'destructive',
        title: 'Invalid Link',
        description: 'Please paste a valid Instagram link to download Reels.',
      });
      return;
    }

    setIsLoading(true);
    setContent([]);
    setUserProfile(null);
    setCaption(null);

    try {
      let shortcode = '';
      try {
        const urlString = link.trim().startsWith('http') ? link.trim() : `https://${link.trim()}`;
        const url = new URL(urlString);
        const pathSegments = url.pathname.split('/').filter(Boolean);

        if (pathSegments[0] === 'p' || pathSegments[0] === 'reel' || pathSegments[0] === 'reels') {
          shortcode = pathSegments[1];
        } else if (pathSegments.length > 0) {
          shortcode = pathSegments[pathSegments.length - 1];
        }
      } catch (e) {
        shortcode = link.trim().split('/').filter(Boolean).pop() || '';
      }

      if (!shortcode) {
        throw new Error("Could not extract shortcode from the provided link.");
      }

      const mediaId = getIdFromCode(shortcode);
      const result = await fetchStoryByMediaId(mediaId);

      if (result && result.items && result.items.length > 0) {
        setPendingContent(result);
        setIsAdDialogOpen(true);
        setLink('');
      } else {
        toast({
          variant: 'destructive',
          title: 'No Content Found',
          description: "This media may be private or no longer available.",
        });
        setIsLoading(false);
      }
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error fetching data',
        description: err instanceof Error ? err.message : 'An unexpected error occurred.',
      });
      setIsLoading(false);
    }
  };

  const handleAdClose = () => {
    setIsAdDialogOpen(false);
    if (pendingContent) {
      setContent(pendingContent.items);
      setUserProfile(pendingContent.user);
      setCaption(pendingContent.caption || null);
    }
    setIsLoading(false);
  };

  const handleDownload = async (url: string, type: string) => {
    try {
      // Use proxy to bypass CORS
      const proxyUrl = `/api/media?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error('Proxy fetch failed');

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `storysaver.in-${type}-${Date.now()}.${type === 'photo' ? 'jpg' : 'mp4'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Download failed', description: 'Network error or CORS restriction.' });
    }
  };

  return (
    <>
      <AdDialog isOpen={isAdDialogOpen} onClose={handleAdClose} />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-gray-900 dark:text-white mb-3 leading-tight">
              { 'Story Saver'}
            </h1>
            <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 font-medium">
              {seoDescription || 'Download Instagram Reels, Videos, and Photos instantly in high quality.'}
            </p>
          </div>

          <Card className="shadow-lg border-none">
            <CardContent className="p-6 md:p-8 space-y-6">
              <DownloaderTabs />

              <AdSenseUnit slot="above-input-ad" />

              <div className="pt-2 space-y-6">
                <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100">
                  Download Instagram Reels & Posts
                </h2>

                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="text"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="Paste Instagram Reel or Post link..."
                    className="flex-grow text-base bg-gray-100 border-none focus-visible:ring-2 focus-visible:ring-red-500 h-12 rounded-xl dark:bg-gray-800 dark:text-white dark:placeholder:text-slate-500"
                  />
                  <Button type="submit" disabled={isLoading} className="bg-red-600 hover:bg-red-700 text-white shrink-0 h-12 px-6 text-base font-bold rounded-xl transition-all">
                    {isLoading ? <LoadingSpinner className="mr-2" /> : <Download className="mr-2 h-5 w-5" />}
                    <span>{isLoading ? 'Searching...' : 'Download'}</span>
                  </Button>
                </form>
              </div>
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
            {content.length > 1 ? (
              <>
                <h3 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-200">
                  Found Carousel Items ({content.length})
                </h3>
                <ContentGrid items={content} downloadType="Post" />
              </>
            ) : (
              <div className="max-w-lg mx-auto">
                <Card className="overflow-hidden border-none shadow-xl rounded-2xl bg-white dark:bg-gray-800">
                  <CardHeader className="p-4 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-slate-100 relative overflow-hidden">
                        <DpViewer url={`/api/media?url=${encodeURIComponent(userProfile.profile_pic)}`} />
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">@{userProfile?.username || 'instagram_user'}</span>
                        <span className="text-[10px] text-slate-500 font-medium">Original Post</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="relative aspect-square bg-black flex items-center justify-center overflow-hidden">
                      {content[0].type === 'video' ? (
                        <video src={content[0].url} controls className="w-full h-full object-contain" />
                      ) : (
                        <div className="relative w-full h-full min-h-[400px]">
                          <Image
                            src={content[0].url}
                            alt="Instagram content"
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      )}
                    </div>
                    <div className="p-4 space-y-4">
                      
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">@{userProfile?.username || 'user'}</p>
                        <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                          {caption || 'Downloaded via StorySaver.'}
                        </div>
                      </div>
                      <Button
                        className="w-full h-12 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 gap-2"
                        onClick={() => handleDownload(content[0].url, content[0].type)}
                      >
                        <Download className="h-5 w-5" />
                        Download High Res {content[0].type === 'video' ? 'Video' : 'Photo'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {!isLoading && content.length === 0 && (
          <div className="max-w-4xl mx-auto mt-16 space-y-20">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-10 text-gray-800 dark:text-gray-100">Quick Guide</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xl">1</div>
                  <p className="text-lg text-gray-600 dark:text-gray-400">Copy the link of the Instagram <strong>Reel or Post</strong> from your app or browser.</p>
                </div>
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xl">2</div>
                  <p className="text-lg text-gray-600 dark:text-gray-400">Paste the link into the input field above.</p>
                </div>
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xl">3</div>
                  <p className="text-lg text-gray-600 dark:text-gray-400">Click <strong>Download</strong> to view and save the content in high quality.</p>
                </div>
              </div>
            </div>

            <div className="text-gray-700 dark:text-gray-300">
              <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100 text-left">Best Instagram Reels Downloader</h2>
              <div className="space-y-4 text-lg">
                <p>
                  Insta Reels Downloader is an Instagram reels video Downloader tool that can help you to download Instagram reels videos online of your friends easily with a simple step. Insta Reels Saver is a powerful Web App that is the best and fast tool for downloading any type of Reels video from Instagram easily. You can download Instagram reels videos in full hd 60 fps formats.
                </p>
                <p>
                  A lot of people are searching for the best and most working Reels Downloader on the internet, but most of the tools are not working properly. But the Insta Reels Saver tool is the most usable and reliable tool available on the internet. You can also install the shortcut to visit Reels Downloader For Instagram easily without remembering the URL.
                </p>
                <p>
                  Insta Reels Downloader tool is a superfast tool that works on any device or web browser, you can download any Instagram reel video easily without using any third-party App. It can download the Instagram reel video of any public user in all HD formats on all devices.
                </p>
              </div>
            </div>

            <div className="text-gray-700 dark:text-gray-300 pb-20">
              <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100 text-left flex items-center gap-2">
                <HelpCircle className="h-8 w-8 text-red-600" /> Frequently Asked Questions
              </h2>
              <Accordion type="single" collapsible className="w-full bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-sm border">
                <AccordionItem value="faq-1" className="border-none px-4">
                  <AccordionTrigger className="text-lg font-bold hover:no-underline py-5 text-left">Do I have to pay to download an Instagram reel video?</AccordionTrigger>
                  <AccordionContent className="text-base text-gray-500 dark:text-gray-400 pb-5">
                    Reels Downloader is a free Instagram Reels Downloader Web App. You can download any Insta content including Videos, Photos, Reels, Stories, IGTV, Insta DP, without paying or without any limit.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-2" className="border-none px-4">
                  <AccordionTrigger className="text-lg font-bold hover:no-underline py-5 text-left">How to use Reels video Downloader for Instagram?</AccordionTrigger>
                  <AccordionContent className="text-base text-gray-500 dark:text-gray-400 pb-5">
                    Open the Reels Saver web app and insert the video or reel link of Instagram and click on the download button. Wait for a while and you will be able to download Insta reels to the gallery.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-3" className="border-none px-4">
                  <AccordionTrigger className="text-lg font-bold hover:no-underline py-5 text-left">Can I Download Reels With Music?</AccordionTrigger>
                  <AccordionContent className="text-base text-gray-500 dark:text-gray-400 pb-5">
                    Yes you can download the Insta Reels video with music.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-4" className="border-none px-4">
                  <AccordionTrigger className="text-lg font-bold hover:no-underline py-5 text-left">Can I Download Reels in HD format?</AccordionTrigger>
                  <AccordionContent className="text-base text-gray-500 dark:text-gray-400 pb-5">
                    Yes you can download the reels video in full HD format.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
