"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BannerAd } from './BannerAd';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdDialog({ isOpen, onClose }: AdDialogProps) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (isOpen) {
      setCountdown(5); // Reset countdown when dialog opens
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer); // Cleanup timer on unmount or close
    }
  }, [isOpen]);

  const handleOpenChange = (open: boolean) => {
    if (!open && countdown === 0) {
      onClose();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-md rounded-3xl p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-gray-950">
        <DialogHeader className="p-6 pb-2 border-b border-slate-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-900/50">
          <DialogTitle className="text-xl font-black text-slate-900 dark:text-white pr-10">Sponsored</DialogTitle>
        </DialogHeader>

        <div className="p-6 flex flex-col gap-4">
          <BannerAd />

          <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-2">
            Support SnapSaver by viewing these short ads
          </p>
        </div>

        <DialogFooter className="p-4 pt-0">
          <Button
            onClick={onClose}
            disabled={countdown > 0}
            className={cn(
              "w-full h-12 font-bold rounded-xl transition-all shadow-lg text-white",
              countdown > 0
                ? "bg-slate-100 text-slate-400 border border-slate-200 dark:bg-gray-800 dark:text-gray-600 dark:border-gray-700"
                : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
            )}
          >
            {countdown > 0 ? `Continue in ${countdown}s...` : 'Continue to Download'}
          </Button>
        </DialogFooter>

        <DialogClose
          disabled={countdown > 0}
          asChild
        >
          <Button
            variant="ghost"
            size="icon"
            disabled={countdown > 0}
            className={cn(
              "absolute right-4 top-4 rounded-full h-9 w-9 transition-all focus:outline-none",
              countdown > 0
                ? "bg-slate-50 text-slate-200 dark:bg-gray-800/50 dark:text-gray-700 cursor-not-allowed opacity-50"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            )}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
