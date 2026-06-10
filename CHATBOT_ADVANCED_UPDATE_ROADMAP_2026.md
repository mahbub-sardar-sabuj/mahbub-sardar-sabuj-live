# মাহবুব সরদার সবুজ ওয়েবসাইট চ্যাটবট: উন্নত আপডেট পরিকল্পনা ২০২৬

**প্রস্তুতকারক:** Manus AI  
**তারিখ:** ১০ জুন ২০২৬  
**প্রকল্প:** `mahbub-sardar-sabuj-live`

## ১. নির্বাহী সারাংশ

বর্তমান ওয়েবসাইটের চ্যাটবট ইতোমধ্যে একটি সাধারণ FAQ bot নয়; এটি **AI Agent**, **লাইভ চ্যাট handoff**, **লেখক/বই/লেখালেখি knowledge response**, **image-aware chat**, **audio/video processing**, **streaming chat**, **Telegram notification**, এবং নতুনভাবে যুক্ত **analytics endpoint**–এর মতো গুরুত্বপূর্ণ ভিত্তি তৈরি করে ফেলেছে। তাই পরবর্তী উন্নয়ন পরিকল্পনার মূল লক্ষ্য হওয়া উচিত নতুন নতুন বিচ্ছিন্ন feature যোগ করা নয়, বরং বিদ্যমান feature-গুলোকে আরও নির্ভুল, দ্রুত, ব্যবহারবান্ধব, নিরাপদ এবং admin-controlled করা।

> **মূল লক্ষ্য:** চ্যাটবটকে “ওয়েবসাইট সহকারী” থেকে **পূর্ণাঙ্গ সাহিত্য, কনটেন্ট, অডিও, ভিশন ও লাইভ সাপোর্ট AI অপারেটিং সেন্টার**–এ উন্নীত করা।

এই পরিকল্পনায় ৬টি মূল স্তম্ভ রাখা হয়েছে: **Knowledge Engine**, **Conversation Intelligence**, **Premium UI/UX**, **Multimodal Studio**, **Analytics & Admin Control**, এবং **Reliability/Security**। পরিকল্পনাটি এমনভাবে সাজানো হয়েছে যাতে ছোট ছোট sprint-এ বাস্তবায়ন করা যায় এবং প্রতিটি sprint শেষে ব্যবহারযোগ্য উন্নয়ন live করা সম্ভব হয়।

## ২. বর্তমান অবস্থার সংক্ষিপ্ত মূল্যায়ন

রিপোজিটরি পর্যালোচনায় দেখা গেছে, চ্যাটবটের frontend মূলত `client/src/components/AIChatbot.tsx`-এ পরিচালিত হচ্ছে। Backend chat logic আছে `api/chat.js`-এ, যেখানে system prompt, intent detection, canonical reply, fallback reply, AI provider fallback, streaming mode এবং analytics support যুক্ত আছে। Audio workflow-এর জন্য `api/audio-edit.js`, video-to-audio workflow-এর জন্য `api/video-to-audio.js`, এবং chatbot notification-এর জন্য `api/chatbot-notify.js` আছে।

| ক্ষেত্র | বর্তমান অবস্থা | উন্নয়নের সুযোগ |
|---|---|---|
| **AI উত্তর** | canonical reply, model fallback, built-in fallback আছে | intent confidence, source citation, answer grading যোগ করা দরকার |
| **Knowledge** | static knowledge ও writings archive আছে | searchable index, category ranking, news/gallery/ebook metadata একীভূত করা দরকার |
| **UI/UX** | floating widget, quick actions, context actions আছে | full assistant panel, task cards, better upload center, mobile-first UX দরকার |
| **Multimodal** | image, audio, video workflow আছে | guided studio mode, before/after preview, processing timeline দরকার |
| **Analytics** | basic `/api/analytics` endpoint যোগ হয়েছে | persistent storage, feedback dashboard, failed question clustering দরকার |
| **Live chat** | tRPC live chat ও Telegram notification আছে | AI-to-human handoff rule, queue state, transcript summary দরকার |

## ৩. উন্নয়নের প্রধান নীতি

চ্যাটবট উন্নয়নের সময় তিনটি নীতি কঠোরভাবে মানা উচিত। প্রথমত, **চ্যাটবট যেন ভুল তথ্য না বানায়**; লেখক, বই, লেখা, আবৃত্তি, যোগাযোগ ও ওয়েবসাইট পেজের তথ্য structured knowledge থেকে আসবে। দ্বিতীয়ত, **প্রতিটি উত্তরের পর ব্যবহারকারীকে next action দেওয়া হবে**; যেমন বই পড়া, লেখা দেখা, যোগাযোগ করা, অডিও upload করা বা লাইভ চ্যাটে যাওয়া। তৃতীয়ত, **privacy ও safety আগে**; ব্যক্তিগত তথ্য, image/audio upload, analytics, admin key এবং notification সব জায়গায় minimum data policy রাখা উচিত।

| নীতি | প্রয়োগ |
|---|---|
| **Source-grounded response** | লেখক/ওয়েবসাইট সম্পর্কিত উত্তর শুধু verified knowledge থেকে তৈরি হবে |
| **Action-first UX** | উত্তর শেষে button, quick action বা suggested next step থাকবে |
| **Progressive disclosure** | নতুন ব্যবহারকারীকে সহজ option, advanced ব্যবহারকারীকে studio feature দেখানো হবে |
| **Privacy by design** | analytics-এ raw sensitive content না রেখে masked/limited text রাখা হবে |
| **Fail gracefully** | AI provider failure হলেও built-in answer, retry বা live chat handoff থাকবে |

## ৪. Phase 1 — Smart Knowledge Engine 2.0

প্রথম phase-এর কাজ হলো চ্যাটবটকে ওয়েবসাইটের কনটেন্ট সম্পর্কে আরও নির্ভুল করা। বর্তমানে knowledge static prompt ও archive-ভিত্তিক। পরবর্তী ধাপে `siteKnowledge`, `writingsArchive`, ebooks, recitations, gallery, news এবং page map থেকে একটি **unified searchable knowledge index** তৈরি করা উচিত।

| কাজ | প্রযুক্তিগত বাস্তবায়ন | অগ্রাধিকার | Acceptance Criteria |
|---|---|---:|---|
| Unified knowledge index | `scripts/build-chatbot-index.mjs` তৈরি করে JSON index export | High | বই, লেখা, news, gallery, page metadata এক file-এ থাকবে |
| Better intent router | `api/chat.js` intent scoring আলাদা module-এ নেওয়া | High | top intent + confidence score return করবে |
| Writing search ranking | exact, startsWith, contains, category, keyword score মিলিয়ে rank | High | “বিচ্ছেদের লেখা”, “মায়ের কবিতা” ধরনের query সঠিক result দেবে |
| Knowledge answer source | response metadata-তে `sourceType`, `sourcePath` রাখা | Medium | analytics-এ কোন source থেকে উত্তর এসেছে দেখা যাবে |
| Common Q&A cache | frequently asked canonical answer cache | Medium | common প্রশ্নে ১ সেকেন্ডের কম response time লক্ষ্য |

এই phase শেষে চ্যাটবট শুধু “লেখা আছে” বলবে না; বরং ব্যবহারকারীর উদ্দেশ্য বুঝে নির্দিষ্ট লেখার লিংক, বইয়ের পাঠ/কেনার লিংক, আবৃত্তি পেজ, contact page বা news item দেখাবে।

## ৫. Phase 2 — Conversation Intelligence ও Memory

চ্যাটবটকে আরও মানবিক করতে session-level memory দরকার। এটি permanent personal data নয়; browser session বা short-lived server memory হতে পারে। উদাহরণ হিসেবে, ব্যবহারকারী যদি আগে “দুঃখবিলাস” নিয়ে কথা বলে, পরে “এটার লেখক কে?” বললে চ্যাটবট বুঝবে “এটা” বলতে বইটিকে বোঝানো হয়েছে।

| Memory Layer | কী রাখবে | Retention | Privacy Rule |
|---|---|---|---|
| **Session context** | সর্বশেষ topic, selected book/writing, current mode | browser session | sensitive data বাদ |
| **Task context** | upload file type, processing intent, output link | temporary | file URL expire বা local only |
| **Preference hint** | ভাষা, short/long answer preference | consent থাকলে | opt-out থাকবে |
| **Admin learning** | failed intent, fallback categories | aggregate | ব্যক্তিগত data mask করা হবে |

প্রযুক্তিগতভাবে frontend-এ `sessionStorage` এবং backend analytics-এ aggregate metrics ব্যবহার করা যেতে পারে। প্রথম sprint-এ permanent database memory না করে session memory যথেষ্ট হবে। পরে logged-in user consent থাকলে preference memory যোগ করা যেতে পারে।

## ৬. Phase 3 — Premium UI/UX Redesign

বর্তমান floating widget ভালো ভিত্তি, কিন্তু উন্নত সংস্করণে এটিকে **Mini AI Dashboard** বানানো উচিত। ব্যবহারকারী open করলেই চারটি কাজ পরিষ্কার দেখতে পাবে: **জিজ্ঞেস করুন**, **লেখা/বই খুঁজুন**, **ফাইল আপলোড করুন**, এবং **লাইভ সাপোর্ট নিন**।

| UI অংশ | পরিকল্পনা | ফলাফল |
|---|---|---|
| **Welcome Command Center** | ৪টি বড় action zone: Ask, Explore, Upload, Live Help | feature discoverability বাড়বে |
| **Message Card Types** | BookCard, WritingCard, AudioResultCard, GalleryCard, ErrorRecoveryCard | উত্তর পড়া সহজ হবে |
| **Smart Quick Actions** | context ও intent অনুযায়ী chips বদলাবে | কম typing, বেশি action |
| **Upload Center** | image/audio/video drag-drop + preset selector | multimodal feature সহজ হবে |
| **Mobile Fullscreen Mode** | ছোট স্ক্রিনে bottom sheet নয়, full-height assistant | mobile UX উন্নত হবে |
| **Accessibility** | keyboard focus, aria labels, reduced motion support | ব্যবহারযোগ্যতা বাড়বে |

UI redesign করতে গিয়ে বিদ্যমান dark literary theme ও gold accent রাখা উচিত, কারণ এটি লেখকের brand identity-এর সঙ্গে সামঞ্জস্যপূর্ণ। তবে visual density কমিয়ে cards ও spacing আরও readable করা দরকার।

## ৭. Phase 4 — Multimodal Studio Pro

চ্যাটবটে audio ও video workflow ইতিমধ্যে আছে। পরবর্তী উন্নয়নে এগুলোকে “hidden capability” না রেখে স্পষ্ট **Studio Mode** হিসেবে দেখানো উচিত। এতে ব্যবহারকারী বুঝবে কী upload করতে হবে, কী instruction লিখতে হবে এবং output কীভাবে ব্যবহার করবে।

| Studio Mode | উন্নয়ন | Acceptance Criteria |
|---|---|---|
| **Audio Studio** | Clean Voice, Poetry Recitation, Radio Voice, Volume Boost preset | preset নির্বাচন করলে instruction auto-fill হবে |
| **Before/After Player** | original ও edited audio পাশাপাশি playback | user output quality বুঝতে পারবে |
| **Processing Timeline** | Upload → Analyze → Process → Result | long task-এ user অপেক্ষা করতে স্বাচ্ছন্দ্য পাবে |
| **Video Audio Extractor** | video upload করলে audio extract করে edit workflow | video-to-audio result chat card-এ দেখাবে |
| **Vision Assistant** | image caption, screenshot error, design review, text summary | image upload-এর পরে task selector দেখাবে |

এই phase-এ response শুধু text হবে না; result card-এ **applied steps**, **technical note**, **download button**, **retry/edit again** এবং **share/copy** action থাকবে।

## ৮. Phase 5 — Admin Analytics ও Improvement Dashboard

বর্তমানে basic analytics endpoint যুক্ত হয়েছে। এটিকে production-grade করতে হলে in-memory analytics থেকে persistent storage-এ যাওয়া দরকার। প্রথমে database table বা lightweight JSON log ব্যবহার করা যেতে পারে; পরে dashboard-এ trend, fallback cluster, top intent, response time, audio usage এবং live chat handoff দেখা যাবে।

| Metric | উদ্দেশ্য | Dashboard View |
|---|---|---|
| **Top intents** | কোন বিষয় বেশি জিজ্ঞেস হচ্ছে | bar chart |
| **Fallback questions** | কোথায় bot ব্যর্থ হচ্ছে | review queue |
| **Provider success/fail** | কোন AI provider স্থিতিশীল | success-rate card |
| **Audio usage** | কোন preset বেশি ব্যবহৃত | usage table |
| **Live handoff count** | AI কোথায় human support দিচ্ছে | trend line |
| **Reaction feedback** | user thumbs up/down | quality score |

Admin dashboard অবশ্যই key-protected থাকবে। production environment-এ `CHATBOT_ANALYTICS_KEY` না থাকলে analytics route blocked থাকা উচিত, যা নিরাপত্তার জন্য ঠিক দিক। পরবর্তী ধাপে admin key rotation এবং role-based admin access যোগ করা যায়।

## ৯. Phase 6 — Reliability, Performance ও Security Hardening

AI system production-এ ভালো রাখতে শুধু feature যথেষ্ট নয়; reliability, abuse protection, privacy এবং error recovery সমান গুরুত্বপূর্ণ। বর্তমান rate limiting ও fallback আছে, তবে আরও granular control দরকার।

| ক্ষেত্র | উন্নয়ন | কারণ |
|---|---|---|
| **Route-level rate limit** | chat, stream, upload, notify আলাদা limit | abuse ও cost control |
| **File validation** | MIME sniffing, size cap, duration cap | malicious upload কমবে |
| **Streaming fallback** | stream fail হলে non-stream fallback | response reliability বাড়বে |
| **Circuit breaker** | provider repeated fail হলে সাময়িক skip | latency কমবে |
| **Answer safety filter** | personal data, hallucinated claims, unsupported claim check | trust বাড়বে |
| **Observability** | structured logs + request id | debugging সহজ হবে |

## ১০. Sprint ভিত্তিক বাস্তবায়ন রোডম্যাপ

নিচের roadmap অনুসরণ করলে প্রতিটি sprint শেষে live deployযোগ্য ফল পাওয়া যাবে। প্রথমে knowledge ও intent accuracy উন্নত করা সবচেয়ে গুরুত্বপূর্ণ, কারণ UI সুন্দর হলেও ভুল উত্তর দিলে trust কমে যাবে।

| Sprint | সময় | কাজ | Deliverable |
|---|---:|---|---|
| **Sprint 1: Knowledge Accuracy** | ২–৩ দিন | unified index, intent confidence, better writing search | accurate website answers |
| **Sprint 2: UX Command Center** | ২–৪ দিন | welcome dashboard, smart cards, dynamic quick actions | premium chatbot UI |
| **Sprint 3: Audio/Video Studio** | ৩–৫ দিন | preset cards, before/after player, timeline | professional audio workflow |
| **Sprint 4: Vision Assistant** | ২–৪ দিন | image task selector, design/screenshot/text modes | useful image intelligence |
| **Sprint 5: Analytics Pro** | ৩–৫ দিন | persistent analytics, fallback review, feedback metrics | data-driven admin dashboard |
| **Sprint 6: Reliability Hardening** | ২–৩ দিন | circuit breaker, stronger validation, observability | stable production assistant |

## ১১. অবিলম্বে করণীয় Top Priority

প্রথম বাস্তবায়ন sprint-এ নিচের কাজগুলো করা সবচেয়ে বেশি ফল দেবে। এগুলো সরাসরি ব্যবহারকারীর অভিজ্ঞতা, উত্তর নির্ভুলতা এবং admin control উন্নত করবে।

| Priority | কাজ | কেন আগে করা উচিত |
|---:|---|---|
| 1 | `build-chatbot-index` script | knowledge accuracy সবকিছুর ভিত্তি |
| 2 | Intent router refactor | audio, book, writing, contact, live chat সঠিকভাবে route হবে |
| 3 | Writing result card | লেখা খুঁজে পেলে সুন্দর card + button দেখাবে |
| 4 | Audio preset selector | audio feature ব্যবহার সহজ হবে |
| 5 | Analytics persistence | server restart হলে data হারাবে না |
| 6 | User feedback buttons | কোন উত্তর ভালো/খারাপ জানা যাবে |
| 7 | Error recovery card | failure হলে retry বা live chat path থাকবে |
| 8 | Mobile fullscreen assistant | mobile visitor experience উন্নত হবে |

## ১২. প্রস্তাবিত ফাইল পরিবর্তনের ম্যাপ

| ফাইল/মডিউল | পরিবর্তনের ধরন |
|---|---|
| `api/chat.js` | intent router modularize, source metadata, analytics event emit |
| `api/_knowledge/siteKnowledge.js` | structured schema expansion |
| `api/_knowledge/writingsArchive.json` | search metadata enrichment |
| `scripts/build-chatbot-index.mjs` | নতুন unified index generator |
| `client/src/components/AIChatbot.tsx` | command center, mode switch, smart cards |
| `client/src/components/chatbot/AudioResultCard.tsx` | before/after player, retry action |
| `client/src/pages/AdminChatbotAnalytics.tsx` | persistent metrics, fallback review UI |
| `server/liveChatRouter.ts` | AI handoff summary ও queue metadata |

## ১৩. Success Metrics

চ্যাটবট আপডেটের সফলতা শুধু “feature যোগ হয়েছে” দিয়ে মাপা উচিত নয়। user outcome ও operational quality দিয়ে মাপা দরকার।

| Metric | Target |
|---|---:|
| Website-related প্রশ্নে সঠিক route/link response | ৯০%+ |
| Common FAQ response latency | ১ সেকেন্ডের কম |
| AI provider failure হলেও useful fallback | ৯৯% request-এ answer |
| Audio workflow successful completion | ৯৫%+ valid upload |
| User positive reaction | ৭০%+ |
| Live chat handoff যেখানে দরকার | ভুল fallback-এর বদলে human handoff |

## ১৪. বাস্তবায়নের সুপারিশ

প্রথমে **Sprint 1: Knowledge Accuracy** বাস্তবায়ন করা উচিত। কারণ চ্যাটবটের সবচেয়ে বড় শক্তি হবে ওয়েবসাইটের কনটেন্ট নির্ভুলভাবে খুঁজে দেওয়া। এরপর **Sprint 2: UX Command Center** করলে ব্যবহারকারীরা feature দ্রুত বুঝবে। তৃতীয় ধাপে **Audio/Video Studio** উন্নত করলে চ্যাটবট একটি আলাদা premium identity পাবে।

পরিকল্পনার সবচেয়ে কার্যকর পথ হলো: **প্রথমে নির্ভুলতা, তারপর অভিজ্ঞতা, তারপর advanced studio feature, শেষে analytics ও reliability hardening।** এতে প্রতিটি ধাপে measurable improvement পাওয়া যাবে এবং live site-এ risk কম থাকবে।

## ১৫. References

[1]: ./client/src/components/AIChatbot.tsx "Current AIChatbot frontend component"  
[2]: ./api/chat.js "Current chat API, intent, fallback, streaming and analytics logic"  
[3]: ./api/audio-edit.js "Current audio editing API"  
[4]: ./api/video-to-audio.js "Current video-to-audio API"  
[5]: ./client/src/pages/AdminChatbotAnalytics.tsx "Current chatbot analytics dashboard"  
[6]: ./chatbot_advanced_improvement_plan.md "Existing advanced chatbot improvement plan"  
[7]: ./NEW_CHATBOT_PRO_MAX_PLAN.md "Existing Pro Max chatbot upgrade plan"
