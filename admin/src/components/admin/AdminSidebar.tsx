"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Mail, 
  LogOut, 
  Instagram, 
  Megaphone, 
  Settings
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  onLogout: () => void;
}

const navLinks = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/sessions", icon: Users, label: "Sessions" },
    { href: "/ads", icon: Megaphone, label: "Ads" },
    { href: "/feedback", icon: MessageSquare, label: "Feedback" },
    { href: "/contact", icon: Mail, label: "Contact" },
    { href: "/settings", icon: Settings, label: "Settings" },
];

export function AdminSidebar({ onLogout }: AdminSidebarProps) {
    const pathname = usePathname();

    return (
        <div className="flex h-full max-h-screen flex-col bg-white border-r">
            <div className="flex h-16 items-center border-b px-6">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="bg-primary p-1.5 rounded-lg shadow-sm">
                        <Instagram className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-slate-900">SnapSaver</span>
                </Link>
            </div>
            <div className="flex-1 overflow-y-auto py-8 px-4">
                <div className="mb-4 px-4 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                    Main Menu
                </div>
                <nav className="space-y-1.5">
                    {navLinks.map(link => {
                        const isActive = pathname.startsWith(link.href);
                        return (
                            <Link 
                                key={link.href} 
                                href={link.href} 
                                className={cn(
                                    "group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all",
                                    isActive 
                                        ? "bg-primary/10 text-primary" 
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <link.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-900")} />
                                    {link.label}
                                </div>
                                {isActive && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                            </Link>
                        )
                    })}
                </nav>
            </div>
            <div className="mt-auto border-t p-4">
                <Button 
                    onClick={onLogout} 
                    variant="ghost" 
                    className="w-full justify-start text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl px-4"
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    Logout
                </Button>
            </div>
        </div>
    )
}
