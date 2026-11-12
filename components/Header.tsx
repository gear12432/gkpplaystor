'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bot,
  Menu,
  X,
  Sun,
  Moon,
  Download,
  Home,
  LayoutGrid,
  Gamepad2,
  FolderKanban,
  Trophy,
  Info,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

const NAV_LINKS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/apps', label: 'Apps', icon: LayoutGrid },
  { href: '/games', label: 'Games', icon: Gamepad2 },
  { href: '/categories', label: 'Categories', icon: FolderKanban },
  { href: '/top-charts', label: 'Top Charts', icon: Trophy },
  { href: '/about', label: 'About', icon: Info },
  { href: '/contact', label: 'Contact', icon: Mail },
];

export function Header() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#101A3A]/95 dark:bg-[#0B1229]/95 backdrop-blur-md border-b border-white/10 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Brand Lockup */}
          <Link
            href="/"
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16C653] rounded-lg"
          >
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#16C653] to-[#75E85C] flex items-center justify-center text-[#101A3A] shadow-md group-hover:scale-105 transition-transform">
              <Bot className="w-6 h-6" strokeWidth={2.4} />
            </span>
            <span className="text-xl font-extrabold tracking-tight text-white">
              APK <span className="text-[#16C653]">Hub</span>
            </span>
          </Link>

          {/* Zone 2: Desktop Navigation Links */}
          <nav
            aria-label="Main Navigation"
            className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-200"
          >
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                    isActive
                      ? 'text-[#75E85C] border-[#16C653] font-semibold'
                      : 'border-transparent text-slate-300 hover:text-white hover:border-white/30'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Zone 3: Admin Panel Switch, Theme Toggle & Mobile Menu Trigger */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#7047EB] hover:bg-[#5f37d4] text-xs font-extrabold text-white transition-colors whitespace-nowrap shrink-0 shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#75E85C]" />
              <span>Admin Panel</span>
            </Link>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'
              }
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16C653]"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-[#75E85C]" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-[#75E85C]" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Out Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <div className="relative ml-auto w-full max-w-xs bg-[#101A3A] text-white h-full shadow-2xl flex flex-col justify-between p-6 z-10 overflow-y-auto border-l border-white/10">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-white/10">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5"
                >
                  <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#16C653] to-[#75E85C] flex items-center justify-center text-[#101A3A] shadow-md">
                    <Bot className="w-6 h-6" strokeWidth={2.4} />
                  </span>
                  <div>
                    <div className="text-lg font-extrabold tracking-tight text-white leading-none">
                      APK <span className="text-[#16C653]">Hub</span>
                    </div>
                    <div className="text-[11px] text-slate-300 mt-1">
                      Download Unlimited APK
                    </div>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="mt-6 space-y-1.5" aria-label="Mobile Navigation">
                {NAV_LINKS.map((link) => {
                  const Icon = link.icon;
                  const isActive =
                    link.href === '/'
                      ? pathname === '/'
                      : pathname.startsWith(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                        isActive
                          ? 'bg-[#16C653] text-[#101A3A]'
                          : 'text-slate-200 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}

                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-extrabold bg-[#7047EB] text-white mt-2"
                >
                  <ShieldCheck className="w-4 h-4 text-[#75E85C] shrink-0" />
                  <span>Open Admin Panel</span>
                </Link>
              </nav>
            </div>

            <div className="pt-6 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Appearance</span>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white font-medium cursor-pointer"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-[#75E85C]" />
                      <span>Light</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-[#75E85C]" />
                      <span>Dark</span>
                    </>
                  )}
                </button>
              </div>
              <Link
                href="/apps"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#16C653] to-[#75E85C] text-[#101A3A] font-bold text-sm shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Browse Verified APKs</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
