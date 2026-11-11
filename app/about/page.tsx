import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  FileCode,
  Download,
  Mail,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About APK Hub – Fast & Secure Android APK Platform',
  description:
    'Learn about APK Hub, our mission to provide transparent Android package information, SHA-256 verification standards, and open-source software access.',
};

export default function AboutPage() {
  return (
    <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-[#101A3A] via-[#172554] to-[#6829E8] rounded-3xl p-6 sm:p-10 lg:p-12 text-white shadow-lg space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-[#75E85C]">
          About APK Hub
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          Transparent, Fast &amp; Secure Android APK Discovery
        </h1>
        <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-3xl">
          APK Hub is built to help Android users, developers, and privacy-conscious
          enthusiasts inspect package specifications and download authorized
          standalone Android installers without forced accounts or dark patterns.
        </p>
      </section>

      {/* 4 Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white dark:bg-[#152046] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-3">
          <div className="w-11 h-11 rounded-2xl bg-[#16C653]/15 text-[#16C653] flex items-center justify-center">
            <FileCode className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-extrabold text-[#111827] dark:text-white">
            01. Website Purpose
          </h2>
          <p className="text-sm text-[#64748B] dark:text-slate-300 leading-relaxed">
            Not every Android device ships with proprietary app stores, and many
            open-source maintainers (such as VideoLAN, Signal Foundation,
            Telegram, F-Droid, and Mozilla Thunderbird) publish reproducible
            standalone APK packages directly. APK Hub indexes these packages with
            complete technical metadata including minimum Android SDK levels,
            CPU architectures, and declared permissions.
          </p>
        </section>

        <section className="bg-white dark:bg-[#152046] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-3">
          <div className="w-11 h-11 rounded-2xl bg-[#16C653]/15 text-[#16C653] flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-extrabold text-[#111827] dark:text-white">
            02. Safety &amp; Download Transparency
          </h2>
          <p className="text-sm text-[#64748B] dark:text-slate-300 leading-relaxed">
            We strictly separate verified open-source / official direct APK
            distributions from UI catalog preview samples. We never fabricate
            security badges, fake ratings, or redistribute unauthorized
            copyrighted commercial binaries. Every downloadable package includes
            its SHA-256 cryptographic digest and upstream source attribution.
          </p>
        </section>

        <section className="bg-white dark:bg-[#152046] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-3">
          <div className="w-11 h-11 rounded-2xl bg-[#16C653]/15 text-[#16C653] flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-extrabold text-[#111827] dark:text-white">
            03. Zero Login or Account Tracking
          </h2>
          <p className="text-sm text-[#64748B] dark:text-slate-300 leading-relaxed">
            APK Hub requires zero user registration, zero email sign-ups, and
            zero personal profiles. Every visitor has immediate access to search,
            filter, inspect permissions, and download authorized APK packages
            over encrypted HTTPS connections.
          </p>
        </section>

        <section className="bg-white dark:bg-[#152046] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-3">
          <div className="w-11 h-11 rounded-2xl bg-[#16C653]/15 text-[#16C653] flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-extrabold text-[#111827] dark:text-white">
            04. Platform Verification Standards
          </h2>
          <p className="text-sm text-[#64748B] dark:text-slate-300 leading-relaxed">
            Before installing any standalone APK on an Android device, we
            recommend comparing the displayed SHA-256 checksum and reviewing the
            application&apos;s declared Android manifest permissions on its
            dedicated details page.
          </p>
        </section>
      </div>

      {/* CTA Banner */}
      <section className="bg-white dark:bg-[#152046] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-lg font-extrabold text-[#111827] dark:text-white">
            Have a question or want to submit an open-source APK?
          </h3>
          <p className="text-sm text-[#64748B] dark:text-slate-300">
            Reach out to our team directly without creating an account.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/apps"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#16C653] hover:bg-[#13b149] text-white dark:text-[#0B1229] text-xs sm:text-sm font-extrabold"
          >
            <Download className="w-4 h-4" />
            <span>Browse APKs</span>
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#101A3A] text-white text-xs sm:text-sm font-bold hover:bg-[#172554]"
          >
            <Mail className="w-4 h-4 text-[#75E85C]" />
            <span>Contact Us</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
