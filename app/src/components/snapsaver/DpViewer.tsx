"use client";

import { useState } from 'react';
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
import { Download, X, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from './LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DpViewerProps {
    url: string;
}

/**
 * DpViewer - Specialized component for viewing Instagram Profile Pictures.
 * Takes a URL and renders a clickable card that opens a full-screen zoom dialog.
 * If the URL contains "s150x150", the image is low-res and interaction is disabled.
 */
export function DpViewer({ url }: DpViewerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const { toast } = useToast();

    // Check if the image is HD (Instagram low-res URLs usually contain s150x150)
    const isHD = !url.includes('s150x150');
    console.log('DP URL:', url, 'Is HD:', isHD);

    const handleDownload = async () => {
        if (!url) return;

        setIsDownloading(true);
        try {
            toast({
                title: "Download Started",
                description: "Preparing HD Profile Picture...",
            });


            const response = await fetch(url);

            if (!response.ok) throw new Error('Failed to fetch media');

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `storysaver.in-dp-${Date.now()}.jpg`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(blobUrl);

        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Download Failed',
                description: 'Could not retrieve high-res image. Please try again.',
            });
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <>
            <Card
                className={cn(
                    "group relative overflow-hidden shadow-xl transition-all aspect-square rounded-3xl border-4 border-white dark:border-gray-800",
                    isHD ? "cursor-pointer hover:shadow-2xl" : "cursor-default"
                )}
                onClick={() => isHD && setIsOpen(true)}
            >
                <CardContent className="p-0 h-full">
                    <Image
                        src={url}
                        alt="Instagram DP"
                        width={600}
                        height={600}
                        className={cn(
                            "h-full w-full object-cover transition-transform duration-500",
                            isHD && "group-hover:scale-110"
                        )}
                        unoptimized
                    />
                    <div className={cn(
                        "absolute inset-0 bg-black/20 transition-colors",
                        isHD && "group-hover:bg-black/40"
                    )} />

                    {isHD && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-white/20 backdrop-blur-md p-4 rounded-full text-white scale-75 group-hover:scale-100 transition-transform">
                                <Search className="h-8 w-8" />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {isHD && (
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogContent
                        showCloseButton={false}
                        className="p-0 border-0 w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden"
                    >
                        <DialogHeader className="pt-5 px-6 pb-2">
                            <DialogTitle className="text-xl font-black text-slate-900 dark:text-white pr-10">
                                HD Profile Picture
                            </DialogTitle>
                        </DialogHeader>

                        <div className="p-4">
                            <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-gray-800 flex items-center justify-center">
                                <Image
                                    src={url}
                                    alt="Full Size DP"
                                    fill
                                    className="object-contain"
                                    unoptimized
                                />
                            </div>
                        </div>

                        <DialogFooter className="px-4 pb-4 pt-2">
                            <Button
                                onClick={handleDownload}
                                disabled={isDownloading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 font-bold gap-2 rounded-xl shadow-lg"
                            >
                                {isDownloading ? <LoadingSpinner className="h-5 w-5" /> : <Download className="h-5 w-5" />}
                                <span>{isDownloading ? 'Downloading...' : 'Download HD Image'}</span>
                            </Button>
                        </DialogFooter>

                        <DialogClose className="absolute right-4 top-4 rounded-full bg-slate-100 dark:bg-gray-800 p-2 text-slate-500 dark:text-slate-400 transition-all hover:bg-slate-200 dark:hover:bg-gray-700 hover:text-slate-900 dark:hover:text-white focus:outline-none">
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </DialogClose>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}