# Access Checklist

## Purpose

এই ফাইলটি এমনভাবে তৈরি করা হয়েছে যাতে ভবিষ্যতে অন্য কোনো AI, developer, বা operator যদি এই ওয়েবসাইটে কাজ করতে চায়, তাহলে সে পরিষ্কারভাবে বুঝতে পারে **কী কী access থাকলে সত্যি সত্যি পূর্ণ কাজ করা যাবে** এবং কী না থাকলে শুধু context বোঝা যাবে কিন্তু কাজ শেষ করা যাবে না।

এই checklist-এর লক্ষ্য হলো বিভ্রান্তি দূর করা। অনেক সময় handoff file থাকলেও মানুষ ধরে নেয় যে সেটাই যথেষ্ট। বাস্তবে, context file কাজের দিকনির্দেশনা দেয়, কিন্তু বাস্তব edit, deploy, verification, indexing, এবং dashboard কাজের জন্য আলাদা access প্রয়োজন হয়।

## Minimum Requirement Summary

| Item | Required for Full Work? | Why It Matters |
| --- | --- | --- |
| Project source code | Yes | ওয়েবসাইটের আসল ফাইল edit করার জন্য |
| File write permission | Yes | code, content, config update করার জন্য |
| Terminal access | Yes | build, debug, install, deploy command চালানোর জন্য |
| Deployment access | Yes | live website update publish করার জন্য |
| Browser access | Usually yes | live verification, dashboard কাজ, Search Console-এর জন্য |
| Google Search Console access | Needed for SEO/indexing work | sitemap, URL inspection, indexing request-এর জন্য |
| Vercel access | Needed for live deployment control | production publish ও config management-এর জন্য |
| User confirmation | Needed for sensitive actions | account-level বা public-facing change-এর আগে |

## What Another AI Can Do Based on Access Level

| Access Level | What the AI Can Do |
| --- | --- |
| Only handoff files | project বুঝবে, plan করবে, missing info চিনবে |
| Handoff files + source code | code edit করতে পারবে |
| Source code + terminal | build, test, debug করতে পারবে |
| Code + terminal + deploy access | live site update করতে পারবে |
| Above সব + Search Console access | SEO, sitemap, indexing-related কাজ করতে পারবে |
| Above সব + domain/DNS access | custom domain, verification, DNS-level কাজ করতে পারবে |

## Exact Things to Provide to the Next AI

যদি আপনি চান অন্য AI আপনার ওয়েবসাইটে **নিখুঁতভাবে শুরু থেকে শেষ পর্যন্ত কাজ করতে পারুক**, তাহলে ideally নিচের জিনিসগুলো দিতে হবে।

| What to provide | Status needed |
| --- | --- |
| Project folder | Full |
| Relevant handoff files | Full |
| Live website URL | Full |
| Deployment environment access | Full |
| Browser session or login access | If dashboard work is needed |
| Google Search Console property access | If SEO/indexing work is needed |
| Vercel project access | If live deploy is needed |
| Domain/DNS access | If custom domain or DNS verification is needed |
| Clear user instructions | Always required |

## Recommended File Set to Share

| File | Purpose |
| --- | --- |
| `MASTER_TRANSFER_PROTOCOL.md` | Full project continuity and workflow |
| `FULL_ACCESS_NOTE.md` | Access requirements and operational summary |
| `AI_HANDOFF.md` | Quick project summary |
| `ACCESS_CHECKLIST.md` | This practical checklist |
| `seo_update_report.md` | SEO summary |
| `search_console_submission_report.md` | Search Console task summary |

## Quick Decision Table

| If the next AI has... | Then it can... |
| --- | --- |
| Only this file | Understand requirements only |
| This file + all project files | Edit locally |
| Plus terminal and deploy access | Publish updates |
| Plus Search Console access | Handle indexing and sitemap tasks |
| Plus DNS/domain access | Complete domain-level tasks |

## Final Rule

> **শুধু file দিলে context পাওয়া যায়; full access দিলে execution সম্ভব হয়।**

অর্থাৎ, যদি আপনি চান অন্য AI সত্যি সত্যি সবকিছু করতে পারুক, তাহলে তাকে শুধু instruction file নয়, বরং **code + tool access + deploy access + dashboard access + প্রয়োজনীয় অনুমতি**—সবকিছু দিতে হবে।

## One-Line Answer for Future Use

যদি কেউ জিজ্ঞেস করে, “এই ফাইল দিলেই কি সব করতে পারবে?”—তাহলে সঠিক উত্তর হবে:

> **না, এই ফাইল দিকনির্দেশনা দেবে; কিন্তু পূর্ণ কাজ করতে বাস্তব project, deployment, browser, এবং account access আলাদাভাবে লাগবে।**
