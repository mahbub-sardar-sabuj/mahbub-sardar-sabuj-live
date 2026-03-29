# Master Project Handoff: Mahbub Sardar Sabuj Official Website

## 1. Project Overview

এই ফাইলটি এমনভাবে তৈরি করা হয়েছে যাতে নতুন কোনো AI সহকারী বা ডেভেলপার এটি পড়েই কাজ শুরু করতে পারে। এটি **মাহবুব সরদার সবুজ**-এর অফিসিয়াল ওয়েবসাইট প্রজেক্ট। সাইটটিতে লেখকের পরিচয়, বই, কবিতা, গল্প এবং আবৃত্তির সংগ্রহ রয়েছে। 

| Item | Value |
| --- | --- |
| **Project Name** | `mahbub-sardar-sabuj-live` |
| **Live URL** | `https://mahbub-sardar-sabuj-live.vercel.app/` |
| **Primary Goal** | Showcase author's portfolio, writings, and monetize via Google AdSense |
| **Language** | Bengali (bn) |

## 2. Tech Stack & Architecture

প্রজেক্টটি একটি আধুনিক React অ্যাপ্লিকেশন হিসেবে তৈরি করা হয়েছে:

- **Frontend Framework:** React 19 + Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS + custom `index.css`
- **Routing:** `wouter`
- **Animations:** `framer-motion`
- **Components:** Radix UI (`@radix-ui/react-*`) + custom components
- **Backend/API (if needed):** Express + tRPC (in `server/_core/`)
- **Database (if needed):** MySQL with Drizzle ORM
- **Package Manager:** `pnpm`

### Key Files & Directories

| Path | Purpose |
| --- | --- |
| `client/src/App.tsx` | Main application router containing all page routes |
| `client/src/components/Navbar.tsx` | Primary navigation and mobile menu logic |
| `client/src/pages/Home.tsx` | Homepage content, hero section, and book showcase |
| `client/index.html` | Global HTML shell, meta tags, structured data, AdSense script |
| `client/public/ads.txt` | AdSense publisher verification file |
| `client/public/sitemap.xml` | XML sitemap for search engines |
| `client/public/robots.txt` | Crawler directives |
| `vercel.json` | Vercel deployment configuration and routing rules |

## 3. Recent Accomplishments

### SEO Optimization (Completed)
সাইটের SEO সম্পূর্ণভাবে অপটিমাইজ করা হয়েছে যাতে Google Search-এ "মাহবুব সরদার সবুজ" লিখলে সাইটটি সবার উপরে আসে।
- **Meta Tags:** Title, description, canonical URLs, and Open Graph/Twitter metadata added to `index.html`.
- **Structured Data:** JSON-LD schema for `Person`, `WebSite`, and `Book` added.
- **Search Console:** Sitemap (`sitemap.xml`) successfully submitted to Google Search Console. Homepage indexing manually requested.

### Google AdSense Setup (Completed)
AdSense থেকে ইনকাম শুরু করার জন্য প্রয়োজনীয় সব পদক্ষেপ সম্পন্ন করা হয়েছে:
- **Account:** lekhokmahbubsardarsabuj@gmail.com
- **Publisher ID:** `pub-3350204114310360`
- **AdSense Snippet:** Added to `<head>` in `index.html`.
- **ads.txt:** Created and deployed to root (`/ads.txt`), verified working (HTTP 200).
- **Current Status:** Site is in **"Getting ready"** status (Google review pending, usually takes 7-14 days). Policy center shows **"No current issues"**.

## 4. How to Run & Deploy

### Local Development
টার্মিনাল থেকে project root-এ গিয়ে নিচের কমান্ডগুলো ব্যবহার করুন:

```bash
cd /home/ubuntu/mahbub-sardar-sabuj-project/mahbub-sardar-sabuj-live
pnpm install
pnpm dev      # Starts local development server
pnpm build    # Builds for production
```

### Deployment (Vercel)
সাইটটি Vercel-এ হোস্ট করা আছে। Deploy করার জন্য:

```bash
npx vercel --prod --yes
```
*Note: `vercel.json` contains a specific rewrite rule to ensure `ads.txt`, `robots.txt`, and `sitemap.xml` are served correctly and not caught by the SPA fallback route.*

## 5. Next Steps & Action Items

যে ব্যক্তি বা AI এরপর কাজ করবে, তার জন্য নিচের কাজগুলো অগ্রাধিকার পাবে:

1. **AdSense Monitoring:** Check the AdSense dashboard after a few days to see if the site approval ("Getting ready") has changed to "Ready".
2. **Search Console Monitoring:** Verify that Google has successfully crawled the sitemap and indexed the homepage.
3. **Custom Domain:** If the user acquires a custom domain (e.g., `mahbubsardarsabuj.com`), update Vercel settings, AdSense site list, and Search Console properties accordingly.
4. **Content Updates:** Add new writings or recitations as requested by the user.

---
**Document Last Updated:** March 28, 2026
**Author:** Manus AI
