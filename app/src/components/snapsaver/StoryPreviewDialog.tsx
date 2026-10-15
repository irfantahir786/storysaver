"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import type { ContentItem } from '@/lib/types';
import { LoadingSpinner } from './LoadingSpinner';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"

interface StoryPreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  items: ContentItem[];
  startIndex: number;
  downloadType: 'Story' | 'Reels' | 'DP' | 'Post';
}

/**
 * VideoItem - A sub-component to handle video play/pause logic
 * based on whether it is currently active in the viewpager.
 */
function VideoItem({ src, isActive }: { src: string; isActive: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    if (isActive) {
      // Small timeout to ensure the transition is smooth
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Auto-play was prevented by browser policy
        });
      }
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isActive]);

  return (
    <video
      ref={videoRef}
      src={src}
      controls
      playsInline
      className="w-full h-full object-contain"
    />
  );
}

export function StoryPreviewDialog({
  isOpen,
  onOpenChange,
  items,
  startIndex,
  downloadType,
}: StoryPreviewDialogProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(startIndex);
  const [count, setCount] = useState(0);

  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const currentItem = items[current] || items[startIndex];

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    const handleSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on("select", handleSelect);

    return () => {
      api.off("select", handleSelect);
    };
  }, [api]);

  useEffect(() => {
    if (isOpen && api) {
      api.scrollTo(startIndex, true);
      setCurrent(startIndex);
    }
  }, [isOpen, startIndex, api]);


  const handleDownload = async () => {
    if (!currentItem) return;

    setIsDownloading(true);
    try {
      toast({
        title: "Download Started",
        description: `Preparing your ${currentItem.type}...`,
      });

      // Use proxy to bypass CORS

      const response = await fetch(currentItem.url);

      if (!response.ok) throw new Error('Failed to fetch media through proxy');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `snapsaver-${downloadType.toLowerCase()}-${currentItem.id}.${currentItem.type === 'photo' ? 'jpg' : 'mp4'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: 'Could not retrieve file. Please try again.',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "p-0 border-0 w-full max-w-md bg-white dark:bg-gray-900 text-card-foreground grid grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden",
          "sm:max-w-lg rounded-2xl shadow-2xl"
        )}
      >
        <DialogHeader className="pt-5 px-6 pb-2 border-b border-slate-100 dark:border-gray-800">
          <DialogTitle className="text-xl font-black text-slate-900 dark:text-white pr-10">
            {downloadType} {items.length > 1 ? `(${current + 1}/${count})` : ''}
          </DialogTitle>
        </DialogHeader>

        <Carousel setApi={setApi} opts={{ startIndex }} className="w-full relative overflow-hidden">
          <CarouselContent>
            {items.map((item, index) => (
              <CarouselItem key={item.id || index}>
                <div className="h-full max-h-[70vh] p-1 flex items-center justify-center">
                  <div className="relative w-full h-full overflow-hidden rounded-md bg-black flex items-center justify-center aspect-[9/16]">
                    {item.type === 'photo' ? (
                      <Image
                        src={item.url}
                        alt={`Instagram content`}
                        fill
                        className="object-contain w-full h-full"
                        unoptimized
                      />
                    ) : (
                      <VideoItem
                        src={item.url}
                        isActive={index === current && isOpen}
                      />
                    )}
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {items.length > 1 && (
            <>
              <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 text-black bg-white/70 hover:bg-white border-none shadow-md h-10 w-10" />
              <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 text-black bg-white/70 hover:bg-white border-none shadow-md h-10 w-10" />
            </>
          )}
        </Carousel>

        <DialogFooter className="px-4 pb-4 pt-2">
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 font-bold gap-2 rounded-xl shadow-lg"
          >
            {isDownloading ? (
              <LoadingSpinner className="h-5 w-5" />
            ) : (
              <Download className="h-5 w-5" />
            )}
            <span>{isDownloading ? 'Downloading...' : `Download ${currentItem?.type === 'video' ? 'Video' : 'Photo'}`}</span>
          </Button>
        </DialogFooter>

        <DialogClose className="absolute right-4 top-4 rounded-full bg-slate-100 dark:bg-gray-800 p-2 text-slate-500 dark:text-gray-400 transition-all hover:bg-slate-200 dark:hover:bg-gray-700 hover:text-slate-900 dark:hover:text-white focus:outline-none">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}