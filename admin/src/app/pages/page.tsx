"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  ExternalLink, 
  Edit3, 
  Layout, 
  Plus, 
  Search, 
  User, 
  Film, 
  Star, 
  Mail,
  RefreshCw,
  Globe,
  Image as ImageIcon
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/snapsaver/LoadingSpinner';
import { fetchSettings, createSetting } from '@/app/actions';
import Link from 'next/link';

interface PageItem {
  id: string;
  title: string;
  key: string;
  path: string;
  icon: any;
  description: string;
  isCustom?: boolean;
}

const STATIC_PAGES: PageItem[] = [
  { id: 'home', title: 'Home Page', key: 'content_home', path: '/', icon: Layout, description: 'Main landing page content & FAQs.' },
  { id: 'reels', title: 'Reels Downloader', key: 'content_reels', path: '/instagram-reels-downloader', icon: Film, description: 'Content for reels and post downloader.' },
  { id: 'photo', title: 'Photo Downloader', key: 'content_photo', path: '/instagram-photo-downloader', icon: ImageIcon, description: 'Content for instagram photo downloader.' },
  { id: 'dp', title: 'DP Downloader', key: 'content_dp', path: '/dp', icon: User, description: 'Content for profile picture downloader.' },
  { id: 'highlights', title: 'Highlights', key: 'content_highlights', path: '/highlights', icon: Star, description: 'Content for highlights downloader.' },
  { id: 'search', title: 'Search Profile', key: 'content_search', path: '/search', icon: Search, description: 'Content for profile search page.' },
  { id: 'contact', title: 'Contact Us', key: 'content_contact', path: '/contact', icon: Mail, description: 'Intro text for contact page.' },
];

export default function AdminPagesListPage() {
  const [pages, setPages] = useState<PageItem[]>(STATIC_PAGES);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [newSection, setNewSection] = useState({
    title: '',
    slug: ''
  });

  const loadDynamicPages = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchSettings();
      const webSettings = data?.web || {};
      
      // Find all keys starting with content_ that aren't in our static list
      const dynamicItems: PageItem[] = Object.keys(webSettings)
        .filter(key => key.startsWith('content_') && !STATIC_PAGES.some(p => p.key === key))
        .map(key => {
          const slug = key.replace('content_', '');
          let title = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/_/g, ' ');
          
          // Try to get title from SEO if available
          const seoKey = `seo_${slug}`;
          if (webSettings[seoKey]?.value) {
            try {
              const seo = JSON.parse(webSettings[seoKey].value);
              if (seo.title) title = seo.title;
            } catch (e) {}
          }

          return {
            id: slug,
            title,
            key,
            path: `/${slug}`,
            icon: FileText,
            description: 'Custom content section.',
            isCustom: true
          };
        });

      setPages([...STATIC_PAGES, ...dynamicItems]);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Fetch Error', description: 'Could not load dynamic pages.' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadDynamicPages();
  }, [loadDynamicPages]);

  const handleCreateSection = async () => {
    if (!newSection.title || !newSection.slug) {
      toast({ variant: 'destructive', title: 'Required Fields', description: 'Please enter a title and a slug.' });
      return;
    }

    const cleanSlug = newSection.slug.toLowerCase().replace(/[^a-z0-9_]/g, '');
    const contentKey = `content_${cleanSlug}`;
    const seoKey = `seo_${cleanSlug}`;

    setIsAdding(true);
    try {
      // Create Content Setting
      await createSetting({
        key: contentKey,
        value: '<h2>New Section Content</h2><p>Start writing here...</p>',
        notes: `Dynamic section: ${newSection.title}`,
        app: 0
      });

      // Create SEO Setting
      await createSetting({
        key: seoKey,
        value: JSON.stringify({ title: newSection.title, description: `Description for ${newSection.title}` }),
        notes: `SEO for dynamic section: ${newSection.title}`,
        app: 0
      });

      toast({ title: 'Section Created', className: 'bg-green-500 text-white' });
      setIsDialogOpen(false);
      setNewSection({ title: '', slug: '' });
      loadDynamicPages();
    } catch (err) {
      toast({ 
        variant: 'destructive', 
        title: 'Creation Failed', 
        description: err instanceof Error ? err.message : 'Unknown error' 
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Content Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage text, guides, and FAQ content for all your sections.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadDynamicPages} className="rounded-xl h-11 border-slate-200">
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl gap-2 font-bold shadow-lg shadow-primary/20 h-11 px-6">
                <Plus className="h-4 w-4" />
                Add New Section
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Content Section</DialogTitle>
                <DialogDescription>
                  Add a new manageable section. This will create content and SEO entries in the database.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="section-title">Public Title</Label>
                  <Input 
                    id="section-title" 
                    placeholder="e.g. Terms of Service" 
                    value={newSection.title}
                    onChange={(e) => setNewSection({...newSection, title: e.target.value})}
                    className="rounded-xl h-11"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="section-slug">Key / Slug (System name)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">content_</span>
                    <Input 
                      id="section-slug" 
                      placeholder="terms" 
                      className="rounded-xl h-11 pl-[64px] font-mono"
                      value={newSection.slug}
                      onChange={(e) => setNewSection({...newSection, slug: e.target.value})}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 italic">Use lowercase and underscores only.</p>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateSection} disabled={isAdding} className="rounded-xl w-full h-11 font-bold">
                  {isAdding ? <LoadingSpinner className="mr-2" /> : <Plus className="mr-2 h-4 w-4" />}
                  Create Section
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <LoadingSpinner className="h-10 w-10 text-primary" />
          <p className="text-sm font-bold text-slate-400">Loading sections...</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pages.map((page) => (
            <Card key={page.id} className="border-none shadow-sm rounded-2xl overflow-hidden group hover:shadow-md transition-all">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <page.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base font-bold truncate">{page.title}</CardTitle>
                    <code className="text-[10px] text-slate-400 font-mono">/{page.path.replace('/', '')}</code>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <CardDescription className="text-xs min-h-[40px] mb-6 line-clamp-2">
                  {page.description}
                </CardDescription>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 rounded-xl font-bold gap-2" asChild>
                    <Link href={`/pages/${page.key}/edit`}>
                      <Edit3 className="h-4 w-4" />
                      Edit Content
                    </Link>
                  </Button>
                  {!page.isCustom && (
                    <Button size="sm" variant="outline" className="rounded-xl font-bold h-9 w-9 p-0" asChild title="View Live Page">
                      <Link href={page.path} target="_blank">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                  {page.isCustom && (
                    <Button size="sm" variant="outline" className="rounded-xl font-bold h-9 w-9 p-0 text-slate-400" disabled title="Dynamic Route">
                      <Globe className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
