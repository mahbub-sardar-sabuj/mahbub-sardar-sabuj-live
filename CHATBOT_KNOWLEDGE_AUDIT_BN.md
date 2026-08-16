# চ্যাটবট Knowledge ও Response Audit

## সারসংক্ষেপ

ওয়েবসাইটের চ্যাটবটের পুরোনো knowledge ও response flow পরিষ্কার করে নতুন canonical বাংলা knowledge system তৈরি করা হয়েছে। আগের response-এ দেখা `undefined`, `[BUTTON:undefined]` এবং raw order URL সমস্যাগুলো সংশোধন করা হয়েছে। এখন চ্যাটবট বই, লেখক, লেখালেখি, আবৃত্তি, সব website page, tools, community submission, privacy policy এবং ব্যবহারবিধি সম্পর্কে একীভূত ও যাচাইকৃত তথ্য ব্যবহার করে।

## যেসব সমস্যা সমাধান করা হয়েছে

| সমস্যা | সংশোধন |
|---|---|
| বইয়ের তালিকায় `undefined` | `readPath`, `pages` ও missing metadata-এর নিরাপদ fallback যোগ করা হয়েছে। অনলাইন reader না থাকলে স্পষ্টভাবে জানানো হয়। |
| `[BUTTON:undefined]` | Backend sanitizer invalid button token সরিয়ে দেয় এবং valid internal route ছাড়া button তৈরি করে না। |
| raw order URL | order URL এখন `[ORDER:লেবেল|URL]` action token হিসেবে যায় এবং frontend-এ সুন্দর external button হিসেবে দেখায়। |
| nested `[ORDER]` token | sanitizer-এ double wrapping বন্ধ করা হয়েছে। |
| বই query ভুল page result দেখানো | বইয়ের তালিকা ও নির্দিষ্ট বইয়ের query-কে index search-এর আগে canonical book formatter-এ পাঠানো হয়েছে। |
| “সব লেখা” query বইয়ের result দেখানো | writing-এর জন্য early routing guard যোগ করা হয়েছে। |
| নিজের লেখা প্রকাশ query ভুল লেখালেখি page-এ যাওয়া | community submission-এর জন্য আলাদা routing guard যোগ করা হয়েছে। |
| আবৃত্তি query AI TTS-এ যাওয়া | Facebook recitation collection-এর জন্য আলাদা routing guard যোগ করা হয়েছে। |
| পুরোনো ২,৩৩৩/২,৩৪৩ লেখা count | live archive অনুযায়ী সঠিক মোট **২,৩৫৭টি লেখা** করা হয়েছে। |
| ভুল follower claim | যাচাইহীন follower সংখ্যা সরানো হয়েছে। |
| raw social links | social/contact response-এ raw URL না দেখিয়ে contact page action ব্যবহার করা হয়েছে। |

## নতুন canonical knowledge

চ্যাটবট এখন লেখক মাহবুব সরদার সবুজের পরিচয়, জন্মস্থান, পিতা-মাতা, বর্তমান অবস্থান, লেখার ধরন, বই, ই-বুক, লেখার বিভাগ, আবৃত্তি, tools, community moderation, privacy policy এবং terms সম্পর্কে নির্ধারিত knowledge base ব্যবহার করে। নতুন লেখা community-তে জমা দিলে তা আগে moderation review-তে থাকে এবং অনুমোদনের পর public feed-এ প্রকাশিত হয়—frontend ও backend দুটিতেই এই নিয়ম একই রাখা হয়েছে।

লেখার archive-এর live category count পুনর্গণনা করা হয়েছে: ছোট লেখা ১,১২২টি, জীবনদর্শন ৬৬২টি, বিচ্ছেদ ২৬০টি, ভালোবাসা ১৯৮টি, কবিতা ৯৮টি, গল্প ২টি এবং ইসলামিক লেখা ১৫টি। মোট যোগফল ২,৩৫৭টি।

চ্যাটবটের route knowledge-এ হোম, পরিচিতি, লেখালেখি, বই ও ই-বুক, আবৃত্তি, ডিজাইন স্টুডিও, গ্যালারি, সংবাদ, contact, AI আবৃত্তি, ছবি ও ভিডিও আপস্কেলার, অডিও এডিটর, temporary tools, community login, profile, privacy policy এবং terms যোগ করা হয়েছে।

## Order action design

চ্যাটবট এখন বইয়ের অর্ডার response-এ raw URL দেখায় না। উদাহরণস্বরূপ, backend internal token তৈরি করে:

`[ORDER:অভিমান অর্ডার করুন|https://rkmri.co/Te303mA3TEyA/]`

Frontend এই token-কে “অভিমান অর্ডার করুন” label-সহ external action button-এ রূপান্তর করে। একইভাবে “দুঃখবিলাস অর্ডার করুন” action-ও যুক্ত হয়েছে। Internal website route-গুলো আলাদা `[BUTTON:/path]` token হিসেবে render হয়।

## পরীক্ষার প্রমাণ

| পরীক্ষা | ফলাফল |
|---|---:|
| Canonical chatbot regression cases | **১০/১০ সফল** |
| JavaScript syntax check | সফল |
| TypeScript check | সফল |
| Chatbot index generation | **২,৩৯৮টি item** তৈরি হয়েছে |
| Production build | সফল |
| GitHub secret scan | সফল |
| Vercel typecheck ও test workflow | সফল |
| Vercel production deployment | সফল |
| Live `/` | HTTP 200 |
| Live `/sitemap-index.xml` | HTTP 200 |
| Live `/robots.txt` | HTTP 200 |
| Live `/llms.txt` | HTTP 200 |
| Live `/api/tts` invalid request | HTTP 400, যথাযথ validation response |
| Live `/api/chat` GET | HTTP 405, সঠিক method protection |
| Live book order query | সঠিক ORDER action token |
| Live writing query | ২,৩৫৭টি লেখা ও `/writings` action |
| Live community query | moderation-aware `/amio-likhbo-bastobota` action |
| Live recitation query | `/facebook-recitations` action |

## GitHub ও deployment

পরিবর্তনগুলো commit `ba53695`-এ সংরক্ষিত হয়েছে এবং `main` branch-এ push করা হয়েছে। সর্বশেষ Vercel Production Deployment সফল হয়েছে। সংশ্লিষ্ট পরিবর্তনের মধ্যে canonical knowledge, training examples, chat backend, chatbot index, frontend token parser এবং regression test অন্তর্ভুক্ত আছে।

## গুরুত্বপূর্ণ ব্যবহারনীতি

চ্যাটবট যাচাইকৃত website knowledge না পেলে তথ্য বানিয়ে বলবে না। কোনো token-এ `undefined`, `null` বা খালি route ব্যবহার করবে না। website page-এ পাঠাতে internal button ব্যবহার করবে; বই অর্ডারের জন্য external order action button ব্যবহার করবে। স্বাস্থ্য, আইন ও অর্থসংক্রান্ত উত্তরে প্রয়োজনীয় সতর্কতা বজায় রাখবে। ব্যবহারকারীর community লেখা review ছাড়া public হয়েছে—এমন বিভ্রান্তিকর দাবি করবে না।

## সীমাবদ্ধতা

চ্যাটবটের live response এখন সঠিকভাবে কাজ করছে এবং raw link leak বন্ধ হয়েছে। তবে AI provider-এর উত্তর যদি কোনো সময় নতুন, অপ্রত্যাশিত format তৈরি করে, sanitizer ও canonical fallback সেটি নিয়ন্ত্রণ করবে। Google indexing বা external order provider-এর নিজস্ব availability এই code release-এর বাইরে।
