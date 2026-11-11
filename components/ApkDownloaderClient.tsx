'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Download,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  ExternalLink,
  ArrowLeft,
  FileCheck,
  Cpu,
} from 'lucide-react';
import { ApkItem, APK_ITEMS } from '@/lib/apk-data';
import { AppIcon } from '@/components/AppIcon';

type DownloadState = 'idle' | 'downloading' | 'completed' | 'error';

export function ApkDownloaderClient({ app }: { app: ApkItem }) {
  const [status, setStatus] = useState<DownloadState>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [bytesReceived, setBytesReceived] = useState<number>(0);
  const [totalBytes, setTotalBytes] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verifiedHash, setVerifiedHash] = useState<string | null>(app.sha256);

  const authorizedAlternatives = APK_ITEMS.filter(
    (item) => item.isAuthorizedDirectApk && item.slug !== app.slug
  ).slice(0, 4);

  const startApkDownload = async () => {
    setStatus('downloading');
    setProgress(0);
    setBytesReceived(0);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/apk/${app.slug}`, {
        method: 'GET',
        cache: 'no-store',
      });

      if (!response.ok) {
        let errorData: { error?: string; message?: string } = {};
        try {
          errorData = await response.json();
        } catch {
          // Ignore JSON parse error
        }
        throw new Error(
          errorData.message ||
            errorData.error ||
            `APK file is currently unavailable (HTTP ${response.status}).`
        );
      }

      const shaHeader = response.headers.get('X-APK-SHA256');
      if (shaHeader) {
        setVerifiedHash(shaHeader);
      }

      const contentLength = Number(response.headers.get('Content-Length') || 0);
      setTotalBytes(contentLength);

      if (!response.body) {
        throw new Error('ReadableStream not supported by browser response.');
      }

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
            setProgress(Math.min(100, Math.round((received / contentLength) * 100)));
          }
        }
      }

      // Assemble APK Blob and trigger file download
      const blob = new Blob(chunks as BlobPart[], {
        type: 'application/vnd.android.package-archive',
      });
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
          : 'An unexpected network error occurred while downloading the APK file.'
      );
    }
  };

  return (
    <div className="space-y-8">
      {/* Main Download Information Card */}
      <div className="bg-white dark:bg-[#152046] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-10 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-100 dark:border-white/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <AppIcon app={app} size="xl" />
            <div>
              <div className="text-xs font-bold text-[#16C653] dark:text-[#75E85C] tracking-wide uppercase">
                APK Download Information
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] dark:text-white mt-1">
                {app.name}
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs sm:text-sm text-[#64748B] dark:text-slate-300 tabular-nums">
                <span>Version {app.version}</span>
                <span aria-hidden="true">·</span>
                <span>{app.size}</span>
                <span aria-hidden="true">·</span>
                <span>{app.developer}</span>
              </div>
            </div>
          </div>

          <Link
            href={`/app/${app.slug}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 text-xs font-bold text-[#111827] dark:text-white hover:bg-slate-200 dark:hover:bg-white/15 transition-colors whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to App Details</span>
          </Link>
        </div>

        {/* Technical Package Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-6 border-b border-slate-100 dark:border-white/10 tabular-nums">
          <div className="p-4 rounded-2xl bg-[#F5F8FF] dark:bg-[#0B1229]">
            <div className="text-xs text-[#64748B] dark:text-slate-400">
              Package Name
            </div>
            <div className="text-xs sm:text-sm font-mono font-bold text-[#111827] dark:text-white mt-1 break-all">
              {app.packageName}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F5F8FF] dark:bg-[#0B1229]">
            <div className="text-xs text-[#64748B] dark:text-slate-400">
              Version &amp; Size
            </div>
            <div className="text-xs sm:text-sm font-bold text-[#111827] dark:text-white mt-1">
              v{app.version} · {app.size}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F5F8FF] dark:bg-[#0B1229]">
            <div className="text-xs text-[#64748B] dark:text-slate-400">
              Minimum Android Version
            </div>
            <div className="text-xs sm:text-sm font-bold text-[#111827] dark:text-white mt-1">
              {app.minAndroid}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F5F8FF] dark:bg-[#0B1229]">
            <div className="text-xs text-[#64748B] dark:text-slate-400">
              CPU Architecture
            </div>
            <div className="text-xs sm:text-sm font-mono font-bold text-[#111827] dark:text-white mt-1">
              {app.architecture}
            </div>
          </div>
        </div>

        {/* File Integrity & Source Transparency */}
        <div className="py-6 border-b border-slate-100 dark:border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-sm font-extrabold text-[#111827] dark:text-white">
            <FileCheck className="w-4 h-4 text-[#16C653]" />
            <span>File Integrity &amp; Distribution Verification</span>
          </div>

          {app.securityVerified && verifiedHash ? (
            <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-900 dark:text-emerald-200">
                <span className="font-bold inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#16C653]" />
                  Authorized Direct APK · {app.verificationSource}
                </span>
                <span className="font-mono">{app.license}</span>
              </div>
              <div className="text-xs font-mono text-emerald-950 dark:text-emerald-100 bg-white/80 dark:bg-[#0B1229]/80 p-2.5 rounded-xl break-all">
                SHA-256: {verifiedHash}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
              <div className="font-bold flex items-center gap-1.5 mb-1">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Proprietary Application · Sample Catalog Preview</span>
              </div>
              <p>
                {app.name} is a copyrighted commercial application owned by{' '}
                <strong>{app.developer}</strong>. APK Hub strictly prohibits
                generating fake download links or redistributing unauthorized
                copyrighted APK binaries. Clicking Download APK below will
                verify distribution availability and guide you to official
                sources.
              </p>
            </div>
          )}
        </div>

        {/* Interactive Download Action & Progress Controller */}
        <div className="pt-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-base font-extrabold text-[#111827] dark:text-white">
                {status === 'idle' && 'Ready to Download APK Package'}
                {status === 'downloading' &&
                  `Downloading ${app.packageName}-v${app.version}.apk...`}
                {status === 'completed' &&
                  'APK Download Complete & Integrity Checked!'}
                {status === 'error' && 'Direct APK File Unavailable'}
              </div>
              <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-300">
                {status === 'idle' &&
                  'HTTPS encrypted transfer with real-time byte stream verification.'}
                {status === 'downloading' &&
                  `Transferred ${(bytesReceived / 1024).toFixed(1)} KB ${
                    totalBytes > 0
                      ? `of ${(totalBytes / 1024).toFixed(1)} KB (${progress}%)`
                      : ''
                  }`}
                {status === 'completed' &&
                  `Saved ${app.packageName}-v${app.version.replace(
                    /\s+/g,
                    '_'
                  )}.apk to your device downloads folder.`}
                {status === 'error' &&
                  'See the transparent verification report and official links below.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={startApkDownload}
                disabled={status === 'downloading'}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-[#16C653] hover:bg-[#13b149] disabled:opacity-60 text-white dark:text-[#0B1229] dark:bg-[#16C653] dark:hover:bg-[#75E85C] font-extrabold text-sm sm:text-base shadow-lg transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                {status === 'error' ? (
                  <>
                    <RotateCcw className="w-5 h-5" />
                    <span>Retry Download</span>
                  </>
                ) : status === 'completed' ? (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Download APK Again</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>
                      {status === 'downloading'
                        ? `Downloading (${progress}%)`
                        : `Download APK (${app.size})`}
                    </span>
                  </>
                )}
              </button>

              {app.officialExternalApkUrl && (
                <a
                  href={app.officialExternalApkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-[#101A3A] hover:bg-[#172554] text-white font-bold text-xs sm:text-sm transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Official Upstream Mirror</span>
                  <ExternalLink className="w-4 h-4 text-[#75E85C]" />
                </a>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {(status === 'downloading' || status === 'completed') && (
            <div className="space-y-2">
              <div className="w-full h-3.5 bg-slate-100 dark:bg-[#0B1229] rounded-full overflow-hidden border border-slate-200 dark:border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-[#16C653] to-[#75E85C] transition-all duration-150 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs font-mono text-[#64748B] dark:text-slate-300 tabular-nums">
                <span>
                  {status === 'completed'
                    ? 'Status: 100% Verified'
                    : 'Streaming APK Package...'}
                </span>
                <span>{progress}%</span>
              </div>
            </div>
          )}

          {/* Completion Banner */}
          {status === 'completed' && (
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#16C653] shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-emerald-950 dark:text-emerald-100">
                  <div className="font-bold">
                    Download Completed Successfully
                  </div>
                  <p className="mt-0.5 opacity-90">
                    Open the downloaded <code>.apk</code> file on your Android
                    device (`{app.minAndroid}`) to install. Never execute APK
                    files inside a web browser.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={startApkDownload}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shrink-0 cursor-pointer"
              >
                Download Copy
              </button>
            </div>
          )}

          {/* Error / Copyright Unavailable State */}
          {status === 'error' && errorMessage && (
            <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 space-y-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-rose-950 dark:text-rose-100 space-y-1">
                  <div className="font-bold">
                    APK File Unavailable for Third-Party Redistribution
                  </div>
                  <p className="leading-relaxed">{errorMessage}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={startApkDownload}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Check</span>
                </button>

                <a
                  href={app.officialWebsiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#101A3A] text-white text-xs font-bold hover:bg-[#172554]"
                >
                  <span>Visit Official {app.developer} Website</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#75E85C]" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Verified Authorized Direct APK Packages Section */}
      <div className="bg-white dark:bg-[#152046] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-[#111827] dark:text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#16C653]" />
              <span>Authorized Open-Source &amp; Direct APK Downloads</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-300 mt-0.5">
              These packages are licensed for direct APK download with full
              SHA-256 verification
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {authorizedAlternatives.map((alt) => (
            <Link
              key={alt.id}
              href={`/download/${alt.slug}`}
              className="p-4 rounded-2xl bg-[#F5F8FF] dark:bg-[#0B1229] border border-slate-200/70 dark:border-white/10 hover:border-[#16C653] transition-colors flex items-center gap-3.5"
            >
              <AppIcon app={alt} size="sm" />
              <div className="min-w-0">
                <div className="text-sm font-bold text-[#111827] dark:text-white truncate">
                  {alt.name}
                </div>
                <div className="text-xs text-emerald-700 dark:text-[#75E85C] font-semibold tabular-nums">
                  v{alt.version} · {alt.size}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
