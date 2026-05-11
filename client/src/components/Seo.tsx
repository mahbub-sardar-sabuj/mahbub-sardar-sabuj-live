import { useEffect } from "react";

type JsonLd = Record<string, unknown> | Array<Record<string, unknown>>;

interface NewsArticleSeo {
  headline?: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  publisherName?: string;
  publisherLogo?: string;
  articleSection?: string;
}

interface SeoProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  keywords?: string;
  type?: string;
  jsonLd?: JsonLd;
  newsArticle?: NewsArticleSeo;
}

const SITE_NAME = "মাহবুব সরদার সবুজ | Mahbub Sardar Sabuj - লেখক ও কবি";
const SITE_URL = "https://www.mahbubsardarsabuj.com";
const DEFAULT_IMAGE = "https://www.mahbubsardarsabuj.com/images/og-home.jpg";
const DEFAULT_PUBLISHER_LOGO = "https://www.mahbubsardarsabuj.com/images/sardar-sangbad-logo-final.png";

function toIsoDateTime(date: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return `${date}T00:00:00+06:00`;
  }
  return date;
}

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector(selector) as HTMLMetaElement | null;

  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element!.setAttribute(key, value);
  });
}

function upsertLink(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector(selector) as HTMLLinkElement | null;

  if (!element) {
    element = document.createElement("link");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element!.setAttribute(key, value);
  });
}

export default function Seo({
  title,
  description,
  path = "/",
  image = DEFAULT_IMAGE,
  keywords,
  type = "website",
  jsonLd,
  newsArticle,
}: SeoProps) {
  useEffect(() => {
    const canonicalUrl = new URL(path, SITE_URL).toString();
    // Ensure image is an absolute URL
    const absoluteImage = image && image.startsWith('http') ? image : new URL(image || DEFAULT_IMAGE, SITE_URL).toString();
    const previousTitle = document.title;
    document.title = title;

    upsertMeta('meta[name="description"]', { name: "description", content: description });
    upsertMeta('meta[name="keywords"]', { name: "keywords", content: keywords ?? "মাহবুব সরদার সবুজ, Mahbub Sardar Sabuj, বাংলা লেখক, কবি, লেখালেখি" });
    upsertMeta('meta[name="author"]', { name: "author", content: "Mahbub Sardar Sabuj" });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: description });
    upsertMeta('meta[property="og:type"]', { property: "og:type", content: type });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: canonicalUrl });
    upsertMeta('meta[property="og:site_name"]', { property: "og:site_name", content: SITE_NAME });
    upsertMeta('meta[property="og:locale"]', { property: "og:locale", content: "bn_BD" });
    upsertMeta('meta[property="og:image"]', { property: "og:image", content: absoluteImage });
    upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
    upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: absoluteImage });
    upsertMeta('meta[name="robots"]', { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" });
    upsertLink('link[rel="canonical"]', { rel: "canonical", href: canonicalUrl });

    const newsArticleJsonLd = newsArticle ? {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": canonicalUrl,
      },
      headline: newsArticle.headline ?? title,
      description,
      image: [absoluteImage],
      datePublished: toIsoDateTime(newsArticle.datePublished),
      dateModified: toIsoDateTime(newsArticle.dateModified ?? newsArticle.datePublished),
      author: {
        "@type": "Person",
        name: newsArticle.author ?? "মাহবুব সরদার সবুজ",
        url: SITE_URL,
      },
      publisher: {
        "@type": "Organization",
        name: newsArticle.publisherName ?? "সরদার সংবাদ",
        logo: {
          "@type": "ImageObject",
          url: newsArticle.publisherLogo ?? DEFAULT_PUBLISHER_LOGO,
        },
      },
      articleSection: newsArticle.articleSection,
      inLanguage: "bn-BD",
      isAccessibleForFree: true,
    } : null;

    const structuredData = newsArticleJsonLd
      ? (jsonLd ? [newsArticleJsonLd, ...(Array.isArray(jsonLd) ? jsonLd : [jsonLd])] : newsArticleJsonLd)
      : jsonLd;

    let jsonLdScript: HTMLScriptElement | null = null;
    if (structuredData) {
      jsonLdScript = document.createElement("script");
      jsonLdScript.type = "application/ld+json";
      jsonLdScript.setAttribute("data-seo-jsonld", canonicalUrl);
      jsonLdScript.text = JSON.stringify(structuredData);
      document.head.appendChild(jsonLdScript);
    }

    return () => {
      document.title = previousTitle;
      if (jsonLdScript && jsonLdScript.parentNode) {
        jsonLdScript.parentNode.removeChild(jsonLdScript);
      }
    };
  }, [title, description, path, image, keywords, type, jsonLd, newsArticle]);

  return null;
}

export { SITE_NAME, SITE_URL, DEFAULT_IMAGE };
