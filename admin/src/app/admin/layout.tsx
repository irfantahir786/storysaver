"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Menu, Search, ChevronDown, Star, History } from 'lucide-react';
import { LoadingSpinner } from '@/components/snapsaver/LoadingSpinner';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    if (!isAdmin && !isLoginPage) {
      router.replace('/admin/login');
    } else if (isAdmin && isLoginPage) {
      router.replace('/admin/dashboard');
    } else {
      setIsAuthenticated(isAdmin);
    }
    setIsChecking(false);
  }, [router, isLoginPage]);

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    router.push('/admin/login');
  };

  if (isChecking && !isLoginPage) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <LoadingSpinner className="h-10 w-10 text-primary" />
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!isAuthenticated) return null;

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[260px_1fr] bg-slate-50">
      <div className="hidden border-r bg-white md:block sticky top-0 h-screen">
        <AdminSidebar onLogout={handleLogout} />
      </div>
      <div className="flex flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white/80 backdrop-blur-md px-4 md:px-8">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 md:hidden text-slate-600"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0 w-[260px]">
              <AdminSidebar onLogout={handleLogout} />
            </SheetContent>
          </Sheet>

          <div className="flex flex-1 items-center gap-4">
            <div className="relative hidden max-w-md flex-1 md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search analytics, sessions..."
                className="pl-10 bg-slate-100/50 border-none focus-visible:ring-1 focus-visible:ring-primary/20 h-10 rounded-xl"
              />
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-xl text-slate-500 hover:bg-slate-100 h-9 w-9 sm:h-10 sm:w-10">
                    <Star className="h-5 w-5" />
                    <span className="sr-only">Favorites</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Favorites</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-xl text-slate-500 hover:bg-slate-100 h-9 w-9 sm:h-10 sm:w-10">
                    <History className="h-5 w-5" />
                    <span className="sr-only">Recent Users</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Recent Users</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative rounded-xl text-slate-500 hover:bg-slate-100 h-9 w-9 sm:h-10 sm:w-10">
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white" />
                    <span className="sr-only">Notifications</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Notifications</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 ml-1 sm:ml-2 border-l">
              <div className="hidden flex-col text-right lg:flex">
                <span className="text-sm font-bold text-slate-900">Admin User</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Super Admin</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 cursor-pointer group">
                <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border-2 border-slate-100 shadow-sm transition-transform group-hover:scale-105">
                  <AvatarImage src="https://github.com/shadcn.png" alt="Admin" />
                  <AvatarFallback className="bg-primary text-white text-xs font-bold">AD</AvatarFallback>
                </Avatar>
                <ChevronDown className="h-4 w-4 text-slate-400 hidden sm:block" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
