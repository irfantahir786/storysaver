"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Code, 
  RefreshCw, 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  List, 
  ListOrdered, 
  Link as LinkIcon, 
  Image as ImageIcon,
  Type,
  Undo,
  Redo,
  Plus
} from 'lucide-react';
import { LoadingSpinner } from '@/components/snapsaver/LoadingSpinner';
import { updateSetting, fetchSettings } from '@/app/actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Link from 'next/link';

export default function EditPageContent() {
  const router = useRouter();
  const params = useParams();
  const { key } = params;
  const { toast } = useToast();
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const visualContentRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('preview');
  
  const seoKey = (key as string).replace('content_', 'seo_');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchSettings();
      const webSettings = data?.web || {};
      
      const contentSetting = webSettings[key as string];
      const initialContent = contentSetting?.value || '';
      setContent(initialContent);

      const seoSetting = webSettings[seoKey];
      if (seoSetting?.value) {
        try {
          const parsedSeo = JSON.parse(seoSetting.value);
          setTitle(parsedSeo.title || '');
          setSeoDescription(parsedSeo.description || '');
        } catch (e) {
          setTitle(seoSetting.value || '');
        }
      }
    } catch (err) {
      toast({ variant: 'destructive', title: 'Load Failed', description: 'Could not fetch page data.' });
    } finally {
      setIsLoading(false);
    }
  }, [key, seoKey, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle syncing state back to visual editor whenever the tab switches to 'preview'
  useEffect(() => {
    if (activeTab === 'preview' && visualContentRef.current) {
      if (visualContentRef.current.innerHTML !== content) {
        visualContentRef.current.innerHTML = content;
      }
    }
  }, [activeTab, content]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSetting(key as string, { 
        value: content, 
        notes: `Body content for ${key}`, 
        app: 0 
      });

      const seoValue = JSON.stringify({ 
        title: title, 
        description: seoDescription 
      });
      
      await updateSetting(seoKey, { 
        value: seoValue, 
        notes: `SEO and Title for ${seoKey}`, 
        app: 0 
      });

      toast({ title: 'Page Updated Successfully', className: 'bg-green-500 text-white' });
    } catch (err) {
      toast({ 
        variant: 'destructive', 
        title: 'Save Failed', 
        description: err instanceof Error ? err.message : 'Unknown error' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const execCommand = (command: string, value: string | undefined = undefined) => {
    if (activeTab === 'preview') {
      document.execCommand(command, false, value);
      handleVisualContentChange();
    } else {
      insertTagForCommand(command, value);
    }
  };

  const insertTagForCommand = (command: string, value?: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const selected = text.substring(start, end);

    let openTag = '';
    let closeTag = '';

    switch (command) {
      case 'bold': openTag = '<strong>'; closeTag = '</strong>'; break;
      case 'italic': openTag = '<em>'; closeTag = '</em>'; break;
      case 'formatBlock': 
        if (value === 'h2') { openTag = '<h2 class="text-2xl font-black mb-4 mt-8 text-slate-900">'; closeTag = '</h2>'; }
        else if (value === 'h3') { openTag = '<h3 class="text-xl font-bold mb-3 mt-6 text-slate-800">'; closeTag = '</h3>'; }
        else if (value === 'code') { openTag = '<code class="bg-slate-100 p-1 rounded">'; closeTag = '</code>'; }
        break;
      case 'insertUnorderedList': openTag = '<ul class="list-disc pl-6 space-y-2 my-4"><li>'; closeTag = '</li></ul>'; break;
      case 'insertOrderedList': openTag = '<ol class="list-decimal pl-6 space-y-2 my-4"><li>'; closeTag = '</li></ol>'; break;
    }

    const newText = `${before}${openTag}${selected}${closeTag}${after}`;
    setContent(newText);
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + openTag.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos + selected.length);
    }, 0);
  };

  const handleInsertLink = () => {
    const url = prompt('Enter the URL:', 'https://');
    if (url) {
      if (activeTab === 'preview') {
        document.execCommand('createLink', false, url);
        handleVisualContentChange();
      } else {
        const tag = `<a href="${url}" class="text-primary hover:underline">`;
        const endTag = '</a>';
        const textarea = textareaRef.current;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const text = textarea.value;
          setContent(`${text.substring(0, start)}${tag}${text.substring(start, end)}${endTag}${text.substring(end)}`);
        }
      }
    }
  };

  const handleInsertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      const alt = prompt('Enter alt text:', 'image description');
      if (activeTab === 'preview') {
        const imgHtml = `<img src="${url}" alt="${alt}" class="rounded-2xl shadow-lg my-8 w-full" />`;
        document.execCommand('insertHTML', false, imgHtml);
        handleVisualContentChange();
      } else {
        const imgHtml = `<img src="${url}" alt="${alt}" class="rounded-2xl shadow-lg my-8 w-full" />`;
        const textarea = textareaRef.current;
        if (textarea) {
          const start = textarea.selectionStart;
          const text = textarea.value;
          setContent(`${text.substring(0, start)}${imgHtml}${text.substring(start)}`);
        }
      }
    }
  };

  const handleVisualContentChange = () => {
    if (visualContentRef.current) {
      const newHtml = visualContentRef.current.innerHTML;
      if (newHtml !== content) {
        setContent(newHtml);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <LoadingSpinner className="h-10 w-10 text-primary" />
        <p className="text-sm font-bold text-slate-400">Loading editor...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-slate-200" asChild>
            <Link href="/pages">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Edit Page Content</h1>
            <p className="text-slate-500 text-xs font-mono">{key}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl font-bold h-11" onClick={loadData} disabled={isSaving}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reload
          </Button>
          <Button className="rounded-xl font-bold shadow-lg shadow-primary/20 px-8 h-11" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <LoadingSpinner className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {isSaving ? 'Saving...' : 'Update Page'}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="page-title" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page Main Heading (H1)</Label>
              <Input 
                id="page-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter page title..."
                className="text-2xl md:text-3xl font-black h-16 rounded-xl border-slate-100 bg-slate-50/50 focus-visible:ring-primary/20 px-6"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seo-desc" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page Subtitle / Meta Description</Label>
              <Input 
                id="seo-desc"
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Brief description for SEO..."
                className="rounded-xl border-slate-100 bg-slate-50/50 h-12"
              />
            </div>
          </div>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="bg-slate-100 p-1 rounded-xl h-11">
              <TabsTrigger value="preview" className="rounded-lg font-bold gap-2 px-6">
                <Eye className="h-4 w-4" />
                Live Write
              </TabsTrigger>
              <TabsTrigger value="editor" className="rounded-lg font-bold gap-2 px-6">
                <Code className="h-4 w-4" />
                HTML Source
              </TabsTrigger>
            </TabsList>
            
            <div className="bg-white border rounded-xl p-1 flex items-center gap-1 shadow-sm">
                <TooltipProvider>
                    <div className="flex items-center gap-1 pr-2 border-r border-slate-100">
                      <ToolbarButton onClick={() => execCommand('formatBlock', 'h2')} icon={Heading1} label="Heading 2" />
                      <ToolbarButton onClick={() => execCommand('formatBlock', 'h3')} icon={Heading2} label="Heading 3" />
                    </div>
                    <div className="flex items-center gap-1 px-2 border-r border-slate-100">
                      <ToolbarButton onClick={() => execCommand('bold')} icon={Bold} label="Bold" />
                      <ToolbarButton onClick={() => execCommand('italic')} icon={Italic} label="Italic" />
                      <ToolbarButton onClick={() => execCommand('formatBlock', 'code')} icon={Type} label="Code" />
                    </div>
                    <div className="flex items-center gap-1 px-2 border-r border-slate-100">
                      <ToolbarButton onClick={() => execCommand('insertUnorderedList')} icon={List} label="Bullet List" />
                      <ToolbarButton onClick={() => execCommand('insertOrderedList')} icon={ListOrdered} label="Numbered List" />
                    </div>
                    <div className="flex items-center gap-1 px-2">
                      <ToolbarButton onClick={handleInsertLink} icon={LinkIcon} label="Link" />
                      <ToolbarButton onClick={handleInsertImage} icon={ImageIcon} label="Image" />
                    </div>
                    {activeTab === 'preview' && (
                        <div className="flex items-center gap-1 pl-2 border-l border-slate-100">
                            <ToolbarButton onClick={() => document.execCommand('undo')} icon={Undo} label="Undo" />
                            <ToolbarButton onClick={() => document.execCommand('redo')} icon={Redo} label="Redo" />
                        </div>
                    )}
                </TooltipProvider>
            </div>
          </div>

          <Card className="border-none shadow-sm rounded-2xl overflow-hidden min-h-[650px] flex flex-col bg-white">
            <CardContent className="p-0 flex-1 flex flex-col">
              <TabsContent value="editor" className="mt-0 flex-1 flex flex-col">
                <Textarea 
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="flex-1 min-h-[550px] font-mono text-sm p-6 border-none focus-visible:ring-0 rounded-none bg-slate-900 text-slate-300 resize-none"
                  placeholder="Start writing HTML content..."
                />
              </TabsContent>
              <TabsContent value="preview" className="mt-0 p-8 md:p-16 flex-1 bg-white overflow-y-auto outline-none">
                <div className="max-w-3xl mx-auto">
                  <div 
                    ref={visualContentRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleVisualContentChange}
                    onBlur={handleVisualContentChange}
                    className="prose prose-slate prose-lg max-w-none prose-headings:font-black prose-p:text-slate-600 prose-strong:text-slate-900 prose-a:text-primary prose-img:rounded-3xl prose-img:shadow-2xl outline-none focus:ring-2 focus:ring-primary/5 rounded-xl p-4 -m-4 min-h-[500px]"
                  />
                </div>
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
}

function ToolbarButton({ onClick, icon: Icon, label }: { onClick: () => void, icon: any, label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 text-slate-600 hover:bg-slate-50 hover:text-primary rounded-lg"
          onClick={onClick}
          type="button"
        >
          <Icon className="h-4 w-4" />
          <span className="sr-only">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent className="bg-slate-900 text-white border-none rounded-lg text-xs font-bold">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
