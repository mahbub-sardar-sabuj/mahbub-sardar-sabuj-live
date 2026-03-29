# Master Transfer Protocol

## Purpose

এই ডকুমেন্টটি এমনভাবে তৈরি করা হয়েছে যাতে ভবিষ্যতে অন্য কোনো AI agent, developer, বা technical operator এই প্রজেক্ট হাতে পেলে নতুন করে অনুমান করে কাজ শুরু না করে, বরং সরাসরি **বর্তমান বাস্তব অবস্থা, ব্যবহারকারীর পছন্দ, সম্পন্ন কাজ, প্রয়োজনীয় access, execution rules, deployment workflow, SEO status, এবং পরবর্তী decision logic** বুঝে কাজ করতে পারে।

এই ফাইলের মূল কাজ হলো continuity নিশ্চিত করা। অর্থাৎ, ব্যবহারকারীর ইচ্ছা অনুযায়ী কাজের মান, সিদ্ধান্তের ধরন, এবং operational discipline যেন একই থাকে। তবে একটি বিষয় পরিষ্কারভাবে মনে রাখতে হবে: **এই ডকুমেন্ট context ও instruction দেয়; বাস্তব account permission, file permission, deploy permission, এবং dashboard permission আলাদাভাবে available থাকতে হবে।**

## User Identity and Project Identity

| Item | Value |
| --- | --- |
| Website owner | Mahbub Sardar Sabuj |
| Project type | Personal website |
| Core themes | Personal branding, writings, recitations |
| Local project path | `/home/ubuntu/website_inspect_1774633962/mahbub-sardar-sabuj-live` |
| Live URL | `https://mahbub-sardar-sabuj-live.vercel.app/` |
| Deployment platform | Vercel |
| Search Console property | URL prefix property for the live Vercel URL |

## User Preference Profile

এই ব্যবহারকারীর সাথে কাজ করার সময় সবচেয়ে গুরুত্বপূর্ণ নির্দেশনা হলো **যা বলা হয়েছে ঠিক তা-ই করা**, নিজের পক্ষ থেকে বাড়তি structure চাপিয়ে না দেওয়া। ব্যবহারকারী একাধিকবার স্পষ্ট করেছেন যে হোমপেজে অপ্রয়োজনীয় content রাখা যাবে না, এবং আলাদা section বা আলাদা tab-এর অনুরোধ থাকলে সেটিকে হুবহু সেইভাবেই implement করতে হবে। ভবিষ্যৎ AI-এর উচিত minimalist decision নেওয়া, unnecessary promotional text এড়িয়ে চলা, এবং requested information architecture সম্মান করা।

এই প্রজেক্টে content placement, navigation naming, এবং page separation—এসব বিষয়ে ব্যবহারকারীর preference খুবই নির্দিষ্ট। তাই future changes করার আগে সবসময় দেখতে হবে কোনো content হোমপেজে থাকা উচিত, আর কোনটি আলাদা route বা tab-এ থাকা উচিত। যদি ব্যবহারকারী বলেন “হোমপেজে না”, তাহলে সেটি homepage থেকে সরাতেই হবে; alternative interpretation করা যাবে না।

## Completed Work Summary

এই প্রজেক্টে ইতোমধ্যে কয়েকটি গুরুত্বপূর্ণ structural, deployment, এবং SEO কাজ সম্পন্ন হয়েছে। হোমপেজে আগে Facebook recitation section ছিল। ব্যবহারকারীর নির্দেশনা অনুযায়ী সেটি হোমপেজ থেকে সরিয়ে আলাদা, minimal, standalone page-এ নেওয়া হয়েছে। Navigation-এ **আবৃত্তি** tab যুক্ত করা হয়েছে এবং route configuration-এ নতুন path যোগ করা হয়েছে।

Vercel deployment-এ Single Page Application routing সমস্যা ছিল, যার ফলে direct route open করলে 404 আসছিল। `vercel.json` সংশোধন করে SPA fallback এবং correct frontend output serve করার ব্যবস্থা করা হয়েছে। Live verification করা হয়েছে এবং `/facebook-recitations` route production-এ কাজ করছে।

এরপর SEO উন্নত করা হয়েছে। Homepage, Writings page, এবং Facebook Recitations page-এ title, description, canonical URL, Open Graph, Twitter metadata, এবং structured data signal যোগ করা হয়েছে। Reusable SEO component তৈরি করা হয়েছে। `robots.txt` এবং `sitemap.xml` লাইভ ডোমেইন অনুযায়ী update করা হয়েছে।

Google Search Console-এ property যোগ, ownership verification, sitemap submission, এবং homepage URL-এর জন্য indexing request পাঠানো হয়েছে। এর মানে basic technical discoverability setup complete। তবে indexing এবং ranking এখনও Google-এর নিজস্ব timeline-এর ওপর নির্ভরশীল।

## Current Reality

| Topic | Current State |
| --- | --- |
| Homepage cleanup | Completed |
| Separate recitation page | Completed |
| Navigation update | Completed |
| Route wiring | Completed |
| Vercel SPA routing fix | Completed |
| Baseline SEO setup | Completed |
| Robots and sitemap update | Completed |
| Search Console verification | Completed |
| Sitemap submission | Completed |
| Homepage indexing request | Completed |
| Guaranteed Google ranking | Not guaranteed |

## Core Files That Matter Most

| File | Why It Matters |
| --- | --- |
| `MASTER_TRANSFER_PROTOCOL.md` | এই master instruction file |
| `FULL_ACCESS_NOTE.md` | Operational access summary |
| `AI_HANDOFF.md` | Quick-start context summary |
| `seo_update_report.md` | SEO কাজের report |
| `search_console_submission_report.md` | Search Console action summary |
| `search_console_verification_notes.md` | Verification notes |
| `client/src/App.tsx` | Route definition |
| `client/src/components/Navbar.tsx` | Navigation control |
| `client/src/components/Seo.tsx` | Page-level SEO logic |
| `client/src/pages/Home.tsx` | Homepage content |
| `client/src/pages/Writings.tsx` | Writings page |
| `client/src/pages/FacebookRecitations.tsx` | Recitation page |
| `client/index.html` | Base head metadata and verification meta |
| `client/public/robots.txt` | Crawling rules |
| `client/public/sitemap.xml` | Discoverability URLs |
| `vercel.json` | Deployment and rewrite behavior |

## What the Next AI Must Understand Before Editing Anything

এই প্রজেক্টে সবচেয়ে বড় ভুল হবে context না বুঝে “improvement” করার চেষ্টা করা। ব্যবহারকারী minimal, structured, instruction-faithful outcome চান। তাই future AI-এর উচিত আগে live site দেখা, তারপর relevant file পড়া, তারপর user instruction-এর সাথে current implementation মিলিয়ে দেখা। কোনো change শুরু করার আগে এই প্রশ্নগুলোর উত্তর জানা জরুরি:

| Question | Why It Matters |
| --- | --- |
| User কি content সরাতে বলেছেন, না redesign করতে বলেছেন? | Wrong scope এড়াতে |
| User কি homepage-এ চান, না separate tab চান? | Information architecture ঠিক রাখতে |
| Existing deployment live আছে কি? | Production breakage এড়াতে |
| SEO-related change live domain-এর সাথে consistent কি না? | Indexing signal ঠিক রাখতে |
| Search Console action দরকার কি? | Browser access লাগবে কি না বুঝতে |

## Access Matrix for True End-to-End Control

এই অংশটি অত্যন্ত গুরুত্বপূর্ণ। কোনো AI যেন ভুল না বোঝে যে শুধু এই file পেলেই সবকিছু magically possible হয়ে যাবে। সম্পূর্ণ control-এর জন্য নিচের access-গুলো বাস্তবে দরকার হবে।

| Access | Minimum Requirement | Needed For |
| --- | --- | --- |
| Project folder access | Read/write access to local files | Code edit, refactor, asset update |
| Terminal access | Command execution permission | Build, package install, diagnostics |
| Deployment access | Vercel project access | Production deploy, config change |
| Browser session access | Logged-in browser if applicable | Live verification, dashboard tasks |
| Search Console access | Verified property dashboard access | Sitemap, URL inspection, indexing request |
| Domain/DNS access | DNS management access | Custom domain, TXT/CNAME verification |
| User approval | Explicit permission for sensitive actions | Dashboard-level changes, account actions |

## What the Next AI Can Do If Access Is Available

| Task Type | Possible? | Condition |
| --- | --- | --- |
| Edit existing pages | Yes | Source code access required |
| Create new pages | Yes | Source code and build access required |
| Change navigation | Yes | Source code access required |
| Update SEO metadata | Yes | Source code access required |
| Fix deployment errors | Yes | Source code plus deploy access required |
| Redeploy live site | Yes | Vercel access required |
| Submit sitemap again | Yes | Search Console access required |
| Request indexing for new pages | Yes | Search Console access required |
| Add custom domain | Yes | Domain and Vercel access required |
| Maintain user intent precisely | Yes | This file must be read first |

## Non-Negotiable Working Rules for the Next AI

ভবিষ্যৎ AI-কে নিচের নিয়মগুলো বাধ্যতামূলকভাবে মানতে হবে।

| Rule | Meaning |
| --- | --- |
| Follow the user literally | User যা বলেছেন তার বাইরে speculative redesign করা যাবে না |
| Remove unnecessary content | যদি user “অপ্রয়োজনীয়” বলেন, minimalist cleanup করতে হবে |
| Respect homepage boundaries | সব কিছু homepage-এ রাখা যাবে না |
| Validate locally before deploy | build/test ছাড়া production push করা যাবে না |
| Recheck live result after deploy | deploy-এর পর actual behavior verify করতে হবে |
| Do not assume Google visibility is immediate | indexing delay explained থাকতে হবে |
| Ask before sensitive account action | account-level change-এর আগে user permission লাগবে |

## Preferred Change Strategy

এই user-এর জন্য best strategy হলো small, precise, high-confidence changes করা। প্রথমে relevant file identify করতে হবে, তারপর smallest necessary edit করতে হবে, তারপর local build, তারপর live deploy, তারপর visual verification। বড় rewrite, unnecessary copy expansion, বা style experiment এড়িয়ে চলা উচিত, যদি না user নিজে সেগুলো চান।

একটি change যদি শুধু layout বা content placement নিয়ে হয়, তাহলে unrelated SEO বা structural পরিবর্তন একসাথে করা উচিত নয়। আবার user যদি SEO, indexing, বা Google visibility নিয়ে জিজ্ঞেস করেন, তখন technical truth পরিষ্কারভাবে বলতে হবে: setup করা যায়, কিন্তু Google-এর result timing guarantee করা যায় না।

## Startup Checklist for the Next AI

| Step | Action |
| --- | --- |
| 1 | `MASTER_TRANSFER_PROTOCOL.md` সম্পূর্ণ পড়া |
| 2 | `AI_HANDOFF.md`, `FULL_ACCESS_NOTE.md`, `seo_update_report.md`, `search_console_submission_report.md` পড়া |
| 3 | Live site খুলে বর্তমান UI verify করা |
| 4 | Relevant component/page files inspect করা |
| 5 | User-এর নতুন instruction-এর সাথে existing state compare করা |
| 6 | Smallest valid plan তৈরি করা |
| 7 | Code edit করা |
| 8 | Local build validate করা |
| 9 | Production deploy করা |
| 10 | Live route এবং visible result check করা |

## Deployment Workflow

এই প্রজেক্টে deploy করার আগে source code consistency এবং route behavior যাচাই করা জরুরি। বিশেষ করে নতুন page, new route, বা path change হলে Vercel rewrite behavior এবং output path break হয়েছে কি না দেখতে হবে। যেহেতু এই project-এ আগে route-related 404 issue ছিল, তাই future deploy-এর পর direct URL open করে test করা mandatory।

যদি নতুন page যোগ করা হয়, তাহলে শুধু navigation click test যথেষ্ট নয়; direct URL test-ও করতে হবে। উদাহরণস্বরূপ, homepage থেকে click করলে কাজ করছে কিন্তু direct browser open-এ fail করছে—এমন issue আগে ছিল। তাই rewrite configuration সবসময় mind-এ রাখতে হবে।

## SEO and Search Visibility Protocol

SEO setup ইতোমধ্যে baseline level-এ আছে, কিন্তু future AI চাইলে এটিকে আরও refine করতে পারে। তবু আগে existing metadata destroy করা যাবে না। নতুন metadata লিখতে হলে user name, personal identity, writings, recitations, এবং canonical live domain consistency বজায় রাখতে হবে। `robots.txt`, `sitemap.xml`, এবং page-level SEO data একে অপরের সাথে aligned থাকতে হবে।

Google Search Console-এ existing property already verified। তাই future AI যদি নতুন গুরুত্বপূর্ণ page তৈরি করে, তাহলে প্রয়োজনে sitemap update এবং URL inspection request বিবেচনা করতে পারে। তবে Search Console action account-level operation হওয়ায় user permission এবং browser access থাকা উচিত।

## If the User Asks “Will It Show on Google Now?”

এই ধরনের প্রশ্নে future AI-এর উত্তর হওয়া উচিত factual এবং non-misleading। সঠিক framing হলো: technical groundwork complete, but actual appearance in Google search depends on crawling, indexing, and ranking timeline. কোনো অবস্থাতেই “এখনই দেখাবে” বলে নিশ্চয়তা দেওয়া যাবে না, যদি না বাস্তব search result manually verify করা হয়।

## Escalation Logic

| Situation | Correct Response |
| --- | --- |
| User asks for content removal | Remove it cleanly, do not restyle unless asked |
| User asks for separate tab/page | Create distinct route and navigation item |
| Live page shows 404 | Check `vercel.json`, build output, and route rewrites |
| Google visibility not happening yet | Explain indexing delay and inspect Search Console status |
| Verification needed in dashboard | Use existing login if available, otherwise ask user |
| Sensitive account action needed | Ask for explicit confirmation first |

## Ready-to-Transfer Package

যদি এই project অন্য AI-কে handover করতে হয়, তাহলে ideally নিচের package দেওয়া উচিত:

| Item | Must Include? |
| --- | --- |
| `MASTER_TRANSFER_PROTOCOL.md` | Yes |
| `FULL_ACCESS_NOTE.md` | Yes |
| `AI_HANDOFF.md` | Yes |
| Full project folder | Yes |
| Deployment capability | Ideally yes |
| Browser/login state or equivalent access | If Search Console/Vercel work is needed |
| User instruction history summary | Yes |

## Final Instruction to the Next AI

যদি তুমি এই project-এর next AI হও, তাহলে প্রথমে ধরে নাও না যে তুমি redesign করতে এসেছ। ধরে নাও তুমি continuity রক্ষা করতে এসেছ। ব্যবহারকারীর tone, specificity, এবং direct instruction এখানে খুব গুরুত্বপূর্ণ। Minimal, exact, and verified execution-ই এই project-এর success standard। 

এই project scratch থেকে শুরু করার প্রয়োজন নেই। Core structure, separate recitation page, SEO baseline, Search Console verification, sitemap submission, এবং indexing request ইতোমধ্যে complete। তোমার কাজ হবে এখান থেকে **maintain, refine, expand, or correct** করা—কিন্তু always user instruction-এর সঙ্গে strict alignment রেখে।
