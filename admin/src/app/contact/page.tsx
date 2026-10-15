
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const contactData = [
  { id: 1, name: 'John Doe', email: 'john.doe@example.com', subject: 'Question about Reels', message: 'How do I download reels from private accounts?', date: '14 Aug, 2025 10:00 am' },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', subject: 'Feature Request', message: 'Please add support for downloading entire profiles.', date: '14 Aug, 2025 11:30 am' },
  { id: 3, name: 'Sam Wilson', email: 'sam.wilson@example.com', subject: 'Bug Report', message: 'The DP downloader is not working for some users.', date: '14 Aug, 2025 01:15 pm' },
];


export default function AdminContactPage() {
  return (
    <div>
        <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Contact Submissions</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {contactData.map((contact) => (
                <Card key={contact.id}>
                    <CardHeader>
                        <CardTitle className="truncate">{contact.subject}</CardTitle>
                        <CardDescription>From: {contact.name} ({contact.email})</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground line-clamp-3">{contact.message}</p>
                        <p className="text-xs text-muted-foreground pt-2">{contact.date}</p>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" size="sm" className="w-full">
                            View Full Message
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    </div>
  );
}
