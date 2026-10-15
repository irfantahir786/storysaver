"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { ArrowLeft, Megaphone, Save, Calendar as CalendarIcon, Link as LinkIcon, Image as ImageIcon, Laptop, Smartphone, Globe } from 'lucide-react';
import Link from 'next/link';

export default function CreateAdPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isMobile, setIsMobile] = useState<string>("1");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
        title: 'Ad Created Successfully',
        description: 'The new advertisement unit has been configured and saved.',
        className: 'bg-green-500 text-white'
    });
    router.push('/ads');
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200" asChild>
          <Link href="/admin/ads">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Create New Ad Placement</h1>
          <p className="text-slate-500 text-xs">Configure visibility and content across platforms.</p>
        </div>
      </div>

      <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Megaphone className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-lg font-bold">Ad Details & Target</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form className="space-y-6" onSubmit={handleCreate}>
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-slate-500">Ad Placement Name (Title)</Label>
                <Input 
                  id="title" 
                  placeholder="e.g. Summer Campaign Interstitial" 
                  className="rounded-xl border-slate-200 h-11 focus-visible:ring-primary/20" 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority" className="text-xs font-bold uppercase tracking-wider text-slate-500">Priority (1-10)</Label>
                <Select defaultValue="10" required>
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
                <Label htmlFor="status" className="text-xs font-bold uppercase tracking-wider text-slate-500">Initial Status</Label>
                <Select defaultValue="active">
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
                  type="url"
                  placeholder="https://example.com/logo.png" 
                  className="rounded-xl border-slate-200 h-11 focus-visible:ring-primary/20" 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clickUrl" className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <LinkIcon className="h-3 w-3" /> Click URL
                </Label>
                <Input 
                  id="clickUrl" 
                  type="url"
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
                type="url"
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
                  type="date"
                  className="rounded-xl border-slate-200 h-11 focus-visible:ring-primary/20" 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <CalendarIcon className="h-3 w-3" /> End Date
                </Label>
                <Input 
                  id="endDate" 
                  type="date"
                  className="rounded-xl border-slate-200 h-11 focus-visible:ring-primary/20" 
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-slate-500">Ad Description / Body Copy</Label>
              <Textarea 
                id="description" 
                placeholder="Write the text that will appear in the ad placement..." 
                rows={4} 
                className="rounded-xl border-slate-200 focus-visible:ring-primary/20 resize-none"
                required
              />
            </div>

            <div className="pt-6 border-t border-slate-100 flex gap-3">
              <Button type="submit" className="rounded-xl h-11 px-8 font-bold gap-2">
                <Save className="h-4 w-4" />
                Save Ad Placement
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
