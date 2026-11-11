'use client';

import React, { useState } from 'react';
import {
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Play,
  Music,
  ShieldCheck,
  Compass,
  Gamepad2,
  Globe,
  Layers,
} from 'lucide-react';
import { AppScreenshot } from '@/lib/apk-data';

export function ScreenshotGallery({
  appName,
  screenshots,
}: {
  appName: string;
  screenshots: AppScreenshot[];
}) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const renderMockScreenContent = (shot: AppScreenshot) => {
    switch (shot.uiType) {
      case 'chat':
        return (
          <div className="space-y-2.5 mt-3">
            <div className="w-3/4 rounded-2xl rounded-tl-xs bg-white/15 p-2.5 text-[11px] text-white/90">
              End-to-end encrypted channel initialized.
            </div>
            <div
              className="w-4/5 ml-auto rounded-2xl rounded-tr-xs p-2.5 text-[11px] text-white font-medium shadow-xs"
              style={{ backgroundColor: shot.accentColor }}
            >
              Verified APK build synced across Android devices.
            </div>
            <div className="w-2/3 rounded-2xl rounded-tl-xs bg-white/10 p-2 text-[10px] text-white/75 flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
              <span>Voice Note · 0:24 (HD Opus)</span>
            </div>
          </div>
        );
      case 'video':
        return (
          <div className="mt-3 space-y-2.5">
            <div className="aspect-video rounded-xl bg-black/50 border border-white/15 flex items-center justify-center relative overflow-hidden">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-white shadow-lg"
                style={{ backgroundColor: shot.accentColor }}
              >
                <Play className="w-5 h-5 fill-white ml-0.5" />
              </div>
              <div className="absolute bottom-2 left-2 right-2 h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full w-2/3 rounded-full"
                  style={{ backgroundColor: shot.accentColor }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-white/75 font-mono">
              <span>4K 60FPS HDR10+</span>
              <span>AV1 Hardware Codec</span>
            </div>
          </div>
        );
      case 'music':
        return (
          <div className="mt-3 space-y-3">
            <div className="flex items-center gap-3 bg-white/10 rounded-xl p-2.5">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0"
                style={{ backgroundColor: shot.accentColor }}
              >
                <Music className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">
                  Lossless Audio Stream
                </div>
                <div className="text-[10px] text-white/70">
                  24-bit / 96kHz FLAC Equalizer
                </div>
              </div>
            </div>
            <div className="grid grid-cols-6 gap-1.5 items-end h-10 px-2">
              {[45, 80, 60, 95, 70, 50].map((h, i) => (
                <div
                  key={i}
                  className="rounded-t"
                  style={{
                    height: `${h}%`,
                    backgroundColor: shot.accentColor,
                  }}
                />
              ))}
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="mt-3 space-y-2.5">
            <div className="rounded-xl bg-emerald-500/15 border border-emerald-400/30 p-3 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#75E85C] shrink-0" />
              <div className="text-[11px] text-white">
                <div className="font-bold">AES-256 &amp; SHA-256 Verified</div>
                <div className="text-white/70 text-[10px]">
                  Zero third-party trackers active
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-black/40 p-2 font-mono text-[10px] text-[#75E85C] truncate">
              sha256: 8f434346648f6b96df89dda901c5176b...
            </div>
          </div>
        );
      case 'map':
        return (
          <div className="mt-3 space-y-2">
            <div className="h-24 rounded-xl bg-emerald-950/60 border border-emerald-500/30 p-3 flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between text-[10px] text-emerald-300 font-semibold">
                <span>Offline OpenStreetMap</span>
                <span>GPS Locked</span>
              </div>
              <div className="flex items-center gap-2 text-white text-xs font-bold">
                <Compass className="w-4 h-4 text-[#75E85C]" />
                <span>Turn-by-Turn Trail Route</span>
              </div>
            </div>
          </div>
        );
      case 'game':
        return (
          <div className="mt-3 space-y-2">
            <div className="h-24 rounded-xl bg-black/45 border border-white/15 p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] text-amber-300 font-mono">
                <span>120 FPS VULKAN</span>
                <span>OFFLINE READY</span>
              </div>
              <div className="flex items-center gap-2 text-white text-xs font-bold">
                <Gamepad2 className="w-4 h-4 text-[#75E85C]" />
                <span>Interactive Campaign Mode</span>
              </div>
            </div>
          </div>
        );
      case 'browser':
        return (
          <div className="mt-3 space-y-2">
            <div className="rounded-lg bg-black/40 px-2.5 py-1.5 flex items-center gap-2 text-[10px] text-white/80 font-mono">
              <Globe className="w-3.5 h-3.5 text-[#75E85C]" />
              <span>https:// · Smarter Encryption Active</span>
            </div>
            <div className="rounded-xl bg-white/10 p-2.5 text-[11px] text-white/90">
              34 hidden ad &amp; profiling trackers blocked on this page.
            </div>
          </div>
        );
      default:
        return (
          <div className="mt-3 space-y-2">
            <div className="rounded-xl bg-white/10 p-3 flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-[#75E85C] shrink-0" />
              <div className="text-[11px] text-white">
                <div className="font-bold">Native Android Material UI</div>
                <div className="text-[10px] text-white/70">
                  Optimized for phones, foldables, and tablets
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {screenshots.map((shot, idx) => (
          <button
            key={shot.id}
            type="button"
            onClick={() => setSelectedIndex(idx)}
            className="group relative text-left rounded-2xl overflow-hidden border border-slate-200 dark:border-white/15 p-5 transition-transform duration-150 hover:-translate-y-0.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16C653]"
            style={{
              background: `linear-gradient(145deg, ${shot.secondaryColor} 0%, #101A3A 100%)`,
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-white/70">
                Screen 0{idx + 1} · {appName}
              </span>
              <span className="w-7 h-7 rounded-lg bg-white/10 group-hover:bg-[#16C653] group-hover:text-[#101A3A] text-white flex items-center justify-center transition-colors">
                <Maximize2 className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="mt-2">
              <h4 className="text-base font-bold text-white">{shot.title}</h4>
              <p className="text-xs text-slate-300 mt-0.5">{shot.subtitle}</p>
            </div>

            {renderMockScreenContent(shot)}
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && screenshots[selectedIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedIndex(null)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl p-6 sm:p-8 text-white border border-white/20 shadow-2xl"
            style={{
              background: `linear-gradient(145deg, ${screenshots[selectedIndex].secondaryColor} 0%, #101A3A 100%)`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/15">
              <div>
                <div className="text-xs text-[#75E85C] font-semibold">
                  {appName} · Screenshot {selectedIndex + 1} of{' '}
                  {screenshots.length}
                </div>
                <h3 className="text-xl font-extrabold mt-0.5">
                  {screenshots[selectedIndex].title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedIndex(null)}
                aria-label="Close screenshot preview"
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-6">
              <p className="text-sm text-slate-200 mb-4">
                {screenshots[selectedIndex].subtitle}
              </p>
              {renderMockScreenContent(screenshots[selectedIndex])}
            </div>

            {screenshots.length > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-white/15">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedIndex(
                      (selectedIndex - 1 + screenshots.length) %
                        screenshots.length
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedIndex((selectedIndex + 1) % screenshots.length)
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
