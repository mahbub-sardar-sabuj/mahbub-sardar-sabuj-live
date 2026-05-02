// api/og.js — Dynamic Open Graph HTML for news pages
// Called by Vercel rewrite when a social crawler visits /news/:id

const SITE_URL = "https://www.mahbubsardarsabuj.com";
const SITE_NAME = "সরদার সংবাদ | মাহবুব সরদার সবুজ";
const DEFAULT_IMAGE = `${SITE_URL}/images/sardar-sangbad-logo-final.png`;

// Mirror of the news data in News.tsx — keep in sync when adding news
const newsData = [
  {
    id: 44,
    image: "/images/news/itikatha-short-film.jpg",
    title: "নতুনদের নিয়েই বড় স্বপ্ন, আসছে শর্টফিল্ম \"ইতিকথা\"",
    excerpt: "Bangla Natok 2.0-এ শিগগিরই শুরু হতে যাচ্ছে নতুন শর্টফিল্ম \"ইতিকথা\"-র শুটিং। ভিন্নধর্মী ভালোবাসার গল্প নিয়ে নির্মিত হতে যাওয়া এই প্রজেক্টটির রচনা ও পরিচালনায় রয়েছেন তরুণ নির্মাতা তাওহীদ ইসলাম সজীব।",
    category: "বিনোদন",
    date: "২ মে ২০২৬",
    tag: "শর্টফিল্ম",
  },
  {
    id: 43,
    image: "/images/news/salman-habib.jpg",
    title: "সরল ভাষায় গভীর অনুভূতির কবি সালমান হাবীব",
    excerpt: "বাংলা কবিতার সমকালীন অঙ্গনে এক নীরব অথচ শক্তিশালী উপস্থিতি হিসেবে উঠে এসেছেন সালমান হাবীব। সহজ ভাষায় গভীর অনুভূতি প্রকাশের ক্ষমতা এবং ব্যক্তিগত আবেগকে সার্বজনীন করে তোলার দক্ষতায় তিনি অল্প সময়েই তরুণ প্রজন্মের কাছে পরিচিত ও জনপ্রিয় হয়ে উঠেছেন।",
    category: "সাহিত্য",
    date: "৩০ এপ্রিল ২০২৬",
    tag: "কবি",
  },
  {
    id: 42,
    image: "/images/news/arifpur-eidgah-bitoork.jpg",
    title: "আরিফপুর ঈদগাহ বিতর্ক: জানাজাকে ঘিরে মতভেদ, উত্তেজনা ও বাস্তবতা",
    excerpt: "আরিফপুর এলাকায় সাম্প্রতিক একটি জানাজার ঘটনাকে কেন্দ্র করে তৈরি হয়েছে আলোচনা, বিভ্রান্তি এবং পারস্পরিক অভিযোগ। দুই পক্ষের বক্তব্য বিশ্লেষণ করলে দেখা যায় ঘটনাটি শুধু একটি জানাজা নয়, বরং স্থানীয় ধর্মীয় নেতৃত্ব, সম্মানবোধ এবং ভুল বোঝাবুঝির জটিল এক প্রতিফলন।",
    category: "সমাজ",
    date: "৩০ এপ্রিল ২০২৬",
    tag: "আরিফপুর",
  },
  {
    id: 41,
    image: "/images/news/huzaifa-al-mahmud.jpg",
    title: "শিক্ষা, সাহিত্য ও কণ্ঠশিল্পে বহুমাত্রিক প্রতিভা হুজাইফা আল মাহমুদ",
    excerpt: "শিক্ষা, সাহিত্য এবং কণ্ঠশিল্প—এই তিন ধারাকে একসঙ্গে বয়ে নিয়ে এগিয়ে চলেছেন হুজাইফা আল মাহমুদ। গোল্ডেন ইউনিভার্সাল স্কুলের প্রিন্সিপাল, কবি ও ভয়েস আর্টিস্ট হিসেবে তিনি সমকালীন এক অনন্য প্রতিভার নাম।",
    category: "ব্যক্তিত্ব",
    date: "২৯ এপ্রিল ২০২৬",
    tag: "ভয়েস আর্টিস্ট",
  },
  {
    id: 40,
    image: "/images/news/mahbub_sardar_sabuj_platform_launch.jpg",
    title: "ব্যক্তিগত লেখা ও অভিজ্ঞতা প্রকাশের নতুন প্ল্যাটফর্ম 'MahbubSardarSabuj.com' চালু",
    excerpt: "ব্যক্তিগত লেখা ও অভিজ্ঞতা প্রকাশের জন্য নতুন অনলাইন প্ল্যাটফর্ম MahbubSardarSabuj.com চালু হয়েছে। এখানে গল্প, কবিতা, উপন্যাসসহ বিভিন্ন লেখা ও তথ্য নিউজ আকারে প্রকাশ করা যাবে।",
    category: "প্রযুক্তি",
    date: "২৮ এপ্রিল ২০২৬",
    tag: "প্ল্যাটফর্ম",
  },
  {
    id: 39,
    image: "/images/news/shunnotar_songlap_junaid_bin_kamal.jpg",
    title: "তরুণ লেখক জুনাইদ বিন কামালের ‘শূন্যতার সংলাপ’ পাঠকমহলে আলোচনায়",
    excerpt: "সাহিত্যাঙ্গনে নতুন প্রজন্মের লেখকদের পদচারণা দিন দিন দৃশ্যমান হচ্ছে। সেই ধারাবাহিকতায় আলোচনায় উঠে এসেছে তরুণ লেখক জুনাইদ বিন কামালের বই ‘শূন্যতার সংলাপ’।",
    category: "সাহিত্য",
    date: "১৬ এপ্রিল ২০২৬",
    tag: "বই",
  },
  {
    id: 38,
    image: "/images/news/fer_dekha_hobe_nusrat_aporna.jpg",
    title: "নতুন প্রজন্মের কাব্যধারায় ‘ফের দেখা হবে’—নুসরাত অপর্ণার আবেগঘন অভিষেক",
    excerpt: "বাংলা সাহিত্যাঙ্গনে নতুন প্রজন্মের তরুণ লেখকদের উপস্থিতি ক্রমেই দৃশ্যমান হচ্ছে। সেই ধারাবাহিকতায় পাঠকসমাজে আলোচনায় এসেছে সম্ভাবনাময় লেখিকা নুসরাত অপর্ণার প্রথম কাব্যগ্রন্থ ‘ফের দেখা হবে’।",
    category: "সাহিত্য",
    date: "১৪ এপ্রিল ২০২৬",
    tag: "কবিতা",
  },
  {
    id: 37,
    image: "/images/news/tumi_chaya_naki_alo_nusrat_aporna.jpg",
    title: "“তুমি ছায়া নাকি আলো”—ভালোবাসা ও নৈতিক দ্বন্দ্বের গল্প নিয়ে নতুন উপন্যাস",
    excerpt: "ঢাকা শহরের অদৃশ্য অন্ধকার বাস্তবতা ও মানুষের ভেতরের নৈতিক দ্বন্দ্বকে কেন্দ্র করে প্রকাশিত হয়েছে তরুণ লেখিকা নুসরাত অপর্ণার নতুন উপন্যাস “তুমি ছায়া নাকি আলো”।",
    category: "সাহিত্য",
    date: "১৪ এপ্রিল ২০২৬",
    tag: "উপন্যাস",
  },
  {
    id: 36,
    image: "/images/news/sulaiman_gufran_new_book_2026.jpg",
    title: "তরুণ কবি সুলাইমান গুফরানের নতুন বই ঘিরে পাঠকমহলে আগ্রহ",
    excerpt: "বরিশালের তরুণ কবি ও লেখক সুলাইমান গুফরানের নতুন বই নিয়ে ইতোমধ্যে পাঠকদের মধ্যে তৈরি হয়েছে আগ্রহ।",
    category: "সাহিত্য",
    date: "১০ এপ্রিল ২০২৬",
    tag: "কবিতা",
  },
  {
    id: 35,
    image: "/images/news/tumi_chile_bolei_eid_book_2026.jpg",
    title: "ঈদে আসছে ‘তুমি ছিলে বলেই’: প্রি-অর্ডারেই পাঠকদের উচ্ছ্বাস, বিশেষ চিঠির ঘোষণা",
    excerpt: "ঈদকে সামনে রেখে নতুন উপন্যাস ‘তুমি ছিলে বলেই’ নিয়ে পাঠকদের আগ্রহ বাড়ছে। প্রি-অর্ডারেই মিলছে ব্যাপক সাড়া।",
    category: "সাহিত্য",
    date: "১০ এপ্রিল ২০২৬",
    tag: "বই",
  },
  {
    id: 34,
    image: "/images/news/economy_reform_bangladesh_april_2026.jpg",
    title: "অর্থনীতি সচল রাখতে সংস্কারে জোর, বলছেন বিশেষজ্ঞরা",
    excerpt: "অর্থনীতিকে সচল রাখতে নীতিগত সংস্কার, স্বচ্ছতা ও বাস্তবমুখী পদক্ষেপের ওপর গুরুত্ব দিয়েছেন অর্থনীতিবিদরা।",
    category: "অর্থনীতি",
    date: "১০ এপ্রিল ২০২৬",
    tag: "বাংলাদেশ",
  },
  {
    id: 33,
    image: "/images/news/IMG_7993.jpeg",
    title: "ইরানকে ঘিরে মধ্যপ্রাচ্যে অস্থিরতা, হরমুজ প্রণালী নিয়ে বাড়ছে উদ্বেগ",
    excerpt: "যুদ্ধবিরতি কার্যকর থাকলেও হরমুজ প্রণালী, নিষেধাজ্ঞা ও সীমান্ত উত্তেজনা নিয়ে মধ্যপ্রাচ্যে নতুন করে অনিশ্চয়তা তৈরি হয়েছে।",
    category: "আন্তর্জাতিক",
    date: "৯ এপ্রিল ২০২৬",
    tag: "মধ্যপ্রাচ্য",
  },
  {
    id: 32,
    image: "/images/news/news_32_parliament.jpg",
    title: "ঠিকমতো বাংলা রিডিং পড়তে পারে না, অথচ বসে আছেন এমপি–মন্ত্রী পদে।",
    excerpt: "একজন মন্ত্রী যদি প্রকাশ্যে ঠিকভাবে লিখিত বক্তব্যও পড়তে না পারেন, তা শুধু ব্যক্তিগত অদক্ষতার পরিচয় নয়, বরং রাষ্ট্রের ভাবমূর্তির জন্যও বিব্রতকর।",
    category: "রাজনীতি",
    date: "৯ এপ্রিল ২০২৬",
    tag: "সংসদ",
  },
  {
    id: 24,
    image: "/images/news/khoshbash-chairman-v2.jpg",
    title: "হাতকড়ায় চেয়ারম্যান: খোশবাসে বেদনা, অনিশ্চয়তায় জনজীবন",
    excerpt:
      "কুমিল্লার বরুড়া উপজেলার খোশবাস ইউনিয়নে চেয়ারম্যান নাজমুল হাসান সর্দারের গ্রেফতারের ঘটনায় জনজীবনে নেমে এসেছে অনিশ্চয়তা ও উদ্বেগ।",
    category: "জাতীয়",
    date: "৩ এপ্রিল ২০২৬",
    tag: "রাজনীতি",
  },
  {
    id: 25,
    image: "/images/news/akibul-hasan.jpg",
    title: "ভোলা থেকে উঠে আসা নতুন সাহিত্যকণ্ঠ আকিবুল হাসান",
    excerpt:
      "ভালোবাসা, বেদনা আর জীবনের গভীর অনুভূতি—এই তিনটিকেই শব্দে রূপ দিতে ভালোবাসেন তরুণ লেখক আকিবুল হাসান।",
    category: "সাহিত্য",
    date: "৩ এপ্রিল ২০২৬",
    tag: "লেখক",
  },
  {
    id: 21,
    image: "/images/news/zahid-hasan-poet.jpg",
    title: "উদীয়মান তরুণ কবি জাহিদ হাসান—ভালোবাসা, বেদনা ও অনুভূতির কণ্ঠস্বর",
    excerpt:
      "ময়মনসিংহের চর-ঝাউগড়া গ্রামের নীরব পরিবেশ থেকে উঠে আসা তরুণ লেখক জাহিদ হাসান ধীরে ধীরে নিজস্ব সাহিত্যভুবন গড়ে তুলছেন।",
    category: "সাহিত্য",
    date: "২ এপ্রিল ২০২৬",
    tag: "কবিতা",
  },
  {
    id: 20,
    image: "/images/news/website-launch.jpg",
    title: "নতুন আঙ্গিকে সাহিত্যচর্চা: চালু হলো লেখক মাহবুব সরদার সবুজের অফিসিয়াল ওয়েবসাইট",
    excerpt:
      "ডিজিটাল যুগের সঙ্গে তাল মিলিয়ে সাহিত্যকে আরও সহজলভ্য ও সংগঠিত করতে লেখক মাহবুব সরদার সবুজ তার নতুন অফিসিয়াল ওয়েবসাইট চালু করেছেন।",
    category: "প্রযুক্তি",
    date: "২ এপ্রিল ২০২৬",
    tag: "ওয়েবসাইট",
  },
  {
    id: 19,
    image: "/images/news/110k-followers.jpg",
    title: "১১০ হাজার ফলোয়ার পূর্ণ: কৃতজ্ঞতা জানালেন লেখক মাহবুব সরদার সবুজ",
    excerpt:
      "জনপ্রিয় লেখক মাহবুব সরদার সবুজের অফিসিয়াল প্রোফাইল আইডিতে ফলোয়ার সংখ্যা ১১০ হাজারে পৌঁছেছে।",
    category: "সাফল্য",
    date: "১ এপ্রিল ২০২৬",
    tag: "মাইলস্টোন",
  },
  {
    id: 18,
    image: "/images/news/december-shohor.jpg",
    title: '"ডিসেম্বরের শহরে" বই নিয়ে পাঠকমহলে আগ্রহ বাড়ছে',
    excerpt:
      'বাংলা সাহিত্য অঙ্গনে সমকালীন রোমান্টিক ধারার আলোচিত বইগুলোর মধ্যে জায়গা করে নিয়েছে "ডিসেম্বরের শহরে"।',
    category: "সাহিত্য",
    date: "১ এপ্রিল ২০২৬",
    tag: "বই",
  },
  {
    id: 17,
    image: "/images/news/platform-announcement.jpg",
    title: "আপনার গল্প, আপনার পরিচিতি—এবার বৃহৎ পাঠকের কাছে",
    excerpt:
      "ডিজিটাল এই সময়ে নিজের পরিচিতি তুলে ধরা কিংবা ব্যক্তিগত সাফল্যের গল্প শেয়ার করা এখন অনেক সহজ।",
    category: "ঘোষণা",
    date: "১ এপ্রিল ২০২৬",
    tag: "প্ল্যাটফর্ম",
  },
  {
    id: 10,
    image: "/images/news/baighar-visit.jpg",
    title: "ঢাকা বাতিঘরে তরুণ আবৃত্তিকারদের বই-পরিচিতি",
    excerpt:
      'তরুণ আবৃত্তিকার মরিয়ম ও সোহানী ঢাকা বাতিঘরে মাহবুব সরদার সবুজের বই "আমি বিচ্ছেদকে বলি দুঃখবিলাস"-এর সাথে পরিচিত হন।',
    category: "সাহিত্য",
    date: "১ এপ্রিল ২০২৬",
    tag: "আবৃত্তি",
  },
];

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isSocialCrawler(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return (
    ua.includes("facebookexternalhit") ||
    ua.includes("twitterbot") ||
    ua.includes("whatsapp") ||
    ua.includes("linkedinbot") ||
    ua.includes("telegrambot") ||
    ua.includes("slackbot") ||
    ua.includes("discordbot") ||
    ua.includes("googlebot") ||
    ua.includes("bingbot") ||
    ua.includes("applebot") ||
    ua.includes("crawler") ||
    ua.includes("spider") ||
    ua.includes("bot/")
  );
}

export default async function handler(req, res) {
  const { id } = req.query;
  const userAgent = req.headers["user-agent"] || "";

  // Find the news item
  const newsId = parseInt(id, 10);
  const news = newsData.find((n) => n.id === newsId);

  // If not a crawler and not a valid news item, redirect to the actual page
  if (!isSocialCrawler(userAgent) && !news) {
    res.setHeader("Location", `${SITE_URL}/news`);
    return res.status(302).end();
  }

  // If not a crawler, redirect to the React SPA page
  if (!isSocialCrawler(userAgent)) {
    res.setHeader("Location", `${SITE_URL}/news/${id}`);
    return res.status(302).end();
  }

  // For crawlers: build the OG HTML
  const title = news
    ? `${escapeHtml(news.title)} | সরদার সংবাদ`
    : "সরদার সংবাদ | মাহবুব সরদার সবুজ";

  const description = news
    ? escapeHtml(news.excerpt)
    : "মাহবুব সরদার সবুজের সর্বশেষ সংবাদ, প্রকাশনা আপডেট, সাহিত্যকর্ম ও অনুষ্ঠানের তথ্য।";

  const imageRelative = news ? news.image : "/images/sardar-sangbad-logo-final.png";
  const image = imageRelative.startsWith("http")
    ? imageRelative
    : `${SITE_URL}${imageRelative}`;

  const canonicalUrl = news
    ? `${SITE_URL}/news/${news.id}`
    : `${SITE_URL}/news`;

  const html = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <meta name="description" content="${description}" />

  <!-- Open Graph -->
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
  <meta property="og:image" content="${escapeHtml(image)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:locale" content="bn_BD" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${escapeHtml(image)}" />

  <!-- Canonical & redirect for humans -->
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
  <meta http-equiv="refresh" content="0; url=${escapeHtml(canonicalUrl)}" />
</head>
<body>
  <p>Loading... <a href="${escapeHtml(canonicalUrl)}">Click here if not redirected</a></p>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
  return res.status(200).send(html);
}
