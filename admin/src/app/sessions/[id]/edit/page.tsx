"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, ShieldCheck } from 'lucide-react';
import { LoadingSpinner } from '@/components/snapsaver/LoadingSpinner';
import { updateSessionStatus, fetchSessions } from '@/app/actions';
import Link from 'next/link';

export default function EditSessionPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { toast } = useToast();

  const [sessionIdValue, setSessionIdValue] = useState('');
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function loadSession() {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await fetchSessions();
        const sessions = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
        const currentSession = sessions.find((s: any) => String(s.id) === String(id) || String(s.userid) === String(id));
        
        if (currentSession) {
          setUsername(currentSession.name || '');
          setUserId(currentSession.userid || '');
          setSessionIdValue(currentSession.sessionid || '');
        }
      } catch (err) {
        console.error("Error loading session for edit:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSession();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionIdValue) {
      toast({
        variant: 'destructive',
        title: 'Input Required',
        description: 'Please provide a session ID token.',
      });
      return;
    }

    setIsUpdating(true);
    try {
      await updateSessionStatus(id as string, sessionIdValue);
      toast({
        title: 'Session Updated Successfully',
        description: `The session for @${username} has been refreshed.`,
        className: 'bg-green-500 text-white'
      });
      router.push('/sessions');
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: err instanceof Error ? err.message : 'An error occurred while updating the session.',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <LoadingSpinner className="h-10 w-10 text-primary" />
        <p className="text-sm font-medium text-slate-500">Loading session details...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200" asChild>
          <Link href="/admin/sessions">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Manage Access Token</h1>
          <p className="text-slate-500 text-xs">Update the Instagram authentication session for this account.</p>
        </div>
      </div>

      <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ShieldCheck className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-lg font-bold">Session Configuration</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Enter the new session ID string extracted from your cookies.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form className="space-y-6" onSubmit={handleUpdate}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-xs font-bold uppercase tracking-wider text-slate-500">Username</Label>
                <Input 
                  id="username" 
                  value={username} 
                  disabled 
                  className="rounded-xl bg-slate-50 border-slate-200 h-11" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userId" className="text-xs font-bold uppercase tracking-wider text-slate-500">User ID</Label>
                <Input 
                  id="userId" 
                  value={userId} 
                  disabled 
                  className="rounded-xl bg-slate-50 border-slate-200 h-11" 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sessionId" className="text-xs font-bold uppercase tracking-wider text-slate-500">Session ID Token</Label>
              <Textarea 
                id="sessionId" 
                value={sessionIdValue} 
                onChange={(e) => setSessionIdValue(e.target.value)}
                placeholder="Paste the sessionid cookie value here..." 
                rows={6} 
                className="rounded-xl border-slate-200 focus-visible:ring-primary/20 font-mono text-sm resize-none"
                required
              />
              <p className="text-[10px] text-slate-400 font-medium italic">
                * This token is required to fetch private content and bypass limits.
              </p>
            </div>

            <div className="pt-6 border-t border-slate-100 flex gap-3">
              <Button type="submit" disabled={isUpdating} className="rounded-xl h-11 px-8 font-bold gap-2">
                {isUpdating ? (
                  <LoadingSpinner className="h-4 w-4" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isUpdating ? 'Updating...' : 'Update Session'}
              </Button>
              <Button type="button" variant="ghost" className="rounded-xl h-11 px-8 font-bold text-slate-500" asChild>
                <Link href="/admin/sessions">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
