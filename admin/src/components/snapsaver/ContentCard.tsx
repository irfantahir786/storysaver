
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { PlayCircle, Eye } from 'lucide-react';
import type { ContentItem } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StoryPreviewDialog } from './StoryPreviewDialog';
import { cn } from '@/lib/utils';

interface ContentCardProps {
  item: ContentItem;
  allItems: ContentItem[];
  startIndex: number;
  downloadType: 'Story' | 'DP' | 'Reels' | 'Post';
}

export function ContentCard({ item, allItems, startIndex, downloadType }: ContentCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const handleCardClick = () => {
    setIsPreviewOpen(true);
  };

  const renderOverlayContent = () => {
    const viewText = downloadType;
    return (
      <>
        <Eye className="h-6 w-6" />
        <span>View {viewText}</span>
      </>
    )
  };

  return (
    <>
      <Card 
        className={cn(
            "group relative overflow-hidden shadow-lg transition-shadow hover:shadow-xl cursor-pointer",
            (downloadType === 'Reels' || downloadType === 'Story') ? 'aspect-[9/16]' : 'aspect-square'
        )}
        onClick={handleCardClick}
      >
        <CardContent className="p-0 h-full">
          <Image
            src={item.thumbnailUrl || item.url}
            alt={`Instagram ${item.type}`}
            width={500}
            height={500}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={`${item.type} content`}
            unoptimized={item.thumbnailUrl?.includes('data:')}
          />
          <div className="absolute inset-0 bg-black/20" />

          {item.type === 'video' && (
            <PlayCircle className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 text-white/80" />
          )}

          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
             <Button
                size='lg'
                variant="ghost"
                className="h-14 rounded-full bg-white/20 text-white hover:bg-white/30 hover:text-white"
                aria-label={`View ${downloadType}`}
            >
              {renderOverlayContent()}
            </Button>
          </div>
        </CardContent>
      </Card>
      <StoryPreviewDialog
        isOpen={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        items={allItems}
        startIndex={startIndex}
        downloadType={downloadType}
      />
    </>
  );
}
