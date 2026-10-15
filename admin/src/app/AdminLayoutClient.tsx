"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Menu, Search, ChevronDown, Star, History } from "lucide-react";
import { LoadingSpinner } from "@/components/other/LoadingSpinner";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const isLoginPage = pathname === "/login";

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    if (!isAdmin && !isLoginPage) {
      router.replace("/login");
    } else if (isAdmin && isLoginPage) {
      router.replace("/dashboard");
    } else {
      setIsAuthenticated(isAdmin);
    }

    setIsChecking(false);
  }, [pathname, router, isLoginPage]);

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    router.push("/login");
  };

  // Loading state
  if (isChecking && !isLoginPage) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <LoadingSpinner className="h-10 w-10 text-primary" />
      </div>
    );
  }

  // Login page (no layout)
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Block access if not authenticated
  if (!isAuthenticated) return null;

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[260px_1fr] bg-slate-50">
      
      {/* SIDEBAR (DESKTOP) */}
      <div className="hidden border-r bg-white md:block sticky top-0 h-screen">
        <AdminSidebar onLogout={handleLogout} />
      </div>

      {/* MAIN */}
      <div className="flex flex-col min-w-0">

        {/* HEADER */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white/80 backdrop-blur-md px-4 md:px-8">
          
          {/* MOBILE SIDEBAR */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[260px]">
              <AdminSidebar onLogout={handleLogout} />
            </SheetContent>
          </Sheet>

          {/* SEARCH */}
          <div className="flex flex-1 items-center gap-4">
            <div className="relative hidden max-w-md flex-1 md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search..."
                className="pl-10 bg-slate-100/50 border-none h-10 rounded-xl"
              />
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-2">
            <TooltipProvider>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Star className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Favorites</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <History className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Recent</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Notifications</TooltipContent>
              </Tooltip>

            </TooltipProvider>

            {/* USER */}
            <div className="flex items-center gap-2 border-l pl-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}