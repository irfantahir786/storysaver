
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Film, PlayCircle, Star, UserCircle, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  {
    href: '/instagram-reels-downloader',
    label: 'Reels',
    icon: Film,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-100 dark:border-blue-900/30'
  },
  {
    href: '/instagram-photo-downloader',
    label: 'Photos',
    icon: ImageIcon,
    color: 'text-rose-500',
    bgColor: 'bg-rose-50 dark:bg-rose-900/20',
    borderColor: 'border-rose-100 dark:border-rose-900/30'
  },
  {
    href: '/',
    label: 'Stories',
    icon: PlayCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-100 dark:border-green-900/30'
  },
  {
    href: '/highlights',
    label: 'Highlights',
    icon: Star,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-100 dark:border-orange-900/30'
  },
  {
    href: '/insta-dp-viewer',
    label: 'DP',
    icon: UserCircle,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-100 dark:border-purple-900/30'
  },
];

export function DownloaderTabs() {
  const pathname = usePathname();

  return (
    <div className="flex justify-around pt-1 items-end border-b border-slate-100 dark:border-gray-800 mb-8 pb-px overflow-x-auto scrollbar-hide">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex flex-col items-center gap-2 group min-w-[70px] pb-3 transition-all relative",
              isActive ? "opacity-100" : "opacity-60 hover:opacity-100"
            )}
          >
            <div className={cn(
              "p-2.5 rounded-xl border transition-all shadow-sm",
              isActive
                ? `${tab.bgColor} ${tab.borderColor} shadow-sm scale-110`
                : "bg-white dark:bg-gray-800 border-slate-100 dark:border-gray-700 group-hover:border-slate-200 dark:group-hover:border-gray-600"
            )}>
              <tab.icon className={cn("h-6 w-6 transition-transform group-active:scale-95", tab.color)} />
            </div>
            <span className={cn(
              "text-[10px] sm:text-xs font-bold tracking-tight transition-colors",
              isActive ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
            )}>
              {tab.label}
            </span>
            {isActive && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full animate-in fade-in slide-in-from-bottom-1" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
