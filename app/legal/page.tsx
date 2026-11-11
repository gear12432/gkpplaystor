import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, FileText, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy, Terms & Disclaimer – APK Hub',
  description:
    'Read APK Hub Privacy Policy, Terms & Conditions, and Copyright / DMCA Disclaimer.',
};

export default function LegalPage() {
  return (
    <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      <div className="bg-gradient-to-br from-[#101A3A] via-[#172554] to-[#6829E8] rounded-3xl p-6 sm:p-10 text-white space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-[#75E85C]">
          Legal &amp; Compliance
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          Privacy Policy, Terms &amp; Disclaimer
        </h1>
        <p className="text-sm sm:text-base text-slate-200">
          Transparent policies governing privacy, authorized open-source APK
          distribution, and intellectual property rights.
        </p>
      </div>

      {/* Privacy Policy */}
      <section
        id="privacy"
        className="bg-white dark:bg-[#152046] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-4"
      >
        <div className="flex items-center gap-2.5 text-lg sm:text-xl font-extrabold text-[#111827] dark:text-white">
          <ShieldCheck className="w-5 h-5 text-[#16C653]" />
          <h2>Privacy Policy</h2>
        </div>
        <p className="text-sm text-[#64748B] dark:text-slate-300 leading-relaxed">
          APK Hub operates on a strict zero-registration model. We do not
          require or offer user accounts, login credentials, or personal
          profiles. Your theme preference (Light or Dark Mode) is stored locally
          in your browser&apos;s <code>localStorage</code> and is never
          transmitted to external tracking networks.
        </p>
        <p className="text-sm text-[#64748B] dark:text-slate-300 leading-relaxed">
          If you voluntarily submit an inquiry through our Contact Us form, the
          name, email address, and message you provide are used solely to reply
          to your support request.
        </p>
      </section>

      {/* Terms & Conditions */}
      <section
        id="terms"
        className="bg-white dark:bg-[#152046] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-4"
      >
        <div className="flex items-center gap-2.5 text-lg sm:text-xl font-extrabold text-[#111827] dark:text-white">
          <FileText className="w-5 h-5 text-[#16C653]" />
          <h2>Terms &amp; Conditions</h2>
        </div>
        <p className="text-sm text-[#64748B] dark:text-slate-300 leading-relaxed">
          By accessing APK Hub, you agree to use the platform for lawful
          purposes only. APK files downloaded from authorized open-source and
          official direct distributions are provided under their respective
          open-source or vendor licenses (such as GNU GPL, Apache 2.0, MIT, or
          official vendor terms). Always verify your device compatibility
          (Minimum Android SDK and architecture) prior to installation.
        </p>
      </section>

      {/* Disclaimer & Copyright Policy */}
      <section
        id="disclaimer"
        className="bg-white dark:bg-[#152046] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-4"
      >
        <div className="flex items-center gap-2.5 text-lg sm:text-xl font-extrabold text-[#111827] dark:text-white">
          <AlertTriangle className="w-5 h-5 text-[#16C653]" />
          <h2>Copyright &amp; Security Disclaimer</h2>
        </div>
        <p className="text-sm text-[#64748B] dark:text-slate-300 leading-relaxed">
          Android is a trademark of Google LLC. All third-party product names,
          trademarks, and registered brands remain the property of their
          respective owners. APK Hub strictly prohibits the unauthorized
          redistribution of copyrighted commercial applications: proprietary
          catalog entries are clearly marked as UI preview samples and link
          users directly to the official developer website.
        </p>
        <div className="pt-2">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#16C653] text-white dark:text-[#0B1229] text-xs font-extrabold"
          >
            Contact Compliance Team
          </Link>
        </div>
      </section>
    </main>
  );
}
