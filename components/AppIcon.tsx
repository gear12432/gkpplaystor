import React from 'react';
import {
  MessageCircle,
  Send,
  Camera,
  Play,
  Ghost,
  Music,
  Cone,
  Package,
  ShieldCheck,
  Tv,
  Compass,
  Lock,
  Gamepad2,
  Swords,
  Box,
  Mail,
  Image as ImageIcon,
  GraduationCap,
  Cloud,
  Headphones,
  Smartphone,
} from 'lucide-react';
import { ApkItem } from '@/lib/apk-data';

interface AppIconProps {
  app: Pick<ApkItem, 'name' | 'iconStyle'>;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function AppIcon({ app, size = 'md', className = '' }: AppIconProps) {
  const sizeClasses = {
    sm: 'w-11 h-11 rounded-xl',
    md: 'w-14 h-14 rounded-2xl',
    lg: 'w-20 h-20 rounded-2xl',
    xl: 'w-24 h-24 sm:w-28 sm:h-28 rounded-3xl',
  }[size];

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12 sm:w-14 sm:h-14',
  }[size];

  const glyph = app.iconStyle.glyph;
  const isSnap = glyph === 'snapchat';

  const renderGlyph = () => {
    const commonClass = `${iconSizes} ${isSnap ? 'text-slate-900' : 'text-white'} drop-shadow-sm`;
    switch (glyph) {
      case 'whatsapp':
        return <MessageCircle className={commonClass} strokeWidth={2.3} />;
      case 'telegram':
        return <Send className={`${commonClass} -translate-x-0.5 translate-y-0.5`} strokeWidth={2.2} />;
      case 'instagram':
        return <Camera className={commonClass} strokeWidth={2.2} />;
      case 'youtube':
        return <Play className={`${commonClass} fill-white`} strokeWidth={2} />;
      case 'snapchat':
        return <Ghost className={commonClass} strokeWidth={2.3} />;
      case 'spotify':
        return <Music className={commonClass} strokeWidth={2.3} />;
      case 'vlc':
        return <Cone className={commonClass} strokeWidth={2.3} />;
      case 'fdroid':
        return <Package className={commonClass} strokeWidth={2.2} />;
      case 'signal':
        return <MessageCircle className={commonClass} strokeWidth={2.3} />;
      case 'newpipe':
        return <Tv className={commonClass} strokeWidth={2.2} />;
      case 'map':
        return <Compass className={commonClass} strokeWidth={2.2} />;
      case 'shield':
        return <Lock className={commonClass} strokeWidth={2.2} />;
      case 'gamepad':
        return <Gamepad2 className={commonClass} strokeWidth={2.2} />;
      case 'sword':
        return <Swords className={commonClass} strokeWidth={2.2} />;
      case 'cube':
        return <Box className={commonClass} strokeWidth={2.4} />;
      case 'mail':
        return <Mail className={commonClass} strokeWidth={2.2} />;
      case 'camera':
        return <ImageIcon className={commonClass} strokeWidth={2.2} />;
      case 'education':
        return <GraduationCap className={commonClass} strokeWidth={2.2} />;
      case 'cloud':
        return <Cloud className={commonClass} strokeWidth={2.2} />;
      case 'headphones':
        return <Headphones className={commonClass} strokeWidth={2.2} />;
      default:
        return <Smartphone className={commonClass} strokeWidth={2.2} />;
    }
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 bg-gradient-to-br ${app.iconStyle.bgGradient} ${sizeClasses} shadow-md select-none overflow-hidden ${className}`}
      aria-label={`${app.name} application icon`}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/25 pointer-events-none" />
      <div className="relative z-10 flex items-center justify-center">
        {renderGlyph()}
      </div>
      <div className="absolute bottom-1 right-1.5 text-[9px] font-bold tracking-tighter uppercase opacity-60 text-white mix-blend-overlay pointer-events-none">
        APK
      </div>
    </div>
  );
}
