import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, ArrowRight } from 'lucide-react';
import { systemApi } from '../../api/systemApi';
import { BannerNotificationConfig } from '../../types/system.types';
import { BANNER_COLOR_MAP } from './bannerColors';

const STORAGE_KEY = 'lexiflash_dismissed_banner_id';

export const TopBannerNotification: React.FC = () => {
  const [banner, setBanner] = useState<BannerNotificationConfig | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const fetchBanner = async () => {
    try {
      const res = await systemApi.getBanner();
      const current = res.data.banner;
      if (current && current.isEnabled && current.message.trim()) {
        const dismissedId = localStorage.getItem(STORAGE_KEY);
        if (dismissedId === current.id) {
          setIsDismissed(true);
        } else {
          setIsDismissed(false);
          setBanner(current);
        }
      } else {
        setBanner(null);
      }
    } catch {
      // Gracefully ignore if network or public endpoint is unavailable
      setBanner(null);
    }
  };

  useEffect(() => {
    fetchBanner();

    // Listen to real-time custom event triggered when admin updates banner in dashboard
    const handleBannerUpdate = () => {
      fetchBanner();
    };
    window.addEventListener('lexiflash_banner_updated', handleBannerUpdate);

    return () => {
      window.removeEventListener('lexiflash_banner_updated', handleBannerUpdate);
    };
  }, []);

  if (!banner || !banner.isEnabled || isDismissed || !banner.message) {
    return null;
  }

  const handleDismiss = () => {
    setIsClosing(true);
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, banner.id);
      setIsDismissed(true);
      setIsClosing(false);
    }, 250);
  };

  const style = BANNER_COLOR_MAP[banner.color] || BANNER_COLOR_MAP.blue;
  const isExternalLink = banner.linkUrl && /^https?:\/\//i.test(banner.linkUrl);

  // Calculate smooth reading duration (faster for short text, steady for long text)
  const marqueeDuration = Math.max(16, Math.min(45, Math.round(banner.message.length * 0.3)));

  return (
    <div
      role="alert"
      className={`w-full relative z-30 transition-all duration-300 overflow-hidden select-none ${
        style.container
      } ${
        isClosing
          ? 'max-h-0 opacity-0 py-0 -translate-y-2'
          : 'max-h-14 opacity-100 py-1.5 sm:py-2'
      }`}
    >
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 flex items-center justify-between gap-2 text-xs sm:text-sm">
        {/* Fixed Left: Notification Badge & Icon */}
        <div className="flex items-center gap-1.5 shrink-0 pl-0.5">
          {style.icon}
          <span
            className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${style.badge}`}
          >
            Thông báo
          </span>
          <span className="w-px h-3.5 bg-white/25 mx-1 hidden sm:inline-block" />
        </div>

        {/* Center: Smooth Marquee Running Text from Right to Left */}
        <div
          className="overflow-hidden relative flex-1 min-w-0 flex items-center"
          title="Chạm hoặc rê chuột để dừng chữ chạy"
        >
          <div
            className="animate-marquee inline-flex items-center gap-6 cursor-default hover:[animation-play-state:paused] active:[animation-play-state:paused]"
            style={{ animationDuration: `${marqueeDuration}s` }}
          >
            <span className="font-semibold tracking-wide drop-shadow-xs whitespace-nowrap">
              {banner.message}
            </span>

            {/* Action Link / Button inside the stream */}
            {banner.linkUrl && (
              <span className="shrink-0 inline-flex items-center">
                {isExternalLink ? (
                  <a
                    href={banner.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-xs hover:opacity-95 transition-opacity ${style.button}`}
                  >
                    <span>{banner.linkText || 'Khám phá ngay'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                ) : (
                  <Link
                    to={banner.linkUrl}
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-xs hover:opacity-95 transition-opacity ${style.button}`}
                  >
                    <span>{banner.linkText || 'Khám phá ngay'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Fixed Right: Dismiss Button */}
        <div className="flex items-center shrink-0 pl-1">
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Tắt thông báo này"
            title="Tắt thông báo"
            className="p-1 rounded-full hover:bg-black/25 active:scale-90 transition-all text-white/85 hover:text-white shrink-0 cursor-pointer focus:outline-none"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
