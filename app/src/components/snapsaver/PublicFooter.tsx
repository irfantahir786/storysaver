
"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { fetchSettings } from '@/app/actions';

export function PublicFooter() {
  
  return (
    <footer className="bg-gray-800 text-gray-300 py-10 mt-auto">
      <div className="container mx-auto text-center px-4">
        <div className="flex justify-center gap-8 mb-6">
          <Link href="/contact" className="text-sm font-medium hover:text-white transition-colors">Contact</Link>
          <Link href="/privacy-policy" className="text-sm font-medium hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/terms-and-conditions" className="text-sm font-medium hover:text-white transition-colors">Terms & Conditions</Link>
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
          {'StorySaver'} &copy; {new Date().getFullYear()}. Made with ❤️ in India.
        </p>
      </div>
    </footer>
  );
}
