# Project Handoff: Mahbub Sardar Sabuj Website

## Purpose

এই ফাইলটি এমনভাবে তৈরি করা হয়েছে যাতে নতুন কোনো ডেভেলপার, এজেন্সি, বা AI সহকারী এটি পড়েই কাজ শুরু করতে পারে। এখানে বর্তমান অবস্থা, গুরুত্বপূর্ণ ফাইল, রান করার ধাপ, ডিপ্লয় প্রসেস, এবং সাম্প্রতিক পরিবর্তনগুলো সংক্ষেপে কিন্তু কার্যকরভাবে দেওয়া হয়েছে।

## Project Identity

| Item | Value |
| --- | --- |
| Project name | `mahbub-sardar-sabuj-live` |
| Local source path | `/home/ubuntu/site_live_check/mahbub-sardar-sabuj-live` |
| Live URL | `https://mahbub-sardar-sabuj-live.vercel.app/` |
| Stack | React + Vite + TypeScript + Express |
| Routing | `wouter` |
| Animation | `framer-motion` |
| Deployment | Vercel |
| Package manager | `pnpm` |

## Current Live Status

প্রজেক্টটি বর্তমানে live আছে এবং সর্বশেষ UI আপডেট deploy করা হয়েছে। মোবাইল মেনু scrollable রাখা হয়েছে, অপ্রয়োজনীয় helper text সরানো হয়েছে, `প্রধান মেনু`-এর আলাদা box সরানো হয়েছে, এবং `তথ্য ও নীতিমালা` section আবার ফিরিয়ে আনা হয়েছে—কিন্তু তার explanatory sentence রাখা হয়নি।

বই সেকশনে আগের PNG image সরিয়ে নতুন JPG image ব্যবহার করা হয়েছে। সাইটের AdSense onboarding flow-ও শুরু করা হয়েছে এবং review request submit করা হয়েছে। ফলে ভবিষ্যৎ কাজের ক্ষেত্রে UI polishing, content editing, compliance improvement, বা deployment maintenance—সবগুলোই এখান থেকে চালানো যাবে। 

## Recent Completed Changes

| Area | What was done |
| --- | --- |
| Mobile menu | Scrollable overlay করা হয়েছে |
| Mobile menu cleanup | অপ্রয়োজনীয় instructional text সরানো হয়েছে |
| Mobile menu header | `প্রধান মেনু` title box সরানো হয়েছে |
| Information section | `তথ্য ও নীতিমালা` section restore করা হয়েছে |
| Information section text | বর্ণনামূলক বাক্য সরানো হয়েছে |
| Book section | পুরোনো PNG cover সরিয়ে নতুন JPG image বসানো হয়েছে |
| AdSense | Site added, verification snippet যুক্ত, review request submit করা হয়েছে |

## Important Files

| File | Why it matters |
| --- | --- |
| `client/src/components/Navbar.tsx` | Mobile menu, navigation items, information/policy cards |
| `client/src/pages/Home.tsx` | Homepage content এবং book section |
| `client/index.html` | Global HTML shell, meta, AdSense snippet |
| `client/src/App.tsx` | Route registration |
| `client/src/pages/FacebookRecitations.tsx` | আলাদা আবৃত্তি পেজ |
| `client/public/robots.txt` | Crawl নির্দেশনা |
| `client/public/sitemap.xml` | Sitemap |
| `vercel.json` | Vercel routing/deploy config |
| `package.json` | Scripts and dependencies |
| `search_console_submission_report.md` | Search Console submission notes |
| `seo_update_report.md` | SEO-related prior work summary |

## AdSense Status

AdSense account-এ website add করা হয়েছে, site verification flow সম্পন্ন করা হয়েছে, এবং review request submit করা হয়েছে। CMP flow-তে more compliant option হিসেবে three-choice setup বেছে নেওয়া হয়েছিল। বর্তমানে review pending ধাপে থাকার সম্ভাবনা বেশি, তাই dashboard-এ status recheck করা দরকার হতে পারে।

যে ব্যক্তি পরের কাজ নেবে, তার জানা দরকার যে:

| Item | Status |
| --- | --- |
| AdSense account | Existing account used |
| Site added | Yes |
| Verification snippet | Added to site HTML |
| Review request | Submitted |
| Possible next step | Approval wait, compliance review, ads.txt/privacy/terms recheck |

## How to Run Locally

টার্মিনাল থেকে project root-এ গিয়ে নিচের ধাপগুলো অনুসরণ করতে হবে।

| Task | Command |
| --- | --- |
| Go to project | `cd /home/ubuntu/site_live_check/mahbub-sardar-sabuj-live` |
| Install dependencies | `pnpm install` |
| Run dev server | `pnpm dev` |
| Build project | `pnpm build` |
| Run production build | `pnpm start` |
| Type check | `pnpm check` |

## Deployment Process

বর্তমান deployment Vercel-এ করা হয়। যদি Vercel CLI already authenticated থাকে, তাহলে নিচের command দিয়েই production deploy করা যাবে।

| Task | Command |
| --- | --- |
| Production deploy | `npx vercel --prod --yes` |

Build-এর সময় analytics placeholder environment variable নিয়ে warning দেখা যেতে পারে। এই warning build block করছে না, তবে future cleanup-এর জন্য `client/index.html` বা env setup revisit করা যেতে পারে।

## Recommended Next Actions

| Priority | Suggested next step |
| --- | --- |
| High | মোবাইল মেনু Safari/iPhone-এ final visual QA |
| High | AdSense dashboard-এ review status recheck |
| High | `ads.txt`, Privacy Policy, Terms, Contact consistency audit |
| Medium | Custom domain যুক্ত করার পরিকল্পনা |
| Medium | Homepage performance এবং bundle size optimisation |
| Low | Content copy refinement and image compression |

## Quick Working Notes for Next Person

যদি নতুন কেউ এই project নেয়, তাহলে প্রথমে `Navbar.tsx`, `Home.tsx`, `client/index.html`, `package.json`, এবং `vercel.json` দেখে নেবে। UI-related request এলে `Navbar.tsx`-এই বেশিরভাগ mobile menu logic পাওয়া যাবে। AdSense বা verification-related কাজ করতে হলে `client/index.html` এবং live deployment status দুটোই চেক করতে হবে।

যদি user বলেন যে live site-এ পুরোনো কিছু দেখাচ্ছে, তাহলে browser cache issue হতে পারে। সে ক্ষেত্রে hard refresh, private window check, বা Vercel deployment URL compare করা উচিত।

## Deliverable Note

এই handoff file-এর সাথে source code archive আলাদা করে দেওয়া হবে, যাতে এটি সরাসরি অন্য কাউকে পাঠানো যায়।
