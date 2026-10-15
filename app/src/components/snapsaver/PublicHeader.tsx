
"use client";

import { Instagram, Star, History, Search, Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FavoritesDialog } from './FavoritesDialog';
import { RecentUsersDialog } from './RecentUsersDialog';
import { cn } from '@/lib/utils';
import { fetchSettings } from '@/app/actions';
import { useTheme } from 'next-themes';

export function PublicHeader() {
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isRecentOpen, setIsRecentOpen] = useState(false);
  const [appName, setAppName] = useState('StorySaver');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    async function loadBranding() {
      try {
        const data = await fetchSettings();
        if (data?.web?.app_name?.value) {
          setAppName(data.web.app_name.value);
        }
      } catch (e) {
        console.error("Could not fetch global branding settings", e);
      }
    }
    loadBranding();
  }, []);

  const handleUserSelect = (user: any) => {
    if (!user) return;

    const userPayload = {
      id: user.id,
      username: user.username,
      name: user.name,
      profile_pic: user.avatar || user.profile_pic,
      is_private: user.is_private ?? false,
      is_verified: user.is_verified ?? false
    };

    if (pathname === '/search') {
      window.dispatchEvent(new CustomEvent('snapsaver:select-user', {
        detail: userPayload
      }));
    } else {
      const params = new URLSearchParams({
        username: userPayload.username,
        id: userPayload.id,
        name: userPayload.name,
        profile_pic: userPayload.profile_pic,
        is_private: String(userPayload.is_private),
        is_verified: String(userPayload.is_verified)
      });
      router.push(`/search?${params.toString()}`);
    }
    setIsRecentOpen(false);
    setIsFavoritesOpen(false);
  };

  return (
    <>
      <FavoritesDialog
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        onSelect={handleUserSelect}
      />
      <RecentUsersDialog
        isOpen={isRecentOpen}
        onClose={() => setIsRecentOpen(false)}
        onSelect={handleUserSelect}
      />

      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md dark:bg-gray-950/80 dark:border-gray-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group transition-all active:scale-95">
            <div className="bg-gradient-primary p-1.5 rounded-xl shadow-lg shadow-red-500/20 group-hover:shadow-red-500/30 transition-shadow">
              <div className="bg-white text-red-600 rounded-lg h-7 w-7 flex items-center justify-center font-black text-xs">
                SS
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tight text-gray-900 dark:text-white leading-tight">
                {appName}
              </h1>
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest leading-none mt-0.5">
                Pro Downloader
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "rounded-xl h-10 w-10 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800",
                      pathname === '/search' && "text-primary bg-primary/10"
                    )}
                    asChild
                  >
                    <Link href="/search">
                      <Search className="h-5 w-5" />
                      <span className="sr-only">Search</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Search Profiles</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl h-10 w-10 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                    onClick={() => setIsFavoritesOpen(true)}
                  >
                    <Star className="h-5 w-5" />
                    <span className="sr-only">Favorites</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Favorites</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl h-10 w-10 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                    onClick={() => setIsRecentOpen(true)}
                  >
                    <History className="h-5 w-5" />
                    <span className="sr-only">History</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Recent Searches</p>
                </TooltipContent>
              </Tooltip>

              {mounted && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-xl h-10 w-10 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                    >
                      {resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                      <span className="sr-only">Toggle Theme</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle Theme</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>

            <div className="hidden sm:block ml-2 pl-2 border-l border-gray-200 dark:border-gray-800">
              <Button size="sm" className="bg-gradient-primary border-none rounded-xl font-bold h-9 shadow-sm text-white" asChild>
                <Link href="/instagram-reels-downloader">Get Reels</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
