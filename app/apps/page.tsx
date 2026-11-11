import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { CatalogExplorer } from '@/components/CatalogExplorer';

export const metadata: Metadata = {
  title: 'Download Android Apps APK – APK Hub',
  description:
    'Browse and download Android applications across communication, productivity, security, entertainment, and tools on APK Hub.',
};

export default function AppsPage() {
  return (
    <main className="flex-1">
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 py-12 text-sm text-slate-500">
            Loading Android Apps catalog...
          </div>
        }
      >
        <CatalogExplorer
          initialType="app"
          title="Android Applications Catalog"
          subtitle="Browse verified open-source Android apps, official standalone installers, and popular utilities with full version and permission transparency."
        />
      </Suspense>
    </main>
  );
}
