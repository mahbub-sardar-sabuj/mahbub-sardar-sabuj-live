/**
 * 🚀 পারফরম্যান্স অপ্টিমাইজেশন ইউটিলিটি
 * ✅ ইমেজ অপ্টিমাইজেশন (WebP, লেজি লোডিং)
 * ✅ কোড স্প্লিটিং এবং ট্রি শেকিং
 * ✅ কোর ওয়েব ভাইটালস মনিটরিং
 */

// ═══════════════════════════════════════════════════════════════════════════════
// 🖼️ ইমেজ অপ্টিমাইজেশন - WebP রূপান্তর এবং লেজি লোডিং
// ═══════════════════════════════════════════════════════════════════════════════

export interface OptimizedImage {
  src: string;
  srcSet: string;
  alt: string;
  loading: "lazy" | "eager";
  decoding: "async" | "sync";
}

/**
 * ইমেজ URL কে WebP ফরম্যাটে রূপান্তর করুন
 * @param originalUrl - মূল ইমেজ URL
 * @returns WebP URL (যদি সম্ভব হয়)
 */
export function convertToWebP(originalUrl: string): string {
  if (!originalUrl) return "";
  
  // যদি ইতিমধ্যে WebP হয়, তাহলে রিটার্ন করুন
  if (originalUrl.endsWith(".webp")) {
    return originalUrl;
  }
  
  // CloudFront বা অন্যান্য CDN এর জন্য WebP সাপোর্ট চেক করুন
  if (originalUrl.includes("cloudfront")) {
    // CloudFront এ WebP সাপোর্ট আছে
    const ext = originalUrl.split(".").pop();
    return originalUrl.replace(`.${ext}`, ".webp");
  }
  
  return originalUrl; // ফলব্যাক
}

/**
 * অপ্টিমাইজড ইমেজ অবজেক্ট তৈরি করুন
 * @param src - ইমেজ সোর্স
 * @param alt - অল্ট টেক্সট
 * @param isHero - হিরো ইমেজ কিনা (eager লোডিং এর জন্য)
 * @returns অপ্টিমাইজড ইমেজ অবজেক্ট
 */
export function createOptimizedImage(
  src: string,
  alt: string,
  isHero: boolean = false
): OptimizedImage {
  const webpSrc = convertToWebP(src);
  
  return {
    src: webpSrc,
    srcSet: `${webpSrc} 1x, ${webpSrc.replace(".webp", "@2x.webp")} 2x`,
    alt,
    loading: isHero ? "eager" : "lazy",
    decoding: isHero ? "sync" : "async",
  };
}

/**
 * ইমেজ প্রি-লোড করুন (হিরো সেকশনের জন্য)
 * @param src - ইমেজ সোর্স
 * @param as - রিসোর্স টাইপ
 */
export function preloadImage(src: string, as: "image" = "image"): void {
  if (typeof document === "undefined") return;
  
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = as;
  link.href = src;
  link.type = "image/webp";
  document.head.appendChild(link);
}

/**
 * ইমেজ প্রি-কানেক্ট করুন (CDN এর জন্য)
 * @param domain - CDN ডোমেইন
 */
export function preconnectCDN(domain: string): void {
  if (typeof document === "undefined") return;
  
  const link = document.createElement("link");
  link.rel = "preconnect";
  link.href = domain;
  link.crossOrigin = "anonymous";
  document.head.appendChild(link);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⏱️ কোর ওয়েব ভাইটালস (Core Web Vitals) মনিটরিং
// ═══════════════════════════════════════════════════════════════════════════════

export interface WebVitals {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

/**
 * কোর ওয়েব ভাইটালস মেট্রিক্স সংগ্রহ করুন
 * @param callback - মেট্রিক্স রিসিভ করার জন্য কলব্যাক
 */
export function monitorWebVitals(callback: (vitals: WebVitals) => void): void {
  if (typeof window === "undefined") return;
  
  const vitals: WebVitals = {};
  
  // Largest Contentful Paint (LCP)
  if ("PerformanceObserver" in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        vitals.lcp = (lastEntry as PerformancePaintTiming & { renderTime?: number; loadTime?: number }).renderTime || (lastEntry as PerformancePaintTiming & { renderTime?: number; loadTime?: number }).loadTime || 0;
        callback(vitals);
      });
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
    } catch (e) {
      console.warn("LCP monitoring not supported");
    }
  }
  
  // First Input Delay (FID)
  if ("PerformanceObserver" in window) {
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          vitals.fid = entry.processingDuration;
          callback(vitals);
        });
      });
      fidObserver.observe({ entryTypes: ["first-input"] });
    } catch (e) {
      console.warn("FID monitoring not supported");
    }
  }
  
  // Cumulative Layout Shift (CLS)
  if ("PerformanceObserver" in window) {
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            vitals.cls = clsValue;
            callback(vitals);
          }
        });
      });
      clsObserver.observe({ entryTypes: ["layout-shift"] });
    } catch (e) {
      console.warn("CLS monitoring not supported");
    }
  }
  
  // Time to First Byte (TTFB)
  if ("PerformanceNavigationTiming" in window) {
    try {
      const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      if (navigation) {
        vitals.ttfb = navigation.responseStart - navigation.fetchStart;
        callback(vitals);
      }
    } catch (e) {
      console.warn("TTFB monitoring not supported");
    }
  }
}

/**
 * পারফরম্যান্স মেট্রিক্স লগ করুন (ডেভেলপমেন্টের জন্য)
 */
export function logPerformanceMetrics(): void {
  if (typeof window === "undefined") return;
  
  monitorWebVitals((vitals) => {
    console.log("📊 Web Vitals:", {
      LCP: vitals.lcp ? `${vitals.lcp.toFixed(2)}ms` : "N/A",
      FID: vitals.fid ? `${vitals.fid.toFixed(2)}ms` : "N/A",
      CLS: vitals.cls ? vitals.cls.toFixed(3) : "N/A",
      TTFB: vitals.ttfb ? `${vitals.ttfb.toFixed(2)}ms` : "N/A",
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔄 ডায়নামিক ইম্পোর্ট - কোড স্প্লিটিং
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * কম্পোনেন্ট ডায়নামিকভাবে লোড করুন (কোড স্প্লিটিং)
 * @param importFunc - ডায়নামিক ইম্পোর্ট ফাংশন
 * @returns লোডেড কম্পোনেন্ট
 */
export async function lazyLoadComponent(importFunc: () => Promise<any>) {
  try {
    const module = await importFunc();
    return module.default || module;
  } catch (error) {
    console.error("Failed to load component:", error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 পারফরম্যান্স হিন্টস
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * DNS প্রি-রেজোলভ করুন
 * @param domain - ডোমেইন
 */
export function dnsPrefetch(domain: string): void {
  if (typeof document === "undefined") return;
  
  const link = document.createElement("link");
  link.rel = "dns-prefetch";
  link.href = domain;
  document.head.appendChild(link);
}

/**
 * রিসোর্স প্রি-ফেচ করুন
 * @param url - রিসোর্স URL
 */
export function prefetchResource(url: string): void {
  if (typeof document === "undefined") return;
  
  const link = document.createElement("link");
  link.rel = "prefetch";
  link.href = url;
  document.head.appendChild(link);
}

/**
 * রিসোর্স প্রি-রেন্ডার করুন
 * @param url - পেজ URL
 */
export function prerenderPage(url: string): void {
  if (typeof document === "undefined") return;
  
  const link = document.createElement("link");
  link.rel = "prerender";
  link.href = url;
  document.head.appendChild(link);
}

export default {
  convertToWebP,
  createOptimizedImage,
  preloadImage,
  preconnectCDN,
  monitorWebVitals,
  logPerformanceMetrics,
  lazyLoadComponent,
  dnsPrefetch,
  prefetchResource,
  prerenderPage,
};
