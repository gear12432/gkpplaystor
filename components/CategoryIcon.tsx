import React from 'react';
import {
  Share2,
  Gamepad2,
  Briefcase,
  Film,
  Wrench,
  Camera,
  GraduationCap,
  MessageSquare,
  Headphones,
  Compass,
  Building2,
  ShieldCheck,
  Folder,
} from 'lucide-react';

export function CategoryIcon({
  iconName,
  className = 'w-6 h-6',
}: {
  iconName: string;
  className?: string;
}) {
  switch (iconName) {
    case 'Share2':
      return <Share2 className={className} />;
    case 'Gamepad2':
      return <Gamepad2 className={className} />;
    case 'Briefcase':
      return <Briefcase className={className} />;
    case 'Film':
      return <Film className={className} />;
    case 'Wrench':
      return <Wrench className={className} />;
    case 'Camera':
      return <Camera className={className} />;
    case 'GraduationCap':
      return <GraduationCap className={className} />;
    case 'MessageSquare':
      return <MessageSquare className={className} />;
    case 'Headphones':
      return <Headphones className={className} />;
    case 'Compass':
      return <Compass className={className} />;
    case 'Building2':
      return <Building2 className={className} />;
    case 'ShieldCheck':
      return <ShieldCheck className={className} />;
    default:
      return <Folder className={className} />;
  }
}
