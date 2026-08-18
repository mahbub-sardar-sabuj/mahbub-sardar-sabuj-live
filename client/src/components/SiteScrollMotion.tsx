import { useEffect } from "react";

const MOTION_SELECTOR = [
  "main > section",
  "main > article",
  ".wr-card",
  ".wr-publication",
  ".wr-ebook",
  ".wr-section",
  ".bk-card",
  ".bk-guide",
  ".bk-feature",
  ".bk-section",
  ".timeline-item",
  ".amio-post-card",
  ".tool-card",
  ".editor-panel",
  "[data-scroll-reveal]",
].join(",");

const EXCLUDED_SELECTOR = "nav, header, footer, button, a, input, textarea, select, dialog, [role='dialog'], [aria-hidden='true']";

type BrowserRuntime = Window & {
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  cancelIdleCallback?: (handle: number) => void;
};

function shouldUseCompactMotion() {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;

  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
    deviceMemory?: number;
  };
  const connection = nav.connection;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const constrainedNetwork = connection?.saveData || connection?.effectiveType === "2g" || connection?.effectiveType === "slow-2g";
  const constrainedDevice = (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4)
    || (typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4);

  return Boolean(constrainedNetwork || (coarsePointer && constrainedDevice));
}

/**
 * A small global motion layer. It uses compositor-friendly opacity + transform,
 * only watches relevant surfaces, and automatically uses a lighter one-time
 * mode on constrained touch devices.
 */
export default function SiteScrollMotion({ routeKey }: { routeKey: string }) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const runtime = window as BrowserRuntime;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const root = document.querySelector(".cinematic-site-shell") ?? document.body;
    const compactMotion = shouldUseCompactMotion();
    let observer: IntersectionObserver | null = null;
    let mutationObserver: MutationObserver | null = null;
    let raf = 0;
    let idle = 0;
    let scheduled = false;

    const clearPromotion = (event: TransitionEvent) => {
      if (event.propertyName !== "transform") return;
      const element = event.currentTarget as HTMLElement;
      if (element.classList.contains("mss-scroll-visible")) {
        element.style.removeProperty("will-change");
      }
    };

    const disableMotion = () => {
      root.classList.remove("mss-motion-ready", "mss-motion-compact");
      root.querySelectorAll<HTMLElement>(".mss-scroll-item").forEach((element) => {
        element.classList.remove("mss-scroll-item", "mss-scroll-visible");
        element.style.removeProperty("--mss-motion-delay");
        element.style.removeProperty("will-change");
        element.removeEventListener("transitionend", clearPromotion);
        delete element.dataset.mssMotionBound;
      });
    };

    const enableMotion = () => {
      if (reduceMotion.matches) {
        disableMotion();
        return;
      }

      root.classList.add("mss-motion-ready");
      root.classList.toggle("mss-motion-compact", compactMotion);
      observer?.disconnect();
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const element = entry.target as HTMLElement;
          element.style.setProperty("will-change", "transform, opacity");
          element.classList.toggle("mss-scroll-visible", entry.isIntersecting);

          // On constrained mobile devices, an element settles after its first
          // entrance instead of paying a scroll-up/scroll-down callback cost.
          if (compactMotion && entry.isIntersecting) {
            observer?.unobserve(element);
          }
        });
      }, {
        threshold: compactMotion ? 0.06 : 0.12,
        rootMargin: compactMotion ? "0px 0px -3% 0px" : "0px 0px -7% 0px",
      });

      const collect = () => {
        const candidates = Array.from(root.querySelectorAll<HTMLElement>(MOTION_SELECTOR))
          .filter((element) => !element.matches(EXCLUDED_SELECTOR))
          .filter((element) => !element.closest("[role='dialog']"))
          .filter((element) => element.offsetHeight >= 48 && element.offsetWidth >= 120)
          .slice(0, compactMotion ? 72 : 90);

        candidates.forEach((element, index) => {
          if (element.dataset.mssMotionBound === "true") return;
          element.dataset.mssMotionBound = "true";
          element.classList.add("mss-scroll-item");
          element.style.setProperty("--mss-motion-delay", `${(index % 5) * (compactMotion ? 0.045 : 0.055)}s`);
          element.addEventListener("transitionend", clearPromotion);
          observer?.observe(element);
        });
      };

      const scheduleCollect = () => {
        if (scheduled) return;
        scheduled = true;
        const run = () => {
          scheduled = false;
          collect();
        };

        if (runtime.requestIdleCallback) {
          idle = runtime.requestIdleCallback(run, { timeout: 350 });
        } else {
          raf = window.requestAnimationFrame(run);
        }
      };

      collect();
      mutationObserver?.disconnect();
      mutationObserver = new MutationObserver(scheduleCollect);
      mutationObserver.observe(root, { childList: true, subtree: true });
    };

    const onPreferenceChange = () => enableMotion();
    enableMotion();
    reduceMotion.addEventListener?.("change", onPreferenceChange);

    return () => {
      window.cancelAnimationFrame(raf);
      if (idle && runtime.cancelIdleCallback) runtime.cancelIdleCallback(idle);
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
        transition:
          transform 520ms cubic-bezier(0.16, 1, 0.3, 1) var(--mss-motion-delay, 0ms),
          opacity 420ms ease-out var(--mss-motion-delay, 0ms);
      }
      .mss-motion-ready .mss-scroll-item.mss-scroll-visible {
        opacity: 1;
        transform: translate3d(0, 0, 0) scale(1);
      }
      .mss-motion-ready.mss-motion-compact .mss-scroll-item {
        transform: translate3d(0, 20px, 0) scale(0.99);
        transition-duration: 430ms, 360ms;
      }
      @media (prefers-reduced-motion: reduce) {
        .mss-motion-ready .mss-scroll-item {
          opacity: 1;
          transform: none;
          transition: none;
        }
      }
    `}</style>
  );
}
