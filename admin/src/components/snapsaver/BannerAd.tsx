
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export function BannerAd() {
  const isMobile = useIsMobile();
  const description = isMobile
    ? "Download Private Stories & Highlights"
    : "Download Private Stories, Highlights, Posts and Liked Feed";

  return (
    <div className="mt-4">
        <a href="#" target="_blank" rel="noopener noreferrer" className="block group">
            <Card className="relative w-full bg-gray-100 dark:bg-gray-800/50 p-3 rounded-lg group-hover:bg-gray-200 dark:group-hover:bg-gray-800 transition-colors">
                <span className="absolute top-0 right-0 bg-gray-500 text-white text-[10px] px-1.5 py-0.5 rounded-tr-lg rounded-bl-lg z-10">Ad</span>
                <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                    <Image
                        src="https://play-lh.googleusercontent.com/zf8h1RwQ8Fhz7LpEQSteWEudubOVsX5gY7SucWmtBWOa_DJwyMsZpCdJroi-voXdGkU=w240-h480-rw"
                        alt="Story Saver App"
                        width={64}
                        height={64}
                        className="rounded-lg object-cover"
                        data-ai-hint="app icon"
                    />
                </div>
                <div className="flex-grow">
                    <h4 className="font-bold text-base text-gray-800 dark:text-gray-100">Story Saver App</h4>
                    <p className={cn("text-sm text-gray-600 dark:text-gray-400", isMobile && "leading-tight")}>
                    {description}
                    </p>
                </div>
                <Button className="bg-green-500 hover:bg-green-600 text-white shrink-0 ml-auto pointer-events-none">
                    Install
                </Button>
                </div>
            </Card>
        </a>
    </div>
  );
}
