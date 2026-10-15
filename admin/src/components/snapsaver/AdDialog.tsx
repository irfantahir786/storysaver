
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
      <DialogContent className="max-w-sm">
        <DialogHeader className="text-center">
          <DialogTitle>Sponsored</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <BannerAd />
        </div>
        <DialogFooter>
          <Button
            onClick={onClose}
            disabled={countdown > 0}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {countdown > 0 ? `Continue in ${countdown}...` : 'Continue'}
          </Button>
        </DialogFooter>
         {countdown === 0 && (
            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
            </DialogClose>
        )}
      </DialogContent>
    </Dialog>
  );
}
