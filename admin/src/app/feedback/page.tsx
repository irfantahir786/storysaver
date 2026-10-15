
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MessageSquare, MoreHorizontal, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const feedbackData = [
  { id: 1, user: 'User1', message: 'Great app! Very useful.', date: '12 Aug, 2025 10:00 am' },
  { id: 2, user: 'User2', message: 'The new feature is amazing!', date: '12 Aug, 2025 11:30 am' },
  { id: 3, user: 'User3', message: 'Found a small bug on the reels page.', date: '12 Aug, 2025 01:15 pm' },
  { id: 4, user: 'User4', message: 'Could you add a dark mode?', date: '13 Aug, 2025 09:20 am' },
  { id: 5, user: 'User5', message: 'Very fast and reliable.', date: '13 Aug, 2025 02:45 pm' },
];

export default function AdminFeedbackPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">User Feedback</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage and review feedback submitted by users.</p>
      </div>

      <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="pb-0 pt-6 px-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <MessageSquare className="h-4 w-4 text-blue-600" />
            </div>
            <CardTitle className="text-lg font-bold">Recent Submissions</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0 mt-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="w-[150px] font-bold text-slate-900 px-6 py-4">User</TableHead>
                  <TableHead className="min-w-[300px] font-bold text-slate-900 px-6 py-4">Message</TableHead>
                  <TableHead className="w-[180px] font-bold text-slate-900 px-6 py-4">Date</TableHead>
                  <TableHead className="w-[100px] text-right font-bold text-slate-900 px-6 py-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbackData.map((feedback) => (
                  <TableRow key={feedback.id} className="border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-medium text-slate-900 px-6 py-4">
                      {feedback.user}
                    </TableCell>
                    <TableCell className="text-slate-600 px-6 py-4">
                      <p className="line-clamp-1 max-w-md">{feedback.message}</p>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm px-6 py-4">
                      {feedback.date}
                    </TableCell>
                    <TableCell className="text-right px-6 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-900">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border-slate-100 shadow-xl w-[160px]">
                          <DropdownMenuLabel className="text-xs font-bold text-slate-400 uppercase tracking-wider">Options</DropdownMenuLabel>
                          <DropdownMenuItem className="cursor-pointer gap-2 focus:bg-slate-50 rounded-lg">
                            <Eye className="h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer gap-2 text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
