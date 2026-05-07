# Runtime test notes — আমিও লিখবো বাস্তবতা

Date: 2026-05-07

## Local test

The local page `/amio-likhbo-bastobota` loaded successfully after the OAuth URL fallback fix. Clicking the login CTA no longer produced the previous `undefined/app-auth cannot be parsed as a URL` runtime crash. Instead, it redirected to `/?login=configuration-required`.

## Live test

The live page `https://www.mahbubsardarsabuj.com/amio-likhbo-bastobota` loaded successfully. Browser console showed no runtime errors on initial load. Clicking the login CTA also did not crash the page and redirected to `https://www.mahbubsardarsabuj.com/?login=configuration-required` without console errors.

## Remaining UX issue

Although the crash is fixed, the login CTA currently redirects visitors away from the writing-platform tab to the home page with a query string when OAuth environment variables are missing. A stronger user-facing fix is to avoid rendering a normal login link when auth is not configured and instead show a clear Bengali notice on the same page.

## Proposed robust correction

Expose an `isLoginConfigured` helper based on `VITE_OAUTH_PORTAL_URL` and `VITE_APP_ID`; update the writing platform page so that when login is not configured, the CTA shows a non-crashing explanatory message instead of navigating to a fallback route.

## Local retest after inline-login UX fix

The local page `http://localhost:3001/amio-likhbo-bastobota` loaded successfully after the new `isLoginConfigured` helper and inline Bengali notice were added. Browser keyword verification found the message `লগইন সিস্টেম শীঘ্রই চালু হবে`, and the hero CTA now renders as a disabled `লগইন শীঘ্রই চালু হবে` button instead of a normal link. The browser console showed no runtime errors.

## Build verification after inline-login UX fix

`pnpm run check && pnpm run build` completed successfully after the UX fix. The build still reports only the existing large-chunk warning for frontend assets, not a blocking error.

## Live verification after push

After pushing commit `cac33e4`, the live URL `https://www.mahbubsardarsabuj.com/amio-likhbo-bastobota` still loaded without browser console errors. At the moment of verification, the production deployment was still serving the previous asset version: the hero login CTA was still a normal `লগইন করুন` link rather than the new disabled `লগইন শীঘ্রই চালু হবে` state. This indicates the GitHub commit is pushed, but the hosting deployment has not yet picked up or finished deploying the latest commit.

## 2026-05-07 — আমিও লিখবো বাস্তবতা login/account-only redesign verification

Local page checked at `http://localhost:3001/amio-likhbo-bastobota` after redesign. The tab now renders as a dedicated login/account landing page with three cards: **লগইন প্যানেল**, **একাউন্ট তৈরি**, and **প্রোফাইল প্রস্তুতি**. The previous writing feed, category list, post composer, reactions, comments, and admin moderation UI are no longer present on this page.

Build verification passed with `pnpm run check` and `pnpm run build`. Browser console on the local page showed no JavaScript errors. The UI uses the AdorshoLipi font stack through page-level styling and global Bengali font variables.
