'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  ArrowRight,
  Download,
  SlidersHorizontal,
  ShieldCheck,
  Sparkles,
  Flame,
  Trophy,
  Gamepad2,
  LayoutGrid,
} from 'lucide-react';
import {
  APK_ITEMS,
  CATEGORIES,
  CategoryName,
} from '@/lib/apk-data';
import { AppIcon } from '@/components/AppIcon';
import { TrendingAppCard, LatestAppCard } from '@/components/AppCard';
import { CategoryIcon } from '@/components/CategoryIcon';
import {
  HeroSmartphoneAndMascot,
  PromoRocketIllustration,
} from '@/components/HeroVisuals';

type LatestTab = 'latest-apps' | 'latest-games' | 'most-downloaded' | 'recently-updated';
type SortOption = 'updated' | 'downloads' | 'popularity' | 'name';

const QUICK_SUGGESTIONS = [
  'Telegram',
  'WhatsApp',
  'VLC for Android',
  'F-Droid',
  'Signal',
  'Mindustry',
];

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<'all' | 'app' | 'game'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [activeTab, setActiveTab] = useState<LatestTab>('latest-apps');

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const explorerSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Instant autocomplete suggestions
  const instantSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return APK_ITEMS.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.developer.toLowerCase().includes(q) ||
        item.packageName.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [searchQuery]);

  // Filtered and sorted explorer results
  const isFilteringActive =
    searchQuery.trim().length > 0 ||
    selectedCategory !== 'All' ||
    selectedType !== 'all';

  const filteredResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = APK_ITEMS.filter((item) => {
      const matchesQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.developer.toLowerCase().includes(q) ||
        item.shortDescription.toLowerCase().includes(q);

      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;

      const matchesType =
        selectedType === 'all' || item.type === selectedType;

      return matchesQuery && matchesCategory && matchesType;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'updated') return b.updatedTimestamp - a.updatedTimestamp;
      if (sortBy === 'downloads') {
        return (b.isMostDownloaded ? 1 : 0) - (a.isMostDownloaded ? 1 : 0) || b.popularityScore - a.popularityScore;
      }
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return b.popularityScore - a.popularityScore;
    });
  }, [searchQuery, selectedCategory, selectedType, sortBy]);

  // Trending 6 apps
  const trendingApps = useMemo(
    () => APK_ITEMS.filter((item) => item.isTrending).slice(0, 6),
    []
  );

  // Latest Apps & Games tab items
  const latestTabItems = useMemo(() => {
    switch (activeTab) {
      case 'latest-apps':
        return APK_ITEMS.filter((i) => i.type === 'app' && i.isLatest).slice(0, 6);
      case 'latest-games':
        return APK_ITEMS.filter((i) => i.type === 'game').slice(0, 6);
      case 'most-downloaded':
        return APK_ITEMS.filter((i) => i.isMostDownloaded)
          .sort((a, b) => b.popularityScore - a.popularityScore)
          .slice(0, 6);
      case 'recently-updated':
        return [...APK_ITEMS]
          .sort((a, b) => b.updatedTimestamp - a.updatedTimestamp)
          .slice(0, 6);
    }
  }, [activeTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchFocused(false);
    if (explorerSectionRef.current) {
      explorerSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedType('all');
    setSortBy('popularity');
  };

  return (
    <main className="flex-1">
      {/* =========================================================
          HERO SECTION (Dark Navy #101A3A -> #172554 -> Purple #6829E8)
         ========================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#101A3A] via-[#172554] to-[#6829E8] text-white py-12 sm:py-16 lg:py-20">
        {/* Decorative geometric light shapes */}
        <div
          className="absolute top-0 right-1/4 w-96 h-96 bg-[#16C653]/15 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 left-10 w-80 h-80 bg-[#6829E8]/30 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Column: Headline, Search Bar & Quick Actions */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#75E85C] tracking-wide">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>APK Hub · Download Unlimited APK</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-[3.4rem] font-extrabold tracking-tight leading-[1.12] text-balance">
                Fast &amp; Secure{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#16C653] to-[#75E85C]">
                  APK Downloader
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Download Your Favourite Apps &amp; Games for Android Free!
                Explore verified open-source packages, official direct releases,
                and SHA-256 integrity-checked installers with zero login
                required.
              </p>

              {/* Interactive Search Bar with Instant Suggestions */}
              <div
                ref={searchContainerRef}
                className="relative max-w-2xl mx-auto lg:mx-0 pt-1"
              >
                <form
                  onSubmit={handleSearchSubmit}
                  className="relative flex items-center bg-white dark:bg-[#0F172A] rounded-2xl p-1.5 shadow-2xl border-2 border-white/20 focus-within:border-[#16C653] transition-colors"
                >
                  <Search className="w-5 h-5 text-slate-400 ml-3.5 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onFocus={() => setSearchFocused(true)}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSearchFocused(true);
                    }}
                    placeholder="Search APK by app name, game, category, or developer..."
                    aria-label="Search APK"
                    className="w-full px-3 py-3 text-sm sm:text-base text-[#111827] dark:text-white bg-transparent focus:outline-none placeholder:text-slate-400"
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
                    type="submit"
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#16C653] to-[#75E85C] hover:from-[#13b149] hover:to-[#62d849] text-[#101A3A] font-extrabold text-sm transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-md"
                  >
                    <Search className="w-4 h-4" />
                    <span className="hidden sm:inline">Search</span>
                  </button>
                </form>

                {/* Instant Search Dropdown */}
                {searchFocused && (
                  <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-[#152046] text-[#111827] dark:text-white rounded-2xl shadow-2xl border border-slate-200 dark:border-white/15 overflow-hidden z-30 text-left">
                    {searchQuery.trim().length === 0 ? (
                      <div className="p-4">
                        <div className="text-xs font-bold text-[#64748B] dark:text-slate-300 mb-2.5">
                          Suggested Searches
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {QUICK_SUGGESTIONS.map((term) => (
                            <button
                              key={term}
                              type="button"
                              onClick={() => {
                                setSearchQuery(term);
                                setSearchFocused(false);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-[#16C653] hover:text-[#101A3A] text-xs font-semibold transition-colors cursor-pointer"
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : instantSuggestions.length > 0 ? (
                      <div className="divide-y divide-slate-100 dark:divide-white/10">
                        {instantSuggestions.map((app) => (
                          <div
                            key={app.id}
                            className="p-3 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-between gap-3 transition-colors"
                          >
                            <Link
                              href={`/app/${app.slug}`}
                              onClick={() => setSearchFocused(false)}
                              className="flex items-center gap-3 min-w-0 flex-1"
                            >
                              <AppIcon app={app} size="sm" />
                              <div className="min-w-0">
                                <div className="text-sm font-bold text-[#111827] dark:text-white truncate">
                                  {app.name}
                                </div>
                                <div className="text-xs text-[#64748B] dark:text-slate-300 truncate tabular-nums">
                                  {app.developer} · {app.category} · v{app.version} ({app.size})
                                </div>
                              </div>
                            </Link>
                            <Link
                              href={`/download/${app.slug}`}
                              onClick={() => setSearchFocused(false)}
                              className="px-3 py-1.5 rounded-lg bg-[#16C653] hover:bg-[#13b149] text-white dark:text-[#0B1229] text-xs font-bold shrink-0"
                            >
                              Download
                            </Link>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-5 text-center text-sm text-[#64748B] dark:text-slate-300">
                        No applications matching &ldquo;{searchQuery}&rdquo; found. Try searching by category or developer.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Below Search: Popular, Games, Apps, Top Charts */}
              <div className="pt-1 flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
                <span className="text-xs font-semibold text-slate-300 mr-1">
                  Quick Explore:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedType('all');
                    setSortBy('popularity');
                    document
                      .getElementById('trending-section')
                      ?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-[#16C653] hover:text-[#101A3A] text-xs font-bold text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Flame className="w-3.5 h-3.5 text-[#75E85C]" />
                  <span>Popular</span>
                </button>

                <Link
                  href="/games"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-[#16C653] hover:text-[#101A3A] text-xs font-bold text-white transition-colors whitespace-nowrap shrink-0"
                >
                  <Gamepad2 className="w-3.5 h-3.5 text-[#75E85C]" />
                  <span>Games</span>
                </Link>

                <Link
                  href="/apps"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-[#16C653] hover:text-[#101A3A] text-xs font-bold text-white transition-colors whitespace-nowrap shrink-0"
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-[#75E85C]" />
                  <span>Apps</span>
                </Link>

                <Link
                  href="/top-charts"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-[#16C653] hover:text-[#101A3A] text-xs font-bold text-white transition-colors whitespace-nowrap shrink-0"
                >
                  <Trophy className="w-3.5 h-3.5 text-[#75E85C]" />
                  <span>Top Charts</span>
                </Link>
              </div>
            </div>

            {/* Right Column: 3D Android Mascot + Smartphone + Floating App Icons */}
            <div className="lg:col-span-5">
              <HeroSmartphoneAndMascot />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          REAL-TIME SEARCH & FILTER RESULTS PANEL (When active)
         ========================================================= */}
      <section
        ref={explorerSectionRef}
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${
          isFilteringActive ? 'pt-10 pb-4' : 'pt-8'
        }`}
      >
        <div className="bg-white dark:bg-[#152046] border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#111827] dark:text-white">
              <SlidersHorizontal className="w-4 h-4 text-[#16C653]" />
              <span>Filter &amp; Sort Catalog</span>
              <span className="text-xs font-normal text-[#64748B] dark:text-slate-400 tabular-nums">
                ({filteredResults.length} results)
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* App / Game Segmented Filter */}
              <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-[#0B1229]">
                {(['all', 'app', 'game'] as const).map((typeOption) => (
                  <button
                    key={typeOption}
                    type="button"
                    onClick={() => setSelectedType(typeOption)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      selectedType === typeOption
                        ? 'bg-[#16C653] text-white dark:text-[#0B1229]'
                        : 'text-[#64748B] dark:text-slate-300 hover:text-[#111827] dark:hover:text-white'
                    }`}
                  >
                    {typeOption === 'all'
                      ? 'All Types'
                      : typeOption === 'app'
                      ? 'Apps Only'
                      : 'Games Only'}
                  </button>
                ))}
              </div>

              {/* Category Select */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter by category"
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#0B1229] text-xs font-semibold text-[#111827] dark:text-white border border-transparent focus:border-[#16C653] focus:outline-none cursor-pointer"
              >
                <option value="All">All Categories (12)</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {/* Sort Select */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sort results by"
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#0B1229] text-xs font-semibold text-[#111827] dark:text-white border border-transparent focus:border-[#16C653] focus:outline-none cursor-pointer"
              >
                <option value="popularity">Sort: Popularity</option>
                <option value="updated">Sort: Latest Updated</option>
                <option value="downloads">Sort: Most Downloaded</option>
                <option value="name">Sort: Application Name (A-Z)</option>
              </select>

              {isFilteringActive && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Live Filtered Results Grid when user is actively searching or filtering */}
          {isFilteringActive && (
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-extrabold text-[#111827] dark:text-white">
                  Matching Applications ({filteredResults.length})
                </h2>
              </div>

              {filteredResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredResults.map((app) => (
                    <LatestAppCard key={app.id} app={app} />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center space-y-3">
                  <p className="text-base font-bold text-[#111827] dark:text-white">
                    No matching APK packages found
                  </p>
                  <p className="text-sm text-[#64748B] dark:text-slate-300 max-w-md mx-auto">
                    We couldn&apos;t find any apps matching your current search or
                    category filter. Try clearing your filters to explore all
                    available packages.
                  </p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#16C653] text-white dark:text-[#0B1229] text-xs font-bold cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* =========================================================
          4. TRENDING APK APPS SECTION
         ========================================================= */}
      <section
        id="trending-section"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-14"
      >
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#111827] dark:text-white tracking-tight">
              🔥 Trending APK Apps
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-300 mt-1">
              Most requested Android applications and communication tools this week
            </p>
          </div>

          <Link
            href="/apps"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-[#152046] border border-slate-200 dark:border-white/10 text-xs sm:text-sm font-bold text-[#111827] dark:text-white hover:border-[#16C653] hover:text-[#16C653] transition-colors whitespace-nowrap shrink-0"
          >
            <span>See All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {trendingApps.map((app) => (
            <TrendingAppCard key={app.id} app={app} />
          ))}
        </div>
      </section>

      {/* =========================================================
          5. PROMOTIONAL BANNER
         ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#16C653] via-[#12A846] to-[#0E8738] text-white p-6 sm:p-10 lg:p-12 shadow-xl">
          <div
            className="absolute -right-12 -bottom-12 w-72 h-72 rounded-full bg-[#75E85C]/25 blur-2xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center md:text-left max-w-xl">
              <div className="inline-flex items-center gap-2 text-xs font-extrabold tracking-wider uppercase text-[#101A3A] bg-[#75E85C] px-3 py-1 rounded-lg">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Verified Direct Repository</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                Get The Latest APK Updates!
              </h2>

              <p className="text-base sm:text-lg font-bold text-[#101A3A] tracking-wide">
                Fast • Safe • Free
              </p>

              <p className="text-sm sm:text-base text-white/95 leading-relaxed">
                Download authorized open-source Android releases and official
                standalone installers with full SHA-256 checksum transparency
                and zero regional lockouts.
              </p>

              <div className="pt-2">
                <Link
                  href="/apps?filter=authorized"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#101A3A] hover:bg-[#172554] text-white font-extrabold text-sm shadow-lg transition-transform hover:-translate-y-0.5 whitespace-nowrap shrink-0"
                >
                  <Download className="w-4 h-4 text-[#75E85C]" />
                  <span>Download Now</span>
                </Link>
              </div>
            </div>

            <div className="shrink-0">
              <PromoRocketIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          6. POPULAR CATEGORIES (All 12 Required Categories)
         ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#111827] dark:text-white tracking-tight">
              Popular Categories
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-300 mt-1">
              Explore Android packages organized across 12 specialized categories
            </p>
          </div>

          <Link
            href="/categories"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-[#152046] border border-slate-200 dark:border-white/10 text-xs sm:text-sm font-bold text-[#111827] dark:text-white hover:border-[#16C653] hover:text-[#16C653] transition-colors whitespace-nowrap shrink-0"
          >
            <span>All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories?category=${encodeURIComponent(cat.name)}`}
              className="group bg-white dark:bg-[#152046] border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 flex flex-col items-start justify-between gap-3 transition-transform duration-150 hover:-translate-y-0.5 hover:border-[#16C653]"
            >
              <div
                className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cat.gradient} text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}
              >
                <CategoryIcon iconName={cat.iconName} className="w-5 h-5" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#111827] dark:text-white group-hover:text-[#16C653] dark:group-hover:text-[#75E85C] transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5 tabular-nums">
                  {cat.appCount} Apps Available
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* =========================================================
          7. LATEST APPS & GAMES (With 4 Interactive Tabs & See All)
         ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#111827] dark:text-white tracking-tight">
              Latest Apps &amp; Games
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-300 mt-1">
              Freshly updated Android builds, open-source releases, and top downloads
            </p>
          </div>

          <Link
            href={activeTab === 'latest-games' ? '/games' : '/apps'}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-[#152046] border border-slate-200 dark:border-white/10 text-xs sm:text-sm font-bold text-[#111827] dark:text-white hover:border-[#16C653] hover:text-[#16C653] transition-colors self-start sm:self-auto whitespace-nowrap shrink-0"
          >
            <span>See All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Interactive Segmented Tabs */}
        <div
          role="tablist"
          aria-label="Latest Apps and Games Filter Tabs"
          className="flex items-center gap-1.5 p-1.5 bg-white dark:bg-[#152046] border border-slate-200/80 dark:border-white/10 rounded-2xl mb-6 overflow-x-auto"
        >
          {(
            [
              { id: 'latest-apps', label: 'Latest Apps' },
              { id: 'latest-games', label: 'Latest Games' },
              { id: 'most-downloaded', label: 'Most Downloaded' },
              { id: 'recently-updated', label: 'Recently Updated' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#16C653] text-white dark:text-[#0B1229] shadow-xs'
                  : 'text-[#64748B] dark:text-slate-300 hover:text-[#111827] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {latestTabItems.map((app) => (
            <LatestAppCard key={app.id} app={app} />
          ))}
        </div>
      </section>
    </main>
  );
}
