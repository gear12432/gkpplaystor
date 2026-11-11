'use client';

import React, { useState } from 'react';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Mail,
  ShieldCheck,
  Clock,
} from 'lucide-react';

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export function ContactFormClient() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [websiteHoneypot, setWebsiteHoneypot] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};
    if (name.trim().length < 2) {
      nextErrors.name = 'Please enter your name (at least 2 characters).';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Please enter a valid email address.';
    }
    if (subject.trim().length < 3) {
      nextErrors.subject = 'Please enter a subject (at least 3 characters).';
    }
    if (message.trim().length < 10) {
      nextErrors.message =
        'Please enter a detailed message (at least 10 characters).';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
          websiteHoneypot,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit form.');
      }
      setSubmittedTicket(data.ticketId || 'APKHUB-VERIFIED');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setErrors({});
    } catch (err) {
      setServerError(
        err instanceof Error
          ? err.message
          : 'Unable to submit message right now. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left 7 Columns: Contact Form */}
      <div className="lg:col-span-7 bg-white dark:bg-[#152046] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xs">
        {submittedTicket ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#16C653]/15 text-[#16C653] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#111827] dark:text-white">
              Message Sent Successfully!
            </h2>
            <p className="text-sm text-[#64748B] dark:text-slate-300 max-w-md mx-auto leading-relaxed">
              Thank you for contacting APK Hub. Your reference ticket ID is{' '}
              <span className="font-mono font-bold text-[#111827] dark:text-[#75E85C]">
                {submittedTicket}
              </span>
              . Our team will respond to your email shortly.
            </p>
            <button
              type="button"
              onClick={() => setSubmittedTicket(null)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#16C653] text-white dark:text-[#0B1229] text-xs font-extrabold cursor-pointer"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <h2 className="text-xl font-extrabold text-[#111827] dark:text-white">
                Send Us a Message
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-300 mt-1">
                No account or login is required to contact our support and
                package verification team.
              </p>
            </div>

            {serverError && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-center gap-2.5 text-xs sm:text-sm text-rose-700 dark:text-rose-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Honeypot field hidden from human users */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="websiteHoneypot">Website</label>
              <input
                id="websiteHoneypot"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={websiteHoneypot}
                onChange={(e) => setWebsiteHoneypot(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="contact-name"
                  className="block text-xs font-bold text-[#111827] dark:text-slate-200 mb-1.5"
                >
                  Your Name *
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivera"
                  className="w-full px-4 py-3 rounded-xl bg-[#F5F8FF] dark:bg-[#0B1229] border border-slate-200 dark:border-white/10 text-sm text-[#111827] dark:text-white focus:border-[#16C653] focus:outline-none"
                />
                {errors.name && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="contact-email"
                  className="block text-xs font-bold text-[#111827] dark:text-slate-200 mb-1.5"
                >
                  Email Address *
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-[#F5F8FF] dark:bg-[#0B1229] border border-slate-200 dark:border-white/10 text-sm text-[#111827] dark:text-white focus:border-[#16C653] focus:outline-none"
                />
                {errors.email && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="contact-subject"
                className="block text-xs font-bold text-[#111827] dark:text-slate-200 mb-1.5"
              >
                Subject *
              </label>
              <input
                id="contact-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Open-Source APK Submission / Checksum Inquiry / DMCA"
                className="w-full px-4 py-3 rounded-xl bg-[#F5F8FF] dark:bg-[#0B1229] border border-slate-200 dark:border-white/10 text-sm text-[#111827] dark:text-white focus:border-[#16C653] focus:outline-none"
              />
              {errors.subject && (
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                  {errors.subject}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="contact-message"
                className="block text-xs font-bold text-[#111827] dark:text-slate-200 mb-1.5"
              >
                Message *
              </label>
              <textarea
                id="contact-message"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message, package details, or feedback here..."
                className="w-full px-4 py-3 rounded-xl bg-[#F5F8FF] dark:bg-[#0B1229] border border-slate-200 dark:border-white/10 text-sm text-[#111827] dark:text-white focus:border-[#16C653] focus:outline-none resize-y"
              />
              {errors.message && (
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                  {errors.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-[#16C653] hover:bg-[#13b149] disabled:opacity-60 text-white dark:text-[#0B1229] font-extrabold text-sm shadow-md transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Sending Message...' : 'Submit Message'}</span>
            </button>
          </form>
        )}
      </div>

      {/* Right 5 Columns: Support Channels & Transparency */}
      <aside className="lg:col-span-5 space-y-6">
        <div className="bg-white dark:bg-[#152046] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="w-11 h-11 rounded-2xl bg-[#16C653]/15 text-[#16C653] flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-extrabold text-[#111827] dark:text-white">
            Direct Support &amp; Inquiries
          </h3>
          <p className="text-sm text-[#64748B] dark:text-slate-300 leading-relaxed">
            Whether you are an Android developer submitting an authorized
            open-source APK or a user reporting a broken upstream mirror, our
            team reviews every submission.
          </p>
          <div className="pt-2 space-y-2 text-xs sm:text-sm text-[#111827] dark:text-slate-200">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#16C653]" />
              <span>Average Response Time: Under 24 Hours</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#16C653]" />
              <span>Spam-Protected &amp; No Account Required</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
