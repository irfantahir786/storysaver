
"use client";

import Image from 'next/image';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import type { ProfileData } from '@/lib/types';
import { Instagram } from 'lucide-react';

interface ProfileCardProps {
  profile: ProfileData;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <Card className="overflow-hidden border-none shadow-none bg-transparent">
      <CardHeader className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <Avatar className="h-24 w-24 sm:h-36 sm:w-36 border-4 border-white shadow-md relative overflow-hidden">
          <Image 
            src={profile.avatarUrl} 
            alt={profile.handle} 
            fill
            className="object-cover"
            referrerPolicy="no-referrer"
            unoptimized
          />
          <AvatarFallback>{profile.handle.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-grow space-y-2">
          <CardTitle className="text-2xl font-bold">{profile.handle}</CardTitle>
          <CardDescription className="pt-2">
            <span className="font-semibold">{profile.name}</span><br />
            {profile.bio}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-2 border-b-2 border-primary/20 pb-2 mb-4">
          <div className="bg-primary/10 p-1.5 rounded-lg">
            <span className="sr-only">Instagram Icon</span>
            <Instagram className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Available Stories</h3>
        </div>
      </CardContent>
    </Card>
  );
}
