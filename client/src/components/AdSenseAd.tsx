import { useEffect, useRef, useState } from "react";

/**
 * AdSense Ad Unit Component
 * Publisher ID: ca-pub-3350204114310360
 *
 * ── Named Ad Slot IDs ──────────────────────────────────────────────────────────
 * AdSense অনুমোদনের পরে Google AdSense Dashboard থেকে Ad Units তৈরি করুন
 * এবং নিচের SLOT_IDS-এ সংশ্লিষ্ট slot ID বসিয়ে দিন।
 *
 * Slot IDs are intentionally left empty until AdSense approval is confirmed.
 * Once approved, create ad units in Google AdSense → Ads → By ad unit → Display ads
 * and fill in the IDs below.
 */
export const AD_SLOTS = {
  HOME_BANNER: "",          // Home page — after hero section
  WRITINGS_INLINE: "",      // Writings page — between poems
  EBOOKS_SIDEBAR: "",       // EBooks page — beside book listing
  CONTACT_BOTTOM: "",       // Contact page — below form
  NEWS_INLINE: "",          // News page — between articles
  GALLERY_BOTTOM: "",       // Gallery page — below photos
  ABOUT_BOTTOM: "",         // About page — below FAQ
  READER_INLINE: "",        // EBook reader — between chapters
  AMIO_INLINE: "",          // আমিও লিখবো বাস্তবতা — between posts
  TERMS_BOTTOM: "",         // Terms/Privacy pages
  RECITATIONS_BOTTOM: "",   // Facebook recitations page
} as const;

interface AdSenseAdProps {
  adSlot?: string;
  adFormat?: "auto" | "rectangle" | "vertical" | "horizontal";
  fullWidthResponsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
  /** Show a subtle placeholder while waiting for AdSense approval */
  showPlaceholder?: boolean;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function AdSenseAd({
  adSlot = "",
  adFormat = "auto",
  fullWidthResponsive = true,
  style = {},
  className = "",
  showPlaceholder = false,
}: AdSenseAdProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);
  const [adError, setAdError] = useState(false);

  useEffect(() => {
    pushed.current = false;
    setAdError(false);
  }, [adSlot]);

  useEffect(() => {
    if (pushed.current) return;
    try {
      if (typeof window !== "undefined") {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
        pushed.current = true;
      }
    } catch (e) {
      console.error("AdSense error:", e);
      setAdError(true);
    }
  }, [adSlot]);

  // If AdSense failed and showPlaceholder is requested, show subtle placeholder
  if (adError && showPlaceholder) {
    return (
      <div
        className={className}
        style={{
          display: "block",
          textAlign: "center",
          overflow: "hidden",
          minHeight: 90,
          background: "rgba(212,168,67,0.03)",
          border: "1px dashed rgba(212,168,67,0.12)",
          borderRadius: 8,
          ...style,
        }}
      />
    );
  }

  return (
    <div
      className={className}
      style={{
        display: "block",
        textAlign: "center",
        overflow: "hidden",
        minHeight: 90,
        ...style,
      }}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", ...style }}
        data-ad-client="ca-pub-3350204114310360"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive ? "true" : "false"}
      />
    </div>
  );
}
