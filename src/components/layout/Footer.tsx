import React from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, ExternalLink } from "lucide-react";
import { Logo } from "../common/Logo";
import { useTranslation } from "../../i18n";

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-white/[0.08] bg-[#131722] pt-10 pb-28 md:pb-12 text-sm text-[#8e98b0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Logo + Slogan */}
          <div className="flex flex-col items-center md:items-start gap-2.5">
            <Logo size="xs" showSlogan={false} />
            <span className="font-medium text-[#8e98b0] text-xs sm:text-sm text-center md:text-left">
              {t(
                "footer.slogan",
                undefined,
                "Spaced Repetition Flashcards & Active Recall Platform",
              )}
            </span>
            <p className="text-[11px] text-[#545d78] max-w-xs text-center md:text-left leading-relaxed">
              Designed for long-term vocabulary retention based on the SuperMemo
              SM-2 cognitive algorithm.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col items-center md:items-start gap-2 text-xs sm:text-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#545d78] mb-1">
              {t("footer.quickLinks", undefined, "Quick Links")}
            </span>
            <Link
              to="/"
              className="text-[#8e98b0] hover:text-white transition-colors"
            >
              {t("sidebar.home", undefined, "Home")}
            </Link>
            <Link
              to="/ai-generator"
              className="text-[#8e98b0] hover:text-white transition-colors"
            >
              {t("sidebar.aiGenerator", undefined, "AI Flashcards")}
            </Link>
            <Link
              to="/vip"
              className="text-[#8e98b0] hover:text-white transition-colors"
            >
              {t("sidebar.vipUpgrade", undefined, "VIP Membership")}
            </Link>
            <Link
              to="/classes"
              className="text-[#8e98b0] hover:text-white transition-colors"
            >
              {t("sidebar.studyGroups", undefined, "Study Groups")}
            </Link>
          </div>

          {/* Column 3: Contact Info */}
          <div className="flex flex-col items-center md:items-start gap-2 text-xs sm:text-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#545d78] mb-1">
              {t("footer.contactTitle", undefined, "Contact & Support")}
            </span>
            <span className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#4f5fd8]" />
              0772 656 047
            </span>
            <span className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#4f5fd8]" />
              trietlegaming2306@gmail.com
            </span>
            <a
              href="https://www.facebook.com/minhtrietle237"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#8e98b0] hover:text-white transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#4f5fd8]" />
              Facebook: Trevor Le
            </a>
            <span className="flex items-center gap-2">
              <span className="text-[#4f5fd8] font-bold text-xs font-mono">
                Z
              </span>
              Zalo: 0772 656 047
            </span>
          </div>
        </div>

        {/* Copyright - Full Width Centered */}
        <div className="border-t border-white/[0.08] mt-8 pt-6 text-center text-xs text-[#545d78]">
          <div className="flex items-center justify-center gap-1.5 text-[#8e98b0]">
            <span>
              {t(
                "footer.builtWith",
                undefined,
                "Engineered with precision for",
              )}
            </span>
            <span className="text-[#9cb1ff] font-semibold">
              IELTS, TOEIC & CEFR Mastery
            </span>
          </div>
          <p className="mt-1 font-mono text-[11px]">
            &copy; {new Date().getFullYear()} LexiFlash. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
