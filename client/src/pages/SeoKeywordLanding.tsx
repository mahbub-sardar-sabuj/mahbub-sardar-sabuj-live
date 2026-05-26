import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo, { SITE_URL } from "@/components/Seo";
import { Link, useLocation } from "wouter";
import { writings } from "@/data/writingsArchive";
import { BookOpen, Feather, Heart, Library, Sparkles, ArrowRight, Search, PenLine } from "lucide-react";

const BENGALI_TRANS: Record<string, string> = {
  'অ':'o','আ':'a','ই':'i','ঈ':'i','উ':'u','ঊ':'u','এ':'e','ঐ':'oi','ও':'o','ঔ':'ou',
  'ক':'k','খ':'kh','গ':'g','ঘ':'gh','ঙ':'ng','চ':'ch','ছ':'chh','জ':'j','ঝ':'jh','ঞ':'n',
  'ট':'t','ঠ':'th','ড':'d','ঢ':'dh','ণ':'n','ত':'t','থ':'th','দ':'d','ধ':'dh','ন':'n',
  'প':'p','ফ':'ph','ব':'b','ভ':'bh','ম':'m','য':'j','র':'r','ল':'l','শ':'sh','ষ':'sh','স':'s','হ':'h',
  'ড়':'r','ঢ়':'rh','য়':'y','ৎ':'t','া':'a','ি':'i','ী':'i','ু':'u','ূ':'u','ে':'e','ৈ':'oi','ো':'o','ৌ':'ou',
  'ং':'ng','ঃ':'h','ঁ':'n','্':'',' ':'-','?':'','!':'',',':'','.':'','"':'',"'":'','—':'-','–':'-'
};

function makeSlug(title: string, id: number): string {
  let slug = "";
  for (const ch of title) slug += BENGALI_TRANS[ch] ?? "";
  slug = slug.replace(/-+/g, "-").replace(/^-|-$/g, "").toLowerCase();
  return slug.length >= 3 ? slug : `writing-${id}`;
}

function makeExcerpt(text: string, maxLength = 155): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength).trim()}…` : normalized;
}

const landingPages = {
  "/bangla-kobita": {
    icon: Feather,
    title: "বাংলা কবিতা — মাহবুব সরদার সবুজ",
    h1: "বাংলা কবিতা",
    intro: "আধুনিক বাংলা কবিতা, কাব্যিক গদ্য, অনুভূতির লেখা এবং হৃদয়স্পর্শী সাহিত্য একসাথে পড়ার জন্য এই পেজটি তৈরি করা হয়েছে।",
    description: "মাহবুব সরদার সবুজের বাংলা কবিতা, কাব্যিক গদ্য, অনুভূতির লেখা ও নির্বাচিত সাহিত্য সংকলন পড়ুন।",
    keywords: "বাংলা কবিতা, আধুনিক বাংলা কবিতা, Bangla kobita, কবিতা, মাহবুব সরদার সবুজ",
    match: (w: typeof writings[number]) => w.category === "কবিতা" || /কবিতা|কাব্য|মন|চাঁদ|ফুল|আকাশ|নদী/.test(`${w.title} ${w.content}`),
    guide: "বাংলা কবিতা খোঁজা পাঠকেরা সাধারণত অনুভূতি, প্রেম, জীবন, প্রকৃতি ও স্মৃতির ভাষা খোঁজেন। এখানে সেসব লেখাকে একসাথে সাজানো হয়েছে যাতে সার্চ ইঞ্জিন ও পাঠক উভয়ই বিষয়ভিত্তিক সংগ্রহ সহজে বুঝতে পারে।",
  },
  "/valobashar-kobita": {
    icon: Heart,
    title: "ভালোবাসার কবিতা — মাহবুব সরদার সবুজ",
    h1: "ভালোবাসার কবিতা",
    intro: "ভালোবাসা, অপেক্ষা, স্মৃতি, সম্পর্ক এবং মায়ার গভীর অনুভূতি নিয়ে লেখা কবিতা ও ছোট লেখা এখানে সংকলিত।",
    description: "ভালোবাসার কবিতা, প্রেমের লেখা, সম্পর্কের অনুভূতি ও আবেগঘন বাংলা সাহিত্য পড়ুন মাহবুব সরদার সবুজের লেখায়।",
    keywords: "ভালোবাসার কবিতা, প্রেমের কবিতা, valobashar kobita, Bangla love poem, প্রেমের লেখা",
    match: (w: typeof writings[number]) => w.category === "ভালোবাসা" || /ভালোবাসা|প্রেম|মায়া|অপেক্ষা|সম্পর্ক|তুমি|মন/.test(`${w.title} ${w.content}`),
    guide: "প্রেম ও ভালোবাসা বিষয়ক লেখাগুলো পাঠকের আবেগের সঙ্গে সরাসরি যুক্ত। এই landing page ভালোবাসা-ভিত্তিক লেখা, কবিতা ও উদ্ধৃতি একত্র করে organic search visibility বাড়াতে সাহায্য করবে।",
  },
  "/bichched-kobita": {
    icon: Sparkles,
    title: "বিচ্ছেদ কবিতা — মাহবুব সরদার সবুজ",
    h1: "বিচ্ছেদ কবিতা",
    intro: "হারানো মানুষ, বিচ্ছেদের ব্যথা, নীরব অভিমান, ফিরে না পাওয়া স্মৃতি এবং দুঃখবিলাসের লেখা এখানে সাজানো।",
    description: "বিচ্ছেদ কবিতা, কষ্টের লেখা, sad Bangla poem ও দুঃখবিলাসধর্মী সাহিত্য পড়ুন মাহবুব সরদার সবুজের লেখায়।",
    keywords: "বিচ্ছেদ কবিতা, কষ্টের কবিতা, sad Bangla poem, দুঃখের লেখা, দুঃখবিলাস",
    match: (w: typeof writings[number]) => w.category === "বিচ্ছেদ" || /বিচ্ছেদ|কষ্ট|হারানো|অভিমান|দুঃখ|একাকী|স্মৃতি/.test(`${w.title} ${w.content}`),
    guide: "বিচ্ছেদ ও কষ্টের কবিতা বাংলা search demand-এর একটি শক্তিশালী অংশ। এই পেজে সংশ্লিষ্ট লেখা একত্র হওয়ায় Google, Bing এবং AI crawler বিষয়টি স্পষ্টভাবে বুঝতে পারে।",
  },
  "/jibon-dorshon": {
    icon: PenLine,
    title: "জীবনদর্শন ও অনুপ্রেরণামূলক লেখা — মাহবুব সরদার সবুজ",
    h1: "জীবনদর্শন ও অনুপ্রেরণামূলক লেখা",
    intro: "জীবনের শিক্ষা, আত্মবিশ্বাস, সম্পর্ক, মানুষ চেনা, বাস্তবতা এবং মানসিক শক্তি নিয়ে লেখা জীবনমুখী সাহিত্য।",
    description: "জীবনদর্শন, অনুপ্রেরণামূলক বাংলা লেখা, বাস্তবতা ও আত্মবিশ্বাস নিয়ে মাহবুব সরদার সবুজের নির্বাচিত লেখা পড়ুন।",
    keywords: "জীবনদর্শন, অনুপ্রেরণামূলক লেখা, বাংলা মোটিভেশনাল লেখা, বাস্তবতা, আত্মবিশ্বাস",
    match: (w: typeof writings[number]) => w.category === "জীবনদর্শন" || /জীবন|বিশ্বাস|বাস্তবতা|মানুষ|স্বপ্ন|শান্তি|সম্পর্ক/.test(`${w.title} ${w.content}`),
    guide: "জীবনদর্শনধর্মী লেখা long-tail keyword থেকে visitor আনতে পারে, কারণ পাঠকেরা প্রায়ই জীবনের বাস্তবতা, সম্পর্ক ও আত্মবিশ্বাস নিয়ে বাংলা লেখা খোঁজেন।",
  },
  "/bangla-ebook": {
    icon: Library,
    title: "বাংলা ই-বুক ও বই — মাহবুব সরদার সবুজ",
    h1: "বাংলা ই-বুক ও বই",
    intro: "মাহবুব সরদার সবুজের প্রকাশিত বই, ই-বুক, কাব্যগ্রন্থ এবং সাহিত্য সংকলনের জন্য একটি dedicated discovery page।",
    description: "বাংলা ই-বুক, কাব্যগ্রন্থ, বই ও মাহবুব সরদার সবুজের সাহিত্য সংকলনের তথ্য ও পড়ার লিংক দেখুন।",
    keywords: "বাংলা ই-বুক, Bangla ebook, বাংলা বই, কাব্যগ্রন্থ, মাহবুব সরদার সবুজ বই",
    match: (w: typeof writings[number]) => /বই|ই-বুক|কাব্যগ্রন্থ|সংকলন|দুঃখবিলাস|চাঁদফুল|স্মৃতি/.test(`${w.title} ${w.content}`),
    guide: "বাংলা বই ও ই-বুকের জন্য আলাদা landing page থাকলে search engine বই-সংক্রান্ত intent সহজে ধরতে পারে এবং পাঠকেরা সরাসরি relevant সংগ্রহে যেতে পারে।",
  },
  "/bangla-status": {
    icon: Sparkles,
    title: "বাংলা স্ট্যাটাস ও ক্যাপশন — মাহবুব সরদার সবুজ",
    h1: "বাংলা স্ট্যাটাস ও ক্যাপশন",
    intro: "মন ছুঁয়ে যাওয়া বাংলা স্ট্যাটাস, ক্যাপশন, ছোট উক্তি এবং সামাজিক মাধ্যমে শেয়ারযোগ্য অনুভূতির লেখা।",
    description: "বাংলা স্ট্যাটাস, ক্যাপশন, ছোট উক্তি ও শেয়ারযোগ্য অনুভূতির লেখা পড়ুন মাহবুব সরদার সবুজের সাহিত্য সংগ্রহে।",
    keywords: "বাংলা স্ট্যাটাস, Bangla status, বাংলা ক্যাপশন, বাংলা উক্তি, facebook caption bangla",
    match: (w: typeof writings[number]) => /স্ট্যাটাস|ক্যাপশন|উক্তি|মন|তুমি|জীবন|ভালোবাসা|স্মৃতি|অভিমান/.test(`${w.title} ${w.content}`),
    guide: "বাংলা স্ট্যাটাস ও ক্যাপশন বিষয়ে পাঠকেরা ছোট, অর্থবহ এবং শেয়ারযোগ্য লেখা খোঁজেন। এই পেজ সেই search intent পূরণ করার জন্য নির্বাচিত ছোট লেখা ও কবিতাকে একত্র করেছে।",
  },
  "/bangla-quotes": {
    icon: PenLine,
    title: "বাংলা উক্তি ও জীবন কথা — মাহবুব সরদার সবুজ",
    h1: "বাংলা উক্তি ও জীবন কথা",
    intro: "জীবন, সম্পর্ক, বাস্তবতা, স্বপ্ন ও আত্মবিশ্বাস নিয়ে সংক্ষিপ্ত বাংলা উক্তি এবং ভাবনার লেখা।",
    description: "বাংলা উক্তি, জীবন কথা, বাস্তবতা ও অনুপ্রেরণামূলক ছোট লেখা পড়ুন মাহবুব সরদার সবুজের সংগ্রহে।",
    keywords: "বাংলা উক্তি, bangla quotes, জীবন কথা, বাস্তবতা, অনুপ্রেরণামূলক উক্তি",
    match: (w: typeof writings[number]) => /উক্তি|জীবন|বাস্তবতা|মানুষ|স্বপ্ন|বিশ্বাস|শিক্ষা|আত্মবিশ্বাস|সম্পর্ক/.test(`${w.title} ${w.content}`),
    guide: "উক্তি ও জীবন কথার মতো long-tail keyword নতুন পাঠক আনার জন্য কার্যকর, কারণ এগুলো দ্রুত পড়া যায় এবং social sharing-এর সম্ভাবনা বেশি।",
  },
  "/koster-kobita": {
    icon: Heart,
    title: "কষ্টের কবিতা ও দুঃখের লেখা — মাহবুব সরদার সবুজ",
    h1: "কষ্টের কবিতা ও দুঃখের লেখা",
    intro: "কষ্ট, অভিমান, হারানো স্মৃতি, নীরবতা এবং একাকিত্বের গভীর অনুভূতি নিয়ে লেখা বাংলা কবিতা।",
    description: "কষ্টের কবিতা, দুঃখের লেখা, অভিমান ও একাকিত্বের বাংলা সাহিত্য পড়ুন মাহবুব সরদার সবুজের লেখায়।",
    keywords: "কষ্টের কবিতা, দুঃখের কবিতা, koster kobita, sad bangla status, অভিমানের লেখা",
    match: (w: typeof writings[number]) => /কষ্ট|দুঃখ|অভিমান|একাকী|নীরব|হারানো|চোখের জল|ব্যথা|বিচ্ছেদ/.test(`${w.title} ${w.content}`),
    guide: "কষ্টের কবিতা ও sad Bangla status সার্চে নিয়মিত চাহিদা থাকে। এখানে related লেখা সাজানো থাকায় পাঠক দ্রুত নিজের অনুভূতির সঙ্গে মিল খুঁজে নিতে পারবেন।",
  },
  "/romantic-bangla-kobita": {
    icon: Heart,
    title: "রোমান্টিক বাংলা কবিতা — মাহবুব সরদার সবুজ",
    h1: "রোমান্টিক বাংলা কবিতা",
    intro: "প্রেম, মায়া, অপেক্ষা, প্রিয় মানুষ এবং সম্পর্কের কোমল অনুভূতি নিয়ে রোমান্টিক বাংলা কবিতা ও লেখা।",
    description: "রোমান্টিক বাংলা কবিতা, প্রেমের লেখা, ভালোবাসার ক্যাপশন ও অনুভূতির বাংলা সাহিত্য পড়ুন।",
    keywords: "রোমান্টিক বাংলা কবিতা, romantic bangla kobita, প্রেমের কবিতা, ভালোবাসার ক্যাপশন",
    match: (w: typeof writings[number]) => /প্রেম|ভালোবাসা|রোমান্টিক|মায়া|তুমি|প্রিয়|অপেক্ষা|হৃদয়|সম্পর্ক/.test(`${w.title} ${w.content}`),
    guide: "রোমান্টিক কবিতা পেজটি প্রেম-ভিত্তিক search intent আলাদাভাবে ধরতে সাহায্য করবে এবং ভালোবাসা বিষয়ক existing content-কে আরও সহজে discoverable করবে।",
  },
  "/bangla-golpo": {
    icon: BookOpen,
    title: "বাংলা গল্প ও বাস্তব লেখা — মাহবুব সরদার সবুজ",
    h1: "বাংলা গল্প ও বাস্তব লেখা",
    intro: "বাস্তবতা, সম্পর্ক, অভিজ্ঞতা, স্মৃতি এবং জীবনঘনিষ্ঠ অনুভূতি নিয়ে বাংলা গল্পধর্মী লেখা।",
    description: "বাংলা গল্প, বাস্তব লেখা, সম্পর্ক ও জীবনের অভিজ্ঞতা নিয়ে মাহবুব সরদার সবুজের সাহিত্য পড়ুন।",
    keywords: "বাংলা গল্প, bangla golpo, বাস্তব গল্প, ছোট গল্প, জীবনঘনিষ্ঠ লেখা",
    match: (w: typeof writings[number]) => /গল্প|বাস্তব|ঘটনা|অভিজ্ঞতা|মানুষ|সম্পর্ক|স্মৃতি|জীবন|সময়/.test(`${w.title} ${w.content}`),
    guide: "বাংলা গল্প ও বাস্তব লেখা পেজটি narrative content খোঁজা পাঠকদের জন্য তৈরি। এতে সাহিত্য, অভিজ্ঞতা ও জীবনঘনিষ্ঠ লেখাকে একত্র করে organic discovery বাড়ানো যায়।",
  },
} as const;

const relatedLinks = [
  { href: "/bangla-kobita", label: "বাংলা কবিতা" },
  { href: "/valobashar-kobita", label: "ভালোবাসার কবিতা" },
  { href: "/bichched-kobita", label: "বিচ্ছেদ কবিতা" },
  { href: "/jibon-dorshon", label: "জীবনদর্শন" },
  { href: "/bangla-ebook", label: "বাংলা ই-বুক" },
  { href: "/bangla-status", label: "বাংলা স্ট্যাটাস" },
  { href: "/bangla-quotes", label: "বাংলা উক্তি" },
  { href: "/koster-kobita", label: "কষ্টের কবিতা" },
  { href: "/romantic-bangla-kobita", label: "রোমান্টিক কবিতা" },
  { href: "/bangla-golpo", label: "বাংলা গল্প" },
  { href: "/writings", label: "সব লেখা" },
  { href: "/ebooks", label: "ই-বুক লাইব্রেরি" },
];

function siteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

export default function SeoKeywordLanding() {
  const [location] = useLocation();
  const page = landingPages[location as keyof typeof landingPages] ?? landingPages["/bangla-kobita"];
  const Icon = page.icon;
  const matched = writings.filter(page.match).slice(0, 36);
  const featured = matched.slice(0, 12);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${siteUrl(location)}#collection`,
        "name": page.h1,
        "url": siteUrl(location),
        "inLanguage": "bn-BD",
        "description": page.description,
        "isPartOf": { "@type": "WebSite", "@id": `${SITE_URL}/#website` },
        "about": page.keywords.split(",").map((keyword) => keyword.trim()),
      },
      {
        "@type": "ItemList",
        "name": `${page.h1} নির্বাচিত লেখা`,
        "itemListElement": featured.map((item, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "url": siteUrl(`/writings/${makeSlug(item.title, item.id)}`),
          "name": item.title,
        })),
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": `${page.h1} কোথায় পড়ব?`,
            "acceptedAnswer": { "@type": "Answer", "text": `এই পেজে মাহবুব সরদার সবুজের ${page.h1} সম্পর্কিত নির্বাচিত লেখা, কবিতা ও সাহিত্য সংকলন পড়া যাবে।` },
          },
          {
            "@type": "Question",
            "name": "মাহবুব সরদার সবুজ কী ধরনের লেখালেখি করেন?",
            "acceptedAnswer": { "@type": "Answer", "text": "তিনি বাংলা কবিতা, ভালোবাসা, বিচ্ছেদ, জীবনদর্শন, ছোট লেখা, বই ও ই-বুক নিয়ে সাহিত্যচর্চা করেন।" },
          },
        ],
      },
    ],
  };

  return (
    <div className="seo-landing">
      <Seo
        title={page.title}
        description={page.description}
        path={location}
        keywords={page.keywords}
        type="website"
        jsonLd={jsonLd}
      />
      <Navbar />
      <main className="sl-main">
        <section className="sl-hero">
          <div className="sl-icon"><Icon size={34} /></div>
          <p className="sl-kicker">মাহবুব সরদার সবুজের সাহিত্য সংগ্রহ</p>
          <h1>{page.h1}</h1>
          <p className="sl-intro">{page.intro}</p>
          <div className="sl-actions">
            <Link href="/writings" className="sl-primary">সব লেখা পড়ুন <ArrowRight size={17} /></Link>
            <Link href="/ebooks" className="sl-secondary">বই ও ই-বুক</Link>
          </div>
        </section>

        <section className="sl-grid-section" aria-labelledby="selected-title">
          <div className="sl-section-head">
            <h2 id="selected-title">নির্বাচিত লেখা</h2>
            <p>{matched.length}টি সম্পর্কিত লেখা থেকে নির্বাচিত অংশ।</p>
          </div>
          <div className="sl-grid">
            {featured.map((item) => (
              <article className="sl-card" key={item.id}>
                <div className="sl-card-meta"><BookOpen size={15} /> {item.category} · {item.date}</div>
                <h3><Link href={`/writings/${makeSlug(item.title, item.id)}`}>{item.title}</Link></h3>
                <p>{makeExcerpt(item.content)}</p>
                <Link href={`/writings/${makeSlug(item.title, item.id)}`} className="sl-read">পুরো লেখা পড়ুন <ArrowRight size={14} /></Link>
              </article>
            ))}
          </div>
        </section>

        <section className="sl-trust" aria-labelledby="trust-title">
          <div>
            <p className="sl-kicker">Author Trust</p>
            <h2 id="trust-title">লেখক, নীতিমালা ও পাঠকের আস্থা</h2>
            <p>
              এই সংগ্রহের লেখা মাহবুব সরদার সবুজের অফিসিয়াল সাহিত্যভিত্তিক ওয়েবসাইটে প্রকাশিত। পাঠক সহজে লেখক পরিচিতি, যোগাযোগ এবং নীতিমালা দেখতে পারেন—যা সার্চ ইঞ্জিন ও AdSense review-এর জন্য বিশ্বাসযোগ্যতার গুরুত্বপূর্ণ সংকেত তৈরি করে।
            </p>
          </div>
          <div className="sl-trust-links" aria-label="বিশ্বাসযোগ্যতা ও নীতিমালা লিংক">
            <Link href="/about">লেখক পরিচিতি</Link>
            <Link href="/contact">যোগাযোগ</Link>
            <Link href="/privacy-policy">প্রাইভেসি পলিসি</Link>
            <Link href="/terms">শর্তাবলি</Link>
          </div>
        </section>

        <section className="sl-related" aria-labelledby="related-title">
          <h2 id="related-title"><Search size={20} /> সম্পর্কিত বিষয়</h2>
          <div className="sl-related-links">
            {relatedLinks.filter((link) => link.href !== location).map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
          </div>
        </section>
      </main>
      <Footer />
      <style>{`
        .seo-landing { min-height: 100vh; background: #070A12; color: #EEEAE2; font-family: 'Noto Serif Bengali', 'SolaimanLipi', serif; }
        .sl-main { padding-top: var(--site-nav-offset, 96px); }
        .sl-hero { max-width: 980px; margin: 0 auto; padding: clamp(4rem, 9vw, 7rem) 1.25rem 3rem; text-align: center; }
        .sl-icon { width: 76px; height: 76px; margin: 0 auto 1.2rem; border: 1px solid rgba(201,168,76,.32); border-radius: 24px; display: grid; place-items: center; color: #D8B45E; background: radial-gradient(circle at 30% 20%, rgba(201,168,76,.22), rgba(201,168,76,.04)); box-shadow: 0 18px 60px rgba(0,0,0,.36); }
        .sl-kicker { color: #C9A84C; letter-spacing: .08em; text-transform: uppercase; font-size: .82rem; margin-bottom: .8rem; }
        .sl-hero h1 { font-size: clamp(2.2rem, 6vw, 5rem); line-height: 1.12; margin: 0 0 1rem; font-weight: 600; }
        .sl-intro { max-width: 760px; margin: 0 auto; color: rgba(238,234,226,.76); font-size: clamp(1.02rem, 2vw, 1.28rem); line-height: 1.9; }
        .sl-actions { display: flex; justify-content: center; flex-wrap: wrap; gap: .8rem; margin-top: 2rem; }
        .sl-primary, .sl-secondary { display: inline-flex; align-items: center; gap: .45rem; padding: .78rem 1.15rem; border-radius: 999px; text-decoration: none; transition: transform .2s, border-color .2s; }
        .sl-primary { background: #C9A84C; color: #070A12; font-weight: 700; }
        .sl-secondary { color: #EEEAE2; border: 1px solid rgba(255,255,255,.14); background: rgba(255,255,255,.04); }
        .sl-primary:hover, .sl-secondary:hover { transform: translateY(-2px); }
        .sl-guide, .sl-grid-section, .sl-trust, .sl-related { max-width: 1120px; margin: 0 auto 2rem; padding: 1.4rem; }
        .sl-guide { border: 1px solid rgba(201,168,76,.16); border-radius: 28px; background: linear-gradient(135deg, rgba(201,168,76,.09), rgba(255,255,255,.025)); }
        .sl-guide h2, .sl-section-head h2, .sl-trust h2, .sl-related h2 { margin: 0 0 .7rem; font-size: clamp(1.35rem, 3vw, 2rem); }
        .sl-guide p, .sl-section-head p, .sl-trust p { color: rgba(238,234,226,.72); line-height: 1.9; margin: 0; }
        .sl-tags { display: flex; flex-wrap: wrap; gap: .55rem; margin-top: 1rem; }
        .sl-tags span { border: 1px solid rgba(201,168,76,.2); background: rgba(201,168,76,.08); color: #E6CA82; border-radius: 999px; padding: .42rem .72rem; font-size: .86rem; }
        .sl-section-head { display: flex; justify-content: space-between; gap: 1rem; align-items: end; margin-bottom: 1rem; flex-wrap: wrap; }
        .sl-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(245px, 1fr)); gap: 1rem; }
        .sl-card { border: 1px solid rgba(255,255,255,.08); border-radius: 22px; padding: 1.1rem; background: rgba(255,255,255,.035); min-height: 230px; display: flex; flex-direction: column; }
        .sl-card-meta { display: flex; align-items: center; gap: .4rem; color: #C9A84C; font-size: .78rem; margin-bottom: .7rem; }
        .sl-card h3 { margin: 0 0 .7rem; font-size: 1.08rem; line-height: 1.55; }
        .sl-card h3 a { color: #FFF8E7; text-decoration: none; }
        .sl-card p { color: rgba(238,234,226,.68); line-height: 1.8; margin: 0 0 1rem; }
        .sl-read { margin-top: auto; color: #D8B45E; display: inline-flex; align-items: center; gap: .35rem; text-decoration: none; font-weight: 600; }
        .sl-trust { display: grid; grid-template-columns: 1.35fr .9fr; gap: 1rem; align-items: center; border: 1px solid rgba(255,255,255,.08); border-radius: 28px; background: rgba(255,255,255,.028); }
        .sl-trust .sl-kicker { margin: 0 0 .4rem; }
        .sl-trust-links { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .7rem; }
        .sl-trust-links a { color: #070A12; background: #D8B45E; border-radius: 14px; text-decoration: none; padding: .78rem .9rem; font-weight: 700; text-align: center; }
        .sl-related { padding-bottom: 4rem; }
        .sl-related h2 { display: flex; align-items: center; gap: .55rem; }
        .sl-related-links { display: flex; flex-wrap: wrap; gap: .7rem; }
        .sl-related-links a { color: #EEEAE2; text-decoration: none; border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.04); border-radius: 999px; padding: .65rem .9rem; }
        @media (max-width: 760px) { .sl-trust { grid-template-columns: 1fr; } .sl-trust-links { grid-template-columns: 1fr; } }
        @media (max-width: 640px) { .sl-hero { text-align: left; } .sl-icon { margin-left: 0; } .sl-actions { justify-content: flex-start; } }
      `}</style>
    </div>
  );
}
