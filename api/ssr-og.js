export const config = { runtime: "edge" };

const SITE_URL = "https://www.mahbubsardarsabuj.com";
const DEFAULT_IMAGE = `${SITE_URL}/images/og-home.jpg`;
const SITE_NAME = "মাহবুব সরদার সবুজ - Mahbub Sardar Sabuj";

const newsData = [
  { id: 29, title: "অমর একুশে বইমেলায় তরুণ লেখক তাহেরুল রাব্বির প্রথম কাব্যগ্রন্থ প্রকাশ", excerpt: "এবারের অমর একুশে বইমেলা ২০২৬-এ প্রকাশিত হয়েছে তরুণ লেখক তাহেরুল রাব্বি-এর বহুল প্রতীক্ষিত প্রথম কাব্যগ্রন্থ “নিঃশব্দ কান্নার অনুবাদ”।", image: `${SITE_URL}/images/news/news29.jpg` },
  { id: 28, title: "চাকরিজীবী নারীদের নিয়ে কটূক্তি, দুর্ঘটনার পর অনুতপ্ত যুবক", excerpt: "চাকরিজীবী নারীদের নিয়ে অবমাননাকর মন্তব্য করে সামাজিক মাধ্যমে সমালোচনার মুখে পড়া এক যুবক সড়ক দুর্ঘটনায় গুরুতর আহত হয়েছেন।", image: `${SITE_URL}/images/news/news28.jpg` },
  { id: 27, title: "সত্য ও ন্যায়ের পথে অবিচল: সরদার সংবাদের অঙ্গীকার", excerpt: "বর্তমান সময়ের তথ্যপ্রবাহে সত্য ও নিরপেক্ষ সংবাদ পৌঁছে দেওয়া একটি বড় দায়িত্ব। এই দায়িত্ববোধ থেকেই পথচলা শুরু করেছে সরদার সংবাদ।", image: `${SITE_URL}/images/news/sardar-sangbad-mission-og.jpg` },
  { id: 26, title: "ভালোবাসা, বেদনা ও নিঃশব্দ অনুভূতির ভাষায় মুরাদ হাসানের কবিতা", excerpt: "চট্টগ্রামের সাতকানিয়া উপজেলার তরুণ কবি মুরাদ হাসান নীরব অনুভূতি আর না-বলা কথাগুলোকে কবিতার ভাষায় প্রকাশ করে ধীরে ধীরে পাঠকের দৃষ্টি আকর্ষণ করছেন।", image: `${SITE_URL}/images/news/murad-hasan-poet-og.jpg` },
  { id: 25, title: "ভোলা থেকে উঠে আসা নতুন সাহিত্যকণ্ঠ আকিবুল হাসান", excerpt: "ভালোবাসা, বেদনা আর জীবনের গভীর অনুভূতি—এই তিনটিকেই শব্দে রূপ দিতে ভালোবাসেন তরুণ লেখক আকিবুল হাসান।", image: `${SITE_URL}/images/news/akibul-hasan-og.jpg` },
  { id: 24, title: "হাতকড়ায় চেয়ারম্যান: খোশবাসে বেদনা, অনিশ্চয়তায় জনজীবন", excerpt: "কুমিল্লার বরুড়া উপজেলার খোশবাস ইউনিয়নে চেয়ারম্যান নাজমুল হাসান সর্দারের গ্রেফতারের ঘটনায় জনজীবনে নেমে এসেছে অনিশ্চয়তা ও উদ্বেগ।", image: `${SITE_URL}/images/news/khoshbash-chairman-v2-og.jpg` },
  { id: 21, title: "উদীয়মান তরুণ কবি জাহিদ হাসান—ভালোবাসা, বেদনা ও অনুভূতির কণ্ঠস্বর", excerpt: "ময়মনসিংহের চর-ঝাউগড়া গ্রামের নীরব পরিবেশ থেকে উঠে আসা তরুণ লেখক জাহিদ হাসান ধীরে ধীরে নিজস্ব সাহিত্যভুবন গড়ে তুলছেন।", image: `${SITE_URL}/images/news/zahid-hasan-poet-og.jpg` },
  { id: 20, title: "নতুন আঙ্গিকে সাহিত্যচর্চা: চালু হলো লেখক মাহবুব সরদার সবুজের অফিসিয়াল ওয়েবসাইট", excerpt: "ডিজিটাল যুগের সঙ্গে তাল মিলিয়ে সাহিত্যকে আরও সহজলভ্য ও সংগঠিত করতে লেখক মাহবুব সরদার সবুজ তার নতুন অফিসিয়াল ওয়েবসাইট চালু করেছেন।", image: `${SITE_URL}/images/news/website-launch-og.jpg` },
  { id: 19, title: "১১০ হাজার ফলোয়ার পূর্ণ: কৃতজ্ঞতা জানালেন লেখক মাহবুব সরদার সবুজ", excerpt: "জনপ্রিয় লেখক মাহবুব সরদার সবুজের অফিসিয়াল প্রোফাইল আইডিতে ফলোয়ার সংখ্যা ১১০ হাজারে পৌঁছেছে।", image: `${SITE_URL}/images/news/110k-followers-og.jpg` },
  { id: 18, title: '"ডিসেম্বরের শহরে" বই নিয়ে পাঠকমহলে আগ্রহ বাড়ছে', excerpt: 'বাংলা সাহিত্য অঙ্গনে সমকালীন রোমান্টিক ধারার আলোচিত বইগুলোর মধ্যে জায়গা করে নিয়েছে "ডিসেম্বরের শহরে"।', image: `${SITE_URL}/images/news/december-shohor-og.jpg` },
  { id: 17, title: "আপনার গল্প, আপনার পরিচিতি—এবার বৃহৎ পাঠকের কাছে", excerpt: "ডিজিটাল এই সময়ে নিজের পরিচিতি তুলে ধরা কিংবা ব্যক্তিগত সাফল্যের গল্প শেয়ার করা এখন অনেক সহজ।", image: `${SITE_URL}/images/news/platform-announcement-og.jpg` },
  { id: 10, title: "ঢাকা বাতিঘরে তরুণ আবৃত্তিকারদের বই-পরিচিতি", excerpt: 'তরুণ আবৃত্তিকার মরিয়ম ও সোহানী ঢাকা বাতিঘরে মাহবুব সরদার সবুজের বই "আমি বিচ্ছেদকে বলি দুঃখবিলাস"-এর সাথে পরিচিত হন।', image: `${SITE_URL}/images/news/baighar-visit-og.jpg` },
];

const ebookData = [
  { slug: "dukkhovilash", title: "আমি বিচ্ছেদকে বলি দুঃখবিলাস", description: "মাহবুব সরদার সবুজের প্রথম প্রকাশিত কাব্যগ্রন্থ। ভালোবাসা, বিচ্ছেদ ও দুঃখের অনুভূতির কাব্যিক প্রকাশ।", image: `${SITE_URL}/images/ebooks/dukkhovilash.png` },
  { slug: "smritir-boshonte", title: "স্মৃতির বসন্তে তুমি", description: "স্মৃতি ও ভালোবাসার কবিতার সংকলন। হৃদয়ের গভীর অনুভূতির সাহিত্যিক প্রকাশ।", image: `${SITE_URL}/images/ebooks/smritir-boshonte.png` },
  { slug: "chand-phool", title: "চাঁদফুল", description: "প্রকৃতি ও ভালোবাসার কবিতার সংকলন।", image: `${SITE_URL}/images/ebooks/chand-phool.png` },
  { slug: "shomoyer-gohvore", title: "সময়ের গহ্বরে", description: "সময় ও জীবনের গভীরতার কবিতার সংকলন।", image: `${SITE_URL}/images/ebooks/shomoyer-gohvore.png` },
];

const staticPages = {
  "/": { title: "মাহবুব সরদার সবুজ | Mahbub Sardar Sabuj", description: "লেখক ও কবির অফিসিয়াল ওয়েবসাইট। কবিতা, গল্প, ই-বুক ও সাহিত্যের এক অনন্য জগৎ।", image: DEFAULT_IMAGE, type: "website" },
  "/writings": { title: "লেখালেখি | মাহবুব সরদার সবুজ", description: "মাহবুব সরদার সবুজের কবিতা, ছোট লেখা, ভালোবাসা ও জীবনদর্শনের বিশাল সংকলন।", image: DEFAULT_IMAGE, type: "website" },
  "/ebooks": { title: "ই-বুক সংগ্রহ | মাহবুব সরদার সবুজ", description: "মাহবুব সরদার সবুজের প্রকাশিত ই-বুক সমূহ বিনামূল্যে পড়ুন।", image: `${SITE_URL}/images/ebooks/dukkhovilash.png`, type: "website" },
  "/gallery": { title: "গ্যালারি | মাহবুব সরদার সবুজ", description: "মাহবুব সরদার সবুজের কবিতা ও লেখার ডিজাইন কার্ডের গ্যালারি।", image: DEFAULT_IMAGE, type: "website" },
  "/news": { title: "সরদার সংবাদ | মাহবুব সরদার সবুজ", description: "লেখক মাহবুব সরদার সবুজের সর্বশেষ সংবাদ, আপডেট ও সাহিত্য জগতের খবর।", image: DEFAULT_IMAGE, type: "website" },
  "/about": { title: "সম্পর্কে | মাহবুব সরদার সবুজ", description: "লেখক ও কবি মাহবুব সরদার সবুজের জীবনী, সাহিত্যদর্শন ও প্রকাশিত রচনার পরিচয়।", image: DEFAULT_IMAGE, type: "profile" },
  "/contact": { title: "যোগাযোগ | মাহবুব সরদার সবুজ", description: "লেখক মাহবুব সরদার সবুজের সাথে সরাসরি যোগাযোগ করুন।", image: DEFAULT_IMAGE, type: "website" },
  "/facebook-recitations": { title: "আবৃত্তি সংগ্রহ | মাহবুব সরদার সবুজ", description: "মাহবুব সরদার সবুজের ফেসবুক লাইভ আবৃত্তির সংগ্রহ।", image: DEFAULT_IMAGE, type: "website" },
  "/editor": { title: "সরদার ডিজাইন স্টুডিও | মাহবুব সরদার সবুজ", description: "কবিতা ও লেখার সুন্দর ডিজাইন কার্ড তৈরি করুন।", image: DEFAULT_IMAGE, type: "website" },
};

function getOGData(pathname) {
  const newsMatch = pathname.match(/^\/news\/(\d+)/);
  if (newsMatch) {
    const newsId = parseInt(newsMatch[1]);
    const news = newsData.find((n) => n.id === newsId);
    if (news) {
      return { title: news.title + " | সরদার সংবাদ", description: news.excerpt, image: news.image || DEFAULT_IMAGE, url: SITE_URL + pathname, type: "article" };
    }
    return { ...staticPages["/news"], url: SITE_URL + pathname };
  }
  const ebookMatch = pathname.match(/^\/ebooks\/read\/([^/]+)/);
  if (ebookMatch) {
    const slug = ebookMatch[1];
    const ebook = ebookData.find((e) => e.slug === slug);
    if (ebook) {
      return { title: ebook.title + " | ই-বুক পড়ুন", description: ebook.description, image: ebook.image || DEFAULT_IMAGE, url: SITE_URL + pathname, type: "book" };
    }
    return { ...staticPages["/ebooks"], url: SITE_URL + pathname };
  }
  const cleanPath = pathname.replace(/\/$/, "") || "/";
  if (staticPages[cleanPath]) {
    return { ...staticPages[cleanPath], url: SITE_URL + pathname };
  }
  return { title: "মাহবুব সরদার সবুজ | Mahbub Sardar Sabuj", description: "লেখক ও কবির অফিসিয়াল ওয়েবসাইট", image: DEFAULT_IMAGE, url: SITE_URL + pathname, type: "website" };
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default async function handler(req) {
  const url = new URL(req.url);
  const pathname = url.searchParams.get("path") || "/";
  const og = getOGData(pathname);

  const absImage = og.image && og.image.startsWith("http") ? og.image : `${SITE_URL}${og.image}`;
  const canonicalUrl = og.url || `${SITE_URL}${pathname}`;

  const html = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(og.title)}</title>
  <meta name="description" content="${escapeHtml(og.description)}" />

  <meta property="og:type" content="${escapeHtml(og.type || "website")}" />
  <meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />
  <meta property="og:title" content="${escapeHtml(og.title)}" />
  <meta property="og:description" content="${escapeHtml(og.description)}" />
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
  <meta property="og:image" content="${escapeHtml(absImage)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:locale" content="bn_BD" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(og.title)}" />
  <meta name="twitter:description" content="${escapeHtml(og.description)}" />
  <meta name="twitter:image" content="${escapeHtml(absImage)}" />

  <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
  <meta http-equiv="refresh" content="0; url=${escapeHtml(canonicalUrl)}" />
</head>
<body>
  <p>Loading... <a href="${escapeHtml(canonicalUrl)}">Click here if not redirected</a></p>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
