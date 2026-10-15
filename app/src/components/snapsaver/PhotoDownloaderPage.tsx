"use client";

import { useState, useRef, useEffect } from 'react';
import { Download, Heart, MessageCircle, Bookmark, HelpCircle, Check, Zap, ShieldCheck, Globe, Unlock } from 'lucide-react';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AdSenseUnit } from '@/components/snapsaver/AdSenseUnit';
import { DpViewer } from './DpViewer';

interface PhotoDownloaderPageProps {
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

export default function PhotoDownloaderPage({ seoTitle, seoDescription }: PhotoDownloaderPageProps) {
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
        description: `Please enter an Instagram Photo or Post link to download.`,
      });
      return;
    }

    if (!link.includes('instagram.com')) {
      toast({
        variant: 'destructive',
        title: 'Invalid Link',
        description: 'Please paste a valid Instagram link to download Photos.',
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
      toast({ variant: 'destructive', title: 'Download failed', description: 'CORS or Network error.' });
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
              {seoDescription || 'Download Instagram Photos and Posts instantly in high quality.'}
            </p>
          </div>

          <Card className="shadow-lg border-none">
            <CardContent className="p-6 md:p-8 space-y-6">
              <DownloaderTabs />

              <AdSenseUnit slot="above-input-ad" />

              <div className="pt-2 space-y-6">
                <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100">
                  Download Instagram Photos & Posts
                </h2>

                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="text"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="Paste Instagram Photo or Post link..."
                    className="flex-grow text-base bg-gray-100 border-none focus-visible:ring-2 focus-visible:ring-red-500 h-12 rounded-xl dark:bg-gray-800 dark:text-white dark:placeholder:text-slate-500"
                  />
                  <Button type="submit" disabled={isLoading} className="bg-red-600 hover:bg-red-700 text-white shrink-0 h-12 px-6 text-base font-bold rounded-xl transition-all">
                    {isLoading ? <LoadingSpinner className="mr-2" /> : <Download className="mr-2 h-5 w-5" />}
                    <span>{isLoading ? 'Fetching...' : 'Download'}</span>
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
                  <p className="text-lg text-gray-600 dark:text-gray-400">Copy the link of the Instagram <strong>Photo or Post</strong> from your app or browser.</p>
                </div>
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xl">2</div>
                  <p className="text-lg text-gray-600 dark:text-gray-400">Paste the link into the input field above.</p>
                </div>
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xl">3</div>
                  <p className="text-lg text-gray-600 dark:text-gray-400">Click <strong>Download</strong> to view and save the photo in high quality.</p>
                </div>
              </div>
            </div>

            <div className="text-gray-700 dark:text-gray-300">
              <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">Best Instagram Photo Downloader</h2>
              <div className="space-y-4 text-lg">
                <p>
                  Insta Photo Downloader is an Instagram post downloader tool that can help you to download Instagram photos online of your friends easily with a simple step. StorySaver is a powerful Web App that is the best and fast tool for downloading any type of photo from Instagram easily. You can download Instagram photos in original high quality.
                </p>
                <p>
                  A lot of people are searching for the best and most working Photo Downloader on the internet, but most of the tools are not working properly. StorySaver is the most usable and reliable tool available on the internet. You can also install the shortcut to visit our tool easily without remembering the URL.
                </p>
                <p>
                  Insta Photo Downloader tool is a superfast tool that works on any device or web browser, you can download any Instagram photo easily without using any third-party App. It can download the Instagram photo of any public user in all HD formats on all devices.
                </p>
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
                        <TableCell className="px-6 py-4">Get original resolution images</TableCell>
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
                        <TableCell className="px-6 py-4">Download as many Photos as you need</TableCell>
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
                  <AccordionTrigger className="text-lg font-bold hover:no-underline py-5 text-left">Do I have to pay to download an Instagram photo?</AccordionTrigger>
                  <AccordionContent className="text-base text-gray-500 dark:text-gray-400 pb-5">
                    No, our Photo Downloader is 100% free to use with no limits or hidden charges.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-2" className="border-none px-4">
                  <AccordionTrigger className="text-lg font-bold hover:no-underline py-5 text-left">How to use Photo Downloader for Instagram?</AccordionTrigger>
                  <AccordionContent className="text-base text-gray-500 dark:text-gray-400 pb-5">
                    Simply copy the link of the Instagram post, paste it into the box above, and click Download.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-3" className="border-none px-4">
                  <AccordionTrigger className="text-lg font-bold hover:no-underline py-5 text-left">Can I download photos from private accounts?</AccordionTrigger>
                  <AccordionContent className="text-base text-gray-500 dark:text-gray-400 pb-5">
                    No, our tool only works with content from public Instagram accounts for security and privacy reasons.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-4" className="border-none px-4">
                  <AccordionTrigger className="text-lg font-bold hover:no-underline py-5 text-left">Is it safe to use this tool?</AccordionTrigger>
                  <AccordionContent className="text-base text-gray-500 dark:text-gray-400 pb-5">
                    Yes, it's completely safe. We do not require you to log in, and we do not store any of your data.
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
