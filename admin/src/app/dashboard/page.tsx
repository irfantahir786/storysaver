"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Video, Clock, TrendingUp, ArrowUpRight, ArrowDownRight, MoreVertical } from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const stats = [
  { 
    title: 'Total Sessions', 
    value: '10', 
    trend: '+2.5%', 
    trendType: 'up',
    icon: Users, 
    color: 'text-blue-600',
    bg: 'bg-blue-100'
  },
  { 
    title: 'Active Sessions', 
    value: '1', 
    trend: '0.0%', 
    trendType: 'neutral',
    icon: TrendingUp, 
    color: 'text-green-600',
    bg: 'bg-green-100'
  },
  { 
    title: 'Expired Sessions', 
    value: '9', 
    trend: '+1.2%', 
    trendType: 'down',
    icon: Clock, 
    color: 'text-orange-600',
    bg: 'bg-orange-100'
  },
  { 
    title: 'Total Downloads', 
    value: '1,250', 
    trend: '+12.5%', 
    trendType: 'up',
    icon: Video, 
    color: 'text-purple-600',
    bg: 'bg-purple-100'
  },
];

const chartData = [
  { name: 'Mon', downloads: 400 },
  { name: 'Tue', downloads: 300 },
  { name: 'Wed', downloads: 600 },
  { name: 'Thu', downloads: 450 },
  { name: 'Fri', downloads: 800 },
  { name: 'Sat', downloads: 700 },
  { name: 'Sun', downloads: 950 },
];

const sessionData = [
  { id: 1, username: 'storysaver_in', userId: '60177972340', status: 'Expired', lastUpdate: '11 Aug, 03:08 pm' },
  { id: 2, username: 'mayer.zo', userId: '59050294328', status: 'Expired', lastUpdate: '11 Aug, 03:08 pm' },
  { id: 7, username: 'save517', userId: '65907157934', status: 'Active', lastUpdate: '12 Aug, 02:08 pm' },
  { id: 4, username: 'irfan_inc', userId: '63999616611', status: 'Expired', lastUpdate: '11 Aug, 04:08 pm' },
];

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500 text-sm mt-0.5">Summary of your platform activity and performance.</p>
        </div>
        <Button variant="outline" className="hidden sm:flex rounded-xl">
          Download Report
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item, index) => (
          <Card key={index} className="border-none shadow-sm overflow-hidden rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2.5 rounded-xl", item.bg)}>
                  <item.icon className={cn("h-5 w-5", item.color)} />
                </div>
                <div className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5",
                  item.trendType === 'up' ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                )}>
                  {item.trend}
                  {item.trendType === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-slate-900">{item.value}</div>
                <div className="text-xs font-medium text-slate-400">{item.title}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-8 border-none shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-0.5">
              <CardTitle className="text-lg font-bold">Download Analytics</CardTitle>
              <CardDescription className="text-xs">Weekly media downloads performance.</CardDescription>
            </div>
            <div className="flex gap-2">
               <Badge variant="outline" className="text-[10px] py-0.5 border-slate-200">Weekly</Badge>
               <Badge variant="outline" className="text-[10px] py-0.5 border-slate-200">Monthly</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[320px] pt-4 pr-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 rounded-xl shadow-xl border border-slate-50">
                          <p className="text-xs font-bold text-slate-900 mb-1">{payload[0].payload.name}</p>
                          <p className="text-sm text-primary font-bold">{payload[0].value} downloads</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="downloads" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorDownloads)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 border-none shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold">Recent Sessions</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-0">
            {sessionData.map((session) => (
              <div key={session.id} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                    <AvatarImage src={`https://picsum.photos/seed/${session.id}/100/100`} />
                    <AvatarFallback className="bg-slate-100 text-slate-600 font-bold text-xs">
                      {session.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900 truncate">{session.username}</span>
                    <span className="text-[11px] font-medium text-slate-400 truncate">ID: {session.userId}</span>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className={cn(
                    "text-[10px] font-bold py-0.5 rounded-lg border-none",
                    session.status === 'Active' ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-500"
                  )}>
                    {session.status}
                  </Badge>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">{session.lastUpdate.split(',')[0]}</p>
                </div>
              </div>
            ))}
            <div className="pt-4">
                <Button variant="secondary" className="w-full text-xs font-bold rounded-xl h-10" asChild>
                    <Link href="/admin/sessions">View All Activity</Link>
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}