import React from 'react';
import type { Metadata } from 'next';
import { ContactFormClient } from '@/components/ContactFormClient';

export const metadata: Metadata = {
  title: 'Contact Us – APK Hub Support & Developer Submissions',
  description:
    'Contact the APK Hub team for open-source APK submissions, SHA-256 verification questions, or copyright inquiries without registering an account.',
};

export default function ContactPage() {
  return (
    <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="bg-gradient-to-br from-[#101A3A] via-[#172554] to-[#6829E8] rounded-3xl p-6 sm:p-10 text-white shadow-lg space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-[#75E85C]">
          Contact APK Hub
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          Get in Touch With Our Team
        </h1>
        <p className="text-sm sm:text-base text-slate-200 max-w-2xl leading-relaxed">
          Have questions about an Android package, want to submit an open-source
          release, or need to reach our compliance team? Fill out the form below.
        </p>
      </div>

      <ContactFormClient />
    </main>
  );
}
