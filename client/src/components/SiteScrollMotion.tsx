import { useEffect } from "react";

const MOTION_SELECTOR = [
  "main > section",
  "main > article",
  ".wr-card",
  ".bk-card",
  ".gallery-photo-tile",
  ".news-card",
  ".timeline-item",
  ".contact-channel",
  ".amio-post-card",
  ".tool-card",
  ".editor-panel",
  "[data-scroll-reveal]",
].join(",");

const EXCLUDED_SELECTOR = "nav, header, footer, button, a, input, textarea, select, dialog, [role='dialog'], [aria-hidden='true']";

/**
 * A deliberately small, global motion layer. It observes only visible content
 * surfaces and uses opacity + transform so scrolling remains fluid on phones.
 * Page-specific Framer Motion interactions remain untouched.
 */
export default function SiteScrollMotion({ routeKey }: { routeKey: string }) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const root = document.querySelector(".cinematic-site-shell") ?? document.body;
    let observer: IntersectionObserver | null = null;
    let mutationObserver: MutationObserver | null = null;
    let raf = 0;
    let scheduled = false;

    const disableMotion = () => {
      root.classList.remove("mss-motion-ready");
      root.querySelectorAll<HTMLElement>(".mss-scroll-item").forEach((element) => {
        element.classList.remove("mss-scroll-item", "mss-scroll-visible");
        element.style.removeProperty("--mss-motion-delay");
        delete element.dataset.mssMotionBound;
      });
    };

    const enableMotion = () => {
      if (reduceMotion.matches) {
        disableMotion();
        return;
      }

      root.classList.add("mss-motion-ready");
      observer?.disconnect();
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const element = entry.target as HTMLElement;
          element.classList.toggle("mss-scroll-visible", entry.isIntersecting);
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -7% 0px" });

      const collect = () => {
        const candidates = Array.from(root.querySelectorAll<HTMLElement>(MOTION_SELECTOR))
          .filter((element) => !element.matches(EXCLUDED_SELECTOR))
          .filter((element) => !element.closest("[role='dialog']"))
          .filter((element) => element.offsetHeight >= 48 && element.offsetWidth >= 120)
          .slice(0, 90);

        candidates.forEach((element, index) => {
          if (element.dataset.mssMotionBound === "true") return;
          element.dataset.mssMotionBound = "true";
          element.classList.add("mss-scroll-item");
          element.style.setProperty("--mss-motion-delay", `${(index % 5) * 0.055}s`);
          observer?.observe(element);
        });
      };

      collect();
      mutationObserver?.disconnect();
      mutationObserver = new MutationObserver(() => {
        if (scheduled) return;
        scheduled = true;
        raf = window.requestAnimationFrame(() => {
          scheduled = false;
          collect();
        });
      });
      mutationObserver.observe(root, { childList: true, subtree: true });
    };

    const onPreferenceChange = () => enableMotion();
    enableMotion();
    reduceMotion.addEventListener?.("change", onPreferenceChange);

    return () => {
      window.cancelAnimationFrame(raf);
      observer?.disconnect();
      mutationObserver?.disconnect();
      reduceMotion.removeEventListener?.("change", onPreferenceChange);
      disableMotion();
    };
  }, [routeKey]);

  return (
    <style>{`
      .mss-motion-ready .mss-scroll-item {
        opacity: 0;
        transform: translate3d(0, 30px, 0) scale(0.985);
        filter: blur(3px);
        will-change: transform, opacity, filter;
        transition:
          transform 560ms cubic-bezier(0.16, 1, 0.3, 1) var(--mss-motion-delay, 0ms),
          opacity 460ms ease-out var(--mss-motion-delay, 0ms),
          filter 460ms ease-out var(--mss-motion-delay, 0ms);
      }
      .mss-motion-ready .mss-scroll-item.mss-scroll-visible {
        opacity: 1;
        transform: translate3d(0, 0, 0) scale(1);
        filter: blur(0);
      }
      @media (prefers-reduced-motion: reduce) {
        .mss-motion-ready .mss-scroll-item {
          opacity: 1;
          transform: none;
          filter: none;
          transition: none;
        }
      }
    `}</style>
  );
}
