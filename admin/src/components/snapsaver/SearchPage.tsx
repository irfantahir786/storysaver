
"use client";

import { useState, useRef, useEffect, Suspense, useCallback } from 'react';
import Image from 'next/image';
import { Search as SearchIcon, Check, Lock, User as UserIcon, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { searchInstagramUser, fetchUserStories } from '@/app/actions';
import type { ProfileData, ContentItem } from '@/lib/types';
import { LoadingSpinner } from '@/components/snapsaver/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';
import { ContentGrid } from '@/components/snapsaver/ContentGrid';
import { BannerAd } from '@/components/snapsaver/BannerAd';
import { AdDialog } from '@/components/snapsaver/AdDialog';
import { PublicHeader } from '@/components/snapsaver/PublicHeader';
import { ProfileCard } from './ProfileCard';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

interface SearchResultUser {
  id: string;
  username: string;
  name: string;
  profile_pic: string;
  is_private: boolean;
  is_verified: boolean;
}

interface SearchContentProps {
  seoTitle?: string;
  seoDescription?: string;
}

function SearchContent({ seoTitle, seoDescription }: SearchContentProps) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultUser[]>([]);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdDialogOpen, setIsAdDialogOpen] = useState(false);
  const [pendingProfile, setPendingProfile] = useState<ProfileData | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const { toast } = useToast();
  const resultsRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const stored = localStorage.getItem('snapsaver_favorite_users');
    if (stored) {
      const favs = JSON.parse(stored);
      setFavorites(favs.map((f: any) => f.username));
    }
  }, []);

  const toggleFavorite = (e: React.MouseEvent, user: SearchResultUser) => {
    e.stopPropagation();
    const stored = localStorage.getItem('snapsaver_favorite_users');
    let favs = stored ? JSON.parse(stored) : [];
    const isFav = favs.some((f: any) => f.username === user.username);
    if (isFav) {
      favs = favs.filter((f: any) => f.username !== user.username);
      setFavorites(prev => prev.filter(u => u !== user.username));
      toast({ title: "Removed from favorites" });
    } else {
      favs.unshift({
        username: user.username,
        name: user.name,
        avatar: user.profile_pic,
        id: user.id,
        is_private: user.is_private,
        is_verified: user.is_verified
      });
      setFavorites(prev => [user.username, ...prev]);
      toast({ title: "Added to favorites" });
    }
    localStorage.setItem('snapsaver_favorite_users', JSON.stringify(favs));
    window.dispatchEvent(new Event('storage'));
  };

  const performSearch = useCallback(async (searchTerm: string) => {
    setIsLoading(true);
    setProfile(null);
    setSearchResults([]);
    try {
      const response = await searchInstagramUser(searchTerm);
      if (response.status === 'ok' && response.users && response.users.length > 0) {
        setSearchResults(response.users);
      } else {
        toast({
          variant: 'destructive',
          title: 'No results',
          description: 'No users found matching your search.',
        });
      }
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Search failed',
        description: 'Could not connect to search service.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const saveToRecentUsers = useCallback((user: SearchResultUser) => {
    const stored = localStorage.getItem('snapsaver_recent_users');
    let recent = stored ? JSON.parse(stored) : [];
    recent = recent.filter((u: any) => u.username !== user.username);
    recent.unshift({
      id: user.id,
      username: user.username,
      name: user.name,
      avatar: user.profile_pic,
      time: 'Recently viewed',
      is_private: user.is_private,
      is_verified: user.is_verified
    });
    recent = recent.slice(0, 10);
    localStorage.setItem('snapsaver_recent_users', JSON.stringify(recent));
  }, []);

  const handleSelectUser = useCallback(async (user: SearchResultUser) => {
    setIsLoading(true);
    setSearchResults([]);
    setProfile(null);
    saveToRecentUsers(user);
    try {
      const storyResponse = await fetchUserStories(user.id);
      let mappedStories: ContentItem[] = [];
      let is404 = storyResponse.message === 'No story Found';

      if (is404) {
        toast({
          title: "No story Found",
          className: "bg-slate-800 text-white border-none"
        });
      } else {
        const storyData = storyResponse.stories || storyResponse.data || (Array.isArray(storyResponse) ? storyResponse : []);
        if (storyData && storyData.length > 0) {
          mappedStories = storyData.map((s: any, idx: number) => {
              const type = (s.type === 'video' || s.is_video || s.video_url) ? 'video' : 'photo';
              const url = s.url || s.path || s.video_url || s.image_url || s.display_url;
              const thumbnailUrl = s.thumbnail || s.thumb || s.display_url || s.url || s.path;
              return {
                id: s.id || `story-${idx}`,
                type: type as 'photo' | 'video',
                url: url,
                thumbnailUrl: thumbnailUrl
              };
          });
        }
      }

      const profileData: ProfileData = {
        handle: user.username,
        name: user.name,
        avatarUrl: user.profile_pic,
        bio: user.is_private 
          ? "This account is private." 
          : (is404 ? "No story Found" : (mappedStories.length > 0 ? `${mappedStories.length} active stories found.` : "No active stories at the moment.")),
        stats: { posts: 0, followers: "N/A", following: 0 },
        posts: [],
        stories: mappedStories,
      };
      setPendingProfile(profileData);
      setIsAdDialogOpen(true);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error loading stories',
        description: 'Could not fetch stories for this user.',
      });
      setIsLoading(false);
    }
  }, [saveToRecentUsers, toast]);

  useEffect(() => {
    const username = searchParams.get('username');
    const id = searchParams.get('id');
    const name = searchParams.get('name');
    const profile_pic = searchParams.get('profile_pic');
    const is_private = searchParams.get('is_private') === 'true';
    const is_verified = searchParams.get('is_verified') === 'true';
    if (id && username) {
      handleSelectUser({ id, username, name: name || username, profile_pic: profile_pic || '', is_private, is_verified });
    } else if (username) {
      setQuery(username);
      performSearch(username);
    }
  }, [searchParams, performSearch, handleSelectUser]);

  useEffect(() => {
    const handleCustomSelect = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) handleSelectUser(customEvent.detail);
    };
    window.addEventListener('snapsaver:select-user', handleCustomSelect);
    return () => window.removeEventListener('snapsaver:select-user', handleCustomSelect);
  }, [handleSelectUser]);

  useEffect(() => {
    if ((profile || searchResults.length > 0) && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [profile, searchResults]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) {
      toast({ variant: 'destructive', title: 'Input required', description: 'Please enter a username to search.' });
      return;
    }
    performSearch(query);
  };

  const handleAdClose = () => {
    setIsAdDialogOpen(false);
    setProfile(pendingProfile);
    setIsLoading(false);
  };

  return (
    <>
      <AdDialog isOpen={isAdDialogOpen} onClose={handleAdClose} />
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <PublicHeader />
        
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-gray-900 dark:text-white mb-3 leading-tight">
                    {seoTitle || 'SnapSaver Search'}
                </h1>
                <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 font-medium">
                    {seoDescription || 'Discover and view Instagram profiles anonymously.'}
                </p>
            </div>
            <Card className="shadow-lg border-none">
              <CardContent className="p-6 md:p-8 space-y-6">
                <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 flex items-center justify-center gap-2">
                  <SearchIcon className="h-6 w-6 text-primary" />
                  Search Instagram Profiles
                </h2>
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-grow">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search for names or usernames..."
                      className="pl-10 text-base bg-gray-100 border-none focus-visible:ring-2 focus-visible:ring-primary h-12 rounded-xl"
                      aria-label="Search username"
                    />
                  </div>
                  <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90 text-white shrink-0 h-12 px-8 rounded-xl font-bold text-base transition-all">
                    {isLoading ? (
                      <>
                        <LoadingSpinner className="mr-2" />
                        <span>Searching...</span>
                      </>
                    ) : (
                      <span>Search</span>
                    )}
                  </Button>
                </form>
                <BannerAd />
              </CardContent>
            </Card>
          </div>
          
          <div ref={resultsRef} className="max-w-4xl mx-auto mt-8">
            {isLoading && !isAdDialogOpen && (
              <div className="flex justify-center py-10">
                <LoadingSpinner className="h-10 w-10 text-primary" />
              </div>
            )}
            {searchResults.length > 0 && !isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                {searchResults.map((user) => (
                  <Card key={user.id} className="cursor-pointer hover:bg-white hover:shadow-md transition-all border-none shadow-sm rounded-2xl group overflow-hidden" onClick={() => handleSelectUser(user)}>
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-14 w-14 border-2 border-slate-100 shadow-sm transition-transform group-hover:scale-105 relative overflow-hidden">
                          <Image src={user.profile_pic} alt={user.username} fill className="object-cover" referrerPolicy="no-referrer" unoptimized />
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">{user.username[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 truncate">@{user.username}</span>
                            {user.is_verified && <Badge className="bg-blue-500 hover:bg-blue-500 p-0.5 rounded-full h-4 w-4 shrink-0 flex items-center justify-center"><Check className="h-2.5 w-2.5 text-white stroke-[3]" /></Badge>}
                          </div>
                          <span className="text-xs font-medium text-slate-500 truncate">{user.name}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className={cn("rounded-full h-10 w-10 transition-colors", favorites.includes(user.username) ? "text-red-500 hover:text-red-600 hover:bg-red-50" : "text-slate-300 hover:text-red-500 hover:bg-red-50")} onClick={(e) => toggleFavorite(e, user)}>
                          <Heart className={cn("h-6 w-6", favorites.includes(user.username) && "fill-current")} />
                        </Button>
                        {user.is_private && <div className="bg-slate-100 p-2 rounded-lg" title="Private Account"><Lock className="h-4 w-4 text-slate-400" /></div>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {profile && !isLoading && (
              <div className="space-y-8">
                <ProfileCard profile={profile} />
                <div className="mt-4">
                  <ContentGrid items={profile.stories} downloadType="Story" />
                </div>
              </div>
            )}
            {!isLoading && !profile && searchResults.length === 0 && (
              <div className="max-w-2xl mx-auto mt-12 text-center">
                <div className="bg-slate-100 inline-flex p-6 rounded-full mb-6">
                  <SearchIcon className="h-12 w-12 text-slate-300" />
                </div>
                <h2 className="text-3xl font-bold mb-4 text-slate-900">Discover Profiles</h2>
                <p className="text-lg text-slate-500 max-w-md mx-auto">Find any Instagram user to view their stories and profile details. Start by typing a name above.</p>
              </div>
            )}
          </div>
        </main>
        
        <footer className="bg-slate-900 text-slate-400 py-10 mt-auto">
          <div className="container mx-auto text-center px-4">
            <div className="flex flex-wrap justify-center gap-8 mb-8">
              <Link href="/contact" className="text-sm font-medium hover:text-white transition-colors">Contact</Link>
              <Link href="/privacy-policy" className="text-sm font-medium hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms-and-conditions" className="text-sm font-medium hover:text-white transition-colors">Terms & Condition</Link>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-600">SnapSaver &copy; {new Date().getFullYear()}. For educational purposes only.</p>
          </div>
        </footer>
      </div>
    </>
  );
}

export default function SearchPage({ seoTitle, seoDescription }: SearchContentProps) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>}>
      <SearchContent seoTitle={seoTitle} seoDescription={seoDescription} />
    </Suspense>
  );
}
