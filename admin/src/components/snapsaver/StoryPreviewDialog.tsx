
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
          // Usually requires user interaction or muted state
        });
      }
    } else {
      videoRef.current.pause();
      // Optionally reset time to 0 so it starts fresh next time
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

  // Sync current index with Carousel state
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
  
  // Reset carousel to start index when opened
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
        description: `Downloading ${currentItem.type}...`,
      });
      
      const response = await fetch(currentItem.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${downloadType.toLowerCase()}-${currentItem.id}.${currentItem.type === 'photo' ? 'jpg' : 'mp4'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
       <DialogContent className={cn(
        "p-0 border-0 w-full max-w-md bg-card text-card-foreground grid grid-rows-[auto_minmax(0,1fr)_auto]",
        "sm:max-w-lg"
      )}>
        <DialogHeader className="pt-4 px-4 pb-2">
          <DialogTitle className="text-lg font-semibold">
            {downloadType} {items.length > 1 ? `${current + 1} of ${count}` : ''}
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
                        alt={`Instagram photo`}
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
                className="w-full bg-blue-600 hover:bg-blue-700 h-12 font-bold gap-2 rounded-xl"
            >
                {isDownloading ? (
                    <LoadingSpinner className="h-5 w-5" />
                ) : (
                    <Download className="h-5 w-5" />
                )}
                <span>Download {currentItem?.type === 'video' ? 'Video' : 'Photo'}</span>
            </Button>
        </DialogFooter>

        <DialogClose className="absolute right-4 top-4 rounded-full bg-black/20 p-2 text-white opacity-70 transition-opacity hover:opacity-100 focus:outline-none">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
