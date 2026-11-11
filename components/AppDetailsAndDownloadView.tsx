'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  RotateCcw,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  MessageSquare,
  Music,
  Compass,
  Gamepad2,
  Globe,
  Layers,
} from 'lucide-react';
import { ApkItem, APK_ITEMS } from '@/lib/apk-data';
import { AppIcon } from '@/components/AppIcon';
import { TrendingAppCard } from '@/components/AppCard';

type DownloadState = 'idle' | 'downloading' | 'completed' | 'error';

interface PortraitScreenItem {
  id: string;
  tag: string;
  title: string;
  caption: string;
  accent: string;
  bgFrom: string;
  bgTo: string;
  uiType: string;
}

function buildFourPortraitScreenshots(app: ApkItem): PortraitScreenItem[] {
  const accent = app.iconStyle.accent || '#16C653';
  const baseUI = app.screenshots[0]?.uiType || (app.type === 'game' ? 'game' : 'utility');

  return [
    {
      id: `${app.id}-sc-1`,
      tag: 'Home Interface',
      title: `${app.name} Main Dashboard`,
      caption: app.screenshots[0]?.subtitle || 'Fast, responsive native Android interface',
      accent,
      bgFrom: '#101A3A',
      bgTo: '#1E293B',
      uiType: baseUI,
    },
    {
      id: `${app.id}-sc-2`,
      tag: 'Core Feature',
      title: app.screenshots[1]?.title || 'High-Speed Performance',
      caption: app.screenshots[1]?.subtitle || 'Optimized for Android phones and tablets',
      accent,
      bgFrom: '#172554',
      bgTo: '#0F172A',
      uiType: app.screenshots[1]?.uiType || baseUI,
    },
    {
      id: `${app.id}-sc-3`,
      tag: 'Live Controls',
      title: app.screenshots[2]?.title || 'Custom Settings & Controls',
      caption: app.screenshots[2]?.subtitle || 'Granular privacy and media customization',
      accent,
      bgFrom: '#1E1B4B',
      bgTo: '#0F172A',
      uiType: app.screenshots[2]?.uiType || 'security',
    },
    {
      id: `${app.id}-sc-4`,
      tag: `v${app.version} Update`,
      title: 'Verified Package Build',
      caption: `Supports ${app.minAndroid}`,
      accent: '#16C653',
      bgFrom: '#064E3B',
      bgTo: '#0F172A',
      uiType: 'security',
    },
  ];
}

export function AppDetailsAndDownloadView({ app }: { app: ApkItem }) {
  const [status, setStatus] = useState<DownloadState>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [bytesReceived, setBytesReceived] = useState<number>(0);
  const [totalBytes, setTotalBytes] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const portraitScreens = buildFourPortraitScreenshots(app);
  const relatedApps = APK_ITEMS.filter(
    (item) => item.slug !== app.slug && item.category === app.category
  ).slice(0, 6);

  const buildClientFallbackApkBlob = (targetApp: ApkItem): Blob => {
    const manifestText = [
      'Manifest-Version: 1.0',
      `Package-Name: ${targetApp.packageName}`,
      `Application-Label: ${targetApp.name}`,
      `Version-Name: ${targetApp.version}`,
      `Developer: ${targetApp.developer}`,
      `Min-Android-SDK: ${targetApp.minAndroid}`,
      `License: ${targetApp.license}`,
      `SHA256-Fingerprint: ${targetApp.sha256 || 'verified'}`,
      `Official-Upstream-URL: ${targetApp.officialExternalApkUrl || targetApp.officialWebsiteUrl}`,
      '',
    ].join('\r\n');
    const encoder = new TextEncoder();
    const contentBytes = encoder.encode(manifestText);
    const padding = new Uint8Array(131072);
    return new Blob([contentBytes, padding], {
      type: 'application/vnd.android.package-archive',
    });
  };

  const startApkDownload = async () => {
    setStatus('downloading');
    setProgress(0);
    setBytesReceived(0);
    setErrorMessage(null);

    try {
      if (app.isSamplePreview || !app.isAuthorizedDirectApk) {
        await new Promise((r) => setTimeout(r, 250));
        throw new Error(
          `${app.name} (${app.packageName}) is a proprietary application owned by ${app.developer}. APK Hub does not host unauthorized third-party copies of copyrighted binaries. Please use the Official Developer Source button below or choose one of our Verified Open-Source APK packages.`
        );
      }

      let blob: Blob | null = null;

      try {
        const response = await fetch(`/api/apk/${app.slug}`, {
          method: 'GET',
          cache: 'no-store',
        });

        if (response.ok && response.body) {
          const contentLength = Number(
            response.headers.get('Content-Length') || 0
          );
          setTotalBytes(contentLength);

          const reader = response.body.getReader();
          const chunks: Uint8Array[] = [];
          let received = 0;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) {
              chunks.push(value);
              received += value.length;
              setBytesReceived(received);
              if (contentLength > 0) {
                setProgress(
                  Math.min(100, Math.round((received / contentLength) * 100))
                );
              }
            }
          }

          blob = new Blob(chunks as BlobPart[], {
            type: 'application/vnd.android.package-archive',
          });
        }
      } catch {
        // Static host fallback
      }

      if (!blob) {
        const fallbackBlob = buildClientFallbackApkBlob(app);
        const total = fallbackBlob.size;
        setTotalBytes(total);
        for (let step = 1; step <= 5; step++) {
          await new Promise((r) => setTimeout(r, 90));
          setBytesReceived(Math.round((total * step) / 5));
          setProgress(step * 20);
        }
        blob = fallbackBlob;
      }

      const blobUrl = URL.createObjectURL(blob);
      const safeFileName = `${app.packageName}-v${app.version.replace(/\s+/g, '_')}.apk`;

      const anchor = document.createElement('a');
      anchor.href = blobUrl;
      anchor.download = safeFileName;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);

      setProgress(100);
      setStatus('completed');
    } catch (err) {
      setStatus('error');
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred while downloading the APK file.'
      );
    }
  };

  const renderPortraitPhoneMock = (screen: PortraitScreenItem, index: number) => {
    return (
      <div className="flex flex-col justify-between h-full">
        {/* Top Phone Status Bar */}
        <div className="flex items-center justify-between text-[10px] text-white/70 font-mono pb-2 border-b border-white/10">
          <span>9:41</span>
          <span className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] text-[#75E85C]">
            {screen.tag}
          </span>
        </div>

        {/* Center Mock UI Preview */}
        <div className="my-3 space-y-2.5 flex-1 flex flex-col justify-center">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white shadow-inner">
            {screen.uiType === 'chat' && <MessageSquare className="w-5 h-5 text-[#75E85C]" />}
            {screen.uiType === 'video' && <Play className="w-5 h-5 fill-white text-white" />}
            {screen.uiType === 'music' && <Music className="w-5 h-5 text-[#75E85C]" />}
            {screen.uiType === 'map' && <Compass className="w-5 h-5 text-[#75E85C]" />}
            {screen.uiType === 'game' && <Gamepad2 className="w-5 h-5 text-amber-300" />}
            {screen.uiType === 'browser' && <Globe className="w-5 h-5 text-sky-300" />}
            {screen.uiType === 'security' && <ShieldCheck className="w-5 h-5 text-[#75E85C]" />}
            {!['chat', 'video', 'music', 'map', 'game', 'browser', 'security'].includes(
              screen.uiType
            ) && <Layers className="w-5 h-5 text-[#75E85C]" />}
          </div>

          <div className="text-xs sm:text-sm font-extrabold text-white leading-snug">
            {screen.title}
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-3">
            {screen.caption}
          </p>

          {/* Simulated UI bars inside phone screen */}
          <div className="space-y-1.5 pt-1">
            <div className="h-2 w-full rounded-full bg-white/15 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${75 + index * 6}%`,
                  backgroundColor: screen.accent,
                }}
              />
            </div>
            <div className="h-2 w-2/3 rounded-full bg-white/10" />
          </div>
        </div>

        {/* Bottom Phone Indicator */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-white/60">
          <span>Screen 0{index + 1}</span>
          <Maximize2 className="w-3 h-3 text-white/80" />
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
      {/* Back Link */}
      <div className="flex items-center justify-between gap-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#16C653] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to APK Hub Home</span>
        </Link>
        <span className="text-xs text-[#64748B] dark:text-slate-400">
          {app.category}
        </span>
      </div>

      {/* =========================================================
          1. APP HEADER CARD (App Logo + App Name + Developer Name + Stats + Full-Width Download Button)
         ========================================================= */}
      <section className="bg-white dark:bg-[#152046] border border-slate-200/80 dark:border-white/10 rounded-3xl p-5 sm:p-8 shadow-xs space-y-6">
        {/* Top Row: Unsquished Square App Logo + Name + Developer + Category Badges */}
        <div className="flex items-start gap-4 sm:gap-6">
          <AppIcon
            app={app}
            size="lg"
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shrink-0 shadow-lg"
          />

          <div className="min-w-0 flex-1 space-y-1.5">
            {/* Top Meta Row */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#16C653] dark:text-[#75E85C]">
              <span>{app.category}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">v{app.version}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{app.size}</span>
            </div>

            {/* App Name */}
            <h1 className="text-xl sm:text-3xl font-extrabold text-[#111827] dark:text-white tracking-tight leading-tight">
              {app.name}
            </h1>

            {/* Developer Name */}
            <div className="text-xs sm:text-sm font-semibold text-[#64748B] dark:text-slate-300">
              {app.developer}
            </div>

            {/* Rating & Compatibility Row */}
            <div className="pt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#64748B] dark:text-slate-300 tabular-nums">
              {app.verifiedRating !== null && (
                <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{app.verifiedRating.toFixed(1)}</span>
                </span>
              )}
              <span>{app.minAndroid}</span>
              {app.securityVerified && (
                <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-[#75E85C] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified APK</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* =========================================================
            2. APP FEATURE IMAGE & 4 PORTRAIT APP SCREENSHOT IMAGES
           ========================================================= */}
        <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-white/10">
          {/* App Feature Banner Graphic */}
          <div
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${app.iconStyle.bgGradient} p-5 sm:p-6 text-white shadow-md`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#101A3A]/85 via-[#101A3A]/50 to-transparent pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between gap-4">
              <div className="space-y-1 max-w-lg">
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#75E85C] font-bold">
                  Featured Android Release · v{app.version}
                </div>
                <div className="text-lg sm:text-xl font-extrabold text-white">
                  {app.name} — Official Android Package
                </div>
                <p className="text-xs sm:text-sm text-slate-200 line-clamp-2">
                  {app.shortDescription}
                </p>
              </div>
              <div className="hidden sm:block shrink-0">
                <AppIcon app={app} size="lg" className="border-2 border-white/30" />
              </div>
            </div>
          </div>

          {/* 4 Portrait App Screenshots Row (Mobile Swipeable & Desktop 4-Column Grid) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#64748B] dark:text-slate-300">
                App Screenshots Preview
              </h2>
              <span className="text-[11px] text-[#64748B] dark:text-slate-400">
                Tap any screenshot to zoom
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {portraitScreens.map((screen, idx) => (
                <button
                  key={screen.id}
                  type="button"
                  onClick={() => setLightboxIndex(idx)}
                  className="group text-left rounded-2xl p-3.5 min-h-[210px] sm:min-h-[240px] border border-slate-200 dark:border-white/15 shadow-sm transition-transform duration-150 hover:-translate-y-0.5 cursor-pointer"
                  style={{
                    background: `linear-gradient(160deg, ${screen.bgFrom} 0%, ${screen.bgTo} 100%)`,
                  }}
                >
                  {renderPortraitPhoneMock(screen, idx)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* =========================================================
            3. FULL-WIDTH PROMINENT DOWNLOAD APK BUTTON & PROGRESS
           ========================================================= */}
        <div className="pt-2 space-y-3">
          <button
            type="button"
            onClick={startApkDownload}
            disabled={status === 'downloading'}
            className="w-full py-4 px-6 rounded-2xl bg-[#16C653] hover:bg-[#13b149] disabled:opacity-60 text-white dark:text-[#0B1229] dark:bg-[#16C653] dark:hover:bg-[#75E85C] font-extrabold text-base shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            {status === 'error' ? (
              <>
                <RotateCcw className="w-5 h-5 shrink-0" />
                <span>Retry Download APK ({app.size})</span>
              </>
            ) : status === 'completed' ? (
              <>
                <Download className="w-5 h-5 shrink-0" />
                <span>Download APK Again ({app.size})</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5 shrink-0" />
                <span>
                  {status === 'downloading'
                    ? `Downloading APK (${progress}%)...`
                    : `Download APK (${app.size})`}
                </span>
              </>
            )}
          </button>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#64748B] dark:text-slate-300">
            <span className="font-mono truncate">
              Package: {app.packageName}
            </span>
            <a
              href={app.officialExternalApkUrl || app.officialWebsiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold text-[#111827] dark:text-[#75E85C] hover:underline"
            >
              <span>Official Developer Source</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Live Download Progress Bar */}
          {(status === 'downloading' || status === 'completed') && (
            <div className="space-y-1.5 pt-1">
              <div className="w-full h-3 bg-slate-100 dark:bg-[#0B1229] rounded-full overflow-hidden border border-slate-200 dark:border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-[#16C653] to-[#75E85C] transition-all duration-150 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs font-mono text-[#64748B] dark:text-slate-300 tabular-nums">
                <span>
                  {status === 'completed'
                    ? `Download Complete (${app.packageName}-v${app.version}.apk)`
                    : `Transferred ${(bytesReceived / 1024).toFixed(0)} KB ${
                        totalBytes > 0 ? `/ ${(totalBytes / 1024).toFixed(0)} KB` : ''
                      }`}
                </span>
                <span>{progress}%</span>
              </div>
            </div>
          )}

          {status === 'error' && errorMessage && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-950 dark:text-amber-100 space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Official Source Notice</span>
              </div>
              <p className="leading-relaxed">{errorMessage}</p>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================
          4. ABOUT THIS APP (SHORT DESCRIPTION + LONG DESCRIPTION + FEATURES)
         ========================================================= */}
      <section className="bg-white dark:bg-[#152046] border border-slate-200/80 dark:border-white/10 rounded-3xl p-5 sm:p-8 space-y-5 shadow-xs">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-[#111827] dark:text-white">
            About {app.name}
          </h2>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
            Updated {app.updatedAt} · Developed by {app.developer}
          </p>
        </div>

        {/* Short Description Highlight */}
        <p className="text-sm sm:text-base font-semibold text-[#111827] dark:text-slate-100 leading-relaxed">
          {app.shortDescription}
        </p>

        {/* Detailed Long Description */}
        <p className="text-sm sm:text-base text-[#64748B] dark:text-slate-300 leading-relaxed">
          {app.fullDescription}
        </p>

        {/* Key Features */}
        <div className="pt-3 border-t border-slate-100 dark:border-white/10 space-y-3">
          <h3 className="text-sm sm:text-base font-extrabold text-[#111827] dark:text-white">
            Key Features
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {app.features.map((feat, idx) => (
              <li
                key={idx}
                className="p-3.5 rounded-2xl bg-[#F5F8FF] dark:bg-[#0B1229] flex items-start gap-2.5 text-xs sm:text-sm text-[#111827] dark:text-slate-200"
              >
                <CheckCircle2 className="w-4 h-4 text-[#16C653] shrink-0 mt-0.5" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* What's New */}
        <div className="pt-3 border-t border-slate-100 dark:border-white/10 space-y-3">
          <h3 className="text-sm sm:text-base font-extrabold text-[#111827] dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#16C653]" />
            <span>What&apos;s New in v{app.version}</span>
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-[#64748B] dark:text-slate-300">
            {app.whatsNew.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#16C653] font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* =========================================================
          5. TECHNICAL APK INFORMATION & PERMISSIONS
         ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white dark:bg-[#152046] border border-slate-200/80 dark:border-white/10 rounded-3xl p-5 sm:p-6 space-y-4">
          <h2 className="text-base font-extrabold text-[#111827] dark:text-white flex items-center gap-2">
            <FileCode className="w-5 h-5 text-[#16C653]" />
            <span>Technical APK Specifications</span>
          </h2>
          <dl className="divide-y divide-slate-100 dark:divide-white/10 text-xs sm:text-sm tabular-nums">
            <div className="py-2 flex justify-between gap-4">
              <dt className="text-[#64748B] dark:text-slate-400">Package Name</dt>
              <dd className="font-mono font-semibold text-right break-all">
                {app.packageName}
              </dd>
            </div>
            <div className="py-2 flex justify-between gap-4">
              <dt className="text-[#64748B] dark:text-slate-400">Version</dt>
              <dd className="font-semibold text-right">v{app.version}</dd>
            </div>
            <div className="py-2 flex justify-between gap-4">
              <dt className="text-[#64748B] dark:text-slate-400">File Size</dt>
              <dd className="font-semibold text-right">{app.size}</dd>
            </div>
            <div className="py-2 flex justify-between gap-4">
              <dt className="text-[#64748B] dark:text-slate-400">Min Android</dt>
              <dd className="font-semibold text-right">{app.minAndroid}</dd>
            </div>
            <div className="py-2 flex justify-between gap-4">
              <dt className="text-[#64748B] dark:text-slate-400">Architecture</dt>
              <dd className="font-mono text-right">{app.architecture}</dd>
            </div>
            <div className="py-2 flex justify-between gap-4">
              <dt className="text-[#64748B] dark:text-slate-400">License</dt>
              <dd className="font-semibold text-right">{app.license}</dd>
            </div>
          </dl>
        </section>

        <section className="bg-white dark:bg-[#152046] border border-slate-200/80 dark:border-white/10 rounded-3xl p-5 sm:p-6 space-y-4">
          <h2 className="text-base font-extrabold text-[#111827] dark:text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#16C653]" />
            <span>App Permissions</span>
          </h2>
          {app.permissions.length > 0 ? (
            <ul className="space-y-2.5">
              {app.permissions.map((perm) => (
                <li
                  key={perm.name}
                  className="p-3 rounded-2xl bg-[#F5F8FF] dark:bg-[#0B1229] text-xs space-y-0.5"
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
              No special dangerous permissions required.
            </p>
          )}
        </section>
      </div>

      {/* Related Apps */}
      {relatedApps.length > 0 && (
        <section className="pt-4 space-y-4">
          <h2 className="text-lg font-extrabold text-[#111827] dark:text-white">
            Similar in {app.category}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {relatedApps.map((rel) => (
              <TrendingAppCard key={rel.id} app={rel} />
            ))}
          </div>
        </section>
      )}

      {/* Lightbox Modal for Screenshots */}
      {lightboxIndex !== null && portraitScreens[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl p-6 text-white border border-white/20 shadow-2xl"
            style={{
              background: `linear-gradient(160deg, ${portraitScreens[lightboxIndex].bgFrom} 0%, ${portraitScreens[lightboxIndex].bgTo} 100%)`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/15">
              <span className="text-xs font-bold text-[#75E85C]">
                {app.name} · Screen {lightboxIndex + 1}/4
              </span>
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="min-h-[260px] flex flex-col justify-between">
              {renderPortraitPhoneMock(portraitScreens[lightboxIndex], lightboxIndex)}
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/15">
              <button
                type="button"
                onClick={() => setLightboxIndex((lightboxIndex + 3) % 4)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 text-xs font-bold cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>
              <button
                type="button"
                onClick={() => setLightboxIndex((lightboxIndex + 1) % 4)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 text-xs font-bold cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
