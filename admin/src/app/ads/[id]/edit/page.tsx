"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Megaphone, Save, Calendar as CalendarIcon, Link as LinkIcon, Image as ImageIcon, Loader2, AlertCircle, Laptop, Smartphone, Globe } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { fetchAdById, updateAd } from '@/app/actions';
import Link from 'next/link';

export default function EditAdPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const { toast } = useToast();
  
  const [ad, setAd] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [priority, setPriority] = useState<string>("10");
  const [status, setStatus] = useState<string>("active");
  const [isMobile, setIsMobile] = useState<string>("1");

  const formatDateForInput = (dateStr: string | undefined | null) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().split('T')[0];
    } catch (e) {
      return "";
    }
  };

  const loadAd = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAdById(id as string);
      if (!data) throw new Error("Advertisement not found.");
      
      setAd(data);
      
      const rawPriority = data?.priority ?? data?.ad_priority ?? "10";
      setPriority(String(rawPriority));
      
      const rawStatus = data?.status ?? data?.ad_status;
      const isActive = rawStatus === 1 || rawStatus === '1' || rawStatus === 'Active' || rawStatus === 'active';
      setStatus(isActive ? 'active' : 'paused');

      const rawIsMobile = data?.is_mobile ?? data?.ad_is_mobile ?? "1";
      setIsMobile(String(rawIsMobile));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load advertisement details.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAd();
  }, [loadAd]);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;

    setIsUpdating(true);
    const formData = new FormData(e.currentTarget);
    
    const payload = {
      title: formData.get('title'),
      priority: Number(priority),
      logo: formData.get('logoUrl'),
      url: formData.get('clickUrl'),
      image: formData.get('imageUrl'),
      start_date: formData.get('startDate'),
      end_date: formData.get('endDate'),
      description: formData.get('description'),
      status: status === 'active' ? 1 : 0,
      is_mobile: Number(isMobile)
    };

    try {
      await updateAd(id as string, payload);
      toast({
        title: 'Ad Updated Successfully',
        description: 'The advertisement unit changes have been saved to the server.',
        className: 'bg-green-500 text-white'
      });
      router.push('/ads');
      router.refresh();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: err instanceof Error ? err.message : 'An error occurred while saving changes.',
      });
    } finally {
      setIsUpdating(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-bold text-slate-400">Fetching ad details from API...</p>
      </div>
    );
  }

  if (error || !ad) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <Alert variant="destructive" className="rounded-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "Could not retrieve advertisement details."}</AlertDescription>
        </Alert>
        <Button variant="outline" className="mt-4 rounded-xl" asChild>
          <Link href="/admin/ads">Back to Ad Management</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-10 px-4 sm:px-0">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200" asChild>
          <Link href="/admin/ads">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Edit Ad Placement</h1>
          <p className="text-slate-500 text-xs">Modify the existing advertisement configuration for ID: {id}.</p>
        </div>
      </div>

      <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Megaphone className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-lg font-bold">Update Ad Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form key={ad.id || id} className="space-y-6" onSubmit={handleUpdate}>
             <div className="grid gap-6 sm:grid-cols-3">
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-slate-500">Ad Placement Name (Title)</Label>
                <Input 
                  id="title" 
                  name="title"
                  defaultValue={ad?.title ?? ad?.name ?? ad?.ad_name ?? ""}
                  placeholder="e.g. Summer Campaign Interstitial" 
                  className="rounded-xl border-slate-200 h-11 focus-visible:ring-primary/20" 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority" className="text-xs font-bold uppercase tracking-wider text-slate-500">Priority (1-10)</Label>
                <Select value={priority} onValueChange={setPriority} required>
                  <SelectTrigger className="rounded-xl border-slate-200 h-11 focus:ring-primary/20">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        Level {num} {num === 10 ? '(Highest)' : num === 1 ? '(Lowest)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
               <div className="space-y-2">
                <Label htmlFor="isMobile" className="text-xs font-bold uppercase tracking-wider text-slate-500">Platform Target</Label>
                <Select value={isMobile} onValueChange={setIsMobile}>
                  <SelectTrigger className="rounded-xl border-slate-200 h-11 focus:ring-primary/20">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    <SelectItem value="1">
                      <div className="flex items-center gap-2"><Smartphone className="h-3.5 w-3.5" /> Mobile Only</div>
                    </SelectItem>
                    <SelectItem value="0">
                      <div className="flex items-center gap-2"><Laptop className="h-3.5 w-3.5" /> Web App Only</div>
                    </SelectItem>
                    <SelectItem value="2">
                      <div className="flex items-center gap-2"><Globe className="h-3.5 w-3.5" /> Both (Universal)</div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="rounded-xl border-slate-200 h-11 focus:ring-primary/20">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    <SelectItem value="active">Active (Scheduled)</SelectItem>
                    <SelectItem value="paused">Paused / Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="logoUrl" className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <ImageIcon className="h-3 w-3" /> Logo URL
                </Label>
                <Input 
                  id="logoUrl" 
                  name="logoUrl"
                  type="url"
                  defaultValue={ad?.logo ?? ad?.ad_logo ?? ad?.logo_url ?? ""}
                  placeholder="https://example.com/logo.png" 
                  className="rounded-xl border-slate-200 h-11 focus-visible:ring-primary/20" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clickUrl" className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <LinkIcon className="h-3 w-3" /> Click URL
                </Label>
                <Input 
                  id="clickUrl" 
                  name="clickUrl"
                  type="url"
                  defaultValue={ad?.url ?? ad?.ad_url ?? ad?.click_url ?? ""}
                  placeholder="https://target-website.com" 
                  className="rounded-xl border-slate-200 h-11 focus-visible:ring-primary/20" 
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl" className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <ImageIcon className="h-3 w-3" /> Main Image URL
              </Label>
              <Input 
                id="imageUrl" 
                name="imageUrl"
                type="url"
                defaultValue={ad?.image ?? ad?.ad_image ?? ad?.image_url ?? ""}
                placeholder="https://example.com/ad-banner-1200x628.jpg" 
                className="rounded-xl border-slate-200 h-11 focus-visible:ring-primary/20" 
                required
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <CalendarIcon className="h-3 w-3" /> Start Date
                </Label>
                <Input 
                  id="startDate" 
                  name="startDate"
                  type="date"
                  defaultValue={formatDateForInput(ad?.start_date ?? ad?.ad_start_date)}
                  className="rounded-xl border-slate-200 h-11 focus-visible:ring-primary/20" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <CalendarIcon className="h-3 w-3" /> End Date
                </Label>
                <Input 
                  id="endDate" 
                  name="endDate"
                  type="date"
                  defaultValue={formatDateForInput(ad?.end_date ?? ad?.ad_end_date)}
                  className="rounded-xl border-slate-200 h-11 focus-visible:ring-primary/20" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-slate-500">Ad Description / Body Copy</Label>
              <Textarea 
                id="description" 
                name="description"
                defaultValue={ad?.description ?? ad?.ad_description ?? ""}
                placeholder="Write the text that will appear in the ad placement..." 
                rows={4} 
                className="rounded-xl border-slate-200 focus-visible:ring-primary/20 resize-none"
              />
            </div>

            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
              <Button type="submit" disabled={isUpdating} className="rounded-xl h-11 px-8 font-bold gap-2">
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isUpdating ? 'Saving Changes...' : 'Update Ad Placement'}
              </Button>
              <Button type="button" variant="ghost" className="rounded-xl h-11 px-8 font-bold text-slate-500" asChild>
                <Link href="/admin/ads">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
