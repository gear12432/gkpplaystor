'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CitizenCalculator } from '@/components/CitizenCalculator';

export default function CitizenCalculatorPage() {
  const router = useRouter();
  return (
    <main className="flex-1 bg-[#F5F8FF] dark:bg-[#0B1229] py-2 sm:py-6 px-0 sm:px-4">
      <CitizenCalculator
        onSwitchToStore={() => router.push('/')}
        onSwitchToAdmin={() => router.push('/admin')}
      />
    </main>
  );
}
