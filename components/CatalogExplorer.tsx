'use client';

import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  X,
  SlidersHorizontal,
  ShieldCheck,
} from 'lucide-react';
import { APK_ITEMS, CATEGORIES } from '@/lib/apk-data';
import { LatestAppCard } from '@/components/AppCard';
import { CategoryIcon } from '@/components/CategoryIcon';

type SortOption = 'updated' | 'downloads' | 'popularity' | 'name';

interface CatalogExplorerProps {
  initialType?: 'all' | 'app' | 'game';
  title: string;
  subtitle: string;
  showCategoryCards?: boolean;
}

export function CatalogExplorer({
  initialType = 'all',
  title,
  subtitle,
  showCategoryCards = false,
}: CatalogExplorerProps) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const filterParam = searchParams.get('filter');
  const queryParam = searchParams.get('q');

  const [searchQuery, setSearchQuery] = useState(queryParam || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    categoryParam || 'All'
  );
  const [selectedType, setSelectedType] = useState<'all' | 'app' | 'game'>(
    initialType
  );
  const [onlyAuthorized, setOnlyAuthorized] = useState<boolean>(
    filterParam === 'authorized'
  );
  const [sortBy, setSortBy] = useState<SortOption>('popularity');

  const [prevCategoryParam, setPrevCategoryParam] = useState(categoryParam);
  if (categoryParam !== prevCategoryParam) {
    setPrevCategoryParam(categoryParam);
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }

  const [prevFilterParam, setPrevFilterParam] = useState(filterParam);
  if (filterParam !== prevFilterParam) {
    setPrevFilterParam(filterParam);
    setOnlyAuthorized(filterParam === 'authorized');
  }

  const [prevQueryParam, setPrevQueryParam] = useState(queryParam);
  if (queryParam !== prevQueryParam) {
    setPrevQueryParam(queryParam);
    if (queryParam !== null) {
      setSearchQuery(queryParam);
    }
  }

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const matches = APK_ITEMS.filter((item) => {
      const matchesQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.developer.toLowerCase().includes(q) ||
        item.packageName.toLowerCase().includes(q) ||
        item.shortDescription.toLowerCase().includes(q);

      const matchesCategory =
        selectedCategory === 'All' ||
        item.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesType =
        selectedType === 'all' || item.type === selectedType;

      const matchesAuth = !onlyAuthorized || item.isAuthorizedDirectApk;

      return matchesQuery && matchesCategory && matchesType && matchesAuth;
    });

    return [...matches].sort((a, b) => {
      if (sortBy === 'updated') return b.updatedTimestamp - a.updatedTimestamp;
      if (sortBy === 'downloads') {
        return (
          (b.isMostDownloaded ? 1 : 0) - (a.isMostDownloaded ? 1 : 0) ||
          b.popularityScore - a.popularityScore
        );
      }
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return b.popularityScore - a.popularityScore;
    });
  }, [searchQuery, selectedCategory, selectedType, onlyAuthorized, sortBy]);

  const resetAll = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedType(initialType);
    setOnlyAuthorized(false);
    setSortBy('popularity');
  };

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Header Banner */}
      <div className="bg-gradient-to-br from-[#101A3A] via-[#172554] to-[#6829E8] rounded-3xl p-6 sm:p-10 text-white shadow-lg">
        <div className="max-w-3xl space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-[#75E85C]">
            APK Hub Directory
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {selectedCategory !== 'All' ? `${selectedCategory} APKs` : title}
          </h1>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Search Input inside Header */}
        <div className="mt-6 max-w-2xl">
          <div className="flex items-center bg-white dark:bg-[#0B1229] rounded-2xl p-1.5 border border-white/20">
            <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by app name, game, category, or developer..."
              aria-label="Search catalog"
              className="w-full px-3 py-2.5 text-sm sm:text-base text-[#111827] dark:text-white bg-transparent focus:outline-none placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="p-2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Optional 12 Category Cards Selector Grid */}
      {showCategoryCards && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#111827] dark:text-white">
              Select a Category
            </h2>
            {selectedCategory !== 'All' && (
              <button
                type="button"
                onClick={() => setSelectedCategory('All')}
                className="text-xs font-bold text-[#16C653] hover:underline cursor-pointer"
              >
                Show All Categories
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {CATEGORIES.map((cat) => {
              const isSelected =
                selectedCategory.toLowerCase() === cat.name.toLowerCase();
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    setSelectedCategory(isSelected ? 'All' : cat.name)
                  }
                  className={`text-left rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#101A3A] text-white border-[#16C653] ring-2 ring-[#16C653]'
                      : 'bg-white dark:bg-[#152046] text-[#111827] dark:text-white border-slate-200/80 dark:border-white/10 hover:border-[#16C653]'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.gradient} text-white flex items-center justify-center shadow-xs`}
                  >
                    <CategoryIcon iconName={cat.iconName} className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">{cat.name}</div>
                    <div
                      className={`text-xs mt-0.5 tabular-nums ${
                        isSelected
                          ? 'text-[#75E85C]'
                          : 'text-[#64748B] dark:text-slate-400'
                      }`}
                    >
                      {cat.appCount} Apps
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Filter & Sort Control Bar */}
      <div className="bg-white dark:bg-[#152046] border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#111827] dark:text-white mr-2">
            <SlidersHorizontal className="w-4 h-4 text-[#16C653]" />
            <span className="tabular-nums">{filteredItems.length} Packages</span>
          </div>

          {/* App / Game Segmented Control */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-[#0B1229]">
            {(['all', 'app', 'game'] as const).map((typeOpt) => (
              <button
                key={typeOpt}
                type="button"
                onClick={() => setSelectedType(typeOpt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedType === typeOpt
                    ? 'bg-[#16C653] text-white dark:text-[#0B1229]'
                    : 'text-[#64748B] dark:text-slate-300 hover:text-[#111827] dark:hover:text-white'
                }`}
              >
                {typeOpt === 'all'
                  ? 'All'
                  : typeOpt === 'app'
                  ? 'Apps'
                  : 'Games'}
              </button>
            ))}
          </div>

          {/* Authorized APK Filter Toggle */}
          <button
            type="button"
            onClick={() => setOnlyAuthorized(!onlyAuthorized)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              onlyAuthorized
                ? 'bg-[#16C653] text-white dark:text-[#0B1229]'
                : 'bg-slate-100 dark:bg-[#0B1229] text-[#64748B] dark:text-slate-300 hover:text-[#111827]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Authorized Direct APKs Only</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Filter by category"
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#0B1229] text-xs font-semibold text-[#111827] dark:text-white focus:outline-none cursor-pointer"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            aria-label="Sort applications by"
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#0B1229] text-xs font-semibold text-[#111827] dark:text-white focus:outline-none cursor-pointer"
          >
            <option value="popularity">Sort: Popularity</option>
            <option value="updated">Sort: Latest Updated</option>
            <option value="downloads">Sort: Most Downloaded</option>
            <option value="name">Sort: Application Name (A-Z)</option>
          </select>

          {(searchQuery ||
            selectedCategory !== 'All' ||
            onlyAuthorized ||
            selectedType !== initialType) && (
            <button
              type="button"
              onClick={resetAll}
              className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300 text-xs font-bold cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Results Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredItems.map((app) => (
            <LatestAppCard key={app.id} app={app} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#152046] border border-slate-200/80 dark:border-white/10 rounded-3xl p-12 text-center space-y-3">
          <h3 className="text-lg font-extrabold text-[#111827] dark:text-white">
            No Matching Applications Found
          </h3>
          <p className="text-sm text-[#64748B] dark:text-slate-300 max-w-md mx-auto">
            No APK packages matched your current search or filter settings.
          </p>
          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#16C653] text-white dark:text-[#0B1229] text-xs font-bold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
