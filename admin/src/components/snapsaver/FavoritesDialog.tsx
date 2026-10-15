
"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, ExternalLink, UserX, Trash2 } from 'lucide-react';

interface FavoritesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (user: FavoriteUser) => void;
}

interface FavoriteUser {
  username: string;
  name: string;
  avatar: string;
  id: string;
  is_private?: boolean;
  is_verified?: boolean;
}

export function FavoritesDialog({ isOpen, onClose, onSelect }: FavoritesDialogProps) {
  const [favoriteUsers, setFavoriteUsers] = useState<FavoriteUser[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadFavorites();
    }
  }, [isOpen]);

  // Also listen for storage events in case they change while dialog is open
  useEffect(() => {
    const handleStorageChange = () => {
      if (isOpen) loadFavorites();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isOpen]);

  const loadFavorites = () => {
    const stored = localStorage.getItem('snapsaver_favorite_users');
    if (stored) {
      setFavoriteUsers(JSON.parse(stored));
    } else {
      setFavoriteUsers([]);
    }
  };

  const removeFavorite = (e: React.MouseEvent, username: string) => {
    e.preventDefault();
    e.stopPropagation();
    const stored = localStorage.getItem('snapsaver_favorite_users');
    if (stored) {
      const favs = JSON.parse(stored).filter((f: FavoriteUser) => f.username !== username);
      localStorage.setItem('snapsaver_favorite_users', JSON.stringify(favs));
      setFavoriteUsers(favs);
      window.dispatchEvent(new Event('storage'));
    }
  };

  const handleUserClick = (user: FavoriteUser) => {
    if (onSelect) {
      onSelect(user);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-6 pb-2 border-b bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-yellow-100 rounded-xl shadow-sm">
              <Star className="h-6 w-6 text-yellow-600 fill-yellow-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">Favorite Users</DialogTitle>
              <p className="text-xs text-slate-500 font-medium">Quickly access profiles you visit often</p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {favoriteUsers.length > 0 ? (
            <div className="grid gap-2">
              {favoriteUsers.map((user) => (
                <div key={user.username} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm ring-1 ring-slate-100">
                      <AvatarImage src={user.avatar} referrerPolicy="no-referrer" />
                      <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">
                        {user.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">@{user.username}</span>
                      <span className="text-[11px] text-slate-500 font-medium">{user.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-9 w-9 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                      onClick={(e) => removeFavorite(e, user.username)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button 
                        size="sm" 
                        variant="outline" 
                        className="rounded-lg gap-2 h-9 px-4 border-slate-200 hover:bg-primary hover:text-white hover:border-primary transition-all" 
                        onClick={() => handleUserClick(user)}
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">View</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="bg-slate-50 p-6 rounded-full mb-4">
                <UserX className="h-12 w-12 text-slate-300" />
              </div>
              <p className="text-base font-bold text-slate-900">No favorite users yet</p>
              <p className="text-sm text-slate-500 mt-1 max-w-[200px]">Profiles you star will appear here for quick access.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
