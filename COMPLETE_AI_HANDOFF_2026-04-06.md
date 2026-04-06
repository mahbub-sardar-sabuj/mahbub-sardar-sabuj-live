# Complete AI Handoff — Mahbub Sardar Sabuj Website

## উদ্দেশ্য

এই নথিটি এমনভাবে প্রস্তুত করা হয়েছে যাতে অন্য কোনো AI সহকারী, ডেভেলপার, বা এজেন্সি **এখান থেকেই কাজ অব্যাহত রাখতে পারে**। এখানে বর্তমান live অবস্থা, সাম্প্রতিক commit, ইতোমধ্যে সম্পন্ন কাজ, এখনো বাকি থাকা কাজ, গুরুত্বপূর্ণ ফাইল, source code location, deployment context, এবং handoff package-এর কাঠামো একত্রে দেওয়া হয়েছে।

## প্রকল্পের পরিচিতি

| বিষয় | তথ্য |
|---|---|
| Project name | `mahbub-sardar-sabuj-live` |
| Primary repository path | `/home/ubuntu/work_mahbub_handoff/home/ubuntu/mahbub-sardar-sabuj-live` |
| Primary branch | `main` |
| Live custom domain | `https://www.mahbubsardarsabuj.com/` |
| Vercel domain | `https://mahbub-sardar-sabuj-live.vercel.app/` |
| Stack | React + Vite + TypeScript + Express |
| Routing | `wouter` |
| Deployment | Vercel |
| Package manager | `pnpm` |
| Language focus | Bengali |

## বর্তমান repository অবস্থা

বর্তমান working repository clean অবস্থায় আছে এবং `origin/main`-এর সাথে aligned। সর্বশেষ যাচাইকৃত branch হলো `main`। remote repository URL হলো `https://github.com/mahbub-sardar-sabuj/mahbub-sardar-sabuj-live.git`।

| Item | Status |
|---|---|
| Git status | Clean |
| Active branch | `main` |
| Remote | `origin` configured |
| Latest verified HEAD | `c59e239` |

## সাম্প্রতিক গুরুত্বপূর্ণ commit

| Commit | Summary | Impact |
|---|---|---|
| `c59e239` | Fix static home OG image metadata in index template | `client/index.html`-এ hardcoded home social metadata আপডেট করা হয়েছে যাতে live HTML-এ পুরোনো preview image না থাকে |
| `6294268` | Update default OG title and home preview image | default Open Graph title-এ `লেখক ও কবি` যোগ করা হয়েছে, এবং নতুন suit-photo image `client/public/images/og-home-suit.jpg` যোগ করা হয়েছে |
| `c6c3033` | Fix news 30 social preview metadata | news item 30-এর social preview metadata API-side update করা হয়েছে |
| `5b6d63b` | Add news item for Abu Bakar book coverage | নতুন news entry যোগ করা হয়েছে |

## এই session-এ সম্পন্ন কাজের সারাংশ

এই session-এ প্রধানত **social preview metadata audit**, **home OG title/image update**, এবং **Google indexing diagnosis** করা হয়েছে। Home URL-এর জন্য title সফলভাবে `মাহবুব সরদার সবুজ | Mahbub Sardar Sabuj - লেখক ও কবি` করা হয়েছে এবং নতুন suit-পরা image home preview image হিসেবে set করা হয়েছে। Social crawler-এর জন্য news preview logic আগেই আংশিক ছিল; তা review করা হয়েছে এবং news item 30-এর জন্য metadata confirm করা হয়েছে।

এর পাশাপাশি Google-এ individual news result কেন দেখা যাচ্ছে না, সেই বিষয়ে audit করা হয়েছে। পর্যবেক্ষণে দেখা গেছে যে social bot-এর জন্য article-specific metadata serve হলেও Googlebot news URL-এ homepage canonical/title পাচ্ছে। ফলে individual news URL-গুলো article page হিসেবে শক্ত signal পাচ্ছে না। এই সমস্যা এখনো **diagnosed but intentionally not fixed**, কারণ ব্যবহারকারী পরে এটি করতে বলেছেন।

## সম্পন্ন deliverable ও report

| File | Location | Purpose |
|---|---|---|
| `COMPLETE_AI_HANDOFF_2026-04-06.md` | repo root | এই master handoff document |
| `Google_News_Indexing_Problem_Report_BN.md` | external report, copied into handoff archive | Google indexing issue-এর user-facing summary |
| `google_news_indexing_findings_bn.md` | external report, copied into handoff archive | raw findings and technical notes |
| `HANDOFF_START_HERE.md` | repo root | prior quick-start handoff |
| `MASTER_HANDOFF.md` | repo root | earlier project-wide handoff |
| `handoff_report.md` | repo root | older chatbot-related handoff |
| `seo_update_report.md` | repo root | previous SEO work summary |
| `search_console_submission_report.md` | repo root | Search Console submission notes |
| `search_console_verification_notes.md` | repo root | verification notes |
| `live_verification_notes.md` | repo root | live checks |

## বর্তমানে live-এ নিশ্চিতভাবে কার্যকর পরিবর্তন

| Area | Current state |
|---|---|
| Home title | `মাহবুব সরদার সবুজ | Mahbub Sardar Sabuj - লেখক ও কবি` |
| Home preview image | নতুন suit-পরা image ব্যবহৃত হচ্ছে |
| Static fallback metadata | `client/index.html`-এ updated |
| Default SEO component metadata | updated |
| Home OG SSR metadata | updated |
| News 30 social preview | adjusted/verified |

## এখনো pending কিন্তু করা হয়নি

ব্যবহারকারীর নির্দেশ অনুযায়ী Google news indexing fix এখনো codebase-এ apply করা হয়নি। এটি কেবল audit ও documentation স্তরে আছে। অন্য AI বা ডেভেলপারকে এই অংশ থেকে কাজ resume করতে হলে নিচের টেবিল অনুসরণ করা উচিত।

| Priority | Pending task | Likely file(s) |
|---|---|---|
| High | Googlebot-এর জন্য article-specific SSR metadata serve করা | `vercel.json`, `api/ssr-og.js` |
| High | `robots.txt`-এ sitemap URL custom domain-এ fix করা | `client/public/robots.txt` |
| High | `sitemap.xml`-এ missing news URLs যোগ করা | `client/public/sitemap.xml` |
| High | News list-এ plain crawlable anchor link যোগ করা | `client/src/pages/News.tsx` |
| Medium | NewsArticle structured data যোগ করা | `client/src/pages/News.tsx`, `client/src/components/Seo.tsx` বা related metadata layer |
| Medium | Search Console-এ individual news URL inspect/request করা | Browser-side manual operation |

## Google indexing audit থেকে মূল সিদ্ধান্ত

| Finding | Meaning |
|---|---|
| Social bot article metadata পাচ্ছে | Facebook/Twitter share preview ঠিক থাকতে পারে |
| Googlebot homepage metadata পাচ্ছে | Google article page-কে আলাদা entity হিসেবে ঠিকমতো ধরছে না |
| `robots.txt`-এ পুরোনো sitemap domain আছে | sitemap discovery signal দুর্বল হতে পারে |
| `sitemap.xml` অসম্পূর্ণ | নতুন news URLs দ্রুত discover নাও হতে পারে |
| News cards primarily click-handler based | crawlability weaker than plain `<a href>` structure |

## continuation-এর জন্য সবচেয়ে গুরুত্বপূর্ণ file map

| File | Why it matters |
|---|---|
| `client/index.html` | static HTML shell, fallback meta tags, live raw head output |
| `client/src/components/Seo.tsx` | default page-level SEO metadata |
| `api/ssr-og.js` | crawler-targeted SSR metadata generation |
| `vercel.json` | routing and bot-specific SSR behavior |
| `client/src/pages/News.tsx` | news listing, detail behavior, URL state, crawlability |
| `client/public/robots.txt` | crawler instructions and sitemap declaration |
| `client/public/sitemap.xml` | URL discovery for Google |
| `package.json` | run/build scripts |

## local run, build, and validation commands

| Task | Command |
|---|---|
| Go to repo | `cd /home/ubuntu/work_mahbub_handoff/home/ubuntu/mahbub-sardar-sabuj-live` |
| Install dependencies | `pnpm install` |
| Development server | `pnpm dev` |
| Production build | `pnpm build` |
| Production start | `pnpm start` |
| Type check | `pnpm check` |
| Tests | `pnpm test` |

## deployment context

প্রকল্পটি Vercel-এ deploy করা হয়। Remote GitHub repository push হলে auto-deployment trigger হতে পারে। প্রয়োজনে manual production deploy-ও করা সম্ভব। Browser-based verification-এর সময় custom domain `https://www.mahbubsardarsabuj.com/` এবং Vercel domain—দুটোই cross-check করা ভালো।

| Deployment item | Note |
|---|---|
| Hosting | Vercel |
| Git remote | GitHub connected |
| Custom domain | `www.mahbubsardarsabuj.com` |
| Alternate domain | `mahbub-sardar-sabuj-live.vercel.app` |

## handoff package-এ কী অন্তর্ভুক্ত করা হয়েছে

এই handoff preparation-এর অংশ হিসেবে repository-র ভেতরে ও বাইরে থাকা গুরুত্বপূর্ণ report-গুলো একত্র করে একটি archive-ready package প্রস্তুত করা হয়েছে। Source snapshot-এ repository content রাখা হবে, তবে অপ্রয়োজনীয় build artifact, `node_modules`, `.git`, এবং local secret env file archive থেকে বাদ রাখা হয়েছে যাতে package ব্যবহারযোগ্য ও নিরাপদ থাকে।

| Included | Status |
|---|---|
| Source code snapshot | Included |
| Existing handoff/report files | Included |
| Current session indexing reports | Included |
| Master handoff file | Included |
| Secret env values | Excluded for safety |
| `.git` directory | Excluded |
| `node_modules` | Excluded |
| `dist` build output | Excluded |

## অন্য AI-এর জন্য restart protocol

যদি অন্য কোনো AI এই কাজ continue করে, তাহলে প্রথম ধাপে repository root-এ গিয়ে `COMPLETE_AI_HANDOFF_2026-04-06.md`, `HANDOFF_START_HERE.md`, `MASTER_HANDOFF.md`, `seo_update_report.md`, এবং handoff archive-এর indexing report দুটো পড়তে হবে। এরপর live HTML compare করে `vercel.json`, `api/ssr-og.js`, `client/public/robots.txt`, `client/public/sitemap.xml`, এবং `client/src/pages/News.tsx`-এ target fix apply করতে হবে। তারপর commit, push, deployment verify, এবং Search Console submission/update process follow করতে হবে।

## final note

এই handoff document-এর উদ্দেশ্য হলো যেন **এখান থেকে কোনো context loss না হয়**। বর্তমান repository state, latest SEO/social work, unresolved Google indexing issue, এবং prior historical handoff docs—সবকিছু একসাথে সংগঠিত রাখা হয়েছে যাতে পরবর্তী AI বা ডেভেলপার শূন্য থেকে শুরু করতে না হয়।

---
**Prepared on:** 2026-04-06
**Prepared by:** Manus AI
