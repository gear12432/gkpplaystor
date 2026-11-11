import React from 'react';
import Link from 'next/link';
import { Bot, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full bg-white dark:bg-[#152046] border border-slate-200/80 dark:border-white/10 rounded-3xl p-8 sm:p-10 text-center space-y-5 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#16C653] to-[#75E85C] text-[#101A3A] flex items-center justify-center mx-auto shadow-md">
          <Bot className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <div className="font-mono text-xs font-bold uppercase tracking-widest text-[#16C653]">
            Error 404 · Package or Page Not Found
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] dark:text-white">
            We Couldn&apos;t Find That APK Page
          </h1>
          <p className="text-sm text-[#64748B] dark:text-slate-300 leading-relaxed">
            The application or route you requested may have been updated or
            moved. Return to the APK Hub homepage or search our full Android
            catalog.
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#16C653] hover:bg-[#13b149] text-white dark:text-[#0B1229] text-xs sm:text-sm font-extrabold"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <Link
            href="/apps"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#101A3A] hover:bg-[#172554] text-white text-xs sm:text-sm font-bold"
          >
            <Search className="w-4 h-4 text-[#75E85C]" />
            <span>Browse All APKs</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
