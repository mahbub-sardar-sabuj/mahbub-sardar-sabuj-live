# MahbubSardarSabuj.com — A–Z প্রযুক্তিগত, SEO, নিরাপত্তা ও ব্যবহারকারী অভিজ্ঞতা নিরীক্ষা প্রতিবেদন

**নিরীক্ষার তারিখ:** ১৬ আগস্ট ২০২৬  
**রিপোজিটরি:** `mahbub-sardar-sabuj/mahbub-sardar-sabuj-live`  
**সর্বশেষ production commit:** `c9d4752`  
**Deployment:** GitHub Actions → Vercel Production — সফল

## সারসংক্ষেপ ও চূড়ান্ত সিদ্ধান্ত

ওয়েবসাইটের inherited audit-এর বাকি SEO cleanup, community moderation/privacy consistency, API preflight, deployment-limit regression এবং sitemap integrity সম্পন্ন হয়েছে। GitHub-এর `main` branch-এ সব পরিবর্তন push করা হয়েছে এবং production deployment সফলভাবে সম্পন্ন হয়েছে। Google Search Console-এ indexing নিশ্চিত করার জন্য ওয়েবসাইটের technical foundation এখন প্রস্তুত। তবে কোনো search engine-এর indexing বা ranking ১০০% গ্যারান্টি করা যায় না; Google নিজস্ব crawl, quality, canonical এবং spam systems ব্যবহার করে চূড়ান্ত সিদ্ধান্ত নেয়।

> **চূড়ান্ত live status:** sitemap index `200`, মোট **২,৪৫৪টি unique URL**, যার মধ্যে **২,৩৫৭টি writing URL**। Duplicate URL **০**, invalid `lastmod` **০**, wrong-host URL **০** এবং robots sitemap references সব `200` live route-এ নির্দেশ করছে।

## ১. SEO ও crawlability সংশোধন

| বিষয় | চূড়ান্ত ফলাফল | প্রমাণ |
|---|---:|---|
| Sitemap index | সফল | [`/sitemap-index.xml`](https://www.mahbubsardarsabuj.com/sitemap-index.xml) `200` response দেয় |
| লেখালেখির archive | সফল | তিনটি chunk: `1000 + 1000 + 357 = 2,357` URL |
| মোট sitemap URL | সফল | Core, news এবং writings sitemap মিলিয়ে `2,454`টি unique URL |
| Duplicate URL | সফল | Overlapping news entry সরানো ও generated news data deduplicate করার পর `0` |
| Invalid `lastmod` | সফল | `0` |
| ভুল host | সফল | `0` |
| Robots sitemap references | সফল | ছয়টি live sitemap reference; dead community API sitemap নেই |
| Dead SEO API reference | সফল | Public SEO surface থেকে `/api/amio-sitemap` এবং `/api/amio-post-seo` সরানো হয়েছে |
| SSR archive loading | সফল | Edge-compatible bundled writings archive `api/ssr-og.js`-এ রাখা হয়েছে |
| SSR cache | সফল | Live writing route `Cache-Control: public, max-age=0, must-revalidate` ফেরত দেয়; Vercel cache-এ `HIT` দেখা গেছে |
| News metadata | সফল | Dated news entry ISO publication date দেয়; উদাহরণ: `2026-08-01T00:00:00+06:00` |

News generator-কে শক্তিশালী করা হয়েছে, যাতে এটি পুরো SSR file scan না করে শুধু নির্দিষ্ট `newsData` array পড়ে। ফলে লেখালেখির archive-এর লেখা ভুলভাবে news article হিসেবে News sitemap-এ ঢুকে যায় না। Duplicate news ID একত্র করা হয়েছে, সম্পূর্ণ date থাকলে Bengali date normalize করা হয়েছে এবং শুধু বছর বা অসম্পূর্ণ date-যুক্ত পুরোনো news URL-গুলো invalid News sitemap metadata হিসেবে না গিয়ে regular sitemap-এর মাধ্যমে discoverable রাখা হয়েছে।

## ২. প্রযুক্তিগত ও deployment সংশোধন

TypeScript checking এবং Vite/server bundling-সহ production build সফলভাবে সম্পন্ন হয়েছে। সব API JavaScript file syntax validation-এ পাশ করেছে। Vercel Hobby deployment-limit সংক্রান্ত সমস্যাও সমাধান করা হয়েছে। `vercel.json` আগে থেকেই `/api/tts` route-কে shared `api/audio-edit.js`-এর TTS branch-এ rewrite করছিল, তাই redundant standalone `api/tts.js` function সরানো হয়েছে। এতে public TTS route না সরিয়েই deployment function সংখ্যা deploy করার উপযোগী পর্যায়ে এসেছে।

| পরীক্ষা | ফলাফল |
|---|---:|
| `pnpm check` | সফল |
| `pnpm build` | সফল |
| GitHub secret scan | Deployment workflow-এ সফল |
| GitHub typecheck | Deployment workflow-এ সফল |
| GitHub tests | Deployment workflow-এ সফল |
| Vercel production deployment | সফল |
| Repository state | সর্বশেষ commit-এর পরে clean |

## ৩. API, tools ও interaction regression

Public route smoke test-এ homepage, writings, books, sitemap index, robots, llms এবং একটি news detail page `200` response দিয়েছে। খালি invalid request পাঠালে `/api/tts` সঠিকভাবে `400` response দিয়েছে; অনুপস্থিত route হিসেবে ব্যর্থ হয়নি। Local-auth এবং SMS proxy endpoint CORS `OPTIONS` preflight request-এ `200` response দিয়েছে। Invalid SMS query input `400` response দিয়েছে; unsupported method-এর ক্ষেত্রে endpoint-এর নির্ধারিত GET-only আচরণ অনুযায়ী `405` response বজায় আছে।

Text-to-Speech, Image Upscaler, Video Upscaler, Temp Number, Temp Email, clipboard error handling, object URL cleanup, keyboard navigation, nested interactive element, responsive overflow এবং global focus-visible সংক্রান্ত inherited fix-গুলো সফল build-এর মধ্যে রাখা হয়েছে। Final production build-এর সময় chatbot knowledge index refresh করা হয়েছে এবং `api/_knowledge/chatbotIndex.json` হিসেবে commit করা হয়েছে। Index total-এ **২,৩৫৭টি লেখা** রয়েছে।

## ৪. নিরাপত্তা, privacy ও data handling সংশোধন

Community writing workflow-এ একটি policy mismatch ছিল: UI-তে লেখা review করা হয় বলা হলেও backend নতুন post-কে সরাসরি `approved` status-এ সংরক্ষণ করছিল। এখন নতুন submission `pending` moderation status-এ যায় এবং admin approval-এর পরই public হয়। Success message-এও review প্রয়োজন—এটি স্পষ্ট করা হয়েছে, ফলে misleading publication claim আর থাকে না।

Privacy Policy সম্প্রসারিত করে community writing, login identity, comments, reactions, optional media upload, approval-এর পর public visibility, author deletion control, removal request, moderation records এবং সীমিত technical log সম্পর্কে পরিষ্কার disclosure যোগ করা হয়েছে। Policy update date ১৬ আগস্ট ২০২৬ করা হয়েছে। Rate limiting, body-size limit, secure cookie configuration এবং production secret requirement-সহ পূর্বের security hardening বহাল আছে।

## ৫. Accessibility, UX ও visual consistency

অনুরোধ অনুযায়ী **AdorshoLipi** typography এবং premium dark glassmorphism design direction বহাল রাখা হয়েছে। Navigation menu এখন শুধু hover-নির্ভর নয়; click এবং keyboard interaction-ও সমর্থন করে। E-book reader-এর nested button/link interaction সংশোধন করা হয়েছে। Form label, image alternative text এবং visible focus treatment পরীক্ষা করা হয়েছে। Inherited audit-এর responsive screenshot-এ mobile ও tablet breakpoint-এ homepage-এ horizontal overflow দেখা যায়নি।

Community page এখন moderation lifecycle সঠিকভাবে ব্যাখ্যা করে। Privacy page user-generated content-এর জন্য আরও পরিষ্কার trust layer প্রদান করে। Existing tool input, output, error এবং loading path build ও regression cycle-এর মধ্যেও অক্ষুণ্ণ রাখা হয়েছে।

## ৬. পরিবর্তিত file ও release commit

| Commit | উদ্দেশ্য |
|---|---|
| `506e09a` | Core SEO, API, accessibility, tools, privacy এবং moderation audit fix |
| `0a5ce37` | Vercel Hobby limit মেটাতে redundant TTS serverless function সরানো |
| `fa6e7d7` | Core sitemap থেকে duplicate news URL সরানো |
| `8361f51` | News sitemap extraction, date validity এবং SSR date normalization সংশোধন |
| `c9d4752` | Chatbot content index refresh |

## ৭. অবশিষ্ট বিষয় ও recommended monitoring

ওয়েবসাইট এখন crawling-এর জন্য technically প্রস্তুত। তবে technical readiness Google inclusion-এর নিশ্চয়তার সমান নয়। Google sitemap পুনরায় crawl করতে সময় নিতে পারে এবং inclusion নির্ভর করতে পারে content quality, canonical selection, duplicate-content signal, crawl budget, server availability এবং policy system-এর ওপর। পরবর্তী crawl cycle-এর পর Google Search Console-এর sitemap status, Page Indexing report, Core Web Vitals এবং AdSense policy page নিয়মিত পর্যবেক্ষণ করা উচিত।

Dedicated News sitemap-এ বর্তমানে শুধু সম্পূর্ণ date-যুক্ত news metadata রাখা হয়েছে। যেসব পুরোনো news record-এ শুধু বছর অথবা non-ISO date রয়েছে, সেগুলো invalid `news:publication_date` তৈরি না করে regular sitemap-এর মাধ্যমে indexed থাকবে। এসব article-কে News sitemap-এর জন্য eligible করতে হলে source data-তে সঠিক publication date যোগ করে build পুনরায় চালাতে হবে।

## রেফারেন্স

[১]: https://www.mahbubsardarsabuj.com/sitemap-index.xml "Live sitemap index"
[২]: https://www.mahbubsardarsabuj.com/robots.txt "Live robots.txt"
[৩]: https://www.mahbubsardarsabuj.com/llms.txt "Live llms.txt"
[৪]: https://www.mahbubsardarsabuj.com/writings "Live writings archive"
[৫]: https://www.mahbubsardarsabuj.com/privacy-policy "Live Privacy Policy"
[৬]: https://github.com/mahbub-sardar-sabuj/mahbub-sardar-sabuj-live/commits/main "GitHub main branch history"
