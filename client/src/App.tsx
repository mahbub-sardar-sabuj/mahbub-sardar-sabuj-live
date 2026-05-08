import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Eagerly load Home and NotFound for instant first render
import Home from "./pages/Home";
import NotFound from "@/pages/NotFound";

// Lazy load all other pages to reduce initial bundle size
const FacebookRecitations = lazy(() => import("./pages/FacebookRecitations"));
const Writings = lazy(() => import("./pages/Writings"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Terms = lazy(() => import("./pages/Terms"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const EBooks = lazy(() => import("./pages/EBooks"));
const EBookReader = lazy(() => import("./pages/EBookReader"));
const Editor = lazy(() => import("./pages/Editor"));
const News = lazy(() => import("./pages/News"));
const Gallery = lazy(() => import("./pages/Gallery"));
const AmiOLikhboBastobota = lazy(() => import("./pages/AmiOLikhboBastobota"));
const AIChatbot = lazy(() => import("./components/AIChatbot"));
const AdminLiveChat = lazy(() => import("./pages/AdminLiveChat"));
const AdminWritingModeration = lazy(() => import("./pages/AdminWritingModeration"));
const Profile = lazy(() => import("./pages/Profile"));

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
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
          <Suspense fallback={null}>
            <AIChatbot />
          </Suspense>
          <SpeedInsights />
          <Analytics />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
