// api/og.js — Dynamic Open Graph HTML for news pages
// Called by Vercel rewrite when a social crawler visits /news/:id

const SITE_URL = "https://www.mahbubsardarsabuj.com";
const SITE_NAME = "সরদার সংবাদ | মাহবুব সরদার সবুজ";
const DEFAULT_IMAGE = `${SITE_URL}/images/sardar-sangbad-logo-final.png`;

// Mirror of the news data in News.tsx — keep in sync when adding news
const newsData = [
  {
    id: 24,
    image: "/images/news/khoshbash-chairman-v2.png",
    title: "হাতকড়ায় চেয়ারম্যান: খোশবাসে বেদনা, অনিশ্চয়তায় জনজীবন",
    excerpt:
      "কুমিল্লার বরুড়া উপজেলার খোশবাস ইউনিয়নে চেয়ারম্যান নাজমুল হাসান সর্দারের গ্রেফতারের ঘটনায় জনজীবনে নেমে এসেছে অনিশ্চয়তা ও উদ্বেগ।",
    category: "জাতীয়",
    date: "৩ এপ্রিল ২০২৬",
    tag: "রাজনীতি",
  },
  {
    id: 25,
    image: "/images/news/akibul-hasan.png",
    title: "ভোলা থেকে উঠে আসা নতুন সাহিত্যকণ্ঠ আকিবুল হাসান",
    excerpt:
      "ভালোবাসা, বেদনা আর জীবনের গভীর অনুভূতি—এই তিনটিকেই শব্দে রূপ দিতে ভালোবাসেন তরুণ লেখক আকিবুল হাসান।",
    category: "সাহিত্য",
    date: "৩ এপ্রিল ২০২৬",
    tag: "লেখক",
  },
  {
    id: 21,
    image: "/images/news/zahid-hasan-poet.png",
    title: "উদীয়মান তরুণ কবি জাহিদ হাসান—ভালোবাসা, বেদনা ও অনুভূতির কণ্ঠস্বর",
    excerpt:
      "ময়মনসিংহের চর-ঝাউগড়া গ্রামের নীরব পরিবেশ থেকে উঠে আসা তরুণ লেখক জাহিদ হাসান ধীরে ধীরে নিজস্ব সাহিত্যভুবন গড়ে তুলছেন।",
    category: "সাহিত্য",
    date: "২ এপ্রিল ২০২৬",
    tag: "কবিতা",
  },
  {
    id: 20,
    image: "/images/news/website-launch.png",
    title: "নতুন আঙ্গিকে সাহিত্যচর্চা: চালু হলো লেখক মাহবুব সরদার সবুজের অফিসিয়াল ওয়েবসাইট",
    excerpt:
      "ডিজিটাল যুগের সঙ্গে তাল মিলিয়ে সাহিত্যকে আরও সহজলভ্য ও সংগঠিত করতে লেখক মাহবুব সরদার সবুজ তার নতুন অফিসিয়াল ওয়েবসাইট চালু করেছেন।",
    category: "প্রযুক্তি",
    date: "২ এপ্রিল ২০২৬",
    tag: "ওয়েবসাইট",
  },
  {
    id: 19,
    image: "/images/news/110k-followers.png",
    title: "১১০ হাজার ফলোয়ার পূর্ণ: কৃতজ্ঞতা জানালেন লেখক মাহবুব সরদার সবুজ",
    excerpt:
      "জনপ্রিয় লেখক মাহবুব সরদার সবুজের অফিসিয়াল প্রোফাইল আইডিতে ফলোয়ার সংখ্যা ১১০ হাজারে পৌঁছেছে।",
    category: "সাফল্য",
    date: "১ এপ্রিল ২০২৬",
    tag: "মাইলস্টোন",
  },
  {
    id: 18,
    image: "/images/news/december-shohor.png",
    title: '"ডিসেম্বরের শহরে" বই নিয়ে পাঠকমহলে আগ্রহ বাড়ছে',
    excerpt:
      'বাংলা সাহিত্য অঙ্গনে সমকালীন রোমান্টিক ধারার আলোচিত বইগুলোর মধ্যে জায়গা করে নিয়েছে "ডিসেম্বরের শহরে"।',
    category: "সাহিত্য",
    date: "১ এপ্রিল ২০২৬",
    tag: "বই",
  },
  {
    id: 17,
    image: "/images/news/platform-announcement.png",
    title: "আপনার গল্প, আপনার পরিচিতি—এবার বৃহৎ পাঠকের কাছে",
    excerpt:
      "ডিজিটাল এই সময়ে নিজের পরিচিতি তুলে ধরা কিংবা ব্যক্তিগত সাফল্যের গল্প শেয়ার করা এখন অনেক সহজ।",
    category: "ঘোষণা",
    date: "১ এপ্রিল ২০২৬",
    tag: "প্ল্যাটফর্ম",
  },
  {
    id: 10,
    image: "/images/news/baighar-visit.png",
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
