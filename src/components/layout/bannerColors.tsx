import React from "react";
import {
  Megaphone,
  AlertTriangle,
  Sparkles,
  Flame,
  Crown,
  Info,
} from "lucide-react";
import { BannerColor } from "../../types/system.types";

export interface ColorStyle {
  container: string;
  badge: string;
  button: string;
  icon: React.ReactNode;
}

export const BANNER_COLOR_MAP: Record<BannerColor, ColorStyle> = {
  red: {
    container:
      "bg-gradient-to-r from-rose-700 via-red-600 to-rose-700 text-white shadow-md shadow-red-950/40 border-b border-rose-500/40",
    badge: "bg-black/20 text-white border-white/30",
    button:
      "bg-white text-rose-700 hover:bg-rose-50 hover:shadow-lg hover:shadow-black/20",
    icon: <Flame className="w-4 h-4 shrink-0 animate-pulse text-amber-300" />,
  },
  amber: {
    container:
      "bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white shadow-md shadow-amber-950/40 border-b border-amber-400/40",
    badge: "bg-black/20 text-white border-white/30",
    button:
      "bg-white text-amber-800 hover:bg-amber-50 hover:shadow-lg hover:shadow-black/20",
    icon: <AlertTriangle className="w-4 h-4 shrink-0 text-yellow-200" />,
  },
  emerald: {
    container:
      "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-md shadow-emerald-950/40 border-b border-emerald-400/40",
    badge: "bg-black/20 text-white border-white/30",
    button:
      "bg-white text-emerald-800 hover:bg-emerald-50 hover:shadow-lg hover:shadow-black/20",
    icon: <Sparkles className="w-4 h-4 shrink-0 text-emerald-200" />,
  },
  blue: {
    container:
      "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-md shadow-blue-950/40 border-b border-blue-400/40",
    badge: "bg-black/20 text-white border-white/30",
    button:
      "bg-white text-indigo-700 hover:bg-blue-50 hover:shadow-lg hover:shadow-black/20",
    icon: <Megaphone className="w-4 h-4 shrink-0 text-blue-200" />,
  },
  purple: {
    container:
      "bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 text-white shadow-md shadow-purple-950/40 border-b border-purple-400/40",
    badge: "bg-black/20 text-white border-white/30",
    button:
      "bg-white text-purple-800 hover:bg-purple-50 hover:shadow-lg hover:shadow-black/20",
    icon: <Crown className="w-4 h-4 shrink-0 text-yellow-300" />,
  },
  cyan: {
    container:
      "bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 text-white shadow-md shadow-cyan-950/40 border-b border-cyan-400/40",
    badge: "bg-black/20 text-white border-white/30",
    button:
      "bg-white text-cyan-800 hover:bg-cyan-50 hover:shadow-lg hover:shadow-black/20",
    icon: <Sparkles className="w-4 h-4 shrink-0 text-cyan-200" />,
  },
  dark: {
    container:
      "bg-gradient-to-r from-[#171b2e] via-[#222845] to-[#171b2e] text-[#f1f3f9] shadow-md shadow-black/50 border-b border-cyan-500/30",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    button:
      "bg-cyan-500 text-black hover:bg-cyan-400 hover:shadow-lg hover:shadow-cyan-500/30",
    icon: <Info className="w-4 h-4 shrink-0 text-cyan-400" />,
  },
};
