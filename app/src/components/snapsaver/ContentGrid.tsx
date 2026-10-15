
import type { ContentItem } from '@/lib/types';
import { ContentCard } from './ContentCard';

interface ContentGridProps {
  items: ContentItem[];
  downloadType: 'Story' | 'DP' | 'Reels' | 'Post';
}

export function ContentGrid({ items, downloadType }: ContentGridProps) {
  if (items.length === 0) {
    const isStory = downloadType === 'Story';
    return (
      <div className="text-center text-slate-500 py-16 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border-2 border-dashed border-slate-100 dark:border-gray-700">
        <p className="text-xl font-black text-slate-900 dark:text-white">
          {isStory ? 'No story Found' : `No ${downloadType} Found`}
        </p>
        <p className="text-sm mt-1 text-slate-400">
          This user has no active {downloadType.toLowerCase()} at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
      {items.map((item, index) => (
        <ContentCard 
            key={item.id} 
            item={item} 
            allItems={items}
            startIndex={index}
            downloadType={downloadType} 
        />
      ))}
    </div>
  );
}
