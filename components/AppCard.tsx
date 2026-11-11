import React from 'react';
import Link from 'next/link';
import { Download, Star, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { ApkItem } from '@/lib/apk-data';
import { AppIcon } from '@/components/AppIcon';

interface AppCardProps {
  app: ApkItem;
}

export function TrendingAppCard({ app }: AppCardProps) {
  return (
    <div className="group bg-white dark:bg-[#152046] border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 flex flex-col justify-between transition-transform duration-150 hover:-translate-y-0.5 hover:border-[#16C653]/60 dark:hover:border-[#16C653]/60">
      <div>
        <Link
          href={`/app/${app.slug}`}
          className="flex flex-col items-center text-center focus-visible:outline-none"
        >
          <AppIcon
            app={app}
            size="lg"
            className="mb-3 group-hover:scale-105 transition-transform duration-150"
          />
          <h3 className="text-sm sm:text-base font-bold text-[#111827] dark:text-white line-clamp-1 group-hover:text-[#16C653] transition-colors">
            {app.name}
          </h3>
        </Link>

        {/* Unboxed clean metadata with typographic separators */}
        <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 text-xs text-[#64748B] dark:text-slate-300 tabular-nums">
          <span>v{app.version}</span>
          <span aria-hidden="true">·</span>
          <span>{app.size}</span>
        </div>

        {/* Verified rating or transparent sample status (never fake ratings) */}
        <div className="mt-2 min-h-[20px] flex items-center justify-center text-xs tabular-nums">
          {app.verifiedRating !== null && app.securityVerified ? (
            <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{app.verifiedRating.toFixed(1)}</span>
              <span className="text-slate-400 dark:text-slate-500" aria-hidden="true">
                ·
              </span>
              <span className="text-emerald-600 dark:text-[#75E85C] inline-flex items-center gap-0.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified
              </span>
            </span>
          ) : (
            <span className="text-[11px] text-[#64748B] dark:text-slate-400">
              {app.category} · Preview
            </span>
          )}
        </div>
      </div>

      <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-white/10">
        <Link
          href={`/download/${app.slug}`}
          className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#16C653] hover:bg-[#13b149] text-white dark:text-[#0B1229] dark:bg-[#16C653] dark:hover:bg-[#75E85C] font-bold text-xs transition-colors whitespace-nowrap shrink-0"
        >
          <Download className="w-3.5 h-3.5 shrink-0" />
          <span>Download APK</span>
        </Link>
      </div>
    </div>
  );
}

export function LatestAppCard({ app }: AppCardProps) {
  return (
    <div className="group bg-white dark:bg-[#152046] border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-4 transition-transform duration-150 hover:-translate-y-0.5 hover:border-[#16C653]/60">
      <div className="flex items-start gap-4">
        <Link href={`/app/${app.slug}`} className="shrink-0">
          <AppIcon
            app={app}
            size="md"
            className="group-hover:scale-105 transition-transform duration-150"
          />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <Link
              href={`/app/${app.slug}`}
              className="text-base font-bold text-[#111827] dark:text-white hover:text-[#16C653] dark:hover:text-[#75E85C] transition-colors truncate"
            >
              {app.name}
            </Link>
          </div>

          {/* Unboxed metadata row */}
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#64748B] dark:text-slate-300 tabular-nums">
            <span>{app.category}</span>
            <span aria-hidden="true">·</span>
            <span>v{app.version}</span>
            <span aria-hidden="true">·</span>
            <span>{app.size}</span>
            {app.verifiedRating !== null && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-semibold">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {app.verifiedRating.toFixed(1)}
                </span>
              </>
            )}
          </div>

          <p className="mt-2 text-xs sm:text-sm text-[#64748B] dark:text-slate-300 line-clamp-2 leading-relaxed">
            {app.shortDescription}
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between gap-3">
        <div className="text-xs text-[#64748B] dark:text-slate-400 truncate">
          {app.isAuthorizedDirectApk ? (
            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-[#75E85C] font-medium">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Authorized APK</span>
            </span>
          ) : (
            <span>UI Sample · {app.developer}</span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/app/${app.slug}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#111827] dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors whitespace-nowrap shrink-0"
          >
            <span>Details</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href={`/download/${app.slug}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#16C653] hover:bg-[#13b149] text-white dark:text-[#0B1229] dark:bg-[#16C653] dark:hover:bg-[#75E85C] font-bold text-xs transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>Download</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function RankedChartCard({
  app,
  rank,
}: {
  app: ApkItem;
  rank: number;
}) {
  return (
    <div className="group bg-white dark:bg-[#152046] border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4 transition-transform duration-150 hover:-translate-y-0.5 hover:border-[#16C653]/60">
      <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
        <div
          className={`w-8 text-center font-mono text-base sm:text-lg font-extrabold tabular-nums shrink-0 ${
            rank <= 3
              ? 'text-[#16C653] dark:text-[#75E85C]'
              : 'text-[#64748B] dark:text-slate-400'
          }`}
        >
          {String(rank).padStart(2, '0')}
        </div>

        <Link href={`/app/${app.slug}`} className="shrink-0">
          <AppIcon app={app} size="sm" />
        </Link>

        <div className="min-w-0">
          <Link
            href={`/app/${app.slug}`}
            className="text-sm sm:text-base font-bold text-[#111827] dark:text-white hover:text-[#16C653] transition-colors truncate block"
          >
            {app.name}
          </Link>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#64748B] dark:text-slate-300 tabular-nums">
            <span>{app.category}</span>
            <span aria-hidden="true">·</span>
            <span>v{app.version}</span>
            <span aria-hidden="true">·</span>
            <span>{app.size}</span>
            {app.verifiedDownloads && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-700 dark:text-[#75E85C] font-medium">
                  {app.verifiedDownloads} installs
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link
          href={`/download/${app.slug}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#16C653] hover:bg-[#13b149] text-white dark:text-[#0B1229] dark:bg-[#16C653] dark:hover:bg-[#75E85C] font-bold text-xs transition-colors whitespace-nowrap shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Download APK</span>
          <span className="sm:hidden">APK</span>
        </Link>
      </div>
    </div>
  );
}
