"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/snapsaver/LoadingSpinner';
import { AlertCircle, RefreshCw, Plus } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { fetchSessions, toggleSessionStatus } from '@/app/actions';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

/**
 * AdminSessionsPage - Displays a list of active and inactive Instagram login sessions.
 * Includes a toggle switch to enable/disable specific sessions.
 */
export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<number | string | null>(null);
  const { toast } = useToast();

  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchSessions();
      
      if (data && Array.isArray(data.data)) {
        setSessions(data.data);
      } else if (Array.isArray(data)) {
        setSessions(data);
      } else {
        setSessions([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching sessions.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleToggleStatus = async (id: number | string, currentStatus: number) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    setTogglingId(id);

    try {
      await toggleSessionStatus(id, newStatus);
      
      // Update local state for immediate feedback
      setSessions(prev => prev.map(s => {
        if ((s.id || s.userid) === id) {
          return { ...s, status: newStatus };
        }
        return s;
      }));

      toast({
        title: `Session ${newStatus === 1 ? 'Activated' : 'Deactivated'}`,
        description: `The status has been successfully updated.`,
        className: newStatus === 1 ? 'bg-green-500 text-white' : 'bg-slate-700 text-white'
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Toggle Failed',
        description: err instanceof Error ? err.message : 'Could not update session status.',
      });
    } finally {
      setTogglingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Login Sessions</h1>
          <p className="text-slate-500 text-sm">Manage Instagram authentication tokens used for media retrieval.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadSessions} disabled={isLoading} className="rounded-xl">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button asChild size="sm" className="rounded-xl">
            <Link href="/admin/sessions/add">
              <Plus className="h-4 w-4 mr-2" />
              Add Session
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
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <LoadingSpinner className="h-10 w-10 text-primary" />
          <p className="text-sm font-medium text-slate-500">Retrieving active sessions from cloud...</p>
        </div>
      ) : sessions.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sessions.map((session) => {
            const currentId = session.id || session.userid;
            const isProcessing = togglingId === currentId;
            const isActive = session.status === 1;

            return (
              <Card key={currentId} className="border-none shadow-sm rounded-2xl overflow-hidden group hover:shadow-md transition-shadow">
                <CardHeader className="pb-3 flex flex-row items-start justify-between">
                  <div className="min-w-0 pr-2">
                    <CardTitle className="text-lg font-bold truncate">@{session.name || 'unknown'}</CardTitle>
                    <CardDescription className="font-mono text-[10px] uppercase tracking-wider">User ID: {session.userid}</CardDescription>
                  </div>
                  <div className="flex items-center pt-1">
                    <Switch 
                      checked={isActive} 
                      disabled={isProcessing}
                      onCheckedChange={() => handleToggleStatus(currentId, session.status)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase">Status</span>
                    <div className="flex items-center gap-2">
                      {isProcessing && <LoadingSpinner className="h-3 w-3 text-slate-400" />}
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[10px] font-bold py-0.5 rounded-lg border-none",
                          isActive ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-500"
                        )}
                      >
                        {isActive ? 'Active' : 'Not Active'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Last Updated At</span>
                    <span className="text-[11px] font-bold text-slate-700">{formatDate(session.updated_at)}</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button variant="secondary" size="sm" asChild className="w-full rounded-xl font-bold h-9">
                    <Link href={`/admin/sessions/${currentId}/edit`}>Manage Access</Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed border-2 bg-slate-50/50 rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
              <AlertCircle className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-lg font-bold text-slate-900">No sessions found</p>
            <p className="text-sm text-slate-500 mt-1 max-w-[250px]">
              The API returned an empty list. Add a new session to start fetching private content.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
