
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Lock, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface MiniProfileCardProps {
  user: {
    id: string;
    username: string;
    name: string;
    profile_pic: string;
    is_private: boolean;
    is_verified: boolean;
  };
}

/**
 * MiniProfileCard - A compact profile header for story results.
 * Shows avatar, name, and verification/privacy status with a favorite toggle.
 */
export function MiniProfileCard({ user }: MiniProfileCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem('snapsaver_favorite_users');
    if (stored) {
      const favs = JSON.parse(stored);
      setIsFavorite(favs.some((f: any) => f.username === user.username));
    }
  }, [user.username]);

  const toggleFavorite = () => {
    const stored = localStorage.getItem('snapsaver_favorite_users');
    let favs = stored ? JSON.parse(stored) : [];
    
    const currentlyFav = favs.some((f: any) => f.username === user.username);
    
    if (currentlyFav) {
      favs = favs.filter((f: any) => f.username !== user.username);
      setIsFavorite(false);
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
      setIsFavorite(true);
      toast({ title: "Added to favorites" });
    }
    
    localStorage.setItem('snapsaver_favorite_users', JSON.stringify(favs));
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <Card className="border-none shadow-sm bg-white dark:bg-gray-800 rounded-2xl overflow-hidden mb-6">
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Avatar className="h-16 w-16 border-2 border-slate-100 shadow-sm relative overflow-hidden">
            <Image 
              src={user.profile_pic} 
              alt={user.username} 
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
              unoptimized
            />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {user.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
                @{user.username}
              </h3>
              {user.is_verified && (
                <Badge className="bg-blue-500 hover:bg-blue-500 p-0.5 rounded-full h-4 w-4 flex items-center justify-center shrink-0">
                  <Check className="h-2.5 w-2.5 text-white stroke-[3]" />
                </Badge>
              )}
              {user.is_private && (
                <div className="bg-slate-100 dark:bg-slate-700 p-1 rounded-md" title="Private Account">
                  <Lock className="h-3 w-3 text-slate-400" />
                </div>
              )}
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
              {user.name}
            </p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "rounded-full h-12 w-12 transition-all hover:scale-110 shrink-0",
            isFavorite ? "text-red-500 hover:text-red-600 hover:bg-red-50" : "text-slate-300 hover:text-red-500 hover:bg-red-50"
          )}
          onClick={toggleFavorite}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={cn("h-7 w-7", isFavorite && "fill-current")} />
        </Button>
      </CardContent>
    </Card>
  );
}
