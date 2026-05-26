import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense, useEffect, useState } from "react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { lazyRoute, preloadRoute, preloadRoutesWhenIdle } from "./lib/routePreloader";

// Keep the landing page and the primary content page in the critical path.
import Home from "./pages/Home";
import Writings from "./pages/Writings";

// Lazy load secondary pages to reduce first-load JavaScript on phones/tablets
// Writings is eagerly loaded above to avoid spinner on the main content tab
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
const AdminChatbotAnalytics = lazyRoute("AdminChatbotAnalytics");
const Profile = lazyRoute("Profile");
const AmiOLikhboLogin = lazyRoute("AmiOLikhboLogin");
const SeoKeywordLanding = lazyRoute("SeoKeywordLanding");
const TempEmail = lazyRoute("TempEmail");

// Page loading fallback — skeleton layout instead of blank spinner
function PageLoader() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#060E1A",
        padding: "0",
      }}
      aria-label="পেজ লোড হচ্ছে..."
      role="status"
    >
      {/* Skeleton Navbar */}
      <div style={{ height: 64, background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(201,168,76,0.1)", display: "flex", alignItems: "center", padding: "0 24px", gap: 16 }}>
        <div style={{ width: 120, height: 20, borderRadius: 6, background: "rgba(201,168,76,0.15)", animation: "skeletonPulse 1.5s ease-in-out infinite" }} />
        <div style={{ flex: 1 }} />
        {[80, 70, 90, 60].map((w, i) => (
          <div key={i} style={{ width: w, height: 14, borderRadius: 4, background: "rgba(255,255,255,0.06)", animation: `skeletonPulse 1.5s ease-in-out ${i * 0.1}s infinite` }} />
        ))}
      </div>
      {/* Skeleton Hero */}
      <div style={{ padding: "60px 24px 40px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ width: "60%", height: 40, borderRadius: 8, background: "rgba(201,168,76,0.12)", marginBottom: 16, animation: "skeletonPulse 1.5s ease-in-out infinite" }} />
        <div style={{ width: "80%", height: 20, borderRadius: 6, background: "rgba(255,255,255,0.06)", marginBottom: 10, animation: "skeletonPulse 1.5s ease-in-out 0.1s infinite" }} />
        <div style={{ width: "50%", height: 20, borderRadius: 6, background: "rgba(255,255,255,0.04)", marginBottom: 40, animation: "skeletonPulse 1.5s ease-in-out 0.2s infinite" }} />
        {/* Skeleton Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.08)", padding: 20, animation: `skeletonPulse 1.5s ease-in-out ${i * 0.08}s infinite` }}>
              <div style={{ width: "70%", height: 18, borderRadius: 5, background: "rgba(255,255,255,0.08)", marginBottom: 12 }} />
              <div style={{ width: "100%", height: 12, borderRadius: 4, background: "rgba(255,255,255,0.05)", marginBottom: 8 }} />
              <div style={{ width: "85%", height: 12, borderRadius: 4, background: "rgba(255,255,255,0.04)" }} />
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes skeletonPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
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
        <Route path={"/admin/chatbot-analytics"} component={AdminChatbotAnalytics} />
        <Route path={"/temp-email"} component={TempEmail} />
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
