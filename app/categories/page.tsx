import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { CatalogExplorer } from '@/components/CatalogExplorer';

export const metadata: Metadata = {
  title: 'Browse APK Categories – APK Hub',
  description:
    'Explore 12 Android APK categories including Social Media, Games, Productivity, Entertainment, Tools, Photography, Education, Communication, Music & Audio, Lifestyle, Business, and Security.',
};

export default function CategoriesPage() {
  return (
    <main className="flex-1">
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 py-12 text-sm text-slate-500">
            Loading APK Categories...
          </div>
        }
      >
        <CatalogExplorer
          initialType="all"
          title="Browse All 12 APK Categories"
          subtitle="Click any category below to filter Android applications and games by topic, developer, or release date."
          showCategoryCards={true}
        />
      </Suspense>
    </main>
  );
}
