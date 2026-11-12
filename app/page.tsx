'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Flame,
  Sparkles,
  ArrowRight,
  Smartphone,
  Gamepad2,
  X,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Globe,
  MessageSquare,
  Play,
  Music,
  Camera,
  Folder,
  Compass,
  BookOpen,
  Briefcase,
  Cpu,
  Trophy,
  Palette,
  LayoutDashboard,
  Calculator,
} from 'lucide-react';
import {
  CATEGORIES,
  CategoryName,
} from '@/lib/apk-data';
import { useLiveApkCatalog } from '@/lib/firebase-catalog';
import { TrendingAppCard, LatestAppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { CitizenCalculator } from '@/components/CitizenCalculator';

type SortOption = 'popular' | 'rating' | 'latest' | 'size';
type TabOption = 'all' | 'app' | 'game';

function CategoryIcon({ iconName }: { iconName: string }) {
  const props = { className: 'w-5 h-5' };
  switch (iconName) {
    case 'MessageSquare':
      return <MessageSquare {...props} />;
    case 'Play':
      return <Play {...props} />;
    case 'Music':
      return <Music {...props} />;
    case 'Globe':
      return <Globe {...props} />;
    case 'Shield':
      return <ShieldCheck {...props} />;
    case 'Folder':
      return <Folder {...props} />;
    case 'Camera':
      return <Camera {...props} />;
    case 'Compass':
      return <Compass {...props} />;
    case 'BookOpen':
      return <BookOpen {...props} />;
    case 'Briefcase':
      return <Briefcase {...props} />;
    case 'Cpu':
      return <Cpu {...props} />;
    case 'Gamepad2':
      return <Gamepad2 {...props} />;
    case 'Trophy':
      return <Trophy {...props} />;
    case 'Palette':
      return <Palette {...props} />;
    default:
      return <Smartphone {...props} />;
  }
}

export default function HomePage() {
  const liveCatalog = useLiveApkCatalog();
  const [homeMode, setHomeMode] = useState<'calculator' | 'store'>('calculator');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryName | 'ALL'>(
    'ALL'
  );
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [activeTab, setActiveTab] = useState<TabOption>('all');
  const [searchFocused, setSearchFocused] = useState(false);

  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.trim().toLowerCase();
    return liveCatalog
      .filter(
        (app) =>
          app.name.toLowerCase().includes(q) ||
          app.developer.toLowerCase().includes(q) ||
          app.category.toLowerCase().includes(q) ||
          app.packageName.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [searchQuery, liveCatalog]);

  const trendingApps = useMemo(
    () =>
      liveCatalog
        .filter((app) => app.isTrending || app.isMostDownloaded)
        .slice(0, 8),
    [liveCatalog]
  );

  const filteredCatalog = useMemo(() => {
    let list = [...liveCatalog];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (app) =>
          app.name.toLowerCase().includes(q) ||
          app.developer.toLowerCase().includes(q) ||
          app.category.toLowerCase().includes(q) ||
          app.packageName.toLowerCase().includes(q) ||
          app.shortDescription.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'ALL') {
      list = list.filter((app) => app.category === selectedCategory);
    }

    if (activeTab !== 'all') {
      list = list.filter((app) => app.type === activeTab);
    }

    list.sort((a, b) => {
      if (sortBy === 'popular') {
        return (
          Number(b.isTrending) - Number(a.isTrending) ||
          b.popularityScore - a.popularityScore ||
          (b.verifiedRating ?? 0) - (a.verifiedRating ?? 0)
        );
      }
      if (sortBy === 'rating') {
        return (b.verifiedRating ?? 0) - (a.verifiedRating ?? 0);
      }
      if (sortBy === 'size') {
        return a.sizeBytes - b.sizeBytes;
      }
      return b.updatedTimestamp - a.updatedTimestamp;
    });

    return list;
  }, [liveCatalog, searchQuery, selectedCategory, activeTab, sortBy]);

  return (
    <main className="flex-1">
      {/* Mode Switcher Bar: Citizen Calculator (Unlimited Numbers) <-> APK Hub Store */}
      <div className="bg-[#101A3A] border-b border-white/10 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-center sm:justify-between gap-2 flex-wrap">
          <div className="inline-flex items-center p-1 rounded-xl bg-[#172554] border border-white/10">
            <button
              type="button"
              onClick={() => setHomeMode('calculator')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                homeMode === 'calculator'
                  ? 'bg-[#16C653] text-[#101A3A] shadow-sm'
                  : 'text-slate-200 hover:text-white'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Citizen Calculator (Unlimited)</span>
            </button>
            <button
              type="button"
              onClick={() => setHomeMode('store')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                homeMode === 'store'
                  ? 'bg-[#16C653] text-[#101A3A] shadow-sm'
                  : 'text-slate-200 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>APK Hub Store</span>
            </button>
          </div>
          <span className="text-[11px] text-[#75E85C] font-semibold hidden sm:inline">
            ✓ Fixed 14-Number Limit — Enter 15, 50, 100, or Unlimited Numbers with Live Auto-Calculation
          </span>
        </div>
      </div>

      {homeMode === 'calculator' ? (
        <section className="py-0 sm:py-6 px-0 sm:px-4 bg-[#F5F8FF] dark:bg-[#0B1229]">
          <CitizenCalculator
            onSwitchToStore={() => setHomeMode('store')}
          />
        </section>
      ) : (
        <>
      {/* =================================================================
          1. CLEAN SEARCH BAR SECTION (HERO TEXT & MOBILE MOCKUP REMOVED)
         ================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#101A3A] via-[#172554] to-[#231955] text-white border-b border-white/10">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="relative max-w-2xl mx-auto">
            <div className="relative flex items-center bg-white dark:bg-[#0B1229] rounded-2xl p-1.5 shadow-2xl border-2 border-white/20 focus-within:border-[#16C653] transition-colors">
              <Search className="w-5 h-5 text-slate-400 ml-3.5 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 180)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search APK apps, games, or package name (e.g. Telegram, VLC, Minetest)..."
                aria-label="Search APK applications and games"
                className="w-full px-3.5 py-3 bg-transparent text-sm sm:text-base text-[#111827] dark:text-white placeholder:text-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search query"
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('catalog-results');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-3 rounded-xl bg-[#16C653] hover:bg-[#13b149] text-white dark:text-[#0B1229] font-extrabold text-sm shadow-md transition-colors shrink-0 cursor-pointer"
              >
                Search
              </button>
            </div>

            {/* Instant Search Suggestions Dropdown */}
            {searchFocused && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-[#152046] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/15 overflow-hidden z-40">
                <div className="px-4 py-2 bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/10 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Matching APK Packages ({suggestions.length})</span>
                  <span>Click for App Details</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-white/5">
                  {suggestions.map((item) => (
                    <Link
                      key={item.id}
                      href={`/app/${item.slug}`}
                      className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <AppIcon app={item} size="sm" />
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-[#111827] dark:text-white truncate">
                            {item.name}
                          </div>
                          <div className="text-xs text-[#64748B] dark:text-slate-400 truncate">
                            {item.developer} · v{item.version} · {item.size}
                          </div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-[#16C653]/15 text-[#16C653] dark:text-[#75E85C] text-xs font-bold shrink-0">
                        View APK
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =================================================================
          2. SEARCH & FILTER TOOLBAR
         ================================================================= */}
      <section
        id="catalog-results"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-5 relative z-20"
      >
        <div className="bg-white dark:bg-[#152046] rounded-2xl p-4 sm:p-5 shadow-xl border border-slate-200/80 dark:border-white/10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400 mr-1 shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#16C653]" />
              Filter:
            </span>
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-[#101A3A] dark:bg-[#16C653] text-white dark:text-[#0B1229] shadow-xs'
                  : 'bg-[#F5F8FF] dark:bg-white/5 text-[#64748B] dark:text-slate-300 hover:text-[#111827] dark:hover:text-white'
              }`}
            >
              All Categories ({liveCatalog.length})
            </button>
            {CATEGORIES.slice(0, 6).map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat.name
                    ? 'bg-[#101A3A] dark:bg-[#16C653] text-white dark:text-[#0B1229] shadow-xs'
                    : 'bg-[#F5F8FF] dark:bg-white/5 text-[#64748B] dark:text-slate-300 hover:text-[#111827] dark:hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sort Dropdown & Live Sync Badge */}
          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 dark:border-white/10">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-[#16C653] dark:text-[#75E85C] text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16C653] animate-pulse" />
              <span>Firebase Live</span>
            </span>
            <label
              htmlFor="sort-select"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[#16C653]" />
              Sort By:
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3.5 py-2 rounded-xl bg-[#F5F8FF] dark:bg-[#0B1229] border border-slate-200 dark:border-white/15 text-xs font-bold text-[#111827] dark:text-white focus:outline-none focus:border-[#16C653] cursor-pointer"
            >
              <option value="popular">Popular &amp; Featured</option>
              <option value="rating">Top Rated</option>
              <option value="latest">Latest Release</option>
              <option value="size">Smallest File Size</option>
            </select>
          </div>
        </div>
      </section>

      {/* =================================================================
          3. TRENDING APK APPS SECTION
         ================================================================= */}
      {!searchQuery && selectedCategory === 'ALL' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#16C653] dark:text-[#75E85C] mb-1">
                <Flame className="w-4 h-4 fill-current" />
                <span>Verified Releases</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] dark:text-white tracking-tight">
                Trending APK Apps
              </h2>
            </div>
            <Link
              href="/top-charts"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#16C653] dark:text-[#75E85C] hover:underline"
            >
              <span>Explore Top Charts</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {trendingApps.map((app) => (
              <TrendingAppCard key={app.id} app={app} />
            ))}
          </div>
        </section>
      )}

      {/* =================================================================
          4. FEATURED PROMOTIONAL BANNER
         ================================================================= */}
      {!searchQuery && selectedCategory === 'ALL' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#101A3A] via-[#172554] to-[#6829E8] p-6 sm:p-10 text-white shadow-xl border border-white/10">
            <div className="absolute -right-16 -bottom-16 w-72 h-72 rounded-full bg-[#16C653]/20 blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#16C653]/20 border border-[#16C653]/40 text-xs font-bold text-[#75E85C]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Direct &amp; Open-Source Android Packages</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  100% Transparent APK Downloads with Full App Previews
                </h2>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                  Every APK listing on APK Hub includes interactive interface
                  screenshots, full application descriptions, version history,
                  minimum Android SDK requirements, and direct one-tap APK
                  installation.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-200">
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#75E85C]" />
                    Official Vendor &amp; FOSS Releases
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-[#75E85C]" />
                    Instant Direct Download
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Link
                  href="/app/telegram"
                  className="px-6 py-3.5 rounded-2xl bg-[#16C653] hover:bg-[#13b149] text-white dark:text-[#0B1229] font-extrabold text-sm shadow-lg transition-all inline-flex items-center gap-2"
                >
                  <span>View Telegram APK</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/admin"
                  className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/15 transition-all inline-flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#75E85C]" />
                  <span>Open Admin Panel</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =================================================================
          5. POPULAR CATEGORIES SECTION (12 CATEGORIES)
         ================================================================= */}
      {!searchQuery && selectedCategory === 'ALL' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#6829E8] dark:text-[#75E85C] mb-1">
                Browse by Topic
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] dark:text-white tracking-tight">
                Popular Categories
              </h2>
            </div>
            <Link
              href="/categories"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#16C653] dark:text-[#75E85C] hover:underline"
            >
              <span>View All 12 Categories</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {CATEGORIES.map((cat) => {
              const count = liveCatalog.filter(
                (a) => a.category === cat.name
              ).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    const el = document.getElementById('latest-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="group text-left bg-white dark:bg-[#152046] border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 hover:border-[#16C653] dark:hover:border-[#75E85C]/50 hover:shadow-md transition-all cursor-pointer"
                >
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center text-white shadow-sm mb-3 group-hover:scale-105 transition-transform`}
                  >
                    <CategoryIcon iconName={cat.iconName} />
                  </div>
                  <div className="font-bold text-sm text-[#111827] dark:text-white group-hover:text-[#16C653] dark:group-hover:text-[#75E85C] transition-colors truncate">
                    {cat.name}
                  </div>
                  <div className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                    {count} {count === 1 ? 'package' : 'packages'}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* =================================================================
          6. LATEST APPS & GAMES SECTION WITH TABS
         ================================================================= */}
      <section
        id="latest-section"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] dark:text-white tracking-tight">
              {searchQuery
                ? `Search Results for "${searchQuery}"`
                : selectedCategory !== 'ALL'
                ? `${selectedCategory} APK Packages`
                : 'Latest Apps & Games'}
            </h2>
            <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">
              Showing {filteredCatalog.length} Android APK{' '}
              {filteredCatalog.length === 1 ? 'package' : 'packages'} — click
              any card to view screenshots, description, and download
            </p>
          </div>

          {/* All / Apps / Games Tabs */}
          <div className="inline-flex items-center p-1 rounded-xl bg-white dark:bg-[#152046] border border-slate-200 dark:border-white/10 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#16C653] text-white dark:text-[#0B1229] shadow-xs'
                  : 'text-[#64748B] dark:text-slate-300 hover:text-[#111827] dark:hover:text-white'
              }`}
            >
              All ({liveCatalog.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('app')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'app'
                  ? 'bg-[#16C653] text-white dark:text-[#0B1229] shadow-xs'
                  : 'text-[#64748B] dark:text-slate-300 hover:text-[#111827] dark:hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>
                Apps ({liveCatalog.filter((i) => i.type === 'app').length})
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('game')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'game'
                  ? 'bg-[#16C653] text-white dark:text-[#0B1229] shadow-xs'
                  : 'text-[#64748B] dark:text-slate-300 hover:text-[#111827] dark:hover:text-white'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>
                Games ({liveCatalog.filter((i) => i.type === 'game').length})
              </span>
            </button>
          </div>
        </div>

        {/* Active Filter Notice */}
        {(searchQuery || selectedCategory !== 'ALL') && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#16C653]/15 text-[#16C653] dark:text-[#75E85C] text-xs font-bold">
                Query: &ldquo;{searchQuery}&rdquo;
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="hover:opacity-75 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {selectedCategory !== 'ALL' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#6829E8]/15 text-[#6829E8] dark:text-purple-300 text-xs font-bold">
                Category: {selectedCategory}
                <button
                  type="button"
                  onClick={() => setSelectedCategory('ALL')}
                  className="hover:opacity-75 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
                setActiveTab('all');
              }}
              className="text-xs font-bold text-[#64748B] hover:text-[#111827] dark:hover:text-white underline ml-2 cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        )}

        {filteredCatalog.length === 0 ? (
          <div className="bg-white dark:bg-[#152046] rounded-3xl p-12 text-center border border-slate-200 dark:border-white/10">
            <Search className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#111827] dark:text-white">
              No matching APK packages found
            </h3>
            <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1 max-w-md mx-auto">
              Try clearing your search filter or selecting another category to
              browse our catalog of verified Android applications.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
                setActiveTab('all');
              }}
              className="mt-5 px-5 py-2.5 rounded-xl bg-[#16C653] text-white font-bold text-xs cursor-pointer"
            >
              Show All APK Packages
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {filteredCatalog.map((app) => (
              <LatestAppCard key={app.id} app={app} />
            ))}
          </div>
        )}
      </section>
      </>
      )}
    </main>
  );
}
