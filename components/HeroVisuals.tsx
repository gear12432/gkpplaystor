import React from 'react';
import Link from 'next/link';
import {
  Bot,
  Download,
  ShieldCheck,
  MessageCircle,
  Send,
  Music,
  Play,
  Rocket,
  CheckCircle2,
  Cpu,
} from 'lucide-react';

export function HeroSmartphoneAndMascot() {
  return (
    <div className="relative w-full max-w-md mx-auto lg:max-w-none flex items-center justify-center py-4 select-none">
      {/* Ambient background glow */}
      <div
        className="absolute -inset-4 bg-gradient-to-tr from-[#6829E8]/40 via-[#16C653]/25 to-transparent rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Main composition container */}
      <div className="relative z-10 w-full max-w-[420px] aspect-[11/10] flex items-center justify-center">
        {/* Smartphone Mockup Frame */}
        <div className="relative w-56 sm:w-64 bg-gradient-to-b from-[#1E293B] to-[#0F172A] rounded-[2.25rem] p-2.5 shadow-2xl border border-white/20 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
          {/* Dynamic Island / Speaker */}
          <div className="w-20 h-4 bg-black/70 rounded-full mx-auto mb-2 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-slate-700" />
          </div>

          {/* Screen UI */}
          <div className="bg-[#101A3A] rounded-[1.75rem] p-4 space-y-3.5 border border-white/10">
            {/* Top Bar inside phone */}
            <div className="flex items-center justify-between text-[11px] text-slate-300 font-semibold">
              <span>APK Hub Store</span>
              <span className="text-[#75E85C] inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                SHA-256
              </span>
            </div>

            {/* Featured App Card inside phone */}
            <div className="bg-gradient-to-br from-[#172554] to-[#6829E8]/60 rounded-2xl p-3 border border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#16C653] to-[#75E85C] flex items-center justify-center text-[#101A3A] font-extrabold shadow">
                  <Bot className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">
                    Telegram Android
                  </div>
                  <div className="text-[10px] text-[#75E85C] tabular-nums">
                    v11.4.2 · 71.2 MB
                  </div>
                </div>
              </div>

              <div className="mt-2.5 w-full bg-black/30 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-[#16C653] to-[#75E85C] w-full h-full rounded-full" />
              </div>

              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-200">
                <span className="inline-flex items-center gap-1 text-[#75E85C] font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  Ready to Install
                </span>
                <span className="font-mono">100%</span>
              </div>
            </div>

            {/* Mini app list inside phone */}
            <div className="space-y-2">
              <Link
                href="/app/whatsapp-messenger"
                className="flex items-center justify-between bg-white/5 hover:bg-white/10 rounded-xl p-2 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[#25D366] flex items-center justify-center text-white">
                    <MessageCircle className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="text-[11px] font-bold text-white leading-tight">
                      WhatsApp
                    </div>
                    <div className="text-[9px] text-slate-400">64.8 MB · APK</div>
                  </div>
                </div>
                <span className="w-6 h-6 rounded-lg bg-[#16C653] text-[#101A3A] flex items-center justify-center">
                  <Download className="w-3.5 h-3.5" />
                </span>
              </Link>

              <Link
                href="/app/vlc-for-android"
                className="flex items-center justify-between bg-white/5 hover:bg-white/10 rounded-xl p-2 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[#FF8800] flex items-center justify-center text-white">
                    <Cpu className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="text-[11px] font-bold text-white leading-tight">
                      VLC Player
                    </div>
                    <div className="text-[9px] text-slate-400">41.6 MB · FOSS</div>
                  </div>
                </div>
                <span className="w-6 h-6 rounded-lg bg-[#16C653] text-[#101A3A] flex items-center justify-center">
                  <Download className="w-3.5 h-3.5" />
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* 3D-Styled Android Mascot Character overlapping right side */}
        <div className=" -ml-8 sm:-ml-10 z-20 flex flex-col items-center transform translate-y-4">
          <svg
            viewBox="0 0 180 200"
            className="w-36 h-40 sm:w-44 sm:h-48 drop-shadow-2xl"
            role="img"
            aria-label="3D Android Mascot Illustration"
          >
            <defs>
              <linearGradient id="android3dHead" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9EF87A" />
                <stop offset="50%" stopColor="#16C653" />
                <stop offset="100%" stopColor="#0D8A38" />
              </linearGradient>
              <linearGradient id="android3dBody" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#75E85C" />
                <stop offset="60%" stopColor="#16C653" />
                <stop offset="100%" stopColor="#0A6E2B" />
              </linearGradient>
              <linearGradient id="androidBellyBadge" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#172554" />
                <stop offset="100%" stopColor="#101A3A" />
              </linearGradient>
            </defs>

            {/* Antennae */}
            <line
              x1="62"
              y1="28"
              x2="48"
              y2="10"
              stroke="#75E85C"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <line
              x1="118"
              y1="28"
              x2="132"
              y2="10"
              stroke="#75E85C"
              strokeWidth="6"
              strokeLinecap="round"
            />

            {/* Dome Head */}
            <path
              d="M 42 74 A 48 46 0 0 1 138 74 Z"
              fill="url(#android3dHead)"
            />
            {/* 3D Highlight on head */}
            <ellipse
              cx="72"
              cy="44"
              rx="18"
              ry="7"
              fill="#FFFFFF"
              fillOpacity="0.35"
              transform="rotate(-15 72 44)"
            />

            {/* Visor Eyes */}
            <rect
              x="58"
              y="46"
              width="64"
              height="18"
              rx="9"
              fill="#101A3A"
            />
            <circle cx="74" cy="55" r="5" fill="#75E85C" />
            <circle cx="106" cy="55" r="5" fill="#75E85C" />

            {/* Left & Right Arms */}
            <rect
              x="16"
              y="80"
              width="20"
              height="56"
              rx="10"
              fill="url(#android3dBody)"
              transform="rotate(10 26 80)"
            />
            <rect
              x="144"
              y="76"
              width="20"
              height="56"
              rx="10"
              fill="url(#android3dBody)"
              transform="rotate(-18 154 76)"
            />

            {/* Torso */}
            <path
              d="M 42 80 L 138 80 L 138 138 A 16 16 0 0 1 122 154 L 58 154 A 16 16 0 0 1 42 138 Z"
              fill="url(#android3dBody)"
            />

            {/* APK Chest Emblem */}
            <rect
              x="63"
              y="96"
              width="54"
              height="38"
              rx="10"
              fill="url(#androidBellyBadge)"
              stroke="#75E85C"
              strokeWidth="2"
            />
            <text
              x="90"
              y="120"
              textAnchor="middle"
              fill="#75E85C"
              fontSize="15"
              fontWeight="800"
              fontFamily="sans-serif"
            >
              APK
            </text>

            {/* Legs */}
            <rect
              x="60"
              y="150"
              width="22"
              height="34"
              rx="11"
              fill="url(#android3dBody)"
            />
            <rect
              x="98"
              y="150"
              width="22"
              height="34"
              rx="11"
              fill="url(#android3dBody)"
            />
          </svg>
        </div>

        {/* Floating App Icons */}
        <Link
          href="/app/telegram-android"
          title="Telegram APK"
          className="absolute top-2 left-2 sm:left-4 w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2AABEE] to-[#229ED9] flex items-center justify-center text-white shadow-xl border border-white/25 hover:scale-110 transition-transform"
        >
          <Send className="w-6 h-6 -translate-x-0.5 translate-y-0.5" />
        </Link>

        <Link
          href="/app/spotify-music"
          title="Spotify"
          className="absolute -top-2 right-8 sm:right-12 w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1DB954] to-[#15883E] flex items-center justify-center text-white shadow-xl border border-white/25 hover:scale-110 transition-transform"
        >
          <Music className="w-6 h-6" />
        </Link>

        <Link
          href="/app/youtube"
          title="YouTube"
          className="absolute bottom-2 left-4 sm:left-8 w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FF0000] to-[#CC0000] flex items-center justify-center text-white shadow-xl border border-white/25 hover:scale-110 transition-transform"
        >
          <Play className="w-5 h-5 fill-white" />
        </Link>
      </div>
    </div>
  );
}

export function PromoRocketIllustration() {
  return (
    <div className="relative flex items-center justify-center select-none">
      <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center shadow-2xl relative">
        <svg
          viewBox="0 0 120 120"
          className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-lg"
          role="img"
          aria-label="3D Rocket Illustration"
        >
          <defs>
            <linearGradient id="rocketBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E2E8F0" />
            </linearGradient>
            <linearGradient id="rocketNose" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6829E8" />
              <stop offset="100%" stopColor="#101A3A" />
            </linearGradient>
            <linearGradient id="rocketFlame" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FACC15" />
              <stop offset="100%" stopColor="#F97316" />
            </linearGradient>
          </defs>
          {/* Exhaust Flame */}
          <path
            d="M 48 88 Q 60 116 72 88 Z"
            fill="url(#rocketFlame)"
          />
          {/* Fins */}
          <path d="M 38 66 L 22 86 L 42 84 Z" fill="url(#rocketNose)" />
          <path d="M 82 66 L 98 86 L 78 84 Z" fill="url(#rocketNose)" />
          {/* Rocket Body */}
          <path
            d="M 60 14 C 78 34 82 62 78 86 L 42 86 C 38 62 42 34 60 14 Z"
            fill="url(#rocketBody)"
          />
          {/* Nose Cone */}
          <path
            d="M 60 14 C 68 23 73 33 75 42 L 45 42 C 47 33 52 23 60 14 Z"
            fill="url(#rocketNose)"
          />
          {/* Window */}
          <circle
            cx="60"
            cy="58"
            r="11"
            fill="#101A3A"
            stroke="#16C653"
            strokeWidth="3.5"
          />
          <circle cx="57" cy="55" r="3.5" fill="#75E85C" />
        </svg>
        <span className="absolute -top-2 -right-2 w-9 h-9 rounded-xl bg-[#101A3A] text-[#75E85C] flex items-center justify-center shadow-lg border border-white/20">
          <Rocket className="w-4 h-4" />
        </span>
      </div>
    </div>
  );
}
