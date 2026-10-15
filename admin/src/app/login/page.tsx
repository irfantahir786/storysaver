
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Smile } from 'lucide-react';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
        if (username === 'admin' && password === 'password') {
          toast({
            title: 'Login Successful',
            description: 'Redirecting to dashboard...',
            variant: 'default',
            className: 'bg-green-500 text-white'
          });
          localStorage.setItem('isAdmin', 'true');
          router.push('/dashboard');
        } else {
          toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: 'Invalid username or password.',
          });
          setIsLoading(false);
        }
    }, 1000)

  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md mx-4 shadow-2xl border-t-4 border-t-primary">
        <CardHeader className="text-center space-y-4">
          <Smile className="h-12 w-12 mx-auto text-primary"/>
          <CardTitle className="text-3xl font-bold">Admin Panel Login</CardTitle>
          <CardDescription>Welcome back! Please log in to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                required
                className="h-12 text-base"
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full h-12 text-lg bg-primary hover:bg-primary/90">
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
