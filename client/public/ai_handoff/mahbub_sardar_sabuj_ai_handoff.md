# AI Handoff Document - Mahbub Sardar Sabuj Website
**Date:** April 09, 2026
**Status:** SEO Optimized, Search Console Verified, SSR Configured

## 1. Project Overview
This is a React-based personal website for writer/poet Mahbub Sardar Sabuj. It features a news portal (Sardar Sangbad), ebook reader, writings gallery, and more.

## 2. Key Accomplishments (April 2026)
### A. SEO & Social Sharing (SSR)
- **Problem:** The site was a Client-Side Rendered (CSR) app, making it hard for Google to index individual news items and for Facebook to show image previews.
- **Solution:** Implemented an **Edge Function (`api/ssr-og.js`)** that acts as a middleware. It intercepts bots (Googlebot, Facebook, etc.) and serves a static HTML page with:
  - **Open Graph Tags:** Title, Description, and Image for social sharing.
  - **JSON-LD Structured Data:** NewsArticle schema for Google News.
  - **Full Article Content:** Injected into the body for better indexing.
- **Vercel Config:** Updated `vercel.json` to route bot traffic to the SSR function while keeping the user experience as a fast SPA.

### B. Google Search Console
- **Verified:** The site is verified on Google Search Console under `mahbubsardarsabuj@gmail.com`.
- **Sitemap:** A dynamic `sitemap.xml` is maintained in `client/public/sitemap.xml` and has been submitted to Google.
- **Indexing:** Manual indexing requests were sent for all major tabs and recent news items.

### C. News Management
- News items are stored in `client/src/pages/News.tsx` (for the UI) and `api/ssr-og.js` (for SEO).
- **Latest News (ID 32):** Added a commentary on parliamentary literacy with custom image support.

## 3. Maintenance Guide for Future AI/Developers
### Adding a New News Item
1. **Image:** Save the image to `client/public/images/news/`.
2. **UI Update:** Add the news object to `newsData` array in `client/src/pages/News.tsx`.
3. **SEO Update:** Add the same object (simplified) to `newsData` in `api/ssr-og.js`.
4. **Sitemap:** Add the new URL `<url><loc>.../news/ID</loc>...</url>` to `client/public/sitemap.xml`.
5. **Push:** Commit and push to GitHub. Vercel will deploy automatically.

### Important Files
- `/vercel.json`: Routing logic for SSR.
- `/api/ssr-og.js`: The "brain" of SEO and social previews.
- `/client/src/pages/News.tsx`: Main news page logic.
- `/client/public/sitemap.xml`: SEO map for search engines.

## 4. Notes on GitHub Limits
- **Large Files:** Avoid pushing files over 100MB (like large `.tar.gz` backups) directly to GitHub. Use Git LFS or external storage for such backups.
- **Persistence:** All handoff docs are stored in `client/public/ai_handoff/` to ensure they are live and accessible on the website.
