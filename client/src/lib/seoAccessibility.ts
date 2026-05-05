/**
 * 🔍 এসইও এবং অ্যাক্সেসিবিলিটি ইউটিলিটি
 * ✅ ARIA লেবেল এবং সিমান্টিক HTML
 * ✅ কিবোর্ড নেভিগেশন সাপোর্ট
 * ✅ স্ক্রিন রিডার অপ্টিমাইজেশন
 * ✅ এসইও মেটা ট্যাগ ম্যানেজমেন্ট
 */

// ═══════════════════════════════════════════════════════════════════════════════
// ♿ অ্যাক্সেসিবিলিটি ইউটিলিটি
// ═══════════════════════════════════════════════════════════════════════════════

export interface AccessibilityAttributes {
  role?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  ariaLive?: "polite" | "assertive" | "off";
  ariaHidden?: boolean;
  tabIndex?: number;
  title?: string;
}

/**
 * ARIA লেবেল এবং অ্যাক্সেসিবিলিটি অ্যাট্রিবিউট তৈরি করুন
 * @param label - ARIA লেবেল
 * @param role - ARIA রোল
 * @param describedBy - বর্ণনা ID
 * @returns অ্যাক্সেসিবিলিটি অ্যাট্রিবিউট অবজেক্ট
 */
export function createAccessibilityAttributes(
  label: string,
  role?: string,
  describedBy?: string
): AccessibilityAttributes {
  return {
    ariaLabel: label,
    role,
    ariaDescribedBy: describedBy,
    tabIndex: 0,
  };
}

/**
 * ইন্টারঅ্যাক্টিভ এলিমেন্টের জন্য কিবোর্ড ইভেন্ট হ্যান্ডলার
 * @param onEnter - এন্টার কী প্রেস করার সময় কলব্যাক
 * @param onSpace - স্পেস কী প্রেস করার সময় কলব্যাক
 * @returns ইভেন্ট হ্যান্ডলার ফাংশন
 */
export function createKeyboardHandler(
  onEnter?: () => void,
  onSpace?: () => void
) {
  return (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && onEnter) {
      e.preventDefault();
      onEnter();
    } else if (e.key === " " && onSpace) {
      e.preventDefault();
      onSpace();
    }
  };
}

/**
 * স্ক্রিন রিডার ঘোষণা করুন (লাইভ রিজিয়ন)
 * @param message - ঘোষণার বার্তা
 * @param priority - অগ্রাধিকার ("polite" বা "assertive")
 */
export function announceToScreenReader(
  message: string,
  priority: "polite" | "assertive" = "polite"
): void {
  if (typeof document === "undefined") return;
  
  // বিদ্যমান লাইভ রিজিয়ন খুঁজুন বা তৈরি করুন
  let liveRegion = document.querySelector(`[aria-live="${priority}"]`);
  
  if (!liveRegion) {
    liveRegion = document.createElement("div");
    liveRegion.setAttribute("aria-live", priority);
    liveRegion.setAttribute("aria-atomic", "true");
    liveRegion.style.position = "absolute";
    liveRegion.style.left = "-10000px";
    liveRegion.style.width = "1px";
    liveRegion.style.height = "1px";
    liveRegion.style.overflow = "hidden";
    document.body.appendChild(liveRegion);
  }
  
  liveRegion.textContent = message;
}

/**
 * স্কিপ লিংক তৈরি করুন (অ্যাক্সেসিবিলিটির জন্য)
 * @param targetId - টার্গেট এলিমেন্ট ID
 * @returns স্কিপ লিংক এলিমেন্ট
 */
export function createSkipLink(targetId: string): JSX.Element {
  return (
    <a
      href={`#${targetId}`}
      style={{
        position: "absolute",
        top: "-40px",
        left: 0,
        background: "#000",
        color: "#fff",
        padding: "8px",
        textDecoration: "none",
        zIndex: 100,
      }}
      onFocus={(e) => {
        e.currentTarget.style.top = "0";
      }}
      onBlur={(e) => {
        e.currentTarget.style.top = "-40px";
      }}
    >
      মূল কন্টেন্টে যান
    </a>
  );
}

/**
 * ফোকাস ট্র্যাপ তৈরি করুন (মডালের জন্য)
 * @param containerRef - কন্টেইনার রেফারেন্স
 */
export function useFocusTrap(containerRef: React.RefObject<HTMLDivElement>) {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;
    
    if (!containerRef.current) return;
    
    const focusableElements = containerRef.current.querySelectorAll(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };
  
  return handleKeyDown;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔍 এসইও ইউটিলিটি
// ═══════════════════════════════════════════════════════════════════════════════

export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
}

/**
 * স্ট্রাকচার্ড ডেটা (JSON-LD) তৈরি করুন
 * @param type - স্কিমা টাইপ (e.g., "Person", "Article", "BlogPosting")
 * @param data - ডেটা অবজেক্ট
 * @returns JSON-LD স্ট্রাকচার্ড ডেটা
 */
export function createStructuredData(type: string, data: Record<string, any>) {
  return {
    "@context": "https://schema.org",
    "@type": type,
    ...data,
  };
}

/**
 * ব্রেডক্রাম্ব স্ট্রাকচার্ড ডেটা তৈরি করুন
 * @param items - ব্রেডক্রাম্ব আইটেম
 * @returns JSON-LD স্ট্রাকচার্ড ডেটা
 */
export function createBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * নিবন্ধ স্ট্রাকচার্ড ডেটা তৈরি করুন
 * @param article - নিবন্ধ ডেটা
 * @returns JSON-LD স্ট্রাকচার্ড ডেটা
 */
export function createArticleSchema(article: {
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  authorUrl?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.headline,
    description: article.description,
    image: article.image,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      "@type": "Person",
      name: article.author,
      url: article.authorUrl,
    },
  };
}

/**
 * সাইটম্যাপ এন্ট্রি তৈরি করুন
 * @param url - পেজ URL
 * @param lastModified - শেষ সংশোধনের তারিখ
 * @param changeFrequency - পরিবর্তনের ফ্রিকোয়েন্সি
 * @param priority - অগ্রাধিকার
 * @returns সাইটম্যাপ এন্ট্রি XML
 */
export function createSitemapEntry(
  url: string,
  lastModified?: string,
  changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never",
  priority?: number
): string {
  return `
    <url>
      <loc>${url}</loc>
      ${lastModified ? `<lastmod>${lastModified}</lastmod>` : ""}
      ${changeFrequency ? `<changefreq>${changeFrequency}</changefreq>` : ""}
      ${priority ? `<priority>${priority}</priority>` : ""}
    </url>
  `;
}

/**
 * robots.txt কন্টেন্ট তৈরি করুন
 * @param allowedPaths - অনুমোদিত পাথ
 * @param disallowedPaths - অনুমোদিত নয় এমন পাথ
 * @param sitemapUrl - সাইটম্যাপ URL
 * @returns robots.txt কন্টেন্ট
 */
export function createRobotsTxt(
  allowedPaths: string[] = ["/"],
  disallowedPaths: string[] = ["/admin", "/private"],
  sitemapUrl?: string
): string {
  let content = "User-agent: *\n";
  
  allowedPaths.forEach((path) => {
    content += `Allow: ${path}\n`;
  });
  
  disallowedPaths.forEach((path) => {
    content += `Disallow: ${path}\n`;
  });
  
  if (sitemapUrl) {
    content += `\nSitemap: ${sitemapUrl}\n`;
  }
  
  return content;
}

/**
 * মেটা ট্যাগ তৈরি করুন
 * @param metadata - এসইও মেটাডেটা
 * @returns মেটা ট্যাগ অবজেক্ট
 */
export function createMetaTags(metadata: SEOMetadata) {
  return {
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords,
    canonical: metadata.canonical,
    og: {
      title: metadata.ogTitle || metadata.title,
      description: metadata.ogDescription || metadata.description,
      image: metadata.ogImage,
      url: metadata.ogUrl,
    },
    twitter: {
      card: metadata.twitterCard || "summary_large_image",
      title: metadata.twitterTitle || metadata.title,
      description: metadata.twitterDescription || metadata.description,
      image: metadata.twitterImage || metadata.ogImage,
    },
  };
}

/**
 * ক্যানোনিক্যাল URL সেট করুন
 * @param url - ক্যানোনিক্যাল URL
 */
export function setCanonicalUrl(url: string): void {
  if (typeof document === "undefined") return;
  
  let canonicalLink = document.querySelector("link[rel='canonical']");
  
  if (!canonicalLink) {
    canonicalLink = document.createElement("link");
    canonicalLink.rel = "canonical";
    document.head.appendChild(canonicalLink);
  }
  
  canonicalLink.href = url;
}

/**
 * OG ট্যাগ সেট করুন
 * @param property - OG প্রপার্টি
 * @param content - কন্টেন্ট
 */
export function setOGTag(property: string, content: string): void {
  if (typeof document === "undefined") return;
  
  let ogTag = document.querySelector(`meta[property="og:${property}"]`);
  
  if (!ogTag) {
    ogTag = document.createElement("meta");
    ogTag.setAttribute("property", `og:${property}`);
    document.head.appendChild(ogTag);
  }
  
  ogTag.setAttribute("content", content);
}

export default {
  createAccessibilityAttributes,
  createKeyboardHandler,
  announceToScreenReader,
  createSkipLink,
  useFocusTrap,
  createStructuredData,
  createBreadcrumbSchema,
  createArticleSchema,
  createSitemapEntry,
  createRobotsTxt,
  createMetaTags,
  setCanonicalUrl,
  setOGTag,
};
