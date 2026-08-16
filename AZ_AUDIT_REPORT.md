# MahbubSardarSabuj.com — A–Z Technical, SEO, Security and UX Audit Report

**Audit date:** ১৬ আগস্ট ২০২৬  
**Repository:** `mahbub-sardar-sabuj/mahbub-sardar-sabuj-live`  
**Final production commit:** `c9d4752`  
**Deployment:** GitHub Actions → Vercel Production — successful

## Executive conclusion

ওয়েবসাইটের inherited audit-এর বাকি SEO cleanup, community moderation/privacy consistency, API preflight, deployment-limit regression এবং sitemap integrity সম্পন্ন হয়েছে। GitHub-এর `main` branch-এ সব পরিবর্তন push করা হয়েছে এবং production deployment সফলভাবে সম্পন্ন হয়েছে। Google Search Console-এ indexing নিশ্চিত করার প্রক্রিয়াটি এখন technically প্রস্তুত, তবে কোনো search engine-এর indexing বা ranking ১০০% গ্যারান্টি করা যায় না; Google নিজস্ব crawl, quality, canonical এবং spam systems দিয়ে চূড়ান্ত সিদ্ধান্ত নেয়।

> **Final live status:** sitemap index `200`, মোট **2,454 unique URLs**, যার মধ্যে **2,357 writing URLs**, duplicate URL **0**, invalid `lastmod` **0**, wrong-host URL **0**, এবং robots sitemap references সব `200` routes-এ নির্দেশ করছে।

## ১. SEO and crawlability fixes

| Area | Final result | Evidence |
|---|---:|---|
| Sitemap index | Passed | [`/sitemap-index.xml`](https://www.mahbubsardarsabuj.com/sitemap-index.xml) returns `200` |
| Writing archive | Passed | Three chunks: `1000 + 1000 + 357 = 2,357` URLs |
| Total sitemap URLs | Passed | `2,454` unique URLs across core, news and writings sitemaps |
| Duplicate URLs | Passed | `0` after removing overlapping news entries and deduplicating generated news data |
| Invalid `lastmod` | Passed | `0` |
| Wrong host | Passed | `0` |
| Robots sitemap references | Passed | Six live sitemap references; no dead community API sitemap |
| Dead SEO API references | Passed | Removed `/api/amio-sitemap` and `/api/amio-post-seo` from public SEO surfaces |
| SSR archive loading | Passed | Edge-compatible bundled writings archive remains in `api/ssr-og.js` |
| SSR cache | Passed | Live writing route returns `Cache-Control: public, max-age=0, must-revalidate`; Vercel cache observed as `HIT` |
| News metadata | Passed | Dated news entry emits ISO publication date, for example `2026-08-01T00:00:00+06:00` |

The news generator was hardened so it reads only the dedicated `newsData` array rather than scanning the entire SSR file. This prevents writing-archive entries from being incorrectly classified as news articles. Duplicate news IDs are collapsed, Bengali dates are normalized where a complete date exists, and year-only or otherwise incomplete legacy news URLs remain discoverable through the regular sitemap rather than being emitted with invalid News sitemap metadata.

## ২. Technical and deployment fixes

The production build completed successfully with both TypeScript checking and Vite/server bundling. All API JavaScript files passed syntax validation. The Vercel Hobby deployment-limit regression was also resolved: the redundant standalone `api/tts.js` function was removed because `vercel.json` already rewrites `/api/tts` to the shared `api/audio-edit.js` TTS branch. This reduced the deployment function count to a deployable level without removing the public TTS route.

| Check | Result |
|---|---:|
| `pnpm check` | Passed |
| `pnpm build` | Passed |
| GitHub secret scan | Passed in deployment workflow |
| GitHub typecheck | Passed in deployment workflow |
| GitHub tests | Passed in deployment workflow |
| Vercel production deployment | Passed |
| Repository state | Clean after final commit |

## ৩. API, tools and interaction regression

The public route smoke test returned `200` for the homepage, writings, books, sitemap index, robots, llms, and a news detail page. `/api/tts` correctly returned `400` for an empty invalid request instead of failing as an absent route. The local-auth and SMS proxy endpoints returned `200` to CORS `OPTIONS` preflight requests. Invalid SMS query input returned `400`; unsupported method handling remained `405` where the endpoint intentionally accepts GET for public SMS lookup.

The inherited fixes for Text-to-Speech, Image Upscaler, Video Upscaler, Temp Number, Temp Email, clipboard error handling, object URL cleanup, keyboard navigation, nested interactive elements, responsive overflow and global focus-visible treatment were retained and included in the successful build. The chatbot knowledge index was refreshed during the final production build and committed as `api/_knowledge/chatbotIndex.json`, with **2,357 writings** represented in the index totals.

## ৪. Security, privacy and data-handling corrections

The community writing workflow had a policy mismatch: the UI stated that posts were reviewed, while the backend inserted new posts as `approved`. New submissions now enter `pending` moderation status and appear publicly only after approval. The success message now tells the author that review is required, preventing a misleading publication claim.

The Privacy Policy was expanded to disclose community writing, login identity, comments, reactions, optional media uploads, public visibility after approval, author deletion controls, removal requests, moderation records and limited technical logs. The policy update date was set to ১৬ আগস্ট ২০২৬. The existing security hardening for rate limiting, body-size limits, secure cookie configuration and production secret requirements remains in place.

## ৫. Accessibility, UX and visual consistency

The audit retained the requested **AdorshoLipi** typography and premium dark glassmorphism design direction. Navigation menus support click and keyboard interaction rather than hover alone. Nested button/link interaction in the e-book reader was corrected. Form labels, image alternative text and visible focus treatment were checked. Responsive screenshots from the inherited audit showed no homepage horizontal overflow on mobile and tablet breakpoints.

The community page now communicates the moderation lifecycle accurately, while the privacy page provides a clearer trust layer for user-generated content. Existing tool input, output, error and loading paths were preserved through the build and regression cycle.

## ৬. Changed files and release commits

| Commit | Purpose |
|---|---|
| `506e09a` | Core SEO, API, accessibility, tools, privacy and moderation audit fixes |
| `0a5ce37` | Removed redundant TTS serverless function to satisfy Vercel Hobby limit |
| `fa6e7d7` | Removed duplicate news URLs from the core sitemap |
| `8361f51` | Corrected news sitemap extraction, date validity and SSR date normalization |
| `c9d4752` | Refreshed chatbot content index |

## ৭. Remaining caveats and recommended monitoring

The website is technically ready for crawling, but technical readiness is not the same as guaranteed Google inclusion. Google may take time to recrawl the sitemap, and inclusion can depend on content quality, canonical selection, duplicate-content signals, crawl budget, server availability and policy systems. Continue monitoring Google Search Console’s sitemap status, Page Indexing report, Core Web Vitals and AdSense policy pages after the next crawl cycle.

The dedicated News sitemap currently contains only fully dated news metadata. Older news items whose source records contain only a year or non-ISO date remain indexed through the regular sitemap, deliberately avoiding invalid `news:publication_date` values. If those articles need News sitemap eligibility, their exact publication dates should be entered in the source data and the build rerun.

## References

[1]: https://www.mahbubsardarsabuj.com/sitemap-index.xml "Live sitemap index"
[2]: https://www.mahbubsardarsabuj.com/robots.txt "Live robots.txt"
[3]: https://www.mahbubsardarsabuj.com/llms.txt "Live llms.txt"
[4]: https://www.mahbubsardarsabuj.com/writings "Live writings archive"
[5]: https://www.mahbubsardarsabuj.com/privacy-policy "Live Privacy Policy"
[6]: https://github.com/mahbub-sardar-sabuj/mahbub-sardar-sabuj-live/commits/main "GitHub main branch history"
