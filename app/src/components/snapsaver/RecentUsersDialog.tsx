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
import { History, ExternalLink, Clock, Trash2 } from 'lucide-react';

interface RecentUsersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (user: RecentUser) => void;
}

interface RecentUser {
  id: string;
  username: string;
  name: string;
  avatar: string;
  time: string;
  is_private?: boolean;
  is_verified?: boolean;
}

export function RecentUsersDialog({ isOpen, onClose, onSelect }: RecentUsersDialogProps) {
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);

  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem('snapsaver_recent_users');
      if (stored) {
        setRecentUsers(JSON.parse(stored));
      } else {
        setRecentUsers([]);
      }
    }
  }, [isOpen]);

  const handleClearAll = () => {
    localStorage.removeItem('snapsaver_recent_users');
    setRecentUsers([]);
  };

  const handleUserClick = (user: RecentUser) => {
    if (onSelect) {
      onSelect(user);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-gray-950">
        <DialogHeader className="p-6 pb-2 border-b border-slate-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 dark:bg-blue-900/20 rounded-xl shadow-sm">
                <History className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">Recent Searches</DialogTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-0.5">Search history</p>
              </div>
            </div>
            {recentUsers.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-bold text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl gap-1.5 h-8"
                onClick={handleClearAll}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear All
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {recentUsers.length > 0 ? (
            <div className="grid gap-2">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-gray-900 transition-all border border-transparent hover:border-slate-100 dark:hover:border-gray-800 group">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative shrink-0">
                      <Avatar className="h-12 w-12 border-2 border-white dark:border-gray-800 shadow-sm ring-1 ring-slate-100 dark:ring-gray-800">
                        <AvatarImage src={`/api/media?url=${encodeURIComponent(user.avatar)}`} referrerPolicy="no-referrer" />
                        <AvatarFallback className="bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-slate-400 font-bold">
                          {user.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 bg-blue-500 border-2 border-white dark:border-gray-800 p-0.5 rounded-full">
                        <History className="h-2 w-2 text-white" />
                      </div>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors truncate">@{user.username}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{user.time}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl gap-2 h-9 px-4 border-slate-200 dark:border-gray-800 hover:bg-primary hover:text-white hover:border-primary transition-all shrink-0 font-bold dark:text-slate-300"
                    onClick={() => handleUserClick(user)}
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-wider">Revisit</span>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
              <div className="bg-slate-50 dark:bg-gray-900 p-6 rounded-full mb-4">
                <History className="h-12 w-12 text-slate-200 dark:text-slate-800" />
              </div>
              <p className="text-base font-bold text-slate-900 dark:text-white">History is empty</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-[200px]">Profiles you search for will be saved here.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
