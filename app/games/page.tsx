import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { CatalogExplorer } from '@/components/CatalogExplorer';

export const metadata: Metadata = {
  title: 'Download Android Games APK – APK Hub',
  description:
    'Explore and download Android games including open-source strategy, RPG dungeon crawlers, and popular arcade titles on APK Hub.',
};

export default function GamesPage() {
  return (
    <main className="flex-1">
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 py-12 text-sm text-slate-500">
            Loading Android Games catalog...
          </div>
        }
      >
        <CatalogExplorer
          initialType="game"
          title="Android Games Catalog"
          subtitle="Discover open-source strategy games, roguelike RPGs, and trending mobile games for Android phones and tablets."
        />
      </Suspense>
    </main>
  );
}
