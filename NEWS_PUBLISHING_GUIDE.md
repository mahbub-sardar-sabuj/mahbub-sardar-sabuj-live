# Google News–Ready নিউজ প্রকাশ নির্দেশিকা

এই repository-তে নতুন নিউজ যোগ করার সময় লক্ষ্য হলো প্রতিটি article যেন crawler-readable metadata, structured data এবং sitemap entry সহ প্রকাশিত হয়। এটি Google-কে নিউজ বুঝতে সাহায্য করে, তবে Google News tab-এ inclusion বা ranking Google-এর নিজস্ব crawling, indexing, quality এবং policy evaluation-এর ওপর নির্ভর করে।

## কোথায় নিউজ যোগ করবেন

বর্তমানে নিউজের public rendering `client/src/pages/News.tsx` থেকে হয় এবং crawler/SSR metadata source `api/ssr-og.js`-এর `newsData` array থেকে তৈরি হয়। নতুন নিউজ যোগ করার সময় একই `id`, `title`, `excerpt`, `image`, `date`, `category` এবং `keywords` দুই জায়গায় মিলিয়ে রাখতে হবে।

| Field | নিয়ম | উদাহরণ |
|---|---|---|
| `id` | unique positive number হতে হবে, সাধারণত আগের সবচেয়ে বড় id-এর পরের সংখ্যা | `40` |
| `title` | সংবাদ শিরোনাম পরিষ্কার ও নির্দিষ্ট হতে হবে | `নতুন বই ঘিরে পাঠকমহলে আলোচনা` |
| `excerpt` | অন্তত ৫০ অক্ষরের summary দিতে হবে | `...` |
| `content` | পূর্ণ article text থাকতে হবে | `...` |
| `image` | SSR source-এ absolute `https://www.mahbubsardarsabuj.com/...` URL; frontend source-এ `/images/...` path | `https://www.mahbubsardarsabuj.com/images/news/example.jpg` |
| `date` | SSR source-এ অবশ্যই `YYYY-MM-DD`; frontend source-এ বাংলা date text ব্যবহার করা যাবে | `2026-04-28` |
| `category` | article section বোঝাতে হবে | `সাহিত্য` |
| `keywords` | title/topic/category মিলিয়ে comma-separated keywords দিন | `বই, সাহিত্য, সরদার সংবাদ` |

## স্বয়ংক্রিয় SEO sync

নতুন নিউজ যোগ করার পর নিচের command চালালে `news-sitemap.xml` এবং মূল `sitemap.xml`-এর news block স্বয়ংক্রিয়ভাবে আপডেট হবে। Production build-এর আগেও এই sync স্বয়ংক্রিয়ভাবে চালু করা হয়েছে।

```bash
npm run news:sync
npm run news:check
npm run check
npm run build
```

`npm run news:check` ব্যর্থ হলে বুঝতে হবে sitemap source data-এর সঙ্গে sync করা নেই বা কোনো required metadata missing আছে। Deploy করার আগে এই command পাস করানো উচিত।

## প্রকাশের পর করণীয়

নিউজ publish হওয়ার পর Google Search Console-এ `https://www.mahbubsardarsabuj.com/news-sitemap.xml` submit/refresh করুন এবং গুরুত্বপূর্ণ নতুন URL-এর জন্য URL Inspection থেকে Request Indexing দিন। Google News sitemap সাধারণত সাম্প্রতিক news discovery-তে সাহায্য করে; পুরনো article সাধারণ Search indexing-এর মাধ্যমে দেখা যেতে পারে।
