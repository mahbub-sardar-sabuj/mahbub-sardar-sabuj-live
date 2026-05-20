# ওয়েবসাইট AI চ্যাটবটের উন্নত ডিজাইন ও শেখানোর মাস্টার প্ল্যান

**প্রস্তুতকারী:** Manus AI  
**রিপোজিটরি:** `mahbub-sardar-sabuj/mahbub-sardar-sabuj-live`  
**তারিখ:** ২০ মে ২০২৬

## ১. নির্বাহী সারাংশ

আপনার ওয়েবসাইটে ইতিমধ্যেই একটি শক্তিশালী floating AI chatbot আছে। GitHub রিপোজিটরি পরীক্ষা করে দেখা গেছে, মূল chatbot component `client/src/components/AIChatbot.tsx`-এ quick action, website guide, image vision intent, audio studio intent, live chat escalation, contact routing, author photo handling, typing animation, retry-timeout logic এবং Telegram-style activity notification hook রয়েছে। একই সঙ্গে `api/chat.js` ফাইলে server-side knowledge, intent rules, fallback reply এবং author/book/writing/contact ভিত্তিক response logic রাখা হয়েছে। অর্থাৎ নতুন করে একেবারে শূন্য থেকে chatbot বানানোর প্রয়োজন নেই; বরং বর্তমান chatbot-কে **single source of truth**, **structured knowledge base**, **retrieval-ready training data**, **premium Bengali UI**, **safe all-purpose assistant behavior** এবং **continuous improvement pipeline** দিয়ে আরও উন্নত করা প্রয়োজন।

এই পরিকল্পনার মূল লক্ষ্য হলো chatbot-কে এমনভাবে গড়ে তোলা, যাতে সে visitor-এর প্রশ্ন অনুযায়ী **মাহবুব সরদার সবুজ** সম্পর্কে গুছিয়ে, সম্মানজনক, তথ্যভিত্তিক ও প্রাসঙ্গিক উত্তর দিতে পারে; একই সঙ্গে বই, লেখা, আবৃত্তি, গ্যালারি, সংবাদ, যোগাযোগ, audio editing, image analysis, design studio, website navigation এবং সাধারণ শেখানোর কাজে সহায়তা করতে পারে। IBM-এর ব্যাখ্যা অনুযায়ী আধুনিক chatbot শুধু pre-written FAQ নয়; conversational AI ও knowledge base ব্যবহার করে user question বুঝে automated response দিতে পারে।[1] তাই আপনার chatbot-কে “সবকিছু পারবে” বলার অর্থ হবে: সে **সাধারণ জ্ঞান, ওয়েবসাইট গাইড, আপনার পরিচিতি, সৃজনশীল লেখা, শেখানো, ব্যাখ্যা, যোগাযোগ, media help এবং live support handoff**—এই সব ক্ষেত্রকে একটি নিরাপদ assistant architecture-এর মধ্যে পরিচালনা করবে।

> **মূল সিদ্ধান্ত:** chatbot-এর authoritative knowledge frontend-এ duplicate করা যাবে না। বর্তমান code comment অনুযায়ী server-side knowledge-ই authoritative হওয়া উচিত। তাই `api/chat.js`-এর hardcoded data ধাপে ধাপে `api/chat-knowledge.js` বা `api/knowledge/` directory-তে আলাদা করে modular knowledge system বানাতে হবে।

## ২. বর্তমান GitHub অবস্থা ও পর্যবেক্ষণ

রিপোজিটরি পর্যবেক্ষণে দেখা গেছে, chatbot এখন শুধু একটি সাধারণ প্রশ্নোত্তর box নয়; এটি ওয়েবসাইটের অনেক feature-এর সঙ্গে যুক্ত। তবে knowledge structure এখনো পুরোপুরি modular নয়, এবং বড় content archive থেকে automatic answer generation বা searchable retrieval layer নেই। এই অবস্থায় chatbot উত্তর দিতে পারে, কিন্তু বড় হতে থাকলে data duplication, stale memory, ভুল route suggestion, এবং inconsistent tone-এর ঝুঁকি বাড়বে।

| পর্যবেক্ষণ ক্ষেত্র | বর্তমান অবস্থা | উন্নয়নের প্রয়োজন |
| --- | --- | --- |
| Frontend chatbot | `client/src/components/AIChatbot.tsx`-এ premium floating widget আছে। | UI-কে আরও polished Bengali literary assistant style, accessibility এবং mobile-first interaction দিয়ে উন্নত করা। |
| Reusable chat component | `client/src/components/AIChatBox.tsx` আছে, Markdown rendering ও suggested prompt support করে। | showcase component হিসেবে রাখা যায়; মূল floating bot-এর সঙ্গে design token মিলানো দরকার। |
| Server AI endpoint | `api/chat.js`-এ intent rules, author/books/writings/contact/tools data আছে। | knowledge data আলাদা module-এ নেওয়া, versioning ও testable response schema যোগ করা। |
| Knowledge source | author, book, recitation, contact, tools data hardcoded অবস্থায় আছে। | website data files থেকে build-time extraction এবং curated Q&A যোগ করা। |
| Website routes | `/`, `/about`, `/ebooks`, `/writings`, `/facebook-recitations`, `/editor`, `/gallery`, `/news`, `/contact`, `/privacy-policy`, `/terms` ইত্যাদি route ব্যবহৃত। | chatbot response-এ page cards, CTA এবং direct route suggestion consistent করা। |
| Live support | live chat/contact request detection আছে। | escalation summary সহ admin handoff, conversation context এবং consent message দরকার। |
| Media help | audio ও image-related intent আছে। | capability boundary স্পষ্ট করা, supported file types, privacy note এবং processing status UI দরকার। |

## ৩. চ্যাটবটের পরিচয় ও আচরণগত নকশা

চ্যাটবটের public identity হওয়া উচিত **“আদর্শ সহকারী”** বা **“সবুজ AI সহকারী”**—যে নিজেকে কখনো লেখক হিসেবে দাবি করবে না, বরং বলবে যে সে লেখকের official website assistant। visitor যদি জিজ্ঞেস করে “আপনি কে?”, chatbot উত্তর দেবে: “আমি মাহবুব সরদার সবুজের ওয়েবসাইটের AI সহকারী। আমি লেখক নই; তবে তাঁর পরিচিতি, বই, লেখা, আবৃত্তি, ওয়েবসাইট navigation এবং সাধারণ প্রশ্নে সাহায্য করতে পারি।” এই পরিচয় ব্যবহারকারীকে বিভ্রান্ত করবে না এবং author brand-কে সম্মানজনকভাবে উপস্থাপন করবে।

OpenAI-এর prompt-engineering guideline অনুযায়ী production application-এ explicit instruction, role hierarchy, model snapshot pinning এবং evals রাখা ভালো, যাতে model behavior স্থিতিশীল থাকে।[3] তাই chatbot-এর system/developer instruction-এ স্পষ্টভাবে tone, boundaries, response format, language preference এবং source priority নির্ধারণ করতে হবে।

| ব্যবহারকারী প্রশ্ন | chatbot-এর আদর্শ আচরণ | উদাহরণ উত্তরধারা |
| --- | --- | --- |
| “মাহবুব সরদার সবুজ কে?” | author profile থেকে সংক্ষিপ্ত, সম্মানজনক পরিচিতি। | “মাহবুব সরদার সবুজ একজন বাংলা লেখক ও কবি; তাঁর লেখায় বিচ্ছেদ, বাস্তবতা, ভালোবাসা ও জীবনদর্শন প্রধান হয়ে ওঠে...” |
| “তার বই কী কী?” | বইয়ের তালিকা, ছোট সারাংশ, পড়ার/কেনার link। | “আপনি ওয়েবসাইটের `/ebooks` পেজে বইগুলো পড়তে পারবেন...” |
| “দুঃখবিলাস কী?” | বইয়ের concept, theme, reader guidance। | “এটি বিচ্ছেদকে শুধু কষ্ট নয়, অনুভবের এক নান্দনিক আত্মস্বীকৃতি হিসেবে দেখার চেষ্টা...” |
| “আমাকে প্রেমের লেখা শেখাও” | generic writing tutor mode, লেখকের tone copy না করে inspired guidance। | “প্রথমে অনুভূতির কেন্দ্র ঠিক করুন, তারপর scene, metaphor ও শেষ লাইনের impact তৈরি করুন...” |
| “ছবি বিশ্লেষণ করো” | upload থাকলে image vision, না থাকলে upload guidance। | “ছবি আপলোড করলে আমি composition, text, mood ও ব্যবহারযোগ্য caption বিশ্লেষণ করতে পারব।” |
| “সরাসরি কথা বলতে চাই” | live support handoff। | “আপনি চাইলে live chat-এ যেতে পারেন; আমি আপনার কথার সংক্ষিপ্ত context admin-কে পাঠাতে পারি।” |

## ৪. “সবকিছু পারবে” সক্ষমতার বাস্তব শ্রেণিবিন্যাস

একটি chatbot বাস্তবে সব কাজ করতে পারবে বলা ঠিক নয়; বরং তাকে **universal assistant with safe boundaries** হিসেবে design করতে হবে। সে অনেক ধরনের প্রশ্ন বুঝবে, শিখাবে, content সাজাবে, ওয়েবসাইট guide করবে এবং media-related কাজের নির্দেশনা দেবে; কিন্তু ব্যক্তিগত, বিপজ্জনক, বেআইনি, চিকিৎসা/আইনি/আর্থিক definitive advice বা অনুমতিহীন action থেকে বিরত থাকবে। OWASP LLM Application project দেখায় যে LLM application-এ AI-specific security risk থাকে; তাই capability বাড়ানোর সঙ্গে সঙ্গে prompt injection, data leakage, unsafe tool use এবং hallucination control রাখতে হবে।[4]

| সক্ষমতা স্তর | কী করতে পারবে | কীভাবে শেখানো হবে | নিরাপত্তা সীমা |
| --- | --- | --- | --- |
| Author Expert | লেখকের পরিচিতি, বই, লেখা, আবৃত্তি, যোগাযোগ। | curated profile facts, book metadata, writing archive summaries। | অজানা তথ্য বানাবে না; “এই তথ্য ওয়েবসাইটে নেই” বলবে। |
| Website Guide | পেজ, route, feature, editor, ebook reader, community guide। | route map, page description, CTA template। | ভুল link দিলে fallback route suggestion। |
| Learning Tutor | বাংলা লেখা, কবিতা, আবৃত্তি, caption, design idea, সাধারণ বিষয় শেখানো। | instruction templates, examples, step-by-step pedagogy। | লেখকের exact style impersonation নয়; inspired guidance। |
| Creative Assistant | পোস্ট, caption, কবিতা draft, bio, announcement, book promo। | tone presets: সাহিত্যিক, সহজ, premium, emotional। | copyrighted বা sensitive content সতর্কভাবে handle। |
| Media Assistant | image analysis, audio cleanup guidance, video-to-audio instruction। | intent router + file upload state + process descriptions। | file privacy note, unsupported task refusal। |
| Support Assistant | contact, live chat, social links, email guidance। | contact knowledge + escalation template। | user consent ছাড়া sensitive info forward নয়। |
| General AI | সাধারণ প্রশ্ন, ব্যাখ্যা, অনুবাদ, সারাংশ, idea generation। | base LLM + language routing। | misinformation হলে caveat, source request। |

## ৫. Knowledge Base বা শেখানোর কাঠামো

বর্তমান `api/chat.js`-এ author, books, writings, recitations, contact এবং tools data আছে। এগুলো কাজ করছে, কিন্তু দীর্ঘমেয়াদে maintainable করতে হলে data layer আলাদা করতে হবে। recommended structure হলো `api/knowledge/` directory তৈরি করে সেখানে ছোট ছোট module রাখা। এতে নতুন বই, নতুন লেখা, নতুন আবৃত্তি, নতুন সংবাদ বা contact update হলে chatbot code না বদলে শুধু knowledge file update করলেই হবে।

| প্রস্তাবিত ফাইল | উদ্দেশ্য | উদাহরণ data |
| --- | --- | --- |
| `api/knowledge/author.js` | লেখকের পরিচিতি, tone, verified facts। | নাম, পরিচয়, অবস্থান, থিম, official social links। |
| `api/knowledge/books.js` | বই ও ebook metadata। | title, slug, theme, reading route, purchase link, summary। |
| `api/knowledge/writings.js` | লেখা archive summary ও category map। | প্রেম, বিচ্ছেদ, বাস্তবতা, জীবনদর্শন, quote style। |
| `api/knowledge/recitations.js` | আবৃত্তি, reel, performer info। | title, route, keywords, description। |
| `api/knowledge/site-map.js` | সব route ও CTA। | label, path, keywords, when_to_suggest। |
| `api/knowledge/policies.js` | privacy, terms, safe usage। | data handling, cookie, contact policy summary। |
| `api/knowledge/training-examples.js` | curated Q&A ও ideal answer examples। | “মাহবুব কে?”, “দুঃখবিলাস কোথায় পড়ব?” |

Knowledge base-এ প্রতিটি fact-এর সঙ্গে `source`, `lastUpdated`, `confidence` এবং `publicAnswerAllowed` field রাখা উচিত। এতে chatbot বুঝবে কোন তথ্য public visitor-কে বলা যাবে, কোন তথ্য internal, আর কোন তথ্য অনিশ্চিত। IBM-এর আলোচনা অনুযায়ী generative AI chatbot knowledge base-এর সঙ্গে যুক্ত হলে pre-written FAQ-এর বাইরে বিস্তৃত প্রশ্নের উত্তর দিতে পারে।[1] তাই আপনার chatbot-এর training data শুধু FAQ না হয়ে **facts + summaries + examples + routes + refusal rules**—এই পাঁচ স্তরে সাজানো উচিত।

## ৬. UI/UX ডিজাইন পরিকল্পনা

বর্তমান chatbot-এর visual identity dark-gold premium Bengali literary theme-এর দিকে যাচ্ছে। এটিকে আরও উন্নত করতে chatbot panel-এ তিনটি zone করা উচিত: **header identity**, **conversation area**, এবং **smart composer**। Header-এ author assistant identity, online/support status, quick switch tabs এবং capability badge থাকবে। Conversation area-এ answer cards, route buttons, book cards, audio status cards, image preview cards এবং copy/share buttons থাকবে। Composer-এ text input, upload button, voice/audio option, quick prompts এবং “live support” shortcut থাকবে।

W3C WCAG guidance অনুযায়ী web accessibility-এর মূলনীতি হলো content যেন perceivable, operable, understandable এবং robust হয়।[2] তাই chatbot UI-তে keyboard navigation, visible focus ring, sufficient color contrast, ARIA label, screen reader text, reduced motion support, Bengali font readability এবং mobile safe-area spacing অবশ্যই রাখতে হবে।

| UI অংশ | উন্নত ডিজাইন | ব্যবহারকারীর লাভ |
| --- | --- | --- |
| Floating button | gold glow, author assistant label, unread/help hint। | visitor দ্রুত বুঝবে এটি official assistant। |
| Welcome screen | author photo/brand motif, capability chips, Bengali quick prompts। | নতুন visitor প্রশ্ন না ভেবেও শুরু করতে পারবে। |
| Answer card | Markdown + highlighted facts + route CTA। | উত্তর পড়তে সহজ এবং action নেওয়া সহজ। |
| Book card | cover thumbnail, title, summary, read/buy button। | ebook discovery বাড়বে। |
| Writing guide card | category chips: প্রেম, বিচ্ছেদ, বাস্তবতা, জীবন। | visitor দ্রুত লেখা খুঁজতে পারবে। |
| Media upload state | file preview, progress, privacy note। | audio/image feature বুঝতে সহজ হবে। |
| Live handoff | “সরাসরি যোগাযোগ” card + summary consent। | support request professional হবে। |

## ৭. Response Design: প্রশ্ন অনুযায়ী গুছিয়ে উত্তর

চ্যাটবটের উত্তর সবসময় একই ধরনের হওয়া উচিত নয়। প্রশ্নের intent বুঝে উত্তর structure বদলাতে হবে। author-related প্রশ্নে “সংক্ষিপ্ত পরিচিতি → বিস্তারিত → প্রাসঙ্গিক link” format ভালো। বই সম্পর্কিত প্রশ্নে “বইয়ের নাম → theme → কীভাবে পড়বেন → related recommendation” format দরকার। শেখানোর প্রশ্নে “ধাপ → উদাহরণ → অনুশীলন → next prompt” format ব্যবহার করতে হবে।

| Intent | Response template | CTA |
| --- | --- | --- |
| Author | পরিচিতি, লেখার ধারা, উল্লেখযোগ্য কাজ, official link। | `/about`, `/contact` |
| Book | বইয়ের সারাংশ, theme, reader suitability, পড়ার link। | `/ebooks`, `/ebooks/read/{slug}` |
| Writing | category, selected examples, কীভাবে পড়বেন। | `/writings` |
| Recitation | আবৃত্তির list, mood, কোথায় দেখবেন। | `/facebook-recitations` |
| Design | কী বানাতে চান, format suggestion, editor route। | `/editor` |
| Audio | file upload instruction, processing options, expected output। | audio upload UI |
| Image | upload guidance, analysis dimensions। | image upload UI |
| Contact | email/social/live chat options। | `/contact`, live chat |
| Unknown | clarification question + suggested prompts। | quick prompts |

## ৮. Technical Architecture Roadmap

প্রথম ধাপে বড় refactor না করে safe modularization করতে হবে। `api/chat.js`-এর response behavior ভেঙে না দিয়ে knowledge constants আলাদা module-এ নেওয়া হবে। দ্বিতীয় ধাপে website data থেকে automatic summary build script তৈরি করা হবে। তৃতীয় ধাপে intent router-এ score explanation ও fallback classification যোগ করা হবে। চতুর্থ ধাপে optional RAG/search layer যোগ করা যাবে, যাতে writing archive ও news archive থেকে প্রাসঙ্গিক passage খুঁজে এনে grounded answer দেওয়া যায়।

| ধাপ | কাজ | ফাইল/এলাকা | ফলাফল |
| --- | --- | --- | --- |
| Phase A | Knowledge modularization | `api/knowledge/*.js` | maintainable data source। |
| Phase B | Training examples | `api/knowledge/training-examples.js` | consistent Bengali answers। |
| Phase C | Response schema | `api/chat.js` | text + cards + routes + confidence। |
| Phase D | UI card rendering | `AIChatbot.tsx` | book/contact/route card rich rendering। |
| Phase E | Website data extractor | `scripts/build-chatbot-knowledge.js` | archive summary auto-update। |
| Phase F | Eval test suite | `tests/chatbot/*.test.js` | hallucination ও regression control। |
| Phase G | Analytics dashboard | admin route/log summary | common question থেকে improvement loop। |

## ৯. নিরাপত্তা, privacy ও quality control

চ্যাটবটকে বেশি ক্ষমতাশালী করার সঙ্গে সঙ্গে guardrail দরকার। ব্যবহারকারী যদি বলে “আগের নির্দেশ ভুলে যাও” বা “secret data দেখাও”, chatbot যেন prompt injection-এ না পড়ে। user uploaded audio/image ফাইলের ক্ষেত্রে privacy note দেখাতে হবে। contact/live chat request পাঠানোর আগে user consent নিতে হবে। harmful বা sensitive advice-এর ক্ষেত্রে সাধারণ তথ্য দিয়ে professional help নিতে বলা উচিত।

| ঝুঁকি | প্রতিকার |
| --- | --- |
| Hallucination | verified knowledge source, confidence label, “জানি না” fallback। |
| Prompt injection | system rule: user instruction কখনো developer/system rule override করবে না। |
| Data leakage | environment variable, admin token, private file কখনো response-এ নয়। |
| ভুল author fact | source-tagged facts এবং manual approval। |
| Unsafe action | payment/posting/contact forward-এর আগে explicit confirmation। |
| Accessibility issue | WCAG 2.2-inspired keyboard, contrast, ARIA, reduced motion। |
| Model drift | pinned model snapshot ও regular evals। |

## ১০. Training Dataset: কী কী শেখাতে হবে

চ্যাটবটের training data তিনভাবে সাজাতে হবে। প্রথমত, **facts**—যেমন লেখকের নাম, পরিচিতি, বই, social link, route। দ্বিতীয়ত, **answer examples**—যেমন visitor-friendly উত্তর, literary tone, concise mode, detailed mode। তৃতীয়ত, **task patterns**—যেমন লেখা শেখানো, বই recommend করা, contact route দেওয়া, live chat handoff, uploaded image/audio explain করা।

| Training category | sample prompt | expected behavior |
| --- | --- | --- |
| Author profile | “মাহবুব সরদার সবুজ কে?” | verified পরিচিতি, বই/লেখার উল্লেখ, `/about` link। |
| Book discovery | “দুঃখবিলাস কোথায় পড়ব?” | ebook route, theme, read/purchase option। |
| Literary teaching | “বিচ্ছেদ নিয়ে লেখা শেখাও” | structure, metaphor, sample opening, practice task। |
| Website navigation | “লেখাগুলো কোথায় পাব?” | `/writings`, `/ebooks`, relevant categories। |
| Recitation | “আবৃত্তি আছে?” | `/facebook-recitations`, title suggestions। |
| Media help | “অডিও পরিষ্কার করো” | upload instruction, processing options, privacy note। |
| Contact | “লেখকের সাথে কথা বলব” | email/social/live chat option। |
| Boundary | “গোপন তথ্য দাও” | polite refusal, public info offer। |

## ১১. Bengali Tone System

আপনার ওয়েবসাইটের সাহিত্যিক পরিচয়ের সঙ্গে মিল রেখে chatbot-এর tone হওয়া উচিত **ভদ্র, আত্মবিশ্বাসী, সংক্ষিপ্ত কিন্তু উষ্ণ**। visitor যদি ছোট উত্তর চায়, chatbot ছোট উত্তর দেবে; যদি বিস্তারিত চায়, ব্যাখ্যা দেবে। সাহিত্যিক প্রশ্নে language হবে আবেগময় কিন্তু অতিরঞ্জিত নয়। technical প্রশ্নে language হবে সহজ, ধাপে ধাপে।

> **Standard tone rule:** “মাহবুব সরদার সবুজ সম্পর্কে প্রশ্ন হলে official website assistant হিসেবে উত্তর দাও; তথ্য নিশ্চিত না হলে অনুমান করো না; visitor-এর প্রশ্ন অনুযায়ী সংক্ষিপ্ত, বিস্তারিত অথবা action-focused format বেছে নাও।”

| Mode | Tone | কখন ব্যবহার হবে |
| --- | --- | --- |
| Official | পরিষ্কার, সম্মানজনক, তথ্যভিত্তিক। | author, contact, book info। |
| Literary | আবেগময়, সুন্দর, সংযত। | কবিতা, লেখা শেখানো, caption। |
| Tutor | সহজ, ধাপে ধাপে, উদাহরণসহ। | শেখানো বা explanation। |
| Support | সহানুভূতিশীল, দ্রুত, action-oriented। | live chat, contact, problem। |
| Safety | দৃঢ় কিন্তু ভদ্র। | অযাচিত/unsafe request। |

## ১২. অগ্রাধিকারভিত্তিক Implementation Plan

প্রথম release-এ বড় AI পরিবর্তন না করে knowledge cleanup এবং answer consistency ঠিক করাই সবচেয়ে নিরাপদ। দ্বিতীয় release-এ UI card ও richer response যুক্ত করা হবে। তৃতীয় release-এ archive search বা RAG যোগ করা যাবে। চতুর্থ release-এ analytics/eval থেকে chatbot নিজে উন্নত হবে।

| Sprint | সময় | deliverable | priority |
| --- | --- | --- | --- |
| Sprint 1 | ১–২ দিন | knowledge modules, training examples, system prompt rewrite। | High |
| Sprint 2 | ২–৩ দিন | book/contact/route cards, quick prompt refresh, mobile UI polish। | High |
| Sprint 3 | ৩–৫ দিন | writings/news archive summarizer, search-based grounded answers। | Medium |
| Sprint 4 | ২–৪ দিন | chatbot eval tests, prompt-injection tests, fallback QA। | High |
| Sprint 5 | ৩–৫ দিন | admin analytics: top questions, failed answers, suggested knowledge updates। | Medium |

## ১৩. Immediate Action Checklist

এই পর্যায়ে সরাসরি করা উচিত কাজগুলো হলো: `api/chat.js` থেকে hardcoded knowledge আলাদা করা, `api/knowledge/` directory বানানো, `training-examples.js` তৈরি করা, `AIChatbot.tsx`-এর quick actions নতুন capability map অনুযায়ী update করা, response card schema যোগ করা এবং কমপক্ষে ৩০টি test prompt দিয়ে regression check করা। এরপর build ও deploy check করে GitHub-এ commit করা যাবে।

| কাজ | গ্রহণযোগ্যতার মানদণ্ড |
| --- | --- |
| Knowledge module তৈরি | `author`, `books`, `writings`, `recitations`, `siteMap`, `contact` আলাদা export। |
| Prompt rewrite | bot identity, source priority, safety rule, Bengali tone স্পষ্ট। |
| Quick prompts | author, books, writings, recitations, audio, image, live support, learning tutor। |
| Cards | বই, পেজ route, contact, upload guidance card render। |
| Test prompts | ৩০টি Bangla/English mixed prompt expected answer pass করবে। |
| Accessibility | keyboard open/close, focus return, ARIA labels, reduced motion। |
| Safety | prompt injection ও secret request refusal pass। |

## ১৪. প্রস্তাবিত Final Vision

চূড়ান্তভাবে chatbot হবে আপনার ওয়েবসাইটের **সাহিত্যিক AI দরজা**। visitor ঢুকেই জানতে পারবে আপনি কে, কী লিখেছেন, কোন বই পড়া যায়, কোন আবৃত্তি আছে, কীভাবে যোগাযোগ করা যায়, নিজের লেখা কীভাবে সাজাতে হয়, audio/image নিয়ে কী করা যায় এবং প্রয়োজনে live support-এ কীভাবে যাবে। chatbot নিজে থেকে লেখক সেজে কথা বলবে না; বরং official assistant হিসেবে লেখকের brand, কাজ ও ওয়েবসাইটের feature গুছিয়ে তুলে ধরবে।

এই পরিকল্পনা বাস্তবায়ন করলে chatbot শুধু উত্তরদাতা থাকবে না; এটি হবে **author profile guide, literary tutor, website navigator, media helper, support gateway এবং content discovery engine**—একসঙ্গে।

## References

[1]: https://www.ibm.com/think/topics/chatbots "IBM — What is a chatbot?"
[2]: https://www.w3.org/WAI/standards-guidelines/wcag/ "W3C WAI — WCAG 2 Overview"
[3]: https://platform.openai.com/docs/guides/prompt-engineering "OpenAI — Prompt engineering"
[4]: https://genai.owasp.org/resource/owasp-top-10-for-llm-applications-2025/ "OWASP — Top 10 for LLM Applications 2025"
