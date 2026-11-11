import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  Download,
  ShieldCheck,
  Star,
  ArrowLeft,
  CheckCircle2,
  Lock,
  ExternalLink,
  AlertTriangle,
  FileCode,
  Sparkles,
} from 'lucide-react';
import { APK_ITEMS, getAppBySlug } from '@/lib/apk-data';
import { AppIcon } from '@/components/AppIcon';
import { ScreenshotGallery } from '@/components/ScreenshotGallery';
import { TrendingAppCard } from '@/components/AppCard';

export async function generateStaticParams() {
  return APK_ITEMS.map((app) => ({
    slug: app.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const app = getAppBySlug(slug);
  if (!app) {
    return {
      title: 'Application Not Found – APK Hub',
    };
  }
  return {
    title: `${app.name} APK v${app.version} (${app.size}) – APK Hub`,
    description: `${app.shortDescription} View package details, minimum Android version, permissions, and download options for ${app.name} on APK Hub.`,
    openGraph: {
      title: `${app.name} APK v${app.version} – APK Hub`,
      description: app.shortDescription,
      type: 'website',
    },
  };
}

export default async function AppDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const app = getAppBySlug(slug);

  if (!app) {
    notFound();
  }

  const relatedApps = APK_ITEMS.filter(
    (item) => item.slug !== app.slug && item.category === app.category
  ).slice(0, 6);

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb & Back Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <Link
          href={app.type === 'game' ? '/games' : '/apps'}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#64748B] dark:text-slate-300 hover:text-[#16C653] dark:hover:text-[#75E85C] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {app.type === 'game' ? 'Games' : 'Apps'} Catalog</span>
        </Link>

        <div className="text-xs text-[#64748B] dark:text-slate-400">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <span className="mx-1.5">/</span>
          <Link
            href={`/categories?category=${encodeURIComponent(app.category)}`}
            className="hover:underline"
          >
            {app.category}
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-[#111827] dark:text-white font-semibold">
            {app.name}
          </span>
        </div>
      </div>

      {/* =========================================================
          PRIMARY APP HEADER CARD
         ========================================================= */}
      <section className="bg-white dark:bg-[#152046] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <AppIcon app={app} size="xl" />

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-semibold text-[#64748B] dark:text-slate-300">
                <Link
                  href={`/categories?category=${encodeURIComponent(app.category)}`}
                  className="text-[#16C653] dark:text-[#75E85C] hover:underline"
                >
                  {app.category}
                </Link>
                <span aria-hidden="true">·</span>
                <span>{app.developer}</span>
                <span aria-hidden="true">·</span>
                <span>Updated {app.updatedAt}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#111827] dark:text-white tracking-tight">
                {app.name}
              </h1>

              {/* Unboxed Version, Size, and Verified Metrics */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-[#64748B] dark:text-slate-300 tabular-nums pt-0.5">
                <span className="font-semibold text-[#111827] dark:text-white">
                  Version {app.version}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-[#111827] dark:text-white">
                  {app.size}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-xs">{app.packageName}</span>
              </div>

              {/* Verified Rating & Downloads OR Transparent Sample Disclosure */}
              <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm tabular-nums">
                {app.securityVerified && app.verifiedRating !== null ? (
                  <>
                    <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>{app.verifiedRating.toFixed(1)}</span>
                      {app.verifiedReviewCount && (
                        <span className="font-normal text-[#64748B] dark:text-slate-300">
                          ({app.verifiedReviewCount})
                        </span>
                      )}
                    </span>
                    {app.verifiedDownloads && (
                      <>
                        <span
                          className="text-slate-300 dark:text-slate-600"
                          aria-hidden="true"
                        >
                          ·
                        </span>
                        <span className="text-[#111827] dark:text-slate-200 font-semibold">
                          {app.verifiedDownloads} Verified Downloads
                        </span>
                      </>
                    )}
                    <span
                      className="text-slate-300 dark:text-slate-600"
                      aria-hidden="true"
                    >
                      ·
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-[#75E85C]">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Security Signature Verified</span>
                    </span>
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-medium">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>
                      UI Preview Catalog Entry · Proprietary binary not hosted
                      for third-party redistribution
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Primary CTA Block */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0">
            <Link
              href={`/download/${app.slug}`}
              className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-[#16C653] hover:bg-[#13b149] text-white dark:text-[#0B1229] dark:bg-[#16C653] dark:hover:bg-[#75E85C] font-extrabold text-base shadow-lg transition-transform hover:-translate-y-0.5 whitespace-nowrap shrink-0"
            >
              <Download className="w-5 h-5" />
              <span>Download APK ({app.size})</span>
            </Link>

            <a
              href={app.officialWebsiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B] dark:text-slate-300 hover:text-[#111827] dark:hover:text-white transition-colors"
            >
              <span>Developer Website ({app.developer})</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================
          MAIN 2-COLUMN CONTENT LAYOUT
         ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        {/* Left 8 Columns: Description, Screenshots, What's New, Features */}
        <div className="lg:col-span-8 space-y-8">
          {/* Application Description */}
          <section className="bg-white dark:bg-[#152046] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-4">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#111827] dark:text-white">
              About {app.name}
            </h2>
            <p className="text-sm sm:text-base text-[#111827] dark:text-slate-200 font-medium leading-relaxed">
              {app.shortDescription}
            </p>
            <p className="text-sm sm:text-base text-[#64748B] dark:text-slate-300 leading-relaxed">
              {app.fullDescription}
            </p>
          </section>

          {/* Screenshots Gallery */}
          <section className="bg-white dark:bg-[#152046] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-extrabold text-[#111827] dark:text-white">
                Screenshots Gallery
              </h2>
              <span className="text-xs text-[#64748B] dark:text-slate-400">
                Click any screen to enlarge
              </span>
            </div>
            <ScreenshotGallery
              appName={app.name}
              screenshots={app.screenshots}
            />
          </section>

          {/* What's New Section */}
          <section className="bg-white dark:bg-[#152046] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-[#111827] dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#16C653]" />
                <span>What&apos;s New in Version {app.version}</span>
              </h2>
              <span className="text-xs text-[#64748B] dark:text-slate-400 tabular-nums">
                {app.updatedAt}
              </span>
            </div>
            <ul className="space-y-2.5 text-sm sm:text-base text-[#64748B] dark:text-slate-300">
              {app.whatsNew.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#16C653] shrink-0 mt-1" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Key Features Section */}
          <section className="bg-white dark:bg-[#152046] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-4">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#111827] dark:text-white">
              Key Features
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {app.features.map((feat, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#F5F8FF] dark:bg-[#0B1229] border border-slate-200/60 dark:border-white/5 text-sm text-[#111827] dark:text-slate-200 leading-relaxed"
                >
                  <span className="font-mono text-xs font-bold text-[#16C653] block mb-1">
                    0{idx + 1}. Feature
                  </span>
                  {feat}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right 4 Columns: File Information, Security Verification, App Permissions */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Technical File Information */}
          <section className="bg-white dark:bg-[#152046] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 space-y-4">
            <h2 className="text-base sm:text-lg font-extrabold text-[#111827] dark:text-white flex items-center gap-2">
              <FileCode className="w-5 h-5 text-[#16C653]" />
              <span>APK File Information</span>
            </h2>

            <dl className="divide-y divide-slate-100 dark:divide-white/10 text-xs sm:text-sm tabular-nums">
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-[#64748B] dark:text-slate-400">
                  Package Name
                </dt>
                <dd className="font-mono font-semibold text-[#111827] dark:text-white text-right break-all">
                  {app.packageName}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-[#64748B] dark:text-slate-400">
                  Latest Version
                </dt>
                <dd className="font-semibold text-[#111827] dark:text-white text-right">
                  {app.version}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-[#64748B] dark:text-slate-400">
                  APK File Size
                </dt>
                <dd className="font-semibold text-[#111827] dark:text-white text-right">
                  {app.size} ({app.sizeBytes.toLocaleString()} bytes)
                </dd>
              </div>
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-[#64748B] dark:text-slate-400">
                  Minimum Android
                </dt>
                <dd className="font-semibold text-[#111827] dark:text-white text-right">
                  {app.minAndroid}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-[#64748B] dark:text-slate-400">
                  Architecture
                </dt>
                <dd className="font-mono text-[#111827] dark:text-white text-right">
                  {app.architecture}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-[#64748B] dark:text-slate-400">License</dt>
                <dd className="font-semibold text-[#111827] dark:text-white text-right">
                  {app.license}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-[#64748B] dark:text-slate-400">
                  Developer
                </dt>
                <dd className="font-semibold text-[#111827] dark:text-white text-right">
                  {app.developer}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-[#64748B] dark:text-slate-400">
                  Last Updated
                </dt>
                <dd className="font-semibold text-[#111827] dark:text-white text-right">
                  {app.updatedAt}
                </dd>
              </div>
            </dl>
          </section>

          {/* Security Verification & Transparency Card */}
          <section className="bg-white dark:bg-[#152046] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 space-y-3">
            <h2 className="text-base sm:text-lg font-extrabold text-[#111827] dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#16C653]" />
              <span>Security &amp; Source Status</span>
            </h2>

            {app.securityVerified ? (
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200">
                  <div className="font-bold">Verified Authorized APK</div>
                  <p className="mt-1 text-xs leading-relaxed opacity-90">
                    Source: {app.verificationSource}
                  </p>
                </div>

                {app.sha256 && (
                  <div>
                    <div className="text-xs font-semibold text-[#64748B] dark:text-slate-400 mb-1">
                      SHA-256 Digest
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#0B1229] font-mono text-[11px] break-all text-[#111827] dark:text-slate-200">
                      {app.sha256}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-200 text-xs leading-relaxed space-y-2">
                <div className="font-bold">Unverified Sample Preview Entry</div>
                <p>
                  This proprietary application is displayed as a UI catalog
                  preview. APK Hub does not fabricate security verification
                  claims or redistribute unauthorized copyrighted APK files.
                </p>
              </div>
            )}
          </section>

          {/* App Permissions */}
          <section className="bg-white dark:bg-[#152046] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 space-y-4">
            <h2 className="text-base sm:text-lg font-extrabold text-[#111827] dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#16C653]" />
              <span>Declared Android Permissions</span>
            </h2>

            {app.permissions.length > 0 ? (
              <ul className="space-y-3">
                {app.permissions.map((perm) => (
                  <li
                    key={perm.name}
                    className="p-3 rounded-2xl bg-[#F5F8FF] dark:bg-[#0B1229] text-xs space-y-1"
                  >
                    <div className="font-mono font-bold text-[#111827] dark:text-[#75E85C] break-all">
                      {perm.name}
                    </div>
                    <div className="text-[#64748B] dark:text-slate-300">
                      {perm.description}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[#64748B] dark:text-slate-300">
                No special dangerous permissions required (runs 100% offline in
                standard Android sandbox).
              </p>
            )}
          </section>
        </aside>
      </div>

      {/* Related Applications */}
      {relatedApps.length > 0 && (
        <section className="mt-12 pt-8 border-t border-slate-200 dark:border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-extrabold text-[#111827] dark:text-white">
              More in {app.category}
            </h2>
            <Link
              href={`/categories?category=${encodeURIComponent(app.category)}`}
              className="text-xs sm:text-sm font-bold text-[#16C653] hover:underline"
            >
              View All {app.category} Apps
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {relatedApps.map((rel) => (
              <TrendingAppCard key={rel.id} app={rel} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
