import { lazy, type ComponentType } from "react";

type Importer = () => Promise<{ default: ComponentType<any> }>;

const routeImporters = {
  Writings: () => import("../pages/Writings"),
  EBooks: () => import("../pages/EBooks"),
  NotFound: () => import("../pages/NotFound"),
  FacebookRecitations: () => import("../pages/FacebookRecitations"),
  PrivacyPolicy: () => import("../pages/PrivacyPolicy"),
  Terms: () => import("../pages/Terms"),
  About: () => import("../pages/About"),
  Contact: () => import("../pages/Contact"),
  EBookReader: () => import("../pages/EBookReader"),
  Editor: () => import("../pages/Editor"),
  News: () => import("../pages/News"),
  Gallery: () => import("../pages/Gallery"),
  AmiOLikhboBastobota: () => import("../pages/AmiOLikhboBastobota"),
  AdminLiveChat: () => import("../pages/AdminLiveChat"),
  AdminWritingModeration: () => import("../pages/AdminWritingModeration"),
  AdminChatbotAnalytics: () => import("../pages/AdminChatbotAnalytics"),
  Profile: () => import("../pages/Profile"),
  AmiOLikhboLogin: () => import("../pages/AmiOLikhboLogin"),
  SeoKeywordLanding: () => import("../pages/SeoKeywordLanding"),
  TempEmail: () => import("../pages/TempEmail"),
  TempNumber: () => import("../pages/TempNumber"),
  TempCard: () => import("../pages/TempCard"),
  ImageUpscaler: () => import("../pages/ImageUpscaler"),
} satisfies Record<string, Importer>;

type RouteKey = keyof typeof routeImporters;

const routePreloadCache = new Map<RouteKey, Promise<unknown>>();

export const lazyRoute = (key: RouteKey) => lazy(routeImporters[key]);

const importerForPath = (href: string): Importer | undefined => {
  const path = href.split("?")[0].split("#")[0];

  if (path === "/") return undefined;
  if (path === "/writings" || path.startsWith("/writings/")) return routeImporters.Writings;
  if (path === "/ebooks") return routeImporters.EBooks;
  if (path.startsWith("/ebooks/read/")) return routeImporters.EBookReader;
  if (path === "/facebook-recitations") return routeImporters.FacebookRecitations;
  if (path === "/privacy-policy") return routeImporters.PrivacyPolicy;
  if (path === "/terms") return routeImporters.Terms;
  if (path === "/about") return routeImporters.About;
  if (path === "/contact") return routeImporters.Contact;
  if (path === "/editor") return routeImporters.Editor;
  if (path === "/news" || path.startsWith("/news/")) return routeImporters.News;
  if (path === "/gallery") return routeImporters.Gallery;
  if (path === "/amio-likhbo-bastobota" || path.startsWith("/amio-likhbo-bastobota/")) return routeImporters.AmiOLikhboBastobota;
  if (path === "/amio-likhbo-login") return routeImporters.AmiOLikhboLogin;
  if (path === "/profile") return routeImporters.Profile;
  if (path === "/admin/live-chat") return routeImporters.AdminLiveChat;
  if (path === "/admin/writing") return routeImporters.AdminWritingModeration;
  if (path === "/admin/chatbot-analytics") return routeImporters.AdminChatbotAnalytics;
  if (path === "/404") return routeImporters.NotFound;
  if (path === "/temp-email") return routeImporters.TempEmail;
  if (path === "/temp-number") return routeImporters.TempNumber;
  if (path === "/temp-card") return routeImporters.TempCard;
  if (path === "/image-upscaler") return routeImporters.ImageUpscaler;

  if (
    path === "/bangla-kobita" ||
    path === "/valobashar-kobita" ||
    path === "/bichched-kobita" ||
    path === "/jibon-dorshon" ||
    path === "/bangla-ebook" ||
    path === "/bangla-status" ||
    path === "/bangla-quotes" ||
    path === "/koster-kobita" ||
    path === "/romantic-bangla-kobita" ||
    path === "/bangla-golpo" ||
    path === "/mayer-kobita" ||
    path === "/babar-kobita" ||
    path === "/choto-kobita" ||
    path === "/mon-kharap-status" ||
    path === "/miss-you-bangla" ||
    path === "/ekla-thaka-kobita" ||
    path === "/rater-kobita" ||
    path === "/bhalobasha-kobita" ||
    path === "/bichhed-kobita" ||
    path === "/jibon-niye-ukti" ||
    path === "/premer-status" ||
    path === "/sad-bangla-status" ||
    path === "/brishti-kobita" ||
    path === "/swapno-kobita" ||
    path === "/bangla-caption" ||
    path === "/jibon-kobita" ||
    path === "/opekkhar-kobita" ||
    path === "/abhibab-kobita" ||
    path === "/shomoy-kobita" ||
    path === "/manush-kobita" ||
    path === "/bangla-kobita-2024"
  ) {
    return routeImporters.SeoKeywordLanding;
  }

  return routeImporters.NotFound;
};

const keyForImporter = (importer: Importer): RouteKey | undefined => {
  return (Object.keys(routeImporters) as RouteKey[]).find((key) => routeImporters[key] === importer);
};

export const preloadRoute = (href: string) => {
  const importer = importerForPath(href);
  if (!importer) return undefined;

  const key = keyForImporter(importer);
  if (!key) return undefined;

  if (!routePreloadCache.has(key)) {
    routePreloadCache.set(key, importer().catch((error) => {
      routePreloadCache.delete(key);
      throw error;
    }));
  }

  return routePreloadCache.get(key);
};

export const preloadRoutesWhenIdle = (hrefs: string[]) => {
  const connection = (navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
  }).connection;

  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || "")) return;

  const preloadNext = (index: number) => {
    const href = hrefs[index];
    if (!href) return;

    preloadRoute(href)?.finally(() => {
      window.setTimeout(() => preloadNext(index + 1), 350);
    });
  };

  const start = () => preloadNext(0);
  window.requestIdleCallback?.(start, { timeout: 3000 }) ?? window.setTimeout(start, 1800);
};
