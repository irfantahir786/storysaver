"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Plus, MoreHorizontal, Edit, Trash, ExternalLink, Megaphone, Smartphone, ArrowUpCircle, RefreshCw, AlertCircle, Laptop, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/snapsaver/LoadingSpinner';
import { cn } from '@/lib/utils';
import { fetchAds } from '@/app/actions';
import Link from 'next/link';

export default function AdminAdsPage() {
  const [ads, setAds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAds = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchAds();
      const adsData = Array.isArray(result) ? result : (result?.data || []);
      setAds(adsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load advertisements.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAds();
  }, [loadAds]);

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Ad Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">Control and monitor advertisement placements across platforms.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={loadAds} disabled={isLoading} className="rounded-xl font-bold h-11 border-slate-200">
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button className="rounded-xl gap-2 font-bold shadow-lg shadow-primary/20 h-11 px-6" asChild>
            <Link href="/admin/ads/new">
              <Plus className="h-4 w-4" />
              Create New Ad
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="rounded-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <LoadingSpinner className="h-10 w-10 text-primary" />
          <p className="text-sm font-bold text-slate-400">Fetching ad units from API...</p>
        </div>
      ) : (
        <div className="w-full">
          <AdTable data={ads} />
        </div>
      )}
    </div>
  );
}

function AdTable({ data }: { data: any[] }) {
  if (data.length === 0) {
    return (
      <Card className="border-dashed border-2 bg-slate-50/50 rounded-2xl">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="bg-white p-4 rounded-full shadow-sm mb-4">
            <Megaphone className="h-8 w-8 text-slate-300" />
          </div>
          <p className="text-lg font-bold text-slate-900">No ads configured</p>
          <p className="text-sm text-slate-500 mt-1 max-w-[250px]">
            No active advertisement units were found in the database.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="pb-0 pt-6 px-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Megaphone className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">Ad Placements</CardTitle>
            <CardDescription className="text-xs">Active and inactive ad units across mobile and web platforms.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 mt-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="font-bold text-slate-900 px-6 py-4">Ad Name</TableHead>
                <TableHead className="font-bold text-slate-900 px-6 py-4">Platform</TableHead>
                <TableHead className="font-bold text-slate-900 px-6 py-4">Priority</TableHead>
                <TableHead className="font-bold text-slate-900 px-6 py-4">Status</TableHead>
                <TableHead className="font-bold text-slate-900 px-6 py-4">Clicks</TableHead>
                <TableHead className="text-right font-bold text-slate-900 px-6 py-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((ad) => {
                const status = ad.status || ad.ad_status || 'Paused';
                const isActive = status === 'Active' || status === 1;
                const isMobile = ad.is_mobile ?? ad.ad_is_mobile ?? 1;

                return (
                  <TableRow key={ad.id} className="border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-bold text-slate-900 px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Megaphone className="h-3 w-3 text-slate-400" />
                        {ad.title || ad.name || ad.ad_name || `Ad unit #${ad.id}`}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 font-medium">
                      {Number(isMobile) === 1 ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-none gap-1.5 py-1">
                          <Smartphone className="h-3 w-3" /> Mobile
                        </Badge>
                      ) : Number(isMobile) === 0 ? (
                        <Badge variant="outline" className="bg-purple-50 text-purple-600 border-none gap-1.5 py-1">
                          <Laptop className="h-3 w-3" /> Web App
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-orange-50 text-orange-600 border-none gap-1.5 py-1">
                          <Globe className="h-3 w-3" /> Both
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <ArrowUpCircle className="h-3.5 w-3.5 text-primary" />
                        {ad.priority || ad.ad_priority || 1}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[10px] font-bold py-0.5 rounded-lg border-none shadow-none",
                          isActive ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-500"
                        )}
                      >
                        {isActive ? 'Active' : 'Paused'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600 px-6 py-4 font-bold">
                      {(ad.clicks || ad.ad_clicks || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right px-6 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-900">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border-slate-100 shadow-xl w-[160px]">
                          <DropdownMenuLabel className="text-xs font-bold text-slate-400 uppercase tracking-wider">Options</DropdownMenuLabel>
                          <DropdownMenuItem className="cursor-pointer gap-2 focus:bg-slate-50 rounded-lg" asChild>
                            <Link href={`/admin/ads/${ad.id}/edit`}>
                              <Edit className="h-4 w-4" />
                              Edit Ad
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer gap-2 focus:bg-slate-50 rounded-lg">
                            <ExternalLink className="h-4 w-4" />
                            View Stats
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer gap-2 text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg">
                            <Trash className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
