import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense, useEffect, useState } from "react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { lazyRoute, preloadRoute, preloadRoutesWhenIdle } from "./lib/routePreloader";

// Keep only the landing page in the critical path. Everything else is loaded per route.
import Home from "./pages/Home";

// Lazy load secondary pages to reduce first-load JavaScript on phones/tablets
const Writings = lazyRoute("Writings");
const EBooks = lazyRoute("EBooks");
const NotFound = lazyRoute("NotFound");
const FacebookRecitations = lazyRoute("FacebookRecitations");
const PrivacyPolicy = lazyRoute("PrivacyPolicy");
const Terms = lazyRoute("Terms");
const About = lazyRoute("About");
const Contact = lazyRoute("Contact");
const EBookReader = lazyRoute("EBookReader");
const Editor = lazyRoute("Editor");
const News = lazyRoute("News");
const Gallery = lazyRoute("Gallery");
const AmiOLikhboBastobota = lazyRoute("AmiOLikhboBastobota");
const AIChatbot = lazy(() => import("./components/AIChatbot"));
const AdminLiveChat = lazyRoute("AdminLiveChat");
const AdminWritingModeration = lazyRoute("AdminWritingModeration");
const Profile = lazyRoute("Profile");
const AmiOLikhboLogin = lazyRoute("AmiOLikhboLogin");
const SeoKeywordLanding = lazyRoute("SeoKeywordLanding");

// Page loading fallback
function PageLoader() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        background: "transparent",
      }}
      aria-label="পেজ লোড হচ্ছে..."
    >
      <div
        style={{
          width: 40,
          height: 40,
          border: "3px solid rgba(201,168,76,0.2)",
          borderTop: "3px solid #C9A84C",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/facebook-recitations"} component={FacebookRecitations} />
        <Route path={"/writings"} component={Writings} />
        <Route path={"/writings/:slug"} component={Writings} />
        <Route path={"/bangla-kobita"} component={SeoKeywordLanding} />
        <Route path={"/valobashar-kobita"} component={SeoKeywordLanding} />
        <Route path={"/bichched-kobita"} component={SeoKeywordLanding} />
        <Route path={"/jibon-dorshon"} component={SeoKeywordLanding} />
        <Route path={"/bangla-ebook"} component={SeoKeywordLanding} />
        <Route path={"/bangla-status"} component={SeoKeywordLanding} />
        <Route path={"/bangla-quotes"} component={SeoKeywordLanding} />
        <Route path={"/koster-kobita"} component={SeoKeywordLanding} />
        <Route path={"/romantic-bangla-kobita"} component={SeoKeywordLanding} />
        <Route path={"/bangla-golpo"} component={SeoKeywordLanding} />
        <Route path={"/privacy-policy"} component={PrivacyPolicy} />
        <Route path={"/terms"} component={Terms} />
        <Route path={"/about"} component={About} />
        <Route path={"/contact"} component={Contact} />
        <Route path={"/ebooks"} component={EBooks} />
        <Route path={"/ebooks/read/:slug"} component={EBookReader} />
        <Route path={"/editor"} component={Editor} />
        <Route path={"/news"} component={News} />
        <Route path={"/news/:id"} component={News} />
        <Route path={"/gallery"} component={Gallery} />
        <Route path={"/amio-likhbo-bastobota"} component={AmiOLikhboBastobota} />
        <Route path={"/amio-likhbo-bastobota/:slug"} component={AmiOLikhboBastobota} />
        <Route path={"/amio-likhbo-login"} component={AmiOLikhboLogin} />
        <Route path={"/profile"} component={Profile} />
        <Route path={"/admin/live-chat"} component={AdminLiveChat} />
        <Route path={"/admin/writing"} component={AdminWritingModeration} />
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  const [loadAssistant, setLoadAssistant] = useState(false);

  useEffect(() => {
    const connection = (navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }).connection;
    const isSlowConnection = connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || "");
    const delay = isSlowConnection ? 6500 : 2500;

    const idleCallback = window.requestIdleCallback?.(() => setLoadAssistant(true), { timeout: delay });
    const timeout = window.setTimeout(() => setLoadAssistant(true), delay);

    return () => {
      if (idleCallback !== undefined) window.cancelIdleCallback?.(idleCallback);
      window.clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    const warmInternalLink = (event: Event) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;

      const url = new URL(anchor.href, window.location.origin);
      if (url.origin !== window.location.origin) return;
      preloadRoute(`${url.pathname}${url.search}${url.hash}`);
    };

    document.addEventListener("pointerover", warmInternalLink, { passive: true });
    document.addEventListener("pointerdown", warmInternalLink, { passive: true });
    document.addEventListener("touchstart", warmInternalLink, { passive: true });
    document.addEventListener("focusin", warmInternalLink);

    preloadRoutesWhenIdle([
      "/about",
      "/contact",
      "/gallery",
      "/facebook-recitations",
      "/news",
      "/editor",
      "/amio-likhbo-bastobota",
      "/writings",
      "/ebooks",
      "/privacy-policy",
      "/terms",
    ]);

    return () => {
      document.removeEventListener("pointerover", warmInternalLink);
      document.removeEventListener("pointerdown", warmInternalLink);
      document.removeEventListener("touchstart", warmInternalLink);
      document.removeEventListener("focusin", warmInternalLink);
    };
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <div className="cinematic-site-shell">
            <Router />
          </div>
          {loadAssistant ? (
            <Suspense fallback={null}>
              <AIChatbot />
            </Suspense>
          ) : null}
          <SpeedInsights />
          <Analytics />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
