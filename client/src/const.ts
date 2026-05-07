export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

const hasConfiguredEnvValue = (value: unknown) =>
  typeof value === "string" && value.trim().length > 0 && value !== "undefined" && value !== "null";

export const isLoginConfigured =
  hasConfiguredEnvValue(import.meta.env.VITE_OAUTH_PORTAL_URL) && hasConfiguredEnvValue(import.meta.env.VITE_APP_ID);

type AuthFlowType = "signIn" | "signUp";

const getAuthUrl = (type: AuthFlowType) => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;

  if (typeof window === "undefined") {
    return "/";
  }

  if (!isLoginConfigured) {
    console.warn("OAuth login is not configured. Missing VITE_OAUTH_PORTAL_URL or VITE_APP_ID.");
    return "/?login=configuration-required";
  }

  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL("/app-auth", oauthPortalUrl);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", type);

  return url.toString();
};

// Generate login URL at runtime so redirect URI reflects the current origin.
// If OAuth environment variables are missing in production, return a safe local
// fallback instead of throwing `undefined/app-auth cannot be parsed as a URL`.
export const getLoginUrl = () => getAuthUrl("signIn");

// Generate account creation URL through the same secure OAuth portal.
export const getSignupUrl = () => getAuthUrl("signUp");
