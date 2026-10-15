"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PublicHeader } from '@/components/snapsaver/PublicHeader';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  subject: z.string().min(5, { message: "Subject must be at least 5 characters." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

interface ContactFormProps {
  seoTitle?: string;
  seoDescription?: string;
}

export default function ContactForm({ seoTitle, seoDescription }: ContactFormProps) {
    const { toast } = useToast();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            subject: "",
            message: "",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        toast({
            title: "Message Sent!",
            description: "Thank you for contacting us. We will get back to you shortly.",
            className: "bg-green-500 text-white"
        });
        form.reset();
    }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <PublicHeader />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl border-t-4 border-t-primary">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 leading-tight">
                {seoTitle || 'Contact Us'}
              </CardTitle>
              <CardDescription className="text-base md:text-lg">
                {seoDescription || "Have a question? We'd love to hear from you."}
              </CardDescription>
            </CardHeader>
            <CardContent>
               <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Your Name</FormLabel>
                        <FormControl>
                            <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Your Email</FormLabel>
                        <FormControl>
                            <Input placeholder="john.doe@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                            <Input placeholder="Regarding..." {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Your message here..." {...field} rows={5}/>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit" size="lg" className="w-full bg-red-600 hover:bg-red-700 h-12 text-lg font-bold rounded-xl">
                        <Send className="mr-2 h-5 w-5" />
                        Send Message
                    </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <footer className="bg-gray-800 text-gray-300 py-6">
        <div className="container mx-auto text-center">
          <div className="flex justify-center gap-6 mb-4">
            <Link href="/contact" className="text-sm hover:underline">Contact</Link>
            <Link href="/privacy-policy" className="text-sm hover:underline">Privacy Policy</Link>
            <Link href="/terms-and-conditions" className="text-sm hover:underline">Terms & Condition</Link>
          </div>
          <p className="text-sm">SnapSaver &copy; {new Date().getFullYear()}. For educational purposes only.</p>
        </div>
      </footer>
    </div>
  );
}
