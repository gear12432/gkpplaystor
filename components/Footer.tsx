import React from 'react';
import Link from 'next/link';
import { Bot, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';
import { CATEGORIES } from '@/lib/apk-data';

export function Footer() {
  return (
    <footer className="bg-[#101A3A] text-slate-300 border-t border-white/10 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Column 1-2: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#16C653] to-[#75E85C] flex items-center justify-center text-[#101A3A] shadow-md">
                <Bot className="w-6 h-6" strokeWidth={2.4} />
              </span>
              <div>
                <div className="text-xl font-extrabold tracking-tight text-white">
                  APK <span className="text-[#16C653]">Hub</span>
                </div>
                <div className="text-xs text-[#75E85C] font-medium">
                  Download Unlimited APK
                </div>
              </div>
            </Link>

            <p className="text-sm text-slate-300 leading-relaxed max-w-md">
              APK Hub is a fast, transparent Android APK discovery and download
              platform. Browse verified open-source releases, official direct
              vendor installers, and detailed package specifications without any
              registration or account requirement.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-300">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#16C653]" />
                SHA-256 Checksum Transparency
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[#16C653]" />
                HTTPS Encrypted Transfers
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#16C653]" />
                No Login Required
              </span>
            </div>
          </div>

          {/* Column 3: Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-[#75E85C] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/apps" className="hover:text-[#75E85C] transition-colors">
                  All Android Apps
                </Link>
              </li>
              <li>
                <Link href="/games" className="hover:text-[#75E85C] transition-colors">
                  Android Games
                </Link>
              </li>
              <li>
                <Link href="/top-charts" className="hover:text-[#75E85C] transition-colors">
                  Top Charts
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-[#75E85C] transition-colors">
                  Browse Categories
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 text-[#75E85C] font-bold hover:underline transition-colors"
                >
                  <span>Admin Panel Console</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Popular Categories */}
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide mb-4">
              Categories
            </h3>
            <ul className="space-y-2.5 text-sm">
              {CATEGORIES.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/categories?category=${encodeURIComponent(cat.name)}`}
                    className="hover:text-[#75E85C] transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Platform & Legal */}
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide mb-4">
              Company & Legal
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="hover:text-[#75E85C] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#75E85C] transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/legal?section=privacy"
                  className="hover:text-[#75E85C] transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/legal?section=terms"
                  className="hover:text-[#75E85C] transition-colors"
                >
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/legal?section=disclaimer"
                  className="hover:text-[#75E85C] transition-colors"
                >
                  Disclaimer &amp; DMCA
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Disclaimer Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            &copy; 2026 APK Hub – Download Unlimited APK. All rights reserved.
          </p>
          <p className="text-center sm:text-right">
            Android is a trademark of Google LLC. APK Hub only provides
            authorized direct and open-source APK files.
          </p>
        </div>
      </div>
    </footer>
  );
}
