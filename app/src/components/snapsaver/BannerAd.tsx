"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { fetchSettings } from '@/app/actions';
import { AdSenseUnit } from './AdSenseUnit';

interface BannerAdProps {
    className?: string;
}

export function BannerAd({ className }: BannerAdProps) {
    const isMobile = useIsMobile();
    const [hasAdSense, setHasAdSense] = useState(false);

    useEffect(() => {
        async function checkAdSense() {
            try {
                const settings = await fetchSettings();
                if (settings?.web?.adsense_pub_id?.value) {
                    setHasAdSense(true);
                }
            } catch (e) { }
        }
        checkAdSense();
    }, []);

    const description = isMobile
        ? "Download Private Stories & Highlights"
        : "Download Private Stories, Highlights, Posts and Liked Feed";

    return (
        <div className={cn("flex flex-col gap-4", className)}>
            {/* Custom Internal Banner Ad */}
            <a href="#" target="_blank" rel="noopener noreferrer" className="block group">
                <Card className="relative w-full bg-gray-100 dark:bg-gray-800/50 p-3 rounded-xl group-hover:bg-gray-200 dark:group-hover:bg-gray-800 transition-colors border-none shadow-none">
                    <span className="absolute top-0 right-0 bg-gray-500 text-white text-[10px] px-1.5 py-0.5 rounded-tr-xl rounded-bl-xl z-10 font-bold">Ad</span>
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
                        <div className="flex-grow min-w-0">
                            <h4 className="font-bold text-sm sm:text-base text-gray-800 dark:text-gray-100 truncate">Story Saver App</h4>
                            <p className={cn("text-xs text-gray-600 dark:text-gray-400 line-clamp-2", isMobile && "leading-tight")}>
                                {description}
                            </p>
                        </div>
                        <Button className="bg-green-500 hover:bg-green-600 text-white shrink-0 ml-auto pointer-events-none text-[10px] sm:text-xs h-8 px-3 font-bold rounded-lg">
                            Install
                        </Button>
                    </div>
                </Card>
            </a>

            {/* AdSense Unit (Shows below if configured) */}
            {hasAdSense && (
                <AdSenseUnit slot="page-banner-slot" format="auto" />
            )}
        </div>
    );
}
