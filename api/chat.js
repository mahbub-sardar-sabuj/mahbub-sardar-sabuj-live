// Centralized chatbot knowledge base rebuilt from the current website content.
// This file is the single authoritative memory source for /api/chat.

const SYSTEM_PROMPT = `তুমি "মাহবুব সরদার সবুজ AI Agent" — লেখক ও কবি মাহবুব সরদার সবুজের অফিসিয়াল ওয়েবসাইটের সহায়ক AI। তোমার কাজ হলো ব্যবহারকারীকে ওয়েবসাইট, লেখক, বই, লেখা, আবৃত্তি, ডিজাইন স্টুডিও, অডিও এডিটিং, গ্যালারি, সংবাদ, আমিও লিখবো বাস্তবতা প্ল্যাটফর্ম ও যোগাযোগ সম্পর্কে নির্ভুলভাবে সাহায্য করা।

## আচরণ ও ভাষা
- ব্যবহারকারীর ভাষা অনুসরণ করবে; বাংলা প্রশ্নে শুদ্ধ, সহজ ও সম্মানজনক বাংলা ব্যবহার করবে। ইংরেজিতে জিজ্ঞেস করলে ইংরেজিতে উত্তর দেবে।
- সবসময় "আপনি" ও "আপনার" ব্যবহার করবে। অপ্রয়োজনীয় ইমোজি ব্যবহার করবে না।
- প্রশ্নের গভীরতা অনুযায়ী উত্তর দেবে: ছোট প্রশ্নে সংক্ষিপ্ত, জটিল প্রশ্নে পরিষ্কার ধাপে ধাপে উত্তর।
- নিশ্চিত তথ্য আর অনুমান আলাদা রাখবে। কোনো তথ্য প্রকাশিত না থাকলে স্পষ্টভাবে বলবে: "এই বিষয়ে আমার কাছে নির্ভরযোগ্য প্রকাশিত তথ্য নেই।"
- কখনো সরাসরি URL লিখবে না। ওয়েবসাইটের ভেতরের পেজ দেখাতে শুধু [BUTTON:/path] ট্যাগ ব্যবহার করবে।
- লেখকের ছবি চাইলে [PHOTO] ট্যাগ ব্যবহার করবে। সরাসরি কথা বলতে চাইলে [LIVE_CHAT] ট্যাগ ব্যবহার করবে। যোগাযোগ তথ্য চাইলে [BUTTON:/contact] ব্যবহার করবে।

## লেখক সম্পর্কে নির্ভরযোগ্য তথ্য
- পুরো নাম: মাহবুব সরদার সবুজ (Mahbub Sardar Sabuj)।
- পরিচয়: বাংলা ভাষার লেখক ও কবি। তাঁর লেখায় ভালোবাসা, বিচ্ছেদ, জীবনসংগ্রাম, স্মৃতি, আত্মসম্মান, মানবিক সম্পর্ক ও জীবনদর্শন বিশেষভাবে উঠে আসে।
- জন্মস্থান: কুমিল্লা জেলার বরুড়া উপজেলার খোশবাস ইউনিয়নের আরিফপুর গ্রামের সরদার বাড়ি।
- বর্তমান অবস্থান: সৌদি আরব (কর্মসূত্রে)।
- লেখালেখির শুরু: ২০১৫ সাল থেকে সামাজিক মাধ্যমে লেখা শুরু।
- পিতা: ফানাউল্লাহ সরদার। মাতা: আহামালী বিনতে মাসুরা।
- দর্শন ও উক্তি: "কলমের স্পর্শে আমি বিদ্রোহী, ন্যায়ের পক্ষে সদা প্রফুল্লচিত্তে ছুটি।" / "মানুষের আচরণই আসল পরিচয় — কে কীভাবে কথা বলে, কেমন ব্যবহারে আগলে রাখে।" / "লেখালেখি আমার কাছে শুধু শখ নয়; এটি আত্মপ্রকাশ ও পাঠকের সঙ্গে মানসিক সংযোগ।"
- জন্মতারিখ, বয়স, শিক্ষাগত যোগ্যতা, ফোন নম্বর, বৈবাহিক অবস্থা — এসব বিষয়ে নিশ্চিত প্রকাশিত তথ্য নেই; অনুমান করবে না। জিজ্ঞেস করলে [BUTTON:/about] বা [BUTTON:/contact] দেখাবে।

## বই ও ই-বুক (সম্পূর্ণ তালিকা)
বর্তমানে ওয়েবসাইটে ১টি ফিজিক্যাল বই এবং ৩টি অনলাইন রিডেবল ই-বুক আছে। মোট ৪টি বই।

১. "আমি বিচ্ছেদকে বলি দুঃখবিলাস" — প্রথম ফিজিক্যাল বই, ২০২৬, আবেগী সাহিত্য, ১৫০+ পৃষ্ঠা। বিচ্ছেদ, ব্যথা ও মানসিক সংগ্রামের কথা। রকমারিতে কেনার লিংক বই পেজে আছে। সংক্ষিপ্ত নাম "দুঃখবিলাস"। [BUTTON:/ebooks/read/dukkhovilash]
২. "স্মৃতির বসন্তে তুমি" — ই-বুক, ২০২৪, কবিতা ও গদ্য, ৮০+ পৃষ্ঠা। স্মৃতি, প্রিয় মুহূর্ত ও মানবমনের গভীর অনুভূতি। [BUTTON:/ebooks/read/smritir-boshonte]
৩. "চাঁদফুল" — ই-বুক, ২০২৩, কবিতা, ৬০+ পৃষ্ঠা। প্রকৃতি ও কোমল অনুভূতির কাব্যিক মেলবন্ধন। [BUTTON:/ebooks/read/chand-phool]
৪. "সময়ের গহ্বরে" — ই-বুক, ২০২৩, গদ্য ও কবিতা, ১০০+ পৃষ্ঠা। সময়, শহর, মানুষ ও স্মৃতির নস্টালজিক সাহিত্যযাত্রা। [BUTTON:/ebooks/read/shomoyer-gohvore]

সব বই দেখতে [BUTTON:/ebooks]।

## ওয়েবসাইটের সব পেজ ও উদ্দেশ্য
- [BUTTON:/] — হোম: লেখকের পরিচয়, বই, লেখা, আবৃত্তি ও প্রধান সেকশনগুলোর সারাংশ।
- [BUTTON:/about] — পরিচিতি: লেখকের জীবনী, জন্মস্থান, সাহিত্যযাত্রা, টাইমলাইন, দর্শন ও উক্তি।
- [BUTTON:/writings] — লেখালেখি ও বই: লেখকের ৭৮৯টি কবিতা, গদ্য ও ছোট লেখার সংগ্রহ। ক্যাটাগরি: জীবনদর্শন (৩৪৩টি), বিচ্ছেদ (২৪৬টি), ভালোবাসা (১১৯টি), ছোট লেখা (৪৬টি), কবিতা (৩৫টি) ও আরও।
- [BUTTON:/ebooks] — বই ও ই-বুক: প্রকাশিত বই ও অনলাইন পড়ার পেজ।
- [BUTTON:/facebook-recitations] — আবৃত্তি: Facebook ও YouTube ভিত্তিক আবৃত্তি/ভিডিও সংগ্রহ। Facebook-এ ৯টি এবং YouTube-এ ৩৯টি আবৃত্তি এন্ট্রি আছে।
- [BUTTON:/editor] — সরদার ডিজাইন স্টুডিও: কবিতা কার্ড ও ডিজাইন তৈরির অনলাইন টুল।
- [BUTTON:/gallery] — গ্যালারি: লেখকের ৪২টি ছবির সংগ্রহ (ফটো পোর্ট্রেট, আর্ট পোর্ট্রেট, বিশেষ মুহূর্ত)।
- [BUTTON:/news] — সরদার সংবাদ: সাহিত্য, সমাজ, বিনোদন ও সাম্প্রতিক খবর। বর্তমানে ৪৭টি সংবাদ প্রকাশিত।
- [BUTTON:/contact] — যোগাযোগ: ইমেইল, সোশ্যাল লিংক ও বার্তা পাঠানোর ফর্ম।
- [BUTTON:/amio-likhbo-bastobota] — আমিও লিখবো বাস্তবতা: ভিজিটরদের জন্য বাংলা সোশ্যাল লেখার প্ল্যাটফর্ম।
- [BUTTON:/amio-likhbo-login] — আমিও লিখবো লগইন: প্ল্যাটফর্মে লগইন/রেজিস্ট্রেশন পেজ।
- [BUTTON:/profile] — প্রোফাইল: লগইন করা ব্যবহারকারীর প্রোফাইল পেজ।
- [BUTTON:/privacy-policy] ও [BUTTON:/terms] — নীতিমালা ও শর্তাবলি।

## আমিও লিখবো বাস্তবতা প্ল্যাটফর্ম (নতুন ফিচার)
এটি ওয়েবসাইটের একটি বিশেষ সেকশন যেখানে যে কেউ নিজের বাস্তব অভিজ্ঞতা, গল্প, কবিতা ও ভাবনা শেয়ার করতে পারেন।

**কীভাবে কাজ করে:**
- লেখা জমা দিতে প্রথমে [BUTTON:/amio-likhbo-login] পেজে ইমেইল ও পাসওয়ার্ড দিয়ে একটি বিনামূল্যে একাউন্ট খুলতে হবে।
- একাউন্ট খুলে লগইন করলে "পোস্ট" বাটন দিয়ে লেখা জমা দেওয়া যাবে।
- লেখা জমা দেওয়ার পর প্রথমে পর্যালোচনা হয়, অনুমোদনের পর সবার ফিডে দেখা যায়।
- প্রোফাইলে ছবি আপলোড করা যায়; পোস্টে লেখকের প্রোফাইল ছবি দেখা যায়।

**লেখার ধরন (৬টি ক্যাটাগরি):**
অভিজ্ঞতা, গল্প, কবিতা, ভাবনা, ছবি, ভিডিও।

**রিঅ্যাকশন (৪ ধরনের):**
পছন্দ (👍), ভালোবাসা (❤️), অনুপ্রেরণা (💡), দুঃখ (😔)।

**অন্যান্য ফিচার:**
- পোস্টে মন্তব্য করা যায় (অনুমোদনের পর প্রকাশিত হয়)।
- পোস্ট শেয়ার করা যায়।
- নিজের পোস্ট সম্পাদনা ও মুছে ফেলা যায়।
- সার্চ করে পোস্ট বা লেখক খোঁজা যায়।
- ক্যাটাগরি ফিল্টার করে নির্দিষ্ট ধরনের লেখা দেখা যায়।
- পোস্টগুলো Google সার্চেও পাওয়া যায়।

**লিংক:** [BUTTON:/amio-likhbo-bastobota]

## লেখালেখি সম্পর্কে উত্তর দেওয়ার নিয়ম
- কবিতা বা লেখা চাইলে লেখকের নামে নতুন কবিতা তৈরি করবে না। বলবে যে লেখকের বিদ্যমান লেখা দেখাতে পারো এবং [BUTTON:/writings] পেজে যেতে বলবে।
- লেখার বিষয়ের উদাহরণ: জীবনদর্শন, ভালোবাসা, বিচ্ছেদ, স্মৃতি, নারীর মূল্য, আত্মসম্মান, ভুল মানুষ, বিশ্বাস, মনের যত্ন, মানুষের আচরণ।
- লেখার সঠিক উদ্ধৃতি দিতে হলে কেবল নিশ্চিত জানা অংশ দেবে; বানিয়ে পূর্ণ কবিতা/উদ্ধৃতি তৈরি করবে না।

## আবৃত্তি ও ভিডিও
আবৃত্তি পেজে লেখকের কবিতা/লেখার ভিডিও সংগ্রহ আছে।
- Facebook আবৃত্তির শিরোনাম: "জানেন বাবা", "আমি কাঁদলে মা আর কাঁদে না", "তবুও তাকে ভালো", "আমি জানি সব ঠিক হয়ে যাওয়ার একটা নিয়ম আছে", "মাঝে মাঝে ইচ্ছে হয় তোমাকে ডেকে বলি", "নারীকে ভালোবাসার আগে", "মানুষটা তোমার প্রতি অন্ধ", "এমনভাবে সরে যাবো একদিন", "বিবেকের আদালত"।
- YouTube-এ ৩৯টি আবৃত্তি এন্ট্রি আছে।
- আবৃত্তি দেখতে [BUTTON:/facebook-recitations]।

## সরদার সংবাদ (সাম্প্রতিক ৫টি খবর)
১. "প্রবাস জীবন" — সিয়াম ভাইয়ের প্রযোজনায় নতুন গান ঘিরে আলোচনা (বিনোদন)
২. জীবন এক অদ্ভুত গল্পের নাম — মেহেদী হাসান জাহিদের সাহিত্য ফিচার (সাহিত্য)
৩. নতুন ভ্রমণ ভ্লগার 'Adventure with Rony' মিরিঞ্জা ভ্যালির ভিডিওতেই দারুণ সাড়া (ভ্রমণ)
৪. নতুনদের নিয়েই বড় স্বপ্ন, আসছে শর্টফিল্ম "ইতিকথা" (বিনোদন)
৫. সরল ভাষায় গভীর অনুভূতির কবি সালমান হাবীব (সাহিত্য)
সব সংবাদ দেখতে [BUTTON:/news]। মোট ৪৭টি সংবাদ প্রকাশিত।

## সরদার ডিজাইন স্টুডিও
মোবাইল ও ডেস্কটপে ব্যবহারযোগ্য অনলাইন ডিজাইন টুল। কবিতা কার্ড, সাহিত্য পোস্ট, quote card ও সামাজিক মাধ্যমের ভিজ্যুয়াল তৈরি করা যায়।
- ফিচার: ৪৬টি বাংলা ফন্ট, ১৬টি থিম, ৫টি ক্যানভাস সাইজ, ৭টি ফ্রেম, ১০টি ফিল্টার প্রিসেট, ৬টি স্টিকার ক্যাটাগরিতে ২১৬টি স্টিকার, বহু ব্যাকগ্রাউন্ড ক্যাটাগরি, ছবি আপলোড, টেক্সট লেয়ার, ড্রইং, PNG/JPG export।
- ব্যবহারের ধাপ: ছবি/লেখা যোগ করুন → ফন্ট/রং ঠিক করুন → background/filter দিন → preview দেখুন → PNG/JPG হিসেবে সেভ করুন।
- খুলতে [BUTTON:/editor]।

## AI অডিও এডিটিং
চ্যাটবটের ভেতরে অডিও এডিটিং ফিচার আছে। অডিও ফাইল আপলোড করলে নিচের কাজ করা যায়:
- সাপোর্টেড ফরম্যাট: MP3, WAV, OGG, FLAC, AAC, M4A।
- কাজ: noise remove, voice enhance, EQ, compression, limiter, de-ess, click/pop cleanup, volume leveling, speed/pitch পরিবর্তন, reverb/echo, podcast/YouTube/আবৃত্তি/voice-message style preset।
- ব্যাকগ্রাউন্ড মিউজিক মিক্স চাইলে মিউজিক ফাইলও চাইবে।
- অডিও আপলোড করতে চ্যাটবটের নিচের অডিও বাটন ব্যবহার করুন।

## লাইভ চ্যাট
ওয়েবসাইটে সরাসরি চ্যাটের সুবিধা আছে। ব্যবহারকারী যদি লেখকের সঙ্গে সরাসরি কথা বলতে চায়, অভিযোগ/সহায়তা চায়, বা মানুষের সঙ্গে কথা বলতে চায়, বলবে যে লাইভ চ্যাট খুলে দিচ্ছি এবং [LIVE_CHAT] ট্যাগ ব্যবহার করবে।

## যোগাযোগ ও সোশ্যাল তথ্য
- ইমেইল: lekhokmahbubsardarsabuj@gmail.com
- Facebook: Lekhok.MahbubSardarSabuj
- Instagram: mahbub_sardar_sabuj
- YouTube: @MahbubSardarSabuj
- অবস্থান: সৌদি আরব। ফোন নম্বর প্রকাশিত নয়।
- যোগাযোগ ফর্ম পেজে আছে: [BUTTON:/contact]

## গ্যালারি
গ্যালারি পেজে লেখকের ৪২টি ছবির সংগ্রহ আছে — ফটো পোর্ট্রেট, আর্ট পোর্ট্রেট, বিশেষ মুহূর্তের ছবি। দেখতে [BUTTON:/gallery]। লেখকের ছবি দেখতে চাইলে [PHOTO]।

## বিশেষ উত্তর নির্দেশনা
- "তুমি কি ChatGPT/Gemini/Claude?" প্রশ্নে বলবে: "না, আমি মাহবুব সরদার সবুজের ওয়েবসাইটের বিশেষ AI সহকারী — মাহবুব সরদার সবুজ AI Agent।"
- সাধারণ জ্ঞানের প্রশ্নের উত্তর সংক্ষেপে দেবে, তারপর বলবে যে তুমি মূলত এই ওয়েবসাইট ও লেখকের কাজ সম্পর্কে সাহায্য করো।
- ব্যবহারকারী যদি ওয়েবসাইটে সমস্যা জানায়, আগে সমস্যা বুঝে নেবে; প্রয়োজন হলে [LIVE_CHAT] ব্যবহার করবে।
- লেখকের ব্যক্তিগত, অপ্রকাশিত বা সংবেদনশীল তথ্য অনুমান করবে না।
- আমিও লিখবো বাস্তবতায় লেখা পোস্ট করতে চাইলে [BUTTON:/amio-likhbo-login] দেখাবে এবং বলবে একাউন্ট খুলে লগইন করতে।

## লক্ষ্য
ব্যবহারকারী যেন নির্ভরযোগ্য, বিনয়ী ও কার্যকর সহায়তা পায়; ভুল তথ্য, পুরনো মেমোরি ও বানানো তথ্য যেন কখনো না আসে।`;

function extractUserText(messages = []) {
  const lastUserMsg = [...messages].reverse().find((message) => message?.role === "user");
  if (!lastUserMsg) return "";
  if (Array.isArray(lastUserMsg.content)) {
    return lastUserMsg.content
      .map((part) => part?.type === "text" ? part.text : "")
      .filter(Boolean)
      .join(" ")
      .trim();
  }
  return String(lastUserMsg.content || "").trim();
}

function isEnglishQuery(text) {
  const letters = text.replace(/[^a-zA-Z\u0980-\u09FF]/g, "");
  const englishLetters = text.replace(/[^a-zA-Z]/g, "");
  if (letters.length === 0) return false;
  return (englishLetters.length / letters.length) > 0.6;
}

function buildFallbackReply(messages = [], aiError = null) {
  const userText = extractUserText(messages);
  const q = userText.toLowerCase().trim();
  const isEnglish = isEnglishQuery(userText);

  if (/আসসালামু|আস সালামু|assalamu|আদাব|নমস্কার|সালাম|হ্যালো|হেলো|hello|hi\b|hey\b|হাই\b/.test(q)) {
    return isEnglish
      ? `Welcome! I am Mahbub Sardar Sabuj AI Agent, the official assistant of this website. I can help you with the author, writings, books, recitations, Sardar Design Studio, audio editing, live chat, gallery, news and contact information. What would you like to know?`
      : `ওয়ালাইকুম আস-সালাম ওয়া রাহমাতুল্লাহি ওয়া বারাকাতুহ। আমি মাহবুব সরদার সবুজ AI Agent — এই ওয়েবসাইটের অফিসিয়াল সহকারী। লেখক, লেখা, বই, আবৃত্তি, ডিজাইন স্টুডিও, অডিও এডিটিং, লাইভ চ্যাট, গ্যালারি, সংবাদ বা যোগাযোগ সম্পর্কে কী জানতে চান?`;
  }

  if (/কে আপনি|কে তুমি|তুমি কে|আপনি কে|who are you|your name|তোমার নাম|আপনার নাম|chatgpt|gemini|claude/.test(q)) {
    return isEnglish
      ? `I am not ChatGPT, Gemini or Claude. I am Mahbub Sardar Sabuj AI Agent, the dedicated assistant for Mahbub Sardar Sabuj's official website. I can guide you through the site and its features. [BUTTON:/about]`
      : `না, আমি ChatGPT বা Gemini নই। আমি মাহবুব সরদার সবুজের ওয়েবসাইটের বিশেষ AI সহকারী — মাহবুব সরদার সবুজ AI Agent। লেখক, বই, লেখা, আবৃত্তি, ডিজাইন স্টুডিও বা যোগাযোগ সম্পর্কে জানতে চাইলে বলুন। [BUTTON:/about]`;
  }

  if (/মাহবুব|সরদার|সবুজ|mahbub|sabuj|লেখক|কবি|author|poet|পরিচয়|পরিচিতি|about|জীবনী/.test(q)) {
    return isEnglish
      ? `Mahbub Sardar Sabuj is a Bengali writer and poet from Arifpur, Barura, Cumilla, Bangladesh. He is currently based in Saudi Arabia. His writings focus on love, separation, life struggle, memory, self-respect and human emotion. Learn more here: [BUTTON:/about]`
      : `মাহবুব সরদার সবুজ বাংলা ভাষার একজন লেখক ও কবি। তাঁর জন্মস্থান কুমিল্লা জেলার বরুড়া উপজেলার খোশবাস ইউনিয়নের আরিফপুর গ্রাম, এবং বর্তমানে তিনি সৌদি আরবে অবস্থান করছেন। তাঁর লেখায় ভালোবাসা, বিচ্ছেদ, জীবনসংগ্রাম, স্মৃতি, আত্মসম্মান ও মানবিক অনুভূতি বিশেষভাবে উঠে আসে। বিস্তারিত জানতে [BUTTON:/about]`;
  }

  if (/বই|book|ই-বুক|ebook|e-book|দুঃখবিলাস|দুঃখাবলাস|বিচ্ছেদ|কিনতে|রকমারি|কিনব|পড়ব|পড়ব|পড়তে|পড়তে|স্মৃতির|চাঁদফুল|সময়ের/.test(q)) {
    return isEnglish
      ? `The books page currently shows one physical book and three readable e-books. The physical book is "Ami Bicchedhke Boli Dukhobilas" (2026). The e-books are "Smritir Boshonte Tumi", "Chandfool" and "Shomoyer Gohvore". View the collection: [BUTTON:/ebooks]`
      : `বই পেজে বর্তমানে ১টি ফিজিক্যাল বই ও ৩টি অনলাইন রিডেবল ই-বুক আছে। ফিজিক্যাল বই: "আমি বিচ্ছেদকে বলি দুঃখবিলাস" (২০২৬)। ই-বুক: "স্মৃতির বসন্তে তুমি", "চাঁদফুল", "সময়ের গহ্বরে"। সব বই দেখতে [BUTTON:/ebooks]`;
  }

  if (/কবিতা|poem|poetry|লিখতে|লিখব|ছন্দ|অনুভূতি|আবেগ|লেখালেখি|লেখা|writing|প্রবন্ধ|গদ্য/.test(q)) {
    return isEnglish
      ? `The writings section contains the author's poems, prose, essays and short writings. I should not invent new poems as the author; I can guide you to the existing writings. [BUTTON:/writings]`
      : `লেখালেখি পেজে লেখকের কবিতা, গদ্য, প্রবন্ধ ও ছোট লেখার সংগ্রহ আছে। আমি লেখকের নামে নতুন কবিতা বানিয়ে দিই না; তবে লেখকের বিদ্যমান লেখা দেখতে সাহায্য করতে পারি। [BUTTON:/writings]`;
  }

  if (/আবৃত্তি|recitation|ভিডিও|video|শুনতে|দেখতে|youtube|facebook/.test(q)) {
    return isEnglish
      ? `The recitation page contains Facebook and YouTube recitation/video collections related to Mahbub Sardar Sabuj's writings. Watch them here: [BUTTON:/facebook-recitations]`
      : `আবৃত্তি পেজে মাহবুব সরদার সবুজের লেখা/কবিতার Facebook ও YouTube ভিডিও সংগ্রহ আছে। দেখতে [BUTTON:/facebook-recitations]`;
  }

  if (/অডিও|audio|ভয়েস|voice|নয়েজ|noise|mp3|wav|রেকর্ড|record|podcast|পডকাস্ট/.test(q)) {
    return `এই ওয়েবসাইটে চ্যাটবটের ভেতরেই AI অডিও এডিটিং সুবিধা আছে। অডিও ফাইল আপলোড করলে noise remove, voice enhance, EQ, compression, volume leveling, podcast/YouTube/আবৃত্তি preset ইত্যাদি করা যায়। অডিও আপলোড করতে নিচের অডিও বাটন ব্যবহার করুন।`;
  }

  if (/ডিজাইন|design|কার্ড|card|বানাতে|তৈরি|স্টুডিও|studio|ফন্ট|font|পোস্ট|ছবি এডিট|image edit|photo edit/.test(q)) {
    return `সরদার ডিজাইন স্টুডিও হলো অনলাইন ডিজাইন টুল। এখানে বাংলা ফন্ট, theme, canvas size, frame, filter, sticker, background, ছবি আপলোড, text layer, drawing এবং PNG/JPG export সুবিধা আছে। খুলতে [BUTTON:/editor]`;
  }

  if (/যোগাযোগ|contact|ইমেইল|email|ফোন|phone|সোশ্যাল|social|facebook|instagram|youtube|messenger|মেসেঞ্জ/.test(q)) {
    return `লেখকের প্রকাশিত যোগাযোগ তথ্য: ইমেইল lekhokmahbubsardarsabuj@gmail.com, Facebook handle Lekhok.MahbubSardarSabuj, Instagram handle mahbub_sardar_sabuj, YouTube handle @MahbubSardarSabuj। ফোন নম্বর প্রকাশিত নয়। সব যোগাযোগ তথ্য দেখতে [BUTTON:/contact]`;
  }

  if (/লাইভ চ্যাট|live chat|সরাসরি কথা|মানুষের সাথে কথা|real person|সরাসরি যোগাযোগ/.test(q)) {
    return `অবশ্যই, সরাসরি চ্যাট খুলে দিচ্ছি। [LIVE_CHAT]`;
  }

  if (/সংবাদ|সরদার সংবাদ|news|আপডেট|update|নতুন|খবর/.test(q)) {
    return `সরদার সংবাদ পেজে সাম্প্রতিক খবর, আপডেট ও প্রকাশনা-সম্পর্কিত পোস্ট পাওয়া যায়। বর্তমানে ৪৭টি সংবাদ প্রকাশিত। [BUTTON:/news]`;
  }
  if (/আমিও লিখবো|লিখবো বাস্তবতা|amio|bastobota|পোস্ট করতে|লেখা জমা|একাউন্ট খুলতে|রেজিস্ট্রেশন|ভিজিটর লেখা|সোশ্যাল লেখা/.test(q)) {
    return isEnglish
      ? `"Amio Likhbo Bastobota" is a social writing platform where anyone can share real life stories, experiences, poems and thoughts. To post, create a free account at [BUTTON:/amio-likhbo-login] and then visit the feed at [BUTTON:/amio-likhbo-bastobota]`
      : `"আমিও লিখবো বাস্তবতা" হলো একটি সোশ্যাল লেখার প্ল্যাটফর্ম যেখানে যে কেউ বাস্তব অভিজ্ঞতা, গল্প, কবিতা ও ভাবনা শেয়ার করতে পারেন। লেখা পোস্ট করতে প্রথমে [BUTTON:/amio-likhbo-login] পেজে বিনামূল্যে একাউন্ট খুলুন, তারপর ফিডে যান [BUTTON:/amio-likhbo-bastobota]`;
  }

  if (/গ্যালারি|gallery|ছবি|photo|image|ফটো/.test(q)) {
    return `গ্যালারি পেজে লেখকের ছবির সংগ্রহ আছে। ছবি দেখতে [BUTTON:/gallery]। লেখকের ছবি দেখতে চাইলে [PHOTO]`;
  }

  if (/ধন্যবাদ|thanks|thank you|শুকরিয়া|আল্লাহ হাফেজ|খোদা হাফেজ|বিদায়|goodbye|bye/.test(q)) {
    return `আপনাকেও ধন্যবাদ। মাহবুব সরদার সবুজের ওয়েবসাইটে আসার জন্য কৃতজ্ঞতা। আবার কোনো প্রয়োজনে জানাবেন।`;
  }

  return isEnglish
    ? `I am Mahbub Sardar Sabuj AI Agent. I can help you with the author, writings, books and e-books, recitations, Sardar Design Studio, audio editing, gallery, news, Amio Likhbo Bastobota platform, live chat and contact information. Which section would you like to explore? [BUTTON:/]`
    : `আমি মাহবুব সরদার সবুজ AI Agent। লেখক, লেখা, বই ও ই-বুক, আবৃত্তি, সরদার ডিজাইন স্টুডিও, অডিও এডিটিং, গ্যালারি, সংবাদ, আমিও লিখবো বাস্তবতা প্ল্যাটফর্ম, লাইভ চ্যাট ও যোগাযোগ সম্পর্কে সাহায্য করতে পারি। আপনি কোন বিষয় জানতে চান? [BUTTON:/]`;
}



// Uses OPENAI_API_KEY and optional OPENAI_BASE_URL / OPENAI_MODEL environment variables
import {
  checkRateLimit,
  isProbablySpamText,
  limitJsonBodySize,
  normalizeText,
} from "./_utils/security.js";

// AI response থেকে raw URL গুলো [BUTTON] ট্যাগে রূপান্তর করা
function sanitizeReply(reply) {
  if (!reply || typeof reply !== "string") return reply;
  // Markdown লিংক [text](https://mahbubsardarsabuj.com/path) → [BUTTON:/path]
  reply = reply.replace(/\[([^\]]+)\]\(https?:\/\/(?:www\.)?mahbubsardarsabuj\.com(\/[^\)]*)?\)/g, (_, text, path) => {
    return path ? `[BUTTON:${path}]` : `[BUTTON:/]`;
  });
  // Raw URL https://mahbubsardarsabuj.com/path → [BUTTON:/path]
  reply = reply.replace(/https?:\/\/(?:www\.)?mahbubsardarsabuj\.com(\/[^\s\)\"\']+)?/g, (_, path) => {
    return path ? `[BUTTON:${path}]` : `[BUTTON:/]`;
  });
  // Typo URL https://mahmubsardarsabuj.com/path → [BUTTON:/path]
  reply = reply.replace(/https?:\/\/(?:www\.)?mahmubsardarsabuj\.com(\/[^\s\)\"\']+)?/g, (_, path) => {
    return path ? `[BUTTON:${path}]` : `[BUTTON:/]`;
  });
  return reply;
}


// Call AI API. It tries every configured provider before using the built-in natural fallback.
async function callAI(messages) {
  const configs = resolveAiConfigs();
  if (configs.length === 0) {
    throw new Error("No AI API key configured. Set GEMINI_API_KEY for the simplest production setup.");
  }
  let lastError;
  for (const config of configs) {
    try {
      return await callAIWithConfig(messages, config);
    } catch (err) {
      lastError = err;
      console.error(`AI provider ${config.source} failed; trying next provider if available:`, err.message);
    }
  }
  throw lastError || new Error("All AI providers failed");
}

function escapeTelegramHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function truncateTelegramText(value = "", maxLength = 3500) {
  const text = String(value);
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 20) + "\n…[truncated]";
}


// Send photo to Telegram (base64 data URL)
async function sendPhotoToTelegram(botToken, adminChatId, base64Data, caption) {
  const matches = base64Data.match(/^data:(.+);base64,(.+)$/s);
  if (!matches) return { ok: false, error: "Invalid image data" };
  const mimeType = matches[1];
  const buffer = Buffer.from(matches[2], "base64");
  const ext = mimeType.split("/")[1] || "jpg";
  const boundary = "----FormBoundary" + Math.random().toString(36).slice(2);
  const CRLF = "\r\n";
  const parts = [];
  parts.push(`--${boundary}${CRLF}Content-Disposition: form-data; name="chat_id"${CRLF}${CRLF}${adminChatId}`);
  if (caption) {
    parts.push(`--${boundary}${CRLF}Content-Disposition: form-data; name="caption"${CRLF}Content-Type: text/plain; charset=utf-8${CRLF}${CRLF}${caption}`);
    parts.push(`--${boundary}${CRLF}Content-Disposition: form-data; name="parse_mode"${CRLF}${CRLF}HTML`);
  }
  const headerStr = parts.join(CRLF) + CRLF;
  const fileHeader = `--${boundary}${CRLF}Content-Disposition: form-data; name="photo"; filename="photo.${ext}"${CRLF}Content-Type: ${mimeType}${CRLF}${CRLF}`;
  const footer = `${CRLF}--${boundary}--`;
  const headerBuf = Buffer.from(headerStr, "utf-8");
  const fileHeaderBuf = Buffer.from(fileHeader, "utf-8");
  const footerBuf = Buffer.from(footer, "utf-8");
  const body = Buffer.concat([headerBuf, fileHeaderBuf, buffer, footerBuf]);
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
    method: "POST",
    headers: { "Content-Type": `multipart/form-data; boundary=${boundary}` },
    body,
  });
  return res.json().catch(() => ({}));
}

async function notifyTelegram({ userMessage, aiResponse, clientIp, userAgent, imageData }) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID?.trim();

  if (!botToken || !adminChatId) {
    console.warn("Telegram notification skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_ADMIN_CHAT_ID is not configured.");
    return { ok: false, skipped: true, reason: "missing_env" };
  }

  const text = [
    "🤖 <b>AI Chatbot Conversation</b>",
    "",
    "<b>Visitor:</b> " + escapeTelegramHtml(truncateTelegramText(userMessage, 1200)),
    "",
    "<b>AI Reply:</b> " + escapeTelegramHtml(truncateTelegramText(aiResponse, 1800)),
    "",
    "<b>IP:</b> " + escapeTelegramHtml(clientIp || "unknown"),
    "<b>User Agent:</b> " + escapeTelegramHtml(truncateTelegramText(userAgent || "unknown", 400)),
    "<b>Time:</b> " + escapeTelegramHtml(new Date().toLocaleString("bn-BD", { timeZone: "Asia/Dhaka" })),
  ].join("\n");

  try {
    if (imageData && imageData.startsWith("data:")) {
      await sendPhotoToTelegram(botToken, adminChatId, imageData, text);
    } else {
      const response = await fetch("https://api.telegram.org/bot" + botToken + "/sendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: adminChatId,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.ok === false) {
        console.error("Telegram notification failed:", {
          status: response.status,
          description: result.description || "Unknown Telegram API error",
        });
        return { ok: false, status: response.status, description: result.description };
      }
    }
    return { ok: true };
  } catch (error) {
    console.error("Telegram notification failed:", error);
    return { ok: false, error: error.message };
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (limitJsonBodySize(req, res, 2 * 1024 * 1024)) return;

  const rate = checkRateLimit(req, res, {
    keyPrefix: "chat",
    windowMs: 60 * 1000,
    max: 20,
  });
  if (rate.limited) return;

  try {
    const { messages } = req.body || {};

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Invalid messages" });
    }

    const lastUserContent = messages
      .filter((message) => message?.role === "user")
      .slice(-1)[0]?.content;
    const lastUserText = Array.isArray(lastUserContent)
      ? lastUserContent.find((part) => part?.type === "text")?.text || ""
      : lastUserContent || "";

    if (normalizeText(lastUserText, 5000).length > 4000 || isProbablySpamText(lastUserText)) {
      return res.status(400).json({ error: "আপনার বার্তাটি খুব বড় বা সন্দেহজনক। অনুগ্রহ করে সংক্ষিপ্ত ও স্বাভাবিক বার্তা পাঠান।" });
    }

    // Filter out any system messages sent from the frontend (to avoid duplication)
    // and keep only the last 12 user/assistant messages for context
    const filteredMessages = messages
      .filter((m) => m.role !== "system" && ["user", "assistant"].includes(m.role))
      .slice(-12);
    const allMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...filteredMessages,
    ];

    try {
      const reply = await callAI(allMessages);

      const lastUserMsg = messages.filter((message) => message.role === "user").slice(-1)[0];
      const lastUserImgPart = Array.isArray(lastUserMsg?.content)
        ? lastUserMsg.content.find(p => p.type === "image_url")?.image_url?.url
        : null;
      await notifyTelegram({
        userMessage: lastUserMsg ? (Array.isArray(lastUserMsg.content) ? lastUserMsg.content.find(p => p.type === 'text')?.text || '[ছবি পাঠানো হয়েছে]' : lastUserMsg.content) : "(অজানা)",
        aiResponse: reply,
        clientIp: rate.clientIp,
        userAgent: req.headers["user-agent"],
        imageData: lastUserImgPart || null,
      });

      return res.status(200).json({ reply: sanitizeReply(reply) });
    } catch (err) {
      console.error("AI API failed; returning built-in fallback reply:", err.message);
      const fallbackReply = buildFallbackReply(messages, err);
      const lastUserMsg = messages.filter((message) => message.role === "user").slice(-1)[0];
      const lastUserImgPart = Array.isArray(lastUserMsg?.content)
        ? lastUserMsg.content.find(p => p.type === "image_url")?.image_url?.url
        : null;
      await notifyTelegram({
        userMessage: lastUserMsg ? (Array.isArray(lastUserMsg.content) ? lastUserMsg.content.find(p => p.type === 'text')?.text || '[ছবি পাঠানো হয়েছে]' : lastUserMsg.content) : "(অজানা)",
        aiResponse: `${fallbackReply}\n\n[Fallback used because AI provider failed: ${err.message}]`,
        clientIp: rate.clientIp,
        userAgent: req.headers["user-agent"],
        imageData: lastUserImgPart || null,
      }).catch((notifyError) => console.error("Telegram fallback notification failed:", notifyError.message));
      return res.status(200).json({ reply: fallbackReply, fallback: true });
    }
  } catch (err) {
    console.error("Chat handler error:", err);
    return res.status(500).json({ error: "সার্ভারে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।" });
  }
}
