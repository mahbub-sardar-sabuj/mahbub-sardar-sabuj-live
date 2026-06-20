import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo, { SITE_URL } from "@/components/Seo";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import type { Writing } from "@/data/writingsArchive";
import { loadWritingsArchive } from "@/lib/loadWritingsArchive";
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
    match: (w: Writing) => w.category === "কবিতা" || /কবিতা|কাব্য|মন|চাঁদ|ফুল|আকাশ|নদী/.test(`${w.title} ${w.content}`),
    guide: "বাংলা কবিতা খোঁজা পাঠকেরা সাধারণত অনুভূতি, প্রেম, জীবন, প্রকৃতি ও স্মৃতির ভাষা খোঁজেন। এখানে সেসব লেখাকে একসাথে সাজানো হয়েছে যাতে সার্চ ইঞ্জিন ও পাঠক উভয়ই বিষয়ভিত্তিক সংগ্রহ সহজে বুঝতে পারে।",
  },
  "/valobashar-kobita": {
    icon: Heart,
    title: "ভালোবাসার কবিতা — মাহবুব সরদার সবুজ",
    h1: "ভালোবাসার কবিতা",
    intro: "ভালোবাসা, অপেক্ষা, স্মৃতি, সম্পর্ক এবং মায়ার গভীর অনুভূতি নিয়ে লেখা কবিতা ও ছোট লেখা এখানে সংকলিত।",
    description: "ভালোবাসার কবিতা, প্রেমের লেখা, সম্পর্কের অনুভূতি ও আবেগঘন বাংলা সাহিত্য পড়ুন মাহবুব সরদার সবুজের লেখায়।",
    keywords: "ভালোবাসার কবিতা, প্রেমের কবিতা, valobashar kobita, Bangla love poem, প্রেমের লেখা",
    match: (w: Writing) => w.category === "ভালোবাসা" || /ভালোবাসা|প্রেম|মায়া|অপেক্ষা|সম্পর্ক|তুমি|মন/.test(`${w.title} ${w.content}`),
    guide: "প্রেম ও ভালোবাসা বিষয়ক লেখাগুলো পাঠকের আবেগের সঙ্গে সরাসরি যুক্ত। এই landing page ভালোবাসা-ভিত্তিক লেখা, কবিতা ও উদ্ধৃতি একত্র করে organic search visibility বাড়াতে সাহায্য করবে।",
  },
  "/bichched-kobita": {
    icon: Sparkles,
    title: "বিচ্ছেদ কবিতা — মাহবুব সরদার সবুজ",
    h1: "বিচ্ছেদ কবিতা",
    intro: "হারানো মানুষ, বিচ্ছেদের ব্যথা, নীরব অভিমান, ফিরে না পাওয়া স্মৃতি এবং দুঃখবিলাসের লেখা এখানে সাজানো।",
    description: "বিচ্ছেদ কবিতা, কষ্টের লেখা, sad Bangla poem ও দুঃখবিলাসধর্মী সাহিত্য পড়ুন মাহবুব সরদার সবুজের লেখায়।",
    keywords: "বিচ্ছেদ কবিতা, কষ্টের কবিতা, sad Bangla poem, দুঃখের লেখা, দুঃখবিলাস",
    match: (w: Writing) => w.category === "বিচ্ছেদ" || /বিচ্ছেদ|কষ্ট|হারানো|অভিমান|দুঃখ|একাকী|স্মৃতি/.test(`${w.title} ${w.content}`),
    guide: "বিচ্ছেদ ও কষ্টের কবিতা বাংলা search demand-এর একটি শক্তিশালী অংশ। এই পেজে সংশ্লিষ্ট লেখা একত্র হওয়ায় Google, Bing এবং AI crawler বিষয়টি স্পষ্টভাবে বুঝতে পারে।",
  },
  "/jibon-dorshon": {
    icon: PenLine,
    title: "জীবনদর্শন ও অনুপ্রেরণামূলক লেখা — মাহবুব সরদার সবুজ",
    h1: "জীবনদর্শন ও অনুপ্রেরণামূলক লেখা",
    intro: "জীবনের শিক্ষা, আত্মবিশ্বাস, সম্পর্ক, মানুষ চেনা, বাস্তবতা এবং মানসিক শক্তি নিয়ে লেখা জীবনমুখী সাহিত্য।",
    description: "জীবনদর্শন, অনুপ্রেরণামূলক বাংলা লেখা, বাস্তবতা ও আত্মবিশ্বাস নিয়ে মাহবুব সরদার সবুজের নির্বাচিত লেখা পড়ুন।",
    keywords: "জীবনদর্শন, অনুপ্রেরণামূলক লেখা, বাংলা মোটিভেশনাল লেখা, বাস্তবতা, আত্মবিশ্বাস",
    match: (w: Writing) => w.category === "জীবনদর্শন" || /জীবন|বিশ্বাস|বাস্তবতা|মানুষ|স্বপ্ন|শান্তি|সম্পর্ক/.test(`${w.title} ${w.content}`),
    guide: "জীবনদর্শনধর্মী লেখা long-tail keyword থেকে visitor আনতে পারে, কারণ পাঠকেরা প্রায়ই জীবনের বাস্তবতা, সম্পর্ক ও আত্মবিশ্বাস নিয়ে বাংলা লেখা খোঁজেন।",
  },
  "/bangla-ebook": {
    icon: Library,
    title: "বাংলা ই-বুক ও বই — মাহবুব সরদার সবুজ",
    h1: "বাংলা ই-বুক ও বই",
    intro: "মাহবুব সরদার সবুজের প্রকাশিত বই, ই-বুক, কাব্যগ্রন্থ এবং সাহিত্য সংকলনের জন্য একটি dedicated discovery page।",
    description: "বাংলা ই-বুক, কাব্যগ্রন্থ, বই ও মাহবুব সরদার সবুজের সাহিত্য সংকলনের তথ্য ও পড়ার লিংক দেখুন।",
    keywords: "বাংলা ই-বুক, Bangla ebook, বাংলা বই, কাব্যগ্রন্থ, মাহবুব সরদার সবুজ বই",
    match: (w: Writing) => /বই|ই-বুক|কাব্যগ্রন্থ|সংকলন|দুঃখবিলাস|চাঁদফুল|স্মৃতি/.test(`${w.title} ${w.content}`),
    guide: "বাংলা বই ও ই-বুকের জন্য আলাদা landing page থাকলে search engine বই-সংক্রান্ত intent সহজে ধরতে পারে এবং পাঠকেরা সরাসরি relevant সংগ্রহে যেতে পারে।",
  },
  "/bangla-status": {
    icon: Sparkles,
    title: "বাংলা স্ট্যাটাস ও ক্যাপশন — মাহবুব সরদার সবুজ",
    h1: "বাংলা স্ট্যাটাস ও ক্যাপশন",
    intro: "মন ছুঁয়ে যাওয়া বাংলা স্ট্যাটাস, ক্যাপশন, ছোট উক্তি এবং সামাজিক মাধ্যমে শেয়ারযোগ্য অনুভূতির লেখা।",
    description: "বাংলা স্ট্যাটাস, ক্যাপশন, ছোট উক্তি ও শেয়ারযোগ্য অনুভূতির লেখা পড়ুন মাহবুব সরদার সবুজের সাহিত্য সংগ্রহে।",
    keywords: "বাংলা স্ট্যাটাস, Bangla status, বাংলা ক্যাপশন, বাংলা উক্তি, facebook caption bangla",
    match: (w: Writing) => /স্ট্যাটাস|ক্যাপশন|উক্তি|মন|তুমি|জীবন|ভালোবাসা|স্মৃতি|অভিমান/.test(`${w.title} ${w.content}`),
    guide: "বাংলা স্ট্যাটাস ও ক্যাপশন বিষয়ে পাঠকেরা ছোট, অর্থবহ এবং শেয়ারযোগ্য লেখা খোঁজেন। এই পেজ সেই search intent পূরণ করার জন্য নির্বাচিত ছোট লেখা ও কবিতাকে একত্র করেছে।",
  },
  "/bangla-quotes": {
    icon: PenLine,
    title: "বাংলা উক্তি ও জীবন কথা — মাহবুব সরদার সবুজ",
    h1: "বাংলা উক্তি ও জীবন কথা",
    intro: "জীবন, সম্পর্ক, বাস্তবতা, স্বপ্ন ও আত্মবিশ্বাস নিয়ে সংক্ষিপ্ত বাংলা উক্তি এবং ভাবনার লেখা।",
    description: "বাংলা উক্তি, জীবন কথা, বাস্তবতা ও অনুপ্রেরণামূলক ছোট লেখা পড়ুন মাহবুব সরদার সবুজের সংগ্রহে।",
    keywords: "বাংলা উক্তি, bangla quotes, জীবন কথা, বাস্তবতা, অনুপ্রেরণামূলক উক্তি",
    match: (w: Writing) => /উক্তি|জীবন|বাস্তবতা|মানুষ|স্বপ্ন|বিশ্বাস|শিক্ষা|আত্মবিশ্বাস|সম্পর্ক/.test(`${w.title} ${w.content}`),
    guide: "উক্তি ও জীবন কথার মতো long-tail keyword নতুন পাঠক আনার জন্য কার্যকর, কারণ এগুলো দ্রুত পড়া যায় এবং social sharing-এর সম্ভাবনা বেশি।",
  },
  "/koster-kobita": {
    icon: Heart,
    title: "কষ্টের কবিতা ও দুঃখের লেখা — মাহবুব সরদার সবুজ",
    h1: "কষ্টের কবিতা ও দুঃখের লেখা",
    intro: "কষ্ট, অভিমান, হারানো স্মৃতি, নীরবতা এবং একাকিত্বের গভীর অনুভূতি নিয়ে লেখা বাংলা কবিতা।",
    description: "কষ্টের কবিতা, দুঃখের লেখা, অভিমান ও একাকিত্বের বাংলা সাহিত্য পড়ুন মাহবুব সরদার সবুজের লেখায়।",
    keywords: "কষ্টের কবিতা, দুঃখের কবিতা, koster kobita, sad bangla status, অভিমানের লেখা",
    match: (w: Writing) => /কষ্ট|দুঃখ|অভিমান|একাকী|নীরব|হারানো|চোখের জল|ব্যথা|বিচ্ছেদ/.test(`${w.title} ${w.content}`),
    guide: "কষ্টের কবিতা ও sad Bangla status সার্চে নিয়মিত চাহিদা থাকে। এখানে related লেখা সাজানো থাকায় পাঠক দ্রুত নিজের অনুভূতির সঙ্গে মিল খুঁজে নিতে পারবেন।",
  },
  "/romantic-bangla-kobita": {
    icon: Heart,
    title: "রোমান্টিক বাংলা কবিতা — মাহবুব সরদার সবুজ",
    h1: "রোমান্টিক বাংলা কবিতা",
    intro: "প্রেম, মায়া, অপেক্ষা, প্রিয় মানুষ এবং সম্পর্কের কোমল অনুভূতি নিয়ে রোমান্টিক বাংলা কবিতা ও লেখা।",
    description: "রোমান্টিক বাংলা কবিতা, প্রেমের লেখা, ভালোবাসার ক্যাপশন ও অনুভূতির বাংলা সাহিত্য পড়ুন।",
    keywords: "রোমান্টিক বাংলা কবিতা, romantic bangla kobita, প্রেমের কবিতা, ভালোবাসার ক্যাপশন",
    match: (w: Writing) => /প্রেম|ভালোবাসা|রোমান্টিক|মায়া|তুমি|প্রিয়|অপেক্ষা|হৃদয়|সম্পর্ক/.test(`${w.title} ${w.content}`),
    guide: "রোমান্টিক কবিতা পেজটি প্রেম-ভিত্তিক search intent আলাদাভাবে ধরতে সাহায্য করবে এবং ভালোবাসা বিষয়ক existing content-কে আরও সহজে discoverable করবে।",
  },
  "/bangla-golpo": {
    icon: BookOpen,
    title: "বাংলা গল্প ও বাস্তব লেখা — মাহবুব সরদার সবুজ",
    h1: "বাংলা গল্প ও বাস্তব লেখা",
    intro: "বাস্তবতা, সম্পর্ক, অভিজ্ঞতা, স্মৃতি এবং জীবনঘনিষ্ঠ অনুভূতি নিয়ে বাংলা গল্পধর্মী লেখা।",
    description: "বাংলা গল্প, বাস্তব লেখা, সম্পর্ক ও জীবনের অভিজ্ঞতা নিয়ে মাহবুব সরদার সবুজের সাহিত্য পড়ুন।",
    keywords: "বাংলা গল্প, bangla golpo, বাস্তব গল্প, ছোট গল্প, জীবনঘনিষ্ঠ লেখা",
    match: (w: Writing) => /গল্প|বাস্তব|ঘটনা|অভিজ্ঞতা|মানুষ|সম্পর্ক|স্মৃতি|জীবন|সময়/.test(`${w.title} ${w.content}`),
    guide: "বাংলা গল্প ও বাস্তব লেখা পেজটি narrative content খোঁজা পাঠকদের জন্য তৈরি। এতে সাহিত্য, অভিজ্ঞতা ও জীবনঘনিষ্ঠ লেখাকে একত্র করে organic discovery বাড়ানো যায়।",
  },
  "/abhibab-kobita": {
    icon: PenLine,
    title: "অভিবাব কবিতা ও অনুভূতির লেখা — মাহবুব সরদার সবুজ",
    h1: "অভিবাব কবিতা ও অনুভূতির লেখা",
    intro: "অভিবাব, কৃতজ্ঞতা, শ্রদ্ধা এবং মানুষের প্রতি ভালোবাসার অনুভূতি নিয়ে লেখা বাংলা কবিতা ও সাহিত্য।",
    description: "অভিবাব কবিতা, কৃতজ্ঞতার লেখা ও মানুষের প্রতি ভালোবাসার বাংলা সাহিত্য পড়ুন মাহবুব সরদার সবুজের লেখায়।",
    keywords: "অভিবাব কবিতা, abhibab kobita, কৃতজ্ঞতার লেখা, শ্রদ্ধার কবিতা, বাংলা কবিতা",
    match: (w: Writing) => /অভিবাব|কৃতজ্ঞ|শ্রদ্ধা|মানুষ|ভালোবাসা|অনুভূতি|হৃদয়/.test(`${w.title} ${w.content}`),
    guide: "অভিবাব কবিতা পেজটি কৃতজ্ঞতা ও শ্রদ্ধাভিত্তিক search intent ধরতে সাহায্য করে।",
  },
  "/babar-kobita": {
    icon: Heart,
    title: "বাবার কবিতা ও বাবাকে নিয়ে লেখা — মাহবুব সরদার সবুজ",
    h1: "বাবার কবিতা ও বাবাকে নিয়ে লেখা",
    intro: "বাবার স্মৃতি, বাবার ভালোবাসা, বাবার ত্যাগ এবং বাবার প্রতি সন্তানের অনুভূতি নিয়ে লেখা কবিতা।",
    description: "বাবার কবিতা, বাবাকে নিয়ে লেখা, বাবার স্মৃতি ও ভালোবাসার বাংলা সাহিত্য পড়ুন।",
    keywords: "বাবার কবিতা, babar kobita, বাবাকে নিয়ে কবিতা, বাবার স্মৃতি, বাবার ভালোবাসা",
    match: (w: Writing) => /বাবা|পিতা|আব্বা|বাপ|জনক/.test(`${w.title} ${w.content}`),
    guide: "বাবার কবিতা পেজটি পারিবারিক অনুভূতিভিত্তিক search intent ধরতে সাহায্য করে।",
  },
  "/bangla-caption": {
    icon: Sparkles,
    title: "বাংলা ক্যাপশন ও স্ট্যাটাস — মাহবুব সরদার সবুজ",
    h1: "বাংলা ক্যাপশন ও স্ট্যাটাস",
    intro: "ফেসবুক, ইনস্টাগ্রাম ও সামাজিক মাধ্যমের জন্য মন ছুঁয়ে যাওয়া বাংলা ক্যাপশন ও শেয়ারযোগ্য লেখা।",
    description: "বাংলা ক্যাপশন, ফেসবুক স্ট্যাটাস, ইনস্টাগ্রাম ক্যাপশন ও শেয়ারযোগ্য বাংলা লেখা পড়ুন।",
    keywords: "বাংলা ক্যাপশন, bangla caption, ফেসবুক ক্যাপশন, ইনস্টাগ্রাম ক্যাপশন, বাংলা স্ট্যাটাস",
    match: (w: Writing) => /ক্যাপশন|স্ট্যাটাস|উক্তি|মন|তুমি|জীবন|ভালোবাসা|অনুভূতি/.test(`${w.title} ${w.content}`),
    guide: "বাংলা ক্যাপশন পেজটি সামাজিক মাধ্যমে শেয়ারযোগ্য কন্টেন্ট খোঁজা পাঠকদের জন্য তৈরি।",
  },
  "/bangla-kobita-2024": {
    icon: Feather,
    title: "বাংলা কবিতা ২০২৪ — মাহবুব সরদার সবুজ",
    h1: "বাংলা কবিতা ২০২৪",
    intro: "২০২৪ সালের নতুন বাংলা কবিতা, আধুনিক কাব্য এবং সমসাময়িক বাংলা সাহিত্যের সংকলন।",
    description: "বাংলা কবিতা ২০২৪, নতুন বাংলা কবিতা ও আধুনিক বাংলা সাহিত্য পড়ুন মাহবুব সরদার সবুজের লেখায়।",
    keywords: "বাংলা কবিতা ২০২৪, bangla kobita 2024, নতুন বাংলা কবিতা, আধুনিক বাংলা কবিতা",
    match: (w: Writing) => w.category === "কবিতা" || /কবিতা|কাব্য|মন|চাঁদ|ফুল|আকাশ|নদী/.test(`${w.title} ${w.content}`),
    guide: "বাংলা কবিতা ২০২৪ পেজটি সাম্প্রতিক বছরের কবিতা খোঁজা পাঠকদের জন্য তৈরি।",
  },
  "/bhalobasha-kobita": {
    icon: Heart,
    title: "ভালোবাসা কবিতা ও প্রেমের লেখা — মাহবুব সরদার সবুজ",
    h1: "ভালোবাসা কবিতা ও প্রেমের লেখা",
    intro: "ভালোবাসা, প্রেম, মায়া এবং হৃদয়ের গভীর অনুভূতি নিয়ে লেখা বাংলা কবিতা ও সাহিত্য।",
    description: "ভালোবাসা কবিতা, প্রেমের লেখা ও হৃদয়স্পর্শী বাংলা সাহিত্য পড়ুন মাহবুব সরদার সবুজের লেখায়।",
    keywords: "ভালোবাসা কবিতা, bhalobasha kobita, প্রেমের কবিতা, love poem bangla",
    match: (w: Writing) => /ভালোবাসা|প্রেম|মায়া|তুমি|হৃদয়|অপেক্ষা|সম্পর্ক/.test(`${w.title} ${w.content}`),
    guide: "ভালোবাসা কবিতা পেজটি প্রেম ও ভালোবাসাভিত্তিক search intent ধরতে সাহায্য করে।",
  },
  // NOTE: /bichhed-kobita was a duplicate of /bichched-kobita.
  // It has been removed from the data map. A 301 redirect is configured in vercel.json.
  "/brishti-kobita": {
    icon: Feather,
    title: "বৃষ্টির কবিতা ও বর্ষার লেখা — মাহবুব সরদার সবুজ",
    h1: "বৃষ্টির কবিতা ও বর্ষার লেখা",
    intro: "বৃষ্টি, বর্ষা, মেঘ, ভেজা মাটির গন্ধ এবং বৃষ্টির দিনের অনুভূতি নিয়ে লেখা বাংলা কবিতা।",
    description: "বৃষ্টির কবিতা, বর্ষার লেখা ও বৃষ্টির দিনের অনুভূতির বাংলা সাহিত্য পড়ুন।",
    keywords: "বৃষ্টির কবিতা, brishti kobita, বর্ষার কবিতা, rain poem bangla",
    match: (w: Writing) => /বৃষ্টি|বর্ষা|মেঘ|ভেজা|জল|ঝরনা|আকাশ/.test(`${w.title} ${w.content}`),
    guide: "বৃষ্টির কবিতা পেজটি প্রকৃতিভিত্তিক search intent ধরতে সাহায্য করে।",
  },
  "/choto-kobita": {
    icon: Feather,
    title: "ছোট কবিতা ও মিনি কবিতা — মাহবুব সরদার সবুজ",
    h1: "ছোট কবিতা ও মিনি কবিতা",
    intro: "ছোট কিন্তু অর্থবহ, সংক্ষিপ্ত কিন্তু হৃদয়স্পর্শী বাংলা কবিতা ও মিনি কবিতার সংকলন।",
    description: "ছোট কবিতা, মিনি কবিতা ও সংক্ষিপ্ত বাংলা কবিতা পড়ুন মাহবুব সরদার সবুজের লেখায়।",
    keywords: "ছোট কবিতা, choto kobita, মিনি কবিতা, short bangla poem",
    match: (w: Writing) => w.category === "কবিতা" || /কবিতা|কাব্য|মন|অনুভূতি/.test(`${w.title} ${w.content}`),
    guide: "ছোট কবিতা পেজটি সংক্ষিপ্ত কবিতা খোঁজা পাঠকদের জন্য তৈরি।",
  },
  "/ekla-thaka-kobita": {
    icon: Sparkles,
    title: "একলা থাকার কবিতা ও নিঃসঙ্গতার লেখা — মাহবুব সরদার সবুজ",
    h1: "একলা থাকার কবিতা ও নিঃসঙ্গতার লেখা",
    intro: "একাকিত্ব, নিঃসঙ্গতা, একলা থাকার অনুভূতি এবং নিজের সাথে নিজের কথোপকথনের লেখা।",
    description: "একলা থাকার কবিতা, নিঃসঙ্গতার লেখা ও একাকিত্বের বাংলা সাহিত্য পড়ুন।",
    keywords: "একলা থাকার কবিতা, ekla thaka kobita, নিঃসঙ্গতার কবিতা, lonely poem bangla",
    match: (w: Writing) => /একা|একাকী|নিঃসঙ্গ|একলা|নিজে|নীরব|শূন্য/.test(`${w.title} ${w.content}`),
    guide: "একলা থাকার কবিতা পেজটি একাকিত্বভিত্তিক search intent ধরতে সাহায্য করে।",
  },
  "/jibon-kobita": {
    icon: PenLine,
    title: "জীবনের কবিতা ও জীবনমুখী লেখা — মাহবুব সরদার সবুজ",
    h1: "জীবনের কবিতা ও জীবনমুখী লেখা",
    intro: "জীবন, বাস্তবতা, সংগ্রাম, স্বপ্ন এবং জীবনের বিভিন্ন অনুভূতি নিয়ে লেখা বাংলা কবিতা।",
    description: "জীবনের কবিতা, জীবনমুখী লেখা ও বাস্তবতার বাংলা সাহিত্য পড়ুন মাহবুব সরদার সবুজের লেখায়।",
    keywords: "জীবনের কবিতা, jibon kobita, জীবনমুখী লেখা, life poem bangla",
    match: (w: Writing) => /জীবন|বাস্তব|সংগ্রাম|স্বপ্ন|পথ|সময়|মানুষ/.test(`${w.title} ${w.content}`),
    guide: "জীবনের কবিতা পেজটি জীবনভিত্তিক search intent ধরতে সাহায্য করে।",
  },
  "/jibon-niye-ukti": {
    icon: PenLine,
    title: "জীবন নিয়ে উক্তি ও জীবনের কথা — মাহবুব সরদার সবুজ",
    h1: "জীবন নিয়ে উক্তি ও জীবনের কথা",
    intro: "জীবন, বাস্তবতা, অভিজ্ঞতা এবং জীবনের শিক্ষা নিয়ে সংক্ষিপ্ত বাংলা উক্তি ও ভাবনার লেখা।",
    description: "জীবন নিয়ে উক্তি, জীবনের কথা ও বাস্তবতার বাংলা উক্তি পড়ুন মাহবুব সরদার সবুজের লেখায়।",
    keywords: "জীবন নিয়ে উক্তি, jibon niye ukti, জীবনের কথা, life quotes bangla",
    match: (w: Writing) => /জীবন|উক্তি|বাস্তব|অভিজ্ঞতা|শিক্ষা|মানুষ|সময়/.test(`${w.title} ${w.content}`),
    guide: "জীবন নিয়ে উক্তি পেজটি জীবনভিত্তিক উক্তি খোঁজা পাঠকদের জন্য তৈরি।",
  },
  "/manush-kobita": {
    icon: Feather,
    title: "মানুষ নিয়ে কবিতা ও মানবিক লেখা — মাহবুব সরদার সবুজ",
    h1: "মানুষ নিয়ে কবিতা ও মানবিক লেখা",
    intro: "মানুষ, মানবতা, সম্পর্ক, বিশ্বাস এবং মানুষের প্রতি ভালোবাসা নিয়ে লেখা বাংলা কবিতা।",
    description: "মানুষ নিয়ে কবিতা, মানবিক লেখা ও সম্পর্কের বাংলা সাহিত্য পড়ুন মাহবুব সরদার সবুজের লেখায়।",
    keywords: "মানুষ নিয়ে কবিতা, manush kobita, মানবিক লেখা, human poem bangla",
    match: (w: Writing) => /মানুষ|মানবতা|সম্পর্ক|বিশ্বাস|ভালোবাসা|হৃদয়|অনুভূতি/.test(`${w.title} ${w.content}`),
    guide: "মানুষ নিয়ে কবিতা পেজটি মানবিক অনুভূতিভিত্তিক search intent ধরতে সাহায্য করে।",
  },
  "/mayer-kobita": {
    icon: Heart,
    title: "মায়ের কবিতা ও মাকে নিয়ে লেখা — মাহবুব সরদার সবুজ",
    h1: "মায়ের কবিতা ও মাকে নিয়ে লেখা",
    intro: "মায়ের ভালোবাসা, মায়ের ত্যাগ, মায়ের স্মৃতি এবং মায়ের প্রতি সন্তানের অনুভূতি নিয়ে লেখা কবিতা।",
    description: "মায়ের কবিতা, মাকে নিয়ে লেখা, মায়ের ভালোবাসা ও স্মৃতির বাংলা সাহিত্য পড়ুন।",
    keywords: "মায়ের কবিতা, mayer kobita, মাকে নিয়ে কবিতা, মায়ের ভালোবাসা, mother poem bangla",
    match: (w: Writing) => /মা|মায়ের|মাতা|আম্মা|জননী/.test(`${w.title} ${w.content}`),
    guide: "মায়ের কবিতা পেজটি পারিবারিক ভালোবাসাভিত্তিক search intent ধরতে সাহায্য করে।",
  },
  "/miss-you-bangla": {
    icon: Heart,
    title: "মিস ইউ বাংলা ও মনে পড়ার লেখা — মাহবুব সরদার সবুজ",
    h1: "মিস ইউ বাংলা ও মনে পড়ার লেখা",
    intro: "কাউকে মিস করা, মনে পড়া, দূরত্বের ব্যথা এবং হারানো মানুষের স্মৃতি নিয়ে বাংলা কবিতা ও লেখা।",
    description: "মিস ইউ বাংলা, মনে পড়ার লেখা, দূরত্বের কবিতা ও হারানো স্মৃতির বাংলা সাহিত্য পড়ুন।",
    keywords: "মিস ইউ বাংলা, miss you bangla, মনে পড়া, দূরত্বের কবিতা, missing poem bangla",
    match: (w: Writing) => /মিস|মনে পড়|দূরত্ব|হারানো|স্মৃতি|অপেক্ষা|তুমি নেই/.test(`${w.title} ${w.content}`),
    guide: "মিস ইউ বাংলা পেজটি মিসিং ও স্মৃতিভিত্তিক search intent ধরতে সাহায্য করে।",
  },
  "/mon-kharap-status": {
    icon: Sparkles,
    title: "মন খারাপের স্ট্যাটাস ও দুঃখের লেখা — মাহবুব সরদার সবুজ",
    h1: "মন খারাপের স্ট্যাটাস ও দুঃখের লেখা",
    intro: "মন খারাপ, দুঃখ, কষ্ট এবং হতাশার অনুভূতি প্রকাশের জন্য বাংলা স্ট্যাটাস ও ক্যাপশন।",
    description: "মন খারাপের স্ট্যাটাস, দুঃখের লেখা ও কষ্টের বাংলা ক্যাপশন পড়ুন মাহবুব সরদার সবুজের লেখায়।",
    keywords: "মন খারাপের স্ট্যাটাস, mon kharap status, দুঃখের স্ট্যাটাস, sad status bangla",
    match: (w: Writing) => /মন খারাপ|দুঃখ|কষ্ট|হতাশা|অভিমান|একাকী|নিঃসঙ্গ/.test(`${w.title} ${w.content}`),
    guide: "মন খারাপের স্ট্যাটাস পেজটি দুঃখ ও কষ্টভিত্তিক social media status খোঁজা পাঠকদের জন্য তৈরি।",
  },
  "/opekkhar-kobita": {
    icon: Feather,
    title: "অপেক্ষার কবিতা ও প্রতীক্ষার লেখা — মাহবুব সরদার সবুজ",
    h1: "অপেক্ষার কবিতা ও প্রতীক্ষার লেখা",
    intro: "অপেক্ষা, প্রতীক্ষা, কারো জন্য অপেক্ষা করা এবং দীর্ঘ প্রতীক্ষার অনুভূতি নিয়ে লেখা বাংলা কবিতা।",
    description: "অপেক্ষার কবিতা, প্রতীক্ষার লেখা ও অপেক্ষার অনুভূতির বাংলা সাহিত্য পড়ুন।",
    keywords: "অপেক্ষার কবিতা, opekkhar kobita, প্রতীক্ষার কবিতা, waiting poem bangla",
    match: (w: Writing) => /অপেক্ষা|প্রতীক্ষা|অপেক্ষায়|তুমি আসবে|ফিরবে/.test(`${w.title} ${w.content}`),
    guide: "অপেক্ষার কবিতা পেজটি অপেক্ষাভিত্তিক search intent ধরতে সাহায্য করে।",
  },
  "/premer-status": {
    icon: Heart,
    title: "প্রেমের স্ট্যাটাস ও ভালোবাসার ক্যাপশন — মাহবুব সরদার সবুজ",
    h1: "প্রেমের স্ট্যাটাস ও ভালোবাসার ক্যাপশন",
    intro: "প্রেম, ভালোবাসা এবং সম্পর্কের অনুভূতি প্রকাশের জন্য বাংলা প্রেমের স্ট্যাটাস ও ক্যাপশন।",
    description: "প্রেমের স্ট্যাটাস, ভালোবাসার ক্যাপশন ও প্রেমের বাংলা লেখা পড়ুন মাহবুব সরদার সবুজের লেখায়।",
    keywords: "প্রেমের স্ট্যাটাস, premer status, ভালোবাসার ক্যাপশন, love status bangla",
    match: (w: Writing) => /প্রেম|ভালোবাসা|মায়া|তুমি|হৃদয়|সম্পর্ক|অনুভূতি/.test(`${w.title} ${w.content}`),
    guide: "প্রেমের স্ট্যাটাস পেজটি প্রেম ও ভালোবাসাভিত্তিক social media status খোঁজা পাঠকদের জন্য তৈরি।",
  },
  "/rater-kobita": {
    icon: Feather,
    title: "রাতের কবিতা ও রাতের লেখা — মাহবুব সরদার সবুজ",
    h1: "রাতের কবিতা ও রাতের লেখা",
    intro: "রাত, নিশীথ, তারা, চাঁদ এবং রাতের নিঃসঙ্গতার অনুভূতি নিয়ে লেখা বাংলা কবিতা।",
    description: "রাতের কবিতা, রাতের লেখা ও রাতের অনুভূতির বাংলা সাহিত্য পড়ুন মাহবুব সরদার সবুজের লেখায়।",
    keywords: "রাতের কবিতা, rater kobita, রাতের লেখা, night poem bangla",
    match: (w: Writing) => /রাত|রাতের|নিশীথ|তারা|চাঁদ|অন্ধকার|নিশি/.test(`${w.title} ${w.content}`),
    guide: "রাতের কবিতা পেজটি রাতভিত্তিক search intent ধরতে সাহায্য করে।",
  },
  "/sad-bangla-status": {
    icon: Sparkles,
    title: "স্যাড বাংলা স্ট্যাটাস ও দুঃখের ক্যাপশন — মাহবুব সরদার সবুজ",
    h1: "স্যাড বাংলা স্ট্যাটাস ও দুঃখের ক্যাপশন",
    intro: "দুঃখ, কষ্ট, মন খারাপ এবং হতাশার অনুভূতি প্রকাশের জন্য স্যাড বাংলা স্ট্যাটাস ও ক্যাপশন।",
    description: "স্যাড বাংলা স্ট্যাটাস, দুঃখের ক্যাপশন ও কষ্টের বাংলা লেখা পড়ুন মাহবুব সরদার সবুজের লেখায়।",
    keywords: "স্যাড বাংলা স্ট্যাটাস, sad bangla status, দুঃখের স্ট্যাটাস, sad caption bangla",
    match: (w: Writing) => /দুঃখ|কষ্ট|মন খারাপ|হতাশা|অভিমান|একাকী|বিচ্ছেদ/.test(`${w.title} ${w.content}`),
    guide: "স্যাড বাংলা স্ট্যাটাস পেজটি দুঃখ ও কষ্টভিত্তিক social media content খোঁজা পাঠকদের জন্য তৈরি।",
  },
  "/shomoy-kobita": {
    icon: PenLine,
    title: "সময়ের কবিতা ও সময় নিয়ে লেখা — মাহবুব সরদার সবুজ",
    h1: "সময়ের কবিতা ও সময় নিয়ে লেখা",
    intro: "সময়, মুহূর্ত, অতীত, বর্তমান এবং সময়ের প্রবাহ নিয়ে লেখা বাংলা কবিতা ও সাহিত্য।",
    description: "সময়ের কবিতা, সময় নিয়ে লেখা ও সময়ের অনুভূতির বাংলা সাহিত্য পড়ুন।",
    keywords: "সময়ের কবিতা, shomoy kobita, সময় নিয়ে লেখা, time poem bangla",
    match: (w: Writing) => /সময়|মুহূর্ত|অতীত|বর্তমান|ভবিষ্যৎ|কাল|আজ/.test(`${w.title} ${w.content}`),
    guide: "সময়ের কবিতা পেজটি সময়ভিত্তিক search intent ধরতে সাহায্য করে।",
  },
  "/swapno-kobita": {
    icon: Feather,
    title: "স্বপ্নের কবিতা ও স্বপ্ন নিয়ে লেখা — মাহবুব সরদার সবুজ",
    h1: "স্বপ্নের কবিতা ও স্বপ্ন নিয়ে লেখা",
    intro: "স্বপ্ন, আশা, কল্পনা এবং স্বপ্নের জগতের অনুভূতি নিয়ে লেখা বাংলা কবিতা ও সাহিত্য।",
    description: "স্বপ্নের কবিতা, স্বপ্ন নিয়ে লেখা ও আশার বাংলা সাহিত্য পড়ুন মাহবুব সরদার সবুজের লেখায়।",
    keywords: "স্বপ্নের কবিতা, swapno kobita, স্বপ্ন নিয়ে লেখা, dream poem bangla",
    match: (w: Writing) => /স্বপ্ন|আশা|কল্পনা|ভবিষ্যৎ|আলো|পথ|লক্ষ্য/.test(`${w.title} ${w.content}`),
    guide: "স্বপ্নের কবিতা পেজটি স্বপ্ন ও আশাভিত্তিক search intent ধরতে সাহায্য করে।",
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
  const [archive, setArchive] = useState<Writing[]>([]);
  const [archiveReady, setArchiveReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    setArchiveReady(false);
    loadWritingsArchive()
      .then((writings) => {
        if (mounted) {
          setArchive(writings);
          setArchiveReady(true);
        }
      })
      .catch(() => {
        if (mounted) setArchiveReady(true);
      });
    return () => { mounted = false; };
  }, []);

  const matched = archive.filter(page.match).slice(0, 36);
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
            <p>{archiveReady ? `${matched.length}টি সম্পর্কিত লেখা থেকে নির্বাচিত অংশ।` : "নির্বাচিত লেখা লোড হচ্ছে..."}</p>
          </div>
          <div className="sl-grid">
            {archiveReady && featured.length === 0 ? (
              <article className="sl-card">
                <div className="sl-card-meta"><BookOpen size={15} /> সাহিত্য সংগ্রহ</div>
                <h3><Link href="/writings">সব লেখা দেখুন</Link></h3>
                <p>সম্পর্কিত লেখা এই মুহূর্তে লোড করা যাচ্ছে না। সম্পূর্ণ সাহিত্য আর্কাইভ থেকে লেখা পড়তে পারেন।</p>
                <Link href="/writings" className="sl-read">সব লেখা পড়ুন <ArrowRight size={14} /></Link>
              </article>
            ) : null}
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
            <p className="sl-kicker">লেখক পরিচিতি</p>
            <h2 id="trust-title">মাহবুব সরদার সবুজ</h2>
            <p>
              বাংলা সাহিত্যের একজন নিবেদিতপ্রাণ লেখক ও কবি। ভালোবাসা, বিচ্ছেদ, জীবনসংগ্রাম ও মানবিক অনুভূতিকে সহজ অথচ আবেগঘন ভাষায় প্রকাশ করেন।
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
        .seo-landing { min-height: 100vh; background: #070A12; color: #EEEAE2; font-family: 'AdorshoLipi', 'AdorshoLipi', 'Noto Serif Bengali', serif; }
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
