export const AUTHOR_PROFILE = {
  name: "মাহবুব সরদার সবুজ",
  publicTitle: "লেখক, কবি ও সাহিত্যিক",
  identity: "বাংলা ভাষার একজন লেখক ও কবি, যিনি ভালোবাসা, বিচ্ছেদ, জীবনসংগ্রাম, স্মৃতি ও মানবিক অনুভূতি নিয়ে লেখেন।",
  birthplace: "কুমিল্লা জেলার বরুড়া উপজেলার খোশবাস ইউনিয়নের আরিফপুর গ্রামের সরদার বাড়ি",
  currentLocation: "কর্মসূত্রে সৌদি আরব",
  signatureQuote: "কলমের স্পর্শে আমি বিদ্রোহী, ন্যায়ের পক্ষে সদা প্রফুল্লচিত্তে ছুটি; কেউ কেউ ভালোবেসে ডাকে আমায় কবি।",
  knownFor: [
    "ভালোবাসা, বিচ্ছেদ, অপেক্ষা, স্মৃতি ও জীবনদর্শনভিত্তিক লেখা",
    "পাঠকের আবেগ ও বাস্তবতার সঙ্গে সংযোগ তৈরি করা সাহিত্যধারা",
    "ওয়েবসাইটে লেখালেখি, ই-বুক, আবৃত্তি, গ্যালারি, সংবাদ ও ডিজাইন স্টুডিও একত্রে উপস্থাপন",
  ],
  stats: [
    "Facebook পেজে ১ লক্ষ ১০ হাজারেরও বেশি ফলোয়ার",
    "৫০ হাজারেরও বেশি পাঠক তাঁর ই-বুক পড়েছেন",
  ],
};

export const SITE_PAGES = [
  { key: "home", label: "হোম", path: "/", keywords: ["home", "হোম", "প্রথম পেজ", "ওয়েবসাইট"] },
  { key: "about", label: "পরিচিতি", path: "/about", keywords: ["about", "পরিচয়", "লেখক", "কবি", "মাহবুব", "সবুজ", "জন্ম", "জীবনী"] },
  { key: "writings", label: "লেখালেখি", path: "/writings", keywords: ["লেখা", "লেখালেখি", "writings", "archive", "আর্কাইভ", "কবিতা", "গল্প", "স্ট্যাটাস"] },
  { key: "ebooks", label: "ই-বুক", path: "/ebooks", keywords: ["বই", "ই-বুক", "ebook", "ebooks", "পড়তে", "বইগুলো", "কাব্যগ্রন্থ"] },
  { key: "recitations", label: "Facebook আবৃত্তি", path: "/facebook-recitations", keywords: ["আবৃত্তি", "recitation", "রিল", "reel", "facebook video", "ভিডিও"] },
  { key: "editor", label: "সরদার ডিজাইন স্টুডিও", path: "/editor", keywords: ["ডিজাইন", "design", "কার্ড", "পোস্টার", "editor", "স্টুডিও", "কবিতা কার্ড"] },
  { key: "gallery", label: "গ্যালারি", path: "/gallery", keywords: ["গ্যালারি", "gallery", "ছবি", "ফটো", "photo", "image"] },
  { key: "news", label: "সরদার সংবাদ", path: "/news", keywords: ["সংবাদ", "news", "খবর", "আপডেট", "সর্বশেষ"] },
  { key: "contact", label: "যোগাযোগ", path: "/contact", keywords: ["যোগাযোগ", "contact", "ইমেইল", "email", "ফর্ম", "message"] },
  { key: "community", label: "আমিও লিখবো বাস্তবতা", path: "/amio-likhbo-bastobota", keywords: ["আমিও লিখবো", "বাস্তবতা", "amio", "bastobota", "নিজের লেখা", "কমিউনিটি"] },
];

export const BOOKS = [
  {
    key: "dukkhovilash",
    title: "আমি বিচ্ছেদকে বলি দুঃখবিলাস",
    type: "ফিজিক্যাল কাব্যগ্রন্থ ও অনলাইন পাঠ",
    year: "২০২৬",
    pages: "১৫০+",
    summary: "বিচ্ছেদ, অপেক্ষা, হারানোর বেদনা ও ভালোবাসার গভীর অনুভূতি নিয়ে লেখা প্রথম ফিজিক্যাল কাব্যগ্রন্থ।",
    readPath: "/ebooks/read/dukkhovilash",
    buyUrl: "https://rkmri.co/TTMEoA3l3pM0/",
    keywords: ["দুঃখবিলাস", "বিচ্ছেদকে বলি", "dukkhovilash", "রকমারি", "rokomari", "কিনতে", "অর্ডার", "ফিজিক্যাল বই"],
  },
  {
    key: "smritir-boshonte",
    title: "স্মৃতির বসন্তে তুমি",
    type: "ই-বুক",
    year: "২০২৪",
    pages: "৮০+",
    summary: "স্মৃতি, ভালোবাসা ও আবেগের কবিতাময় সংকলন।",
    readPath: "/ebooks/read/smritir-boshonte",
    keywords: ["স্মৃতির বসন্তে", "smritir", "boshonte", "স্মৃতি"],
  },
  {
    key: "chand-phool",
    title: "চাঁদফুল",
    type: "ই-বুক",
    year: "২০২৩",
    pages: "৬০+",
    summary: "কোমল অনুভূতি, প্রেম ও সৌন্দর্যের কাব্যিক প্রকাশ।",
    readPath: "/ebooks/read/chand-phool",
    keywords: ["চাঁদফুল", "chand", "phool", "চাদফুল"],
  },
  {
    key: "shomoyer-gohvore",
    title: "সময়ের গহ্বরে",
    type: "ই-বুক",
    year: "২০২৩",
    pages: "১০০+",
    summary: "সময়, জীবন ও অভিজ্ঞতার গভীর ভাবনামূলক লেখা।",
    readPath: "/ebooks/read/shomoyer-gohvore",
    keywords: ["সময়ের গহ্বরে", "সময়ের গহ্বরে", "shomoyer", "gohvore"],
  },
  {
    key: "onoboddo-lekha",
    title: "মাহবুব সরদার সবুজের অনবদ্য লেখা",
    type: "ই-বুক সংকলন",
    year: "চলমান",
    pages: "১০০টি লেখা",
    summary: "জীবনমুখী ও অনুপ্রেরণামূলক লেখার বাছাই সংকলন।",
    readPath: "/ebooks/read/onoboddo-lekha",
    keywords: ["অনবদ্য", "onoboddo", "অনুপ্রেরণা", "জীবনমুখী"],
  },
];

export const WRITING_CATEGORIES = [
  { name: "জীবনদর্শন", count: 570, path: "/writings", keywords: ["জীবনদর্শন", "জীবন", "বাস্তবতা", "অনুপ্রেরণা", "life"] },
  { name: "বিচ্ছেদ", count: 251, path: "/writings", keywords: ["বিচ্ছেদ", "কষ্ট", "হারানো", "অপেক্ষা", "breakup"] },
  { name: "ভালোবাসা", count: 168, path: "/writings", keywords: ["ভালোবাসা", "প্রেম", "love"] },
  { name: "ছোট লেখা", count: 55, path: "/writings", keywords: ["ছোট লেখা", "short", "উক্তি", "স্ট্যাটাস"] },
  { name: "কবিতা", count: 40, path: "/writings", keywords: ["কবিতা", "poem", "poetry"] },
];

export const RECITATIONS = [
  { title: "জানেন বাবা", path: "/facebook-recitations", keywords: ["জানেন বাবা", "বাবা"] },
  { title: "আমি কাঁদলে মা আর কাঁদে না", path: "/facebook-recitations", keywords: ["কাঁদলে মা", "মা"] },
  { title: "তবুও তাকে ভালো", path: "/facebook-recitations", keywords: ["তবুও তাকে", "তাকে ভালো"] },
  { title: "আমি জানি সব ঠিক হয়ে যাওয়ার একটা নিয়ম আছে", path: "/facebook-recitations", keywords: ["সব ঠিক", "নিয়ম আছে"] },
  { title: "মাঝে মাঝে ইচ্ছে হয় তোমাকে ডেকে বলি", path: "/facebook-recitations", keywords: ["মাঝে মাঝে", "ডেকে বলি"] },
  { title: "নারীকে ভালোবাসার আগে", path: "/facebook-recitations", keywords: ["নারীকে", "ভালোবাসার আগে"] },
  { title: "মানুষটা তোমার প্রতি অন্ধ", path: "/facebook-recitations", keywords: ["মানুষটা", "অন্ধ"] },
  { title: "এমনভাবে সরে যাবো একদিন", path: "/facebook-recitations", keywords: ["সরে যাবো", "সরে যাব"] },
  { title: "বিবেকের আদালত", path: "/facebook-recitations", keywords: ["বিবেক", "আদালত"] },
];

export const CONTACT_CHANNELS = {
  email: "lekhokmahbubsardarsabuj@gmail.com",
  facebook: "https://facebook.com/MahbubSardarSabuj",
  instagram: "https://instagram.com/mahbub_sardar_sabuj",
  youtube: "https://youtube.com/@MahbubSardarSabuj",
};

export const CHATBOT_TOOLS = [
  { key: "audio", label: "Audio Studio", keywords: ["অডিও", "audio", "ভয়েস", "voice", "নয়েজ", "noise", "মিউজিক", "music", "মিক্স", "mix", "রেকর্ড", "sound"] },
  { key: "vision", label: "Vision Assistant", keywords: ["ছবি বিশ্লেষণ", "image", "vision", "স্ক্রিনশট", "screenshot", "ফটো বিশ্লেষণ"] },
  { key: "live", label: "Live Chat", keywords: ["লাইভ", "live", "মানুষের সাথে", "সরাসরি চ্যাট", "admin", "support"] },
];

export const WEBSITE_KNOWLEDGE = {
  author: AUTHOR_PROFILE,
  pages: SITE_PAGES,
  books: BOOKS,
  writingCategories: WRITING_CATEGORIES,
  recitations: RECITATIONS,
  contact: CONTACT_CHANNELS,
  tools: CHATBOT_TOOLS,
};
