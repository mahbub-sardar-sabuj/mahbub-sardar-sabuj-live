# Organic Visitor Growth Release

## লক্ষ্য

এই release-এর লক্ষ্য হলো মাহবুব সরদার সবুজের ওয়েবসাইটে **ভুয়া traffic ছাড়া প্রকৃত পাঠক** বাড়ানো। উন্নয়নের প্রধান ক্ষেত্র হলো Google-এর জন্য crawler-visible content understanding, প্রতিটি লেখার shareability, পাঠককে এক লেখা থেকে অন্য লেখায় নেওয়া এবং সঠিক analytics measurement।

> এই release visitor-এর সংখ্যা রাতারাতি কৃত্রিমভাবে বাড়ানোর প্রতিশ্রুতি দেয় না। Search engine crawl, indexing, ranking এবং সামাজিক মাধ্যমে মানুষের স্বাভাবিক interaction সময়সাপেক্ষ। এখানে সেই দীর্ঘমেয়াদি বৃদ্ধির ভিত্তি শক্ত করা হয়েছে।

## বর্তমান baseline

Vercel Web Analytics-এর live dashboard অনুযায়ী ৯–১৬ আগস্ট ২০২৬ সময়কালে **৮৮ জন visitor**, **১,৬৬৩ page view** এবং **৫২% bounce rate** দেখা গেছে। একই dashboard-এ Facebook-এর বিভিন্ন domain ও Google referral পাওয়া গেছে। এটি নির্দেশ করে যে বর্তমান acquisition-এর প্রধান বাস্তব উৎস social এবং search—দুটি channel-ই উন্নত করার সুযোগ আছে।

| মেট্রিক | যাচাইকৃত অবস্থা | ব্যাখ্যা |
|---|---:|---|
| Visitors | ৮৮ | ৯–১৬ আগস্ট ২০২৬; পুরো মাস নয় |
| Page Views | ১,৬৬৩ | একই সময়কাল |
| Bounce Rate | ৫২% | একই সময়কাল |
| Google referral | ১১ | Last 7 Days dashboard view |
| m.facebook.com referral | ১৪ | Last 7 Days dashboard view |
| Content archive | ২,৩৫৭টি লেখা | Sitemap ও chatbot archive-এর live count |

## সম্পন্ন technical SEO growth কাজ

প্রতিটি writing detail page-এর crawler-visible SSR metadata উন্নত করা হয়েছে। Googlebot এখন একটি লেখার জন্য সঠিক canonical URL, title, description এবং `Article` structured data পায়। আগের `CreativeWork` schema-কে `Article` করা হয়েছে এবং লেখার category-কে `articleSection` হিসেবে যুক্ত করা হয়েছে। Invalid year-only `datePublished` field সরানো হয়েছে, ফলে ভুল date metadata পাঠানোর ঝুঁকি কমেছে। Publisher entity-ও `Organization` হিসেবে নির্ধারণ করা হয়েছে।

প্রতিটি লেখার client page-এ Article ও BreadcrumbList structured data যোগ করা হয়েছে। এতে লেখার title, লেখক, ভাষা, category, site hierarchy এবং free accessibility সম্পর্কে consistent metadata থাকে। লেখার list, individual page, sitemap index ও robots.txt live HTTP 200 verification-এ সঠিক response দিয়েছে।

| উন্নয়ন | visitor growth-এ ভূমিকা |
|---|---|
| SSR `Article` schema | crawler-কে লেখার বিষয় ও কাঠামো বুঝতে সাহায্য করে |
| Canonical URL verification | duplicate/ভুল URL-এর পরিবর্তে একটি authoritative URL signal দেয় |
| Breadcrumb structured data | site hierarchy ও internal discovery শক্তিশালী করে |
| ২,৩৫৭ লেখার sitemap coverage | বৃহৎ archive crawl ও indexing-ready রাখে |
| Valid metadata hygiene | invalid date/metadata সমস্যা কমায় |

## Social sharing ও reader retention উন্নয়ন

প্রতিটি writing detail page-এ এখন তিন স্তরের sharing path আছে: native device share, Facebook share এবং WhatsApp share; পাশাপাশি link copy action রয়েছে। iPhone ও Android ব্যবহারকারী native share ব্যবহার করে Messenger, Facebook, WhatsApp, Telegram বা পছন্দের অন্য app-এ লেখা পাঠাতে পারবেন। এতে কোনো raw URL দেখানোর প্রয়োজন হয় না এবং মোবাইল থেকে শেয়ার করা সহজ হয়।

পাঠককে সাইটে ধরে রাখার জন্য একই category-এর চারটি related writing এবং category-aware previous/next writing navigation আগেই ছিল; সেটি new schema ও share flow-এর সঙ্গে বজায় রাখা হয়েছে। প্রতিটি লেখায় লেখকের পরিচয়, category, reading context এবং all-writings navigation আছে।

## Quality ও live verification

| পরীক্ষা | ফলাফল |
|---|---|
| SSR handler JavaScript syntax | সফল |
| TypeScript check | সফল |
| Production build | সফল |
| Chatbot canonical regression | ১০/১০ সফল |
| GitHub secret scan ও Vercel CI | সফল |
| Vercel Production Deployment | সফল |
| Googlebot user-agent দিয়ে live Article schema | উপস্থিত |
| Googlebot user-agent দিয়ে canonical URL | উপস্থিত |
| `/writings` | HTTP 200 |
| Individual writing page | HTTP 200 |
| `/sitemap-index.xml` | HTTP 200 |
| `/robots.txt` | HTTP 200 |

## পরবর্তী ৩০ দিনের বাস্তব growth plan

প্রথম দুই সপ্তাহে Vercel Analytics-এ visitor, Google referral, Facebook referral, top pages এবং bounce rate সপ্তাহে একবার তুলনা করতে হবে। ২,৩৫৭টি লেখার মধ্যে Google ও Facebook থেকে যেসব URL-এ আগ্রহ আসছে, সেগুলোর title, opening paragraph, related writing এবং share CTA নিয়মিত পর্যালোচনা করা উচিত।

প্রতি সপ্তাহে Facebook-এ নির্বাচিত ৩–৫টি লেখার canonical URL-সহ ছোট excerpt প্রকাশ করা উচিত। পোস্টে সম্পূর্ণ লেখা সাইটে পড়ার স্পষ্ট CTA থাকতে হবে। একই সঙ্গে Google Search Console-এ নতুন index coverage, indexed pages, queries এবং sitemap status দেখা প্রয়োজন। দীর্ঘমেয়াদে visitor বাড়ানোর সবচেয়ে কার্যকর পথ হলো নির্দিষ্ট search intent-এর জন্য মানসম্পন্ন বাংলা লেখা, natural social sharing এবং দ্রুত readable page experience—bot traffic নয়।

## সীমাবদ্ধতা

Google ranking, Facebook reach এবং visitor সংখ্যা কোনো code change-এর সঙ্গে সঙ্গে নিশ্চিতভাবে বাড়ে না। Search engine crawl ও content quality evaluation-এ সময় লাগে। এই release সেই বৃদ্ধির জন্য technical ও user-experience ভিত্তি উন্নত করেছে; পরবর্তী ফল analytics এবং Search Console দিয়ে পরিমাপ করা হবে।

## References

[1] [Vercel Web Analytics dashboard](https://vercel.com/mahbub-sardar-sabuj-s-projects/mahbub-sardar-sabuj-live/analytics)

[2] [Google Search Central: structured data introduction](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)

[3] [Google Search Central: canonicalization](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
