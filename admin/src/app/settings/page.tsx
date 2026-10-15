"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Settings as SettingsIcon, 
  Globe, 
  Save, 
  BarChart3, 
  BellRing,
  Plus,
  FileText,
  RefreshCw,
  Search,
  Layout,
  Trash2,
  PlusCircle,
  Code,
  X,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createSetting, updateSetting, deleteSetting, fetchSettings } from '@/app/actions';
import { LoadingSpinner } from '@/components/snapsaver/LoadingSpinner';

interface SettingValue {
  value: string;
  notes: string;
  app?: number;
}

interface SettingsState {
  web: { [key: string]: SettingValue };
  app: { [key: string]: SettingValue };
}

const PUBLIC_PAGES = [
  { id: 'home', label: 'Home Page', path: '/', key: 'seo_home' },
  { id: 'reels', label: 'Reels Downloader', path: '/instagram-reels-downloader', key: 'seo_reels' },
  { id: 'photo', label: 'Photo Downloader', path: '/instagram-photo-downloader', key: 'seo_photo' },
  { id: 'dp', label: 'DP Downloader', path: '/dp', key: 'seo_dp' },
  { id: 'highlights', label: 'Highlights', path: '/highlights', key: 'seo_highlights' },
  { id: 'search', label: 'Search Profile', path: '/search', key: 'seo_search' },
  { id: 'contact', label: 'Contact Us', path: '/contact', key: 'seo_contact' },
];

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  const [settings, setSettings] = useState<SettingsState>({
    web: {},
    app: {}
  });

  const [newSetting, setNewSetting] = useState({
    category: '0', 
    key: '',
    value: '',
    notes: '',
    type: 'text' as 'text' | 'boolean' | 'json'
  });

  const [jsonPairs, setJsonPairs] = useState<{ key: string; value: string }[]>([
    { key: '', value: '' }
  ]);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchSettings();
      if (data && (data.web || data.app)) {
        setSettings({
          web: data.web || {},
          app: data.app || {}
        });
      } else {
        const settingsArray = data?.data && Array.isArray(data.data) 
          ? data.data 
          : (Array.isArray(data) ? data : []);
        
        const newSettings: SettingsState = { web: {}, app: {} };
        settingsArray.forEach((s: any) => {
          const category = Number(s.app) === 1 ? 'app' : 'web';
          newSettings[category][s.key] = {
            value: s.value || '',
            notes: s.notes || '',
            app: Number(s.app)
          };
        });
        setSettings(newSettings);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error Fetching Settings',
        description: error instanceof Error ? error.message : 'Could not load configurations.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSaveSetting = async (key: string, value: string, notes: string, app: number) => {
    try {
      await updateSetting(key, { value, notes, app });
      toast({ title: `"${key}" saved`, className: "bg-green-500 text-white" });
      loadSettings();
    } catch (error) {
      toast({ 
        variant: 'destructive', 
        title: 'Save Failed',
        description: error instanceof Error ? error.message : 'An error occurred.'
      });
    }
  };

  const handleDeleteSetting = async (key: string) => {
    if (!window.confirm(`Are you sure you want to delete the parameter "${key}"?`)) return;

    try {
      await deleteSetting(key);
      toast({ title: `"${key}" deleted`, className: "bg-red-500 text-white" });
      loadSettings();
    } catch (error) {
      toast({ 
        variant: 'destructive', 
        title: 'Delete Failed',
        description: error instanceof Error ? error.message : 'An error occurred.'
      });
    }
  };

  const handleSavePageSEO = async (pageKey: string, title: string, description: string) => {
    const jsonValue = JSON.stringify({ title, description });
    const notes = settings.web[pageKey]?.notes || `SEO metadata for ${pageKey}`;
    await handleSaveSetting(pageKey, jsonValue, notes, 0);
  };

  const handleAddSetting = async () => {
    if (!newSetting.key) {
        toast({ variant: 'destructive', title: 'Key Required' });
        return;
    }

    setIsAdding(true);
    try {
      let finalValue = newSetting.value;
      if (newSetting.type === 'json') {
        const jsonObj: Record<string, string> = {};
        jsonPairs.forEach(pair => {
          if (pair.key.trim()) {
            jsonObj[pair.key.trim()] = pair.value;
          }
        });
        finalValue = JSON.stringify(jsonObj);
      }

      await createSetting({
        key: newSetting.key,
        value: finalValue,
        notes: newSetting.notes,
        app: parseInt(newSetting.category)
      });

      setIsAddDialogOpen(false);
      setNewSetting({ category: '0', key: '', value: '', notes: '', type: 'text' });
      setJsonPairs([{ key: '', value: '' }]);
      toast({ title: "Setting Created", className: "bg-green-500 text-white" });
      loadSettings();
    } catch (error) {
      toast({ 
        variant: 'destructive', 
        title: 'Add Failed',
        description: error instanceof Error ? error.message : 'An error occurred.'
      });
    } finally {
      setIsAdding(false);
    }
  };

  const onEnterPress = (e: React.KeyboardEvent, callback: () => void) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      callback();
    }
  };

  const addJsonPair = () => setJsonPairs([...jsonPairs, { key: '', value: '' }]);
  const removeJsonPair = (index: number) => {
    if (jsonPairs.length > 1) {
      setJsonPairs(jsonPairs.filter((_, i) => i !== index));
    }
  };
  const updateJsonPair = (index: number, field: 'key' | 'value', val: string) => {
    const updated = [...jsonPairs];
    updated[index][field] = val;
    setJsonPairs(updated);
  };

  const renderPageSEO = () => {
    return PUBLIC_PAGES.map((page) => {
      let currentData = { title: '', description: '' };
      const rawValue = settings.web[page.key]?.value;
      
      if (rawValue) {
        try {
          currentData = JSON.parse(rawValue);
        } catch (e) {
          currentData.title = rawValue;
        }
      }

      return (
        <Card key={page.id} className="border-none shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-bold">{page.label}</CardTitle>
              </div>
              <code className="text-[10px] bg-slate-200 px-2 py-0.5 rounded text-slate-600 font-mono">
                {page.key}
              </code>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Meta Title / Page Title</Label>
              <Input 
                key={`title-${page.key}-${currentData.title}`}
                placeholder="Press Enter to save..."
                defaultValue={currentData.title}
                onKeyDown={(e) => onEnterPress(e, () => handleSavePageSEO(page.key, (e.target as HTMLInputElement).value, currentData.description))}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Meta Description / Subtitle</Label>
              <Textarea 
                key={`desc-${page.key}-${currentData.description}`}
                placeholder="Press Enter to save (Shift+Enter for newline)..."
                defaultValue={currentData.description}
                onKeyDown={(e) => onEnterPress(e, () => handleSavePageSEO(page.key, currentData.title, (e.target as HTMLTextAreaElement).value))}
                rows={2}
                className="rounded-xl resize-none"
              />
            </div>
          </CardContent>
        </Card>
      );
    });
  };

  const renderWebParams = () => {
    return Object.entries(settings.web).filter(([key]) => {
      const isPageSeo = PUBLIC_PAGES.some(p => p.key === key);
      return !isPageSeo && key !== 'meta_keywords' && key !== 'google_analytics_id' && key !== 'adsense_pub_id' && key !== 'app_name' && key !== 'app_slogan';
    }).map(([key, setting]) => {
      let type: 'text' | 'boolean' | 'json' = 'text';
      let parsedJson: Record<string, string> = {};
      
      if (setting.value === 'true' || setting.value === 'false') {
        type = 'boolean';
      } else {
        try {
          const parsed = JSON.parse(setting.value);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            type = 'json';
            parsedJson = parsed;
          }
        } catch (e) {
          type = 'text';
        }
      }

      return (
        <Card key={key} className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <code className="text-[11px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-lg">{key}</code>
              <div className="flex items-center gap-2">
                <Select 
                  defaultValue={type} 
                  onValueChange={(newType) => {
                    if (newType === 'boolean') handleSaveSetting(key, 'false', setting.notes, 0);
                    else if (newType === 'json') handleSaveSetting(key, '{}', setting.notes, 0);
                    else handleSaveSetting(key, '', setting.notes, 0);
                  }}
                >
                  <SelectTrigger className="h-7 w-20 text-[10px] font-bold rounded-lg border-slate-100 bg-slate-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                  onClick={() => handleDeleteSetting(key)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="pt-2">
              {type === 'boolean' && (
                <Select 
                  key={`select-${key}-${setting.value}`}
                  defaultValue={setting.value}
                  onValueChange={(val) => handleSaveSetting(key, val, setting.notes, 0)}
                >
                  <SelectTrigger className="h-10 rounded-xl text-sm border-slate-200">
                    <SelectValue placeholder="Select value" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100">
                    <SelectItem value="true">True (Enabled)</SelectItem>
                    <SelectItem value="false">False (Disabled)</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {type === 'text' && (
                <Input 
                  key={`param-${key}-${setting.value}`}
                  defaultValue={setting.value} 
                  onKeyDown={(e) => onEnterPress(e, () => handleSaveSetting(key, (e.target as HTMLInputElement).value, setting.notes, 0))}
                  className="h-10 rounded-xl text-sm" 
                />
              )}

              {type === 'json' && (
                <div className="space-y-3 p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                  {Object.entries(parsedJson).map(([subKey, subVal]) => (
                    <div key={subKey} className="flex flex-col gap-1 relative group/field">
                      <div className="flex items-center justify-between">
                        <Label className="text-[9px] font-bold uppercase text-slate-400">{subKey}</Label>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5 text-slate-300 hover:text-red-500 rounded-full"
                          onClick={() => {
                            const updated = { ...parsedJson };
                            delete updated[subKey];
                            handleSaveSetting(key, JSON.stringify(updated), setting.notes, 0);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <Input 
                        key={`json-field-${key}-${subKey}-${subVal}`}
                        defaultValue={subVal}
                        className="h-8 text-xs rounded-lg"
                        onKeyDown={(e) => onEnterPress(e, () => {
                          const updated = { ...parsedJson, [subKey]: (e.target as HTMLInputElement).value };
                          handleSaveSetting(key, JSON.stringify(updated), setting.notes, 0);
                        })}
                      />
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full h-8 text-[10px] font-bold gap-1 rounded-lg mt-2"
                    onClick={() => {
                      const newSubKey = prompt("Enter new field name:");
                      if (newSubKey && newSubKey.trim()) {
                        const updated = { ...parsedJson, [newSubKey.trim()]: "" };
                        handleSaveSetting(key, JSON.stringify(updated), setting.notes, 0);
                      }
                    }}
                  >
                    <PlusCircle className="h-3 w-3" /> Add Field
                  </Button>
                </div>
              )}
            </div>
            
            {setting.notes && (
              <p className="text-[10px] text-slate-400 font-medium italic">
                * {setting.notes}
              </p>
            )}
          </CardContent>
        </Card>
      );
    });
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Platform Settings</h1>
          <p className="text-slate-500 text-sm mt-0.5">Control branding, SEO, and tracking. Press Enter to save changes.</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadSettings} disabled={isLoading} className="rounded-xl font-bold h-11 border-slate-200">
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl gap-2 font-bold shadow-lg shadow-primary/20 h-11 px-6">
                <Plus className="h-4 w-4" />
                Add Parameter
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>New Configuration</DialogTitle>
                <DialogDescription>Add a dynamic key/value pair to the database.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-5 py-4">
                <div className="grid gap-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Platform</Label>
                  <Select value={newSetting.category} onValueChange={(val) => setNewSetting({...newSetting, category: val})}>
                    <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                        <SelectItem value="0">Web (0)</SelectItem>
                        <SelectItem value="1">Mobile App (1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Key Name</Label>
                  <Input 
                    value={newSetting.key} 
                    onChange={(e) => setNewSetting({...newSetting, key: e.target.value})} 
                    className="rounded-xl h-11" 
                    placeholder="e.g. maintenance_mode" 
                  />
                </div>

                <div className="grid gap-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Value Type</Label>
                  <Select 
                    value={newSetting.type} 
                    onValueChange={(val: any) => {
                      setNewSetting({...newSetting, type: val, value: val === 'boolean' ? 'false' : ''});
                    }}
                  >
                    <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="text">Plain Text</SelectItem>
                      <SelectItem value="boolean">True / False</SelectItem>
                      <SelectItem value="json">Structured JSON (Maker)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Value Configuration</Label>
                  
                  {newSetting.type === 'text' && (
                    <Textarea 
                      value={newSetting.value} 
                      onChange={(e) => setNewSetting({...newSetting, value: e.target.value})} 
                      className="rounded-xl font-mono text-sm min-h-[100px]" 
                      placeholder="Enter text value..." 
                    />
                  )}

                  {newSetting.type === 'boolean' && (
                    <Select value={newSetting.value} onValueChange={(val) => setNewSetting({...newSetting, value: val})}>
                      <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="true">True (Enabled)</SelectItem>
                        <SelectItem value="false">False (Disabled)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}

                  {newSetting.type === 'json' && (
                    <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">JSON Maker</span>
                        <Button variant="ghost" type="button" size="sm" onClick={addJsonPair} className="h-7 text-[10px] font-bold gap-1 text-primary hover:text-primary hover:bg-primary/5">
                          <PlusCircle className="h-3 w-3" /> Add Pair
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {jsonPairs.map((pair, idx) => (
                          <div key={idx} className="flex gap-2 items-start">
                            <Input 
                              placeholder="Key" 
                              value={pair.key} 
                              onChange={(e) => updateJsonPair(idx, 'key', e.target.value)}
                              className="h-9 text-xs rounded-lg bg-white"
                            />
                            <Input 
                              placeholder="Value" 
                              value={pair.value} 
                              onChange={(e) => updateJsonPair(idx, 'value', e.target.value)}
                              className="h-9 text-xs rounded-lg bg-white"
                            />
                            <Button 
                              variant="ghost" 
                              type="button"
                              size="icon" 
                              onClick={() => removeJsonPair(idx)}
                              disabled={jsonPairs.length === 1}
                              className="h-9 w-9 shrink-0 text-slate-400 hover:text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Internal Notes</Label>
                  <Input 
                    value={newSetting.notes} 
                    onChange={(e) => setNewSetting({...newSetting, notes: e.target.value})} 
                    className="rounded-xl h-11" 
                    placeholder="What is this setting for?" 
                  />
                </div>
              </div>
              <DialogFooter className="mt-2">
                <Button onClick={handleAddSetting} disabled={isAdding} className="rounded-xl w-full h-11 font-bold">
                  {isAdding ? <LoadingSpinner className="mr-2" /> : <Plus className="mr-2 h-4 w-4" />}
                  Create Configuration
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="pageseo" className="w-full">
        <TabsList className="grid w-full max-w-3xl grid-cols-4 bg-slate-100/80 p-1 rounded-xl mb-8">
          <TabsTrigger value="pageseo" className="rounded-lg font-bold gap-2">
            <Layout className="h-4 w-4" />
            Page SEO
          </TabsTrigger>
          <TabsTrigger value="globalseo" className="rounded-lg font-bold gap-2">
            <Search className="h-4 w-4" />
            Global SEO
          </TabsTrigger>
          <TabsTrigger value="webapp" className="rounded-lg font-bold gap-2">
            <Code className="h-4 w-4" />
            Web Params
          </TabsTrigger>
          <TabsTrigger value="adsense" className="rounded-lg font-bold gap-2">
            <BellRing className="h-4 w-4" />
            AdSense
          </TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <LoadingSpinner className="h-10 w-10 text-primary" />
            <p className="text-sm font-bold text-slate-400">Connecting to API...</p>
          </div>
        ) : (
          <>
            <TabsContent value="pageseo" className="space-y-6 mt-0 animate-in fade-in duration-300">
               <div className="grid gap-6 md:grid-cols-2">
                    {renderPageSEO()}
               </div>
            </TabsContent>

            <TabsContent value="globalseo" className="space-y-8 mt-0">
              <div className="grid gap-6 lg:grid-cols-2">
                  <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        <CardTitle className="text-lg font-bold">App Branding & Global SEO</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">App Name (Site Title)</Label>
                        <Input 
                          key={`appname-${settings.web.app_name?.value}`}
                          defaultValue={settings.web.app_name?.value || 'SnapSaver'} 
                          onKeyDown={(e) => onEnterPress(e, () => handleSaveSetting('app_name', (e.target as HTMLInputElement).value, 'Primary brand name across the site', 0))}
                          className="rounded-xl h-11 border-primary/20 bg-primary/5 focus-visible:ring-primary/30" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">App Slogan</Label>
                        <Input 
                          key={`slogan-${settings.web.app_slogan?.value}`}
                          defaultValue={settings.web.app_slogan?.value || 'Download Instagram Content'} 
                          onKeyDown={(e) => onEnterPress(e, () => handleSaveSetting('app_slogan', (e.target as HTMLInputElement).value, 'Tagline used in headers and default descriptions', 0))}
                          className="rounded-xl h-11" 
                        />
                      </div>
                      <div className="pt-4 border-t border-slate-100 space-y-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Meta Keywords</Label>
                          <Input 
                            key={`keywords-${settings.web.meta_keywords?.value}`}
                            defaultValue={settings.web.meta_keywords?.value} 
                            onKeyDown={(e) => onEnterPress(e, () => handleSaveSetting('meta_keywords', (e.target as HTMLInputElement).value, 'Global site keywords', 0))}
                            className="rounded-xl h-11" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Google Analytics ID</Label>
                          <Input 
                            key={`ga-${settings.web.google_analytics_id?.value}`}
                            defaultValue={settings.web.google_analytics_id?.value} 
                            onKeyDown={(e) => onEnterPress(e, () => handleSaveSetting('google_analytics_id', (e.target as HTMLInputElement).value, 'GA Tracking ID', 0))}
                            placeholder="G-XXXXXXXXXX" 
                            className="rounded-xl h-11" 
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
              </div>
            </TabsContent>

            <TabsContent value="webapp" className="space-y-4 mt-0">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {renderWebParams()}
              </div>
            </TabsContent>

            <TabsContent value="adsense" className="space-y-8 mt-0">
               <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <BellRing className="h-4 w-4 text-red-600" />
                    <CardTitle className="text-lg font-bold">AdSense Configuration</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Publisher ID</Label>
                      <Input 
                        key={`adsense-${settings.web.adsense_pub_id?.value}`}
                        defaultValue={settings.web.adsense_pub_id?.value} 
                        onKeyDown={(e) => onEnterPress(e, () => handleSaveSetting('adsense_pub_id', (e.target as HTMLInputElement).value, 'AdSense Pub ID', 0))}
                        placeholder="pub-xxxxxxxxxxxxxxxx" 
                        className="rounded-xl h-11" 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
