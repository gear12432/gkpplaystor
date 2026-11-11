import React from 'react';
import type { Metadata } from 'next';
import { Trophy, Flame, Clock, Gamepad2, LayoutGrid } from 'lucide-react';
import { APK_ITEMS } from '@/lib/apk-data';
import { RankedChartCard } from '@/components/AppCard';

export const metadata: Metadata = {
  title: 'Top Charts – Most Downloaded Apps & Games – APK Hub',
  description:
    'Explore Top Downloaded Apps, Top Downloaded Games, Trending Apps, Trending Games, and Recently Updated Android APK packages on APK Hub.',
};

export default function TopChartsPage() {
  const topDownloadedApps = APK_ITEMS.filter(
    (item) => item.type === 'app' && item.isMostDownloaded
  ).sort((a, b) => b.popularityScore - a.popularityScore);

  const topDownloadedGames = APK_ITEMS.filter(
    (item) => item.type === 'game' && item.isMostDownloaded
  ).sort((a, b) => b.popularityScore - a.popularityScore);

  const trendingApps = APK_ITEMS.filter(
    (item) => item.type === 'app' && item.isTrending
  );

  const trendingGames = APK_ITEMS.filter((item) => item.type === 'game');

  const recentlyUpdated = [...APK_ITEMS]
    .sort((a, b) => b.updatedTimestamp - a.updatedTimestamp)
    .slice(0, 8);

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#101A3A] via-[#172554] to-[#6829E8] rounded-3xl p-6 sm:p-10 text-white shadow-lg">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#75E85C]">
            <Trophy className="w-4 h-4" />
            <span>APK Hub Leaderboards</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Top Charts &amp; Rankings
          </h1>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
            Rankings compiled from verified upstream repository download
            milestones, release velocity, and catalog popularity.
          </p>
        </div>
      </div>

      {/* Section 1 & 2: Top Downloaded Apps & Top Downloaded Games */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <LayoutGrid className="w-5 h-5 text-[#16C653]" />
            <h2 className="text-xl font-extrabold text-[#111827] dark:text-white">
              Top Downloaded Apps
            </h2>
          </div>
          <div className="space-y-3">
            {topDownloadedApps.map((app, index) => (
              <RankedChartCard key={app.id} app={app} rank={index + 1} />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <Gamepad2 className="w-5 h-5 text-[#16C653]" />
            <h2 className="text-xl font-extrabold text-[#111827] dark:text-white">
              Top Downloaded Games
            </h2>
          </div>
          <div className="space-y-3">
            {topDownloadedGames.map((app, index) => (
              <RankedChartCard key={app.id} app={app} rank={index + 1} />
            ))}
          </div>
        </section>
      </div>

      {/* Section 3 & 4: Trending Apps & Trending Games */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <Flame className="w-5 h-5 text-[#16C653]" />
            <h2 className="text-xl font-extrabold text-[#111827] dark:text-white">
              Trending Apps
            </h2>
          </div>
          <div className="space-y-3">
            {trendingApps.map((app, index) => (
              <RankedChartCard key={app.id} app={app} rank={index + 1} />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <Flame className="w-5 h-5 text-[#16C653]" />
            <h2 className="text-xl font-extrabold text-[#111827] dark:text-white">
              Trending Games
            </h2>
          </div>
          <div className="space-y-3">
            {trendingGames.map((app, index) => (
              <RankedChartCard key={app.id} app={app} rank={index + 1} />
            ))}
          </div>
        </section>
      </div>

      {/* Section 5: Recently Updated */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5">
          <Clock className="w-5 h-5 text-[#16C653]" />
          <h2 className="text-xl font-extrabold text-[#111827] dark:text-white">
            Recently Updated Packages
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          {recentlyUpdated.map((app, index) => (
            <RankedChartCard key={app.id} app={app} rank={index + 1} />
          ))}
        </div>
      </section>
    </main>
  );
}
