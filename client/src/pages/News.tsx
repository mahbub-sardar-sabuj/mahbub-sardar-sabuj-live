/**
 * সংবাদ পেজ — Professional News Portal
 * Design: Premium literary news portal with Navy/Gold theme
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Clock, Tag, Search, ChevronRight, BookOpen, Mic2, Award, Calendar, ExternalLink, X, Share2, Facebook, Twitter, MessageCircle, Link2, Check, Send, ThumbsUp, User } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Seo from "../components/Seo";

interface Comment {
  id: number;
  name: string;
  text: string;
  time: string;
  likes: number;
  liked: boolean;
}

interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  categoryColor: string;
  date: string;
  readTime: string;
  featured: boolean;
  tag: string;
  link?: string;
  image?: string;
}

const newsData: NewsItem[] = [
  {
    id: 10,
    title: "তরুণ আবৃত্তিকার মরিয়ম আক্তার ও সোহানী ইসলাম সমাপ্তির ঢাকা বাতিঘর পরিদর্শন",
    excerpt: "তরুণ আবৃত্তিকার মরিয়ম ও সোহানী ঢাকা বাতিঘরে মাহবুব সরদার সবুজের বই \"আমি বিচ্ছেদকে বলি দুঃখবিলাস\"-এর সাথে পরিচিত হন এবং আবৃত্তি রেকর্ড করেন।",
    content: "মরিয়ম আক্তার ও সোহানী ইসলাম সমাপ্তি—দুজনই তরুণ আবৃত্তিকার। গতকাল তারা ঢাকা বাতিঘরে গিয়ে লেখক মাহবুব সরদার সবুজের প্রথম প্রকাশিত বই “আমি বিচ্ছেদকে বলি দুঃখবিলাস”-এর সঙ্গে পরিচিত হন। বাতিঘর কর্তৃপক্ষ জানায়, আবৃত্তির পাশাপাশি তারা নিজেদের কণ্ঠে আবৃত্তি রেকর্ডও করেন। মাহবুব সরদার সবুজের বইটি বিনামূল্যে ই-বুক হিসেবে পড়তে পারেন তার ওয়েবসাইটে, অথবা সংগ্রহ করতে পারেন রকমারি থেকে।",
    category: "সাহিত্য",
    categoryColor: "#C9A84C",
    date: "১ এপ্রিল ২০২৬",
    readTime: "২ মিনিট",
    featured: true,
    tag: "আবৃত্তি",
    image: "/images/news/baighar-visit.png",
  },

  {
    id: 1,
    title: "\"আমি বিচ্ছেদকে বলি দুঃখবিলাস\" — নতুন বই প্রকাশিত হচ্ছে ২০২৬ সালে",
    excerpt: "মাহবুব সরদার সবুজের নতুন কাব্যগ্রন্থ ২০২৬ সালে প্রকাশিত হতে চলেছে। বইটিতে বিচ্ছেদ, প্রেম ও জীবনদর্শনের গভীর অনুভূতি শব্দে বাঁধা হয়েছে।",
    content: "মাহবুব সরদার সবুজের বহুল প্রতীক্ষিত কাব্যগ্রন্থ \"আমি বিচ্ছেদকে বলি দুঃখবিলাস\" ২০২৬ সালে প্রকাশিত হতে চলেছে। বইটিতে লেখকের জীবনের বিভিন্ন পর্যায়ের অনুভূতি — বিচ্ছেদের বেদনা, প্রেমের মাধুর্য এবং জীবনদর্শনের গভীরতা — কাব্যিক ভাষায় উপস্থাপিত হয়েছে। পাঠকদের মধ্যে ইতিমধ্যেই এই বইটি নিয়ে ব্যাপক আগ্রহ তৈরি হয়েছে।",
    category: "প্রকাশনা",
    categoryColor: "#C9A84C",
    date: "মার্চ ২০২৬",
    readTime: "৩ মিনিট",
    featured: true,
    tag: "নতুন বই",
  },
  {
    id: 2,
    title: "সরদার ডিজাইন স্টুডিওতে এলো ৪K আপস্কেল ফিচার",
    excerpt: "এখন থেকে যেকোনো ছবি ৪K মানে উন্নত করে ডাউনলোড করা যাবে। ছবির তীক্ষ্ণতা ও রঙের গভীরতা বহুগুণ বেড়ে যাবে।",
    content: "সরদার ডিজাইন স্টুডিওতে যুক্ত হয়েছে বহুল প্রতীক্ষিত ৪K আপস্কেল ফিচার। এই ফিচারটি ব্যবহার করে পাঠকরা তাদের তৈরি ডিজাইন কার্ড বা যেকোনো ছবিকে ৪K মানে উন্নত করতে পারবেন। Laplacian sharpening ও unsharp mask প্রযুক্তি ব্যবহার করে ছবির প্রতিটি বিস্তারিত তুলে আনা হয়। আগের ও পরের তুলনা দেখার জন্য রয়েছে বিশেষ স্লাইডার। সম্পূর্ণ বিনামূল্যে এই ফিচারটি ব্যবহার করুন।",
    category: "ওয়েবসাইট",
    categoryColor: "#4A90D9",
    date: "মার্চ ২০২৬",
    readTime: "২ মিনিট",
    featured: true,
    tag: "আপডেট",
    link: "/editor",
  },
  {
    id: 3,
    title: "ডিজাইন স্টুডিওতে ২১৬টি স্টিকার যুক্ত হলো",
    excerpt: "ফুল, প্রকৃতি, হৃদয়, তারা, বাংলা ক্যালিগ্রাফি সহ ৬টি ক্যাটাগরিতে ২১৬টি স্টিকার এখন ব্যবহার করা যাচ্ছে।",
    content: "সরদার ডিজাইন স্টুডিওতে এখন ২১৬টি স্টিকার ব্যবহার করা যাচ্ছে। ফুল ও প্রকৃতি, হৃদয় ও প্রেম, তারা ও চাঁদ, বাংলা ক্যালিগ্রাফি, ইমোজি এবং ডেকোরেটিভ — এই ৬টি ক্যাটাগরিতে সাজানো স্টিকারগুলো ডিজাইনকে আরও প্রাণবন্ত করে তুলবে। ক্যানভাসে যেকোনো জায়গায় টেনে নিয়ে বসানো যাবে এবং আকার পরিবর্তন করা যাবে।",
    category: "ওয়েবসাইট",
    categoryColor: "#4A90D9",
    date: "মার্চ ২০২৬",
    readTime: "২ মিনিট",
    featured: false,
    tag: "ফিচার",
    link: "/editor",
  },
  {
    id: 4,
    title: "চারটি ই-বুক এখন বিনামূল্যে পড়া যাচ্ছে",
    excerpt: "আমি বিচ্ছেদকে বলি দুঃখবিলাস, স্মৃতির বসন্তে তুমি, চাঁদফুল এবং সময়ের গহ্বরে — এই চারটি ই-বুক এখন ওয়েবসাইটে বিনামূল্যে পড়া যাচ্ছে।",
    content: "মাহবুব সরদার সবুজের চারটি ই-বুক — \"আমি বিচ্ছেদকে বলি দুঃখবিলাস\", \"স্মৃতির বসন্তে তুমি\", \"চাঁদফুল\" এবং \"সময়ের গহ্বরে\" — এখন ওয়েবসাইটে বিনামূল্যে পড়া যাচ্ছে। পাঠকরা যেকোনো ডিভাইস থেকে সহজেই এই বইগুলো পড়তে পারবেন। প্রতিটি বই সুন্দর পাঠযোগ্য ফরম্যাটে উপস্থাপন করা হয়েছে।",
    category: "ই-বুক",
    categoryColor: "#7B68EE",
    date: "ফেব্রুয়ারি ২০২৬",
    readTime: "২ মিনিট",
    featured: false,
    tag: "ই-বুক",
    link: "/ebooks",
  },
  {
    id: 5,
    title: "গ্যালারিতে যুক্ত হলো ১০০+ কবিতার ডিজাইন কার্ড",
    excerpt: "পাঠকদের তৈরি ও লেখকের নিজের ডিজাইন করা শতাধিক কবিতা কার্ড এখন গ্যালারিতে দেখা যাচ্ছে।",
    content: "মাহবুব সরদার সবুজের ওয়েবসাইটের গ্যালারি সেকশনে এখন ১০০-এরও বেশি কবিতার ডিজাইন কার্ড সংযুক্ত হয়েছে। প্রতিটি কার্ড সরদার ডিজাইন স্টুডিও ব্যবহার করে তৈরি করা হয়েছে। বিভিন্ন থিম, রঙ ও ফন্টে সাজানো এই কার্ডগুলো সোশ্যাল মিডিয়ায় শেয়ার করার জন্য আদর্শ।",
    category: "গ্যালারি",
    categoryColor: "#E67E22",
    date: "ফেব্রুয়ারি ২০২৬",
    readTime: "২ মিনিট",
    featured: false,
    tag: "গ্যালারি",
    link: "/gallery",
  },
  {
    id: 6,
    title: "ফেসবুকে ৭,০০০+ কবিতা ও লেখার বিশাল সংগ্রহ",
    excerpt: "মাহবুব সরদার সবুজের ফেসবুক পেজে এখন ৭,০০০-এরও বেশি কবিতা ও গল্প সংরক্ষিত আছে, যা পাঠকদের মধ্যে ব্যাপক সাড়া ফেলেছে।",
    content: "মাহবুব সরদার সবুজের ফেসবুক পেজে এখন ৭,০০০-এরও বেশি কবিতা ও গল্প সংরক্ষিত আছে। প্রেম, বিচ্ছেদ, প্রকৃতি, জীবনদর্শন — প্রতিটি অনুভূতি শব্দে বাঁধা। পাঠকদের মধ্যে এই লেখাগুলো ব্যাপক সাড়া ফেলেছে এবং প্রতিদিন হাজার হাজার মানুষ এই লেখাগুলো পড়ছেন।",
    category: "সোশ্যাল মিডিয়া",
    categoryColor: "#1877F2",
    date: "জানুয়ারি ২০২৬",
    readTime: "৩ মিনিট",
    featured: false,
    tag: "ফেসবুক",
    link: "https://www.facebook.com/mahbubsardarsabuj",
  },
  {
    id: 7,
    title: "আবৃত্তি সংগ্রহ — ফেসবুক লাইভ রেকর্ডিং",
    excerpt: "লেখকের ফেসবুক লাইভ আবৃত্তির সংগ্রহ এখন ওয়েবসাইটে দেখা যাচ্ছে। নিজের কণ্ঠে কবিতা পাঠের অনন্য অভিজ্ঞতা নিন।",
    content: "মাহবুব সরদার সবুজের ফেসবুক লাইভ আবৃত্তির সংগ্রহ এখন ওয়েবসাইটে দেখা যাচ্ছে। লেখক নিজের কণ্ঠে তাঁর কবিতা পাঠ করেছেন, যা শ্রোতাদের মধ্যে গভীর আবেগ তৈরি করেছে। এই সংগ্রহটি সাহিত্যপ্রেমীদের জন্য একটি অমূল্য সম্পদ।",
    category: "আবৃত্তি",
    categoryColor: "#E74C3C",
    date: "ডিসেম্বর ২০২৫",
    readTime: "২ মিনিট",
    featured: false,
    tag: "আবৃত্তি",
    link: "/facebook-recitations",
  },
  {
    id: 8,
    title: "নতুন AI চ্যাটবট — লেখক সম্পর্কে যেকোনো প্রশ্ন করুন",
    excerpt: "ওয়েবসাইটে যুক্ত হয়েছে AI চ্যাটবট। লেখক মাহবুব সরদার সবুজ সম্পর্কে যেকোনো প্রশ্নের উত্তর পাবেন তাৎক্ষণিকভাবে।",
    content: "মাহবুব সরদার সবুজের ওয়েবসাইটে একটি AI চ্যাটবট যুক্ত হয়েছে। এই চ্যাটবটটি লেখক সম্পর্কে সম্পূর্ণ সঠিক ও নির্ভুল তথ্য প্রদান করে। পাঠকরা কবিতা, ই-বুক, যোগাযোগ বা ওয়েবসাইট ব্যবহার সংক্রান্ত যেকোনো প্রশ্ন করতে পারবেন।",
    category: "প্রযুক্তি",
    categoryColor: "#27AE60",
    date: "নভেম্বর ২০২৫",
    readTime: "২ মিনিট",
    featured: false,
    tag: "AI",
  },
  {
    id: 9,
    title: "ডিজাইন স্টুডিওতে ১২০+ ব্যাকগ্রাউন্ড ওয়াল যুক্ত হলো",
    excerpt: "প্রকৃতি, শহর, রাত্রির আকাশ, বৃষ্টি সহ ১২০টিরও বেশি ব্যাকগ্রাউন্ড ওয়াল এখন ডিজাইনে ব্যবহার করা যাচ্ছে।",
    content: "সরদার ডিজাইন স্টুডিওতে এখন ১২০টিরও বেশি ব্যাকগ্রাউন্ড ওয়াল ব্যবহার করা যাচ্ছে। প্রকৃতির দৃশ্য, শহরের রাত, বৃষ্টিভেজা পথ, ফুলের বাগান, মেঘলা আকাশ — প্রতিটি ব্যাকগ্রাউন্ড আপনার কবিতার মেজাজ অনুযায়ী বেছে নিন। এছাড়াও ১০টি ফটো ফিল্টার দিয়ে ব্যাকগ্রাউন্ডের রং ও আলো পরিবর্তন করা যাবে।",
    category: "ওয়েবসাইট",
    categoryColor: "#4A90D9",
    date: "মার্চ ২০২৬",
    readTime: "২ মিনিট",
    featured: false,
    tag: "ফিচার",
    link: "/editor",
  },
  {
    id: 10,
    title: "লেখকের সাথে সরাসরি যোগাযোগ করুন",
    excerpt: "যোগাযোগ পেজে এখন সরাসরি বার্তা পাঠানোর সুবিধা রয়েছে। লেখক নিজে প্রতিটি বার্তার উত্তর দেন।",
    content: "মাহবুব সরদার সবুজের ওয়েবসাইটে যোগাযোগ পেজটি সম্পূর্ণ নতুনভাবে তৈরি করা হয়েছে। পাঠকরা এখন সরাসরি লেখককে বার্তা পাঠাতে পারবেন। কবিতা নিয়ে আলোচনা, বইয়ের অর্ডার বা যেকোনো বিষয়ে লেখক নিজে প্রতিটি বার্তার উত্তর দেন। ফেসবুক, ইমেইল ও ফোনের মাধ্যমেও যোগাযোগ করা যাবে।",
    category: "যোগাযোগ",
    categoryColor: "#16A085",
    date: "ফেব্রুয়ারি ২০২৬",
    readTime: "১ মিনিট",
    featured: false,
    tag: "যোগাযোগ",
    link: "/contact",
  },
  {
    id: 11,
    title: "ডিজাইন স্টুডিওতে ড্রয়িং টুল — নিজেই আঁকুন",
    excerpt: "পেন্সিল, ব্রাশ, ইরেজার, লাইন, আয়তক্ষেত্র, বৃত্ত ও তীর — ৭টি ড্রয়িং টুল দিয়ে এখন ক্যানভাসে সরাসরি আঁকা যাবে।",
    content: "সরদার ডিজাইন স্টুডিওতে নতুন ড্রয়িং ফিচার যুক্ত হয়েছে। পেন্সিল, ব্রাশ, ইরেজার, সরলরেখা, আয়তক্ষেত্র, বৃত্ত এবং তীর — এই ৭টি টুল দিয়ে ক্যানভাসে সরাসরি আঁকা যাবে। রঙ ও ব্রাশের আকার নিজের মতো করে ঠিক করা যাবে। কবিতার সাথে নিজের হাতের আঁকা যোগ করে ডিজাইনকে আরও ব্যক্তিগত করে তুলুন।",
    category: "ওয়েবসাইট",
    categoryColor: "#4A90D9",
    date: "মার্চ ২০২৬",
    readTime: "২ মিনিট",
    featured: false,
    tag: "ফিচার",
    link: "/editor",
  },
  {
    id: 12,
    title: "লেখকের জীবনী ও সাহিত্যকর্মের পূর্ণ পরিচয় এখন অনলাইনে",
    excerpt: "সম্পর্কে পেজে লেখকের জীবন, সাহিত্যদর্শন ও প্রকাশিত রচনার বিস্তারিত তথ্য পাওয়া যাচ্ছে।",
    content: "মাহবুব সরদার সবুজের ওয়েবসাইটে সম্পর্কে পেজটি নতুনভাবে সাজানো হয়েছে। লেখকের জন্ম, বেড়ে ওঠা, সাহিত্যজীবনের শুরু থেকে আজ পর্যন্ত — সব কিছু বিস্তারিতভাবে তুলে ধরা হয়েছে। তাঁর সাহিত্যদর্শন, প্রিয় বিষয় এবং পাঠকদের প্রতি বার্তাও এই পেজে পাওয়া যাবে।",
    category: "লেখক পরিচিতি",
    categoryColor: "#8E44AD",
    date: "জানুয়ারি ২০২৬",
    readTime: "৩ মিনিট",
    featured: false,
    tag: "পরিচিতি",
    link: "/about",
  },
  {
    id: 13,
    title: "ওয়েবসাইটে যুক্ত হলো ক্রপ ও ইমেজ অ্যাডজাস্টমেন্ট টুল",
    excerpt: "ডিজাইন স্টুডিওতে এখন ছবি ক্রপ করা এবং উজ্জ্বলতা, কনট্রাস্ট, স্যাচুরেশন সরাসরি নিয়ন্ত্রণ করা যাবে।",
    content: "সরদার ডিজাইন স্টুডিওতে নতুন দুটি টুল যুক্ত হয়েছে — ক্রপ এবং অ্যাডজাস্টমেন্ট। ক্রপ টুল দিয়ে ছবির যেকোনো অংশ কেটে নেওয়া যাবে। অ্যাডজাস্টমেন্ট টুলে রয়েছে উজ্জ্বলতা, কনট্রাস্ট, স্যাচুরেশন, তীক্ষ্ণতা ও উষ্ণতার স্লাইডার। এই টুলগুলো দিয়ে ছবিকে পেশাদার মানে নিয়ে যাওয়া এখন অনেক সহজ।",
    category: "ওয়েবসাইট",
    categoryColor: "#4A90D9",
    date: "মার্চ ২০২৬",
    readTime: "২ মিনিট",
    featured: false,
    tag: "ফিচার",
    link: "/editor",
  },
  {
    id: 15,
    title: "বাবা — আমার সবচেয়ে বড় অনুপ্রেরণা",
    excerpt: "বাবার অনুপ্রেরণায়ই লেখক হয়ে ওঠার স্বপ্ন দেখেছিলেন মাহবুব সরদার সবুজ। বাবার প্রতি কৃতজ্ঞতা ও ভালোবাসার কথা লিখেছেন লেখক।",
    content: "বাবা — এই দুটি অক্ষরে লুকিয়ে আছে সমস্ত শক্তি, সাহস ও আশীর্বাদ। মাহবুব সরদার সবুজের লেখক হয়ে ওঠার পেছনে সবচেয়ে বড় ভূমিকা রয়েছে তাঁর বাবার। ছোটবেলা থেকেই বাবা তাঁকে বলতেন, “তুমি একদিন বড় লেখক হবে।” সেই স্বপ্নই আজ বাস্তবে রূপ নিয়েছে।\n\nবাবার হাত ধরে প্রথম কলম ধরা, বাবার প্রতিটি শিক্ষার মধ্যে লুকিয়ে থাকা আশীর্বাদ — সবকিছুর মধ্যে বাবার ছায়া অনুভব করেন লেখক। বাবা শুধু জন্মদাতা নন, তিনি সবচেয়ে বড় বন্ধু, সবচেয়ে বড় অনুপ্রেরণার উৎস।\n\nলেখক বলেন, “বাবার জন্য যা কিছু করেছি, তা কোনোদিন যথেষ্ট হবে না। তিনি আমার প্রতিটি লেখার প্রথম পাঠক, প্রথম সমালোচক। বাবার ভালোবাসাই আমার লেখার শক্তি।”",
    category: "পরিবার",
    categoryColor: "#E74C3C",
    date: "মার্চ ২০২৬",
    readTime: "২ মিনিট",
    featured: false,
    tag: "বাবা",
    image: "/photos/IMG_6966.JPG",
  },
  {
    id: 14,
    title: "পাঠকদের ভালোবাসায় ওয়েবসাইট ১০,০০০ ভিজিটর অতিক্রম করলো",
    excerpt: "মাত্র কয়েক মাসে ওয়েবসাইটটি ১০,০০০-এরও বেশি পাঠকের কাছে পৌঁছেছে। লেখক পাঠকদের প্রতি কৃতজ্ঞতা জানিয়েছেন।",
    content: "মাহবুব সরদার সবুজের অফিসিয়াল ওয়েবসাইট মাত্র কয়েক মাসে ১০,০০০-এরও বেশি পাঠকের কাছে পৌঁছেছে। বাংলাদেশ, ভারত, যুক্তরাষ্ট্র, যুক্তরাজ্য সহ বিশ্বের বিভিন্ন দেশ থেকে পাঠকরা ওয়েবসাইটটি পরিদর্শন করছেন। লেখক তাঁর সকল পাঠক ও শুভানুধ্যায়ীদের প্রতি গভীর কৃতজ্ঞতা জানিয়েছেন।",
    category: "মাইলফলক",
    categoryColor: "#F39C12",
    date: "মার্চ ২০২৬",
    readTime: "২ মিনিট",
    featured: false,
    tag: "মাইলফলক",
  },
];

const categories = ["সব", "প্রকাশনা", "পরিবার", "ওয়েবসাইট", "ই-বুক", "গ্যালারি", "সোশ্যাল মিডিয়া", "আবৃত্তি", "প্রযুক্তি", "যোগাযোগ", "লেখক পরিচিতি", "মাইলফলক"];

function FadeIn({ children, delay = 0, direction = "up" }: { children: React.ReactNode; delay?: number; direction?: "up" | "left" | "right" }) {
  const variants = {
    hidden: { opacity: 0, y: direction === "up" ? 30 : 0, x: direction === "left" ? -30 : direction === "right" ? 30 : 0 },
    visible: { opacity: 1, y: 0, x: 0 },
  };
  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6, delay, ease: "easeOut" }} variants={variants}>
      {children}
    </motion.div>
  );
}

export default function News() {
  const [selectedCategory, setSelectedCategory] = useState("সব");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const pageUrl = typeof window !== "undefined" ? window.location.href : "https://mahbubsardarsabuj.com/news";

  const handleShare = (platform: string, title: string) => {
    const url = pageUrl;
    const text = encodeURIComponent(title + " — মাহবুব সরদার সবুজ");
    const encodedUrl = encodeURIComponent(url);
    if (platform === "facebook") window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, "_blank");
    else if (platform === "twitter") window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`, "_blank");
    else if (platform === "whatsapp") window.open(`https://api.whatsapp.com/send?text=${text}%20${encodedUrl}`, "_blank");
    else if (platform === "copy") {
      navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
    }
    setShowShareMenu(false);
  };

  const handleAddComment = (newsId: number) => {
    if (!commentName.trim() || !commentText.trim()) return;
    const now = new Date();
    const timeStr = now.toLocaleDateString("bn-BD", { day: "numeric", month: "long" }) + ", " + now.toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" });
    const newComment: Comment = {
      id: Date.now(),
      name: commentName.trim(),
      text: commentText.trim(),
      time: timeStr,
      likes: 0,
      liked: false,
    };
    setComments(prev => ({ ...prev, [newsId]: [newComment, ...(prev[newsId] || [])] }));
    setCommentName("");
    setCommentText("");
  };

  const handleLikeComment = (newsId: number, commentId: number) => {
    setComments(prev => ({
      ...prev,
      [newsId]: (prev[newsId] || []).map(c =>
        c.id === commentId ? { ...c, likes: c.liked ? c.likes - 1 : c.likes + 1, liked: !c.liked } : c
      ),
    }));
  };

  const filtered = newsData.filter(item => {
    const matchCat = selectedCategory === "সব" || item.category === selectedCategory;
    const matchSearch = !searchQuery || item.title.includes(searchQuery) || item.excerpt.includes(searchQuery);
    return matchCat && matchSearch;
  });

  const featured = filtered.filter(n => n.featured);
  const regular = filtered.filter(n => !n.featured);

  return (
    <div style={{ minHeight: "100vh", background: "#060E1A", fontFamily: "'Noto Sans Bengali', sans-serif" }}>
      <Seo
        title="সংবাদ ও আপডেট | মাহবুব সরদার সবুজ"
        description="মাহবুব সরদার সবুজের সর্বশেষ সংবাদ, প্রকাশনা আপডেট, সাহিত্যকর্ম ও অনুষ্ঠানের তথ্য।"
        path="/news"
      />
      <Navbar />

      {/* ── HERO HEADER ── */}
      <section style={{
        background: "linear-gradient(135deg, #0A1628 0%, #0d2040 60%, #0A1628 100%)",
        padding: "8rem 0 5rem",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Grid pattern */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(201,168,76,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.04) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }} />
        {/* Glow */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(201,168,76,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "0 2rem", textAlign: "center" }}>
          <FadeIn direction="up">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: "1.5rem" }}>
              <div style={{ width: 60, height: 1, background: "rgba(201,168,76,0.4)" }} />
              <span style={{ color: "#C9A84C", fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>সাম্প্রতিক</span>
              <div style={{ width: 60, height: 1, background: "rgba(201,168,76,0.4)" }} />
            </div>
            <h1 style={{
              fontFamily: "'Tiro Bangla', serif",
              color: "#FAF6EF",
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              fontWeight: 400,
              marginBottom: "1.5rem",
              lineHeight: 1.3,
            }}>সংবাদ ও আপডেট</h1>
            <p style={{
              color: "rgba(250,246,239,0.6)",
              fontSize: "1.05rem",
              maxWidth: 560,
              margin: "0 auto 3rem",
              lineHeight: 2,
            }}>লেখক মাহবুব সরদার সবুজের সর্বশেষ খবর, প্রকাশনা ও ওয়েবসাইট আপডেট</p>

            {/* Search bar */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(201,168,76,0.25)",
              borderRadius: 50,
              padding: "12px 20px",
              maxWidth: 480,
              margin: "0 auto",
            }}>
              <Search size={18} color="rgba(201,168,76,0.7)" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="সংবাদ খুঁজুন..."
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#FAF6EF",
                  fontSize: "0.95rem",
                  fontFamily: "'Noto Sans Bengali', sans-serif",
                }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(201,168,76,0.7)", display: "flex" }}>
                  <X size={16} />
                </button>
              )}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── WELCOME BANNER ── */}
      <div style={{
        background: "linear-gradient(135deg, #0d1f3c 0%, #0A1628 50%, #0d2040 100%)",
        borderTop: "1px solid rgba(201,168,76,0.15)",
        borderBottom: "1px solid rgba(201,168,76,0.15)",
        padding: "2.5rem 1.5rem",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Subtle glow */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600, height: 200, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(201,168,76,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto" }}>
          {/* Decorative line */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: "1rem" }}>
            <div style={{ width: 40, height: 1, background: "linear-gradient(90deg, transparent, #C9A84C)" }} />
            <span style={{ color: "#C9A84C", fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase" }}>স্বাগতম</span>
            <div style={{ width: 40, height: 1, background: "linear-gradient(90deg, #C9A84C, transparent)" }} />
          </div>
          <p style={{
            fontFamily: "'Tiro Bangla', serif",
            color: "#FAF6EF",
            fontSize: "clamp(1rem, 3vw, 1.25rem)",
            fontWeight: 400,
            lineHeight: 1.9,
            marginBottom: "1rem",
          }}>মাহবুব সরদার সবুজের অফিসিয়াল ওয়েবসাইটে স্বাগতম।</p>
          <p style={{
            fontFamily: "'Noto Sans Bengali', sans-serif",
            color: "rgba(250,246,239,0.65)",
            fontSize: "clamp(0.85rem, 2.5vw, 0.98rem)",
            lineHeight: 2,
          }}>
            <span style={{ color: "#C9A84C", fontFamily: "'Tiro Bangla', serif", fontWeight: 400 }}>"সরদার ডিজাইন স্টুডিও"</span>
            {" "}দিয়ে নিজের পছন্দের কবিতা বা উক্তি দিয়ে সুন্দর ডিজাইন তৈরি করে সহজেই শেয়ার করুন—সম্পূর্ণ ফ্রি।
          </p>
        </div>
      </div>

      {/* ── CATEGORY FILTER ── */}
      <section style={{ background: "#0A1628", padding: "2rem 0", borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2rem" }}>
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", justifyContent: "center" }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "8px 20px",
                  borderRadius: 50,
                  border: selectedCategory === cat ? "1px solid #C9A84C" : "1px solid rgba(201,168,76,0.2)",
                  background: selectedCategory === cat ? "linear-gradient(135deg, #C9A84C, #E8C4A0)" : "rgba(201,168,76,0.05)",
                  color: selectedCategory === cat ? "#0A1628" : "rgba(250,246,239,0.7)",
                  fontFamily: "'Noto Sans Bengali', sans-serif",
                  fontSize: "0.85rem",
                  fontWeight: selectedCategory === cat ? 700 : 400,
                  cursor: "pointer",
                  transition: "all 0.25s",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "4rem 2rem" }}>

        {/* Featured news */}
        {featured.length > 0 && (
          <div style={{ marginBottom: "4rem" }}>
            <FadeIn direction="up">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "2rem" }}>
                <div style={{ width: 4, height: 24, background: "#C9A84C", borderRadius: 2 }} />
                <h2 style={{ fontFamily: "'Tiro Bangla', serif", color: "#FAF6EF", fontSize: "1.5rem", fontWeight: 400 }}>প্রধান সংবাদ</h2>
              </div>
            </FadeIn>
            <div style={{ display: "grid", gridTemplateColumns: featured.length >= 2 ? "1fr 1fr" : "1fr", gap: "1.5rem" }} className="news-grid">
              {featured.map((item, i) => (
                <FadeIn key={item.id} delay={i * 0.1} direction="up">
                  <motion.div
                    whileHover={{ y: -6, boxShadow: "0 30px 80px rgba(10,22,40,0.35)" }}
                    onClick={() => setSelectedNews(item)}
                    style={{
                      background: "linear-gradient(145deg, #0d1f3c 0%, #0A1628 100%)",
                      borderRadius: 20,
                      overflow: "hidden",
                      cursor: "pointer",
                      border: "1px solid rgba(201,168,76,0.18)",
                      boxShadow: "0 8px 30px rgba(10,22,40,0.3)",
                      transition: "all 0.3s",
                      position: "relative",
                    }}
                  >
                    {/* Top gradient accent */}
                    <div style={{ height: 3, background: `linear-gradient(90deg, ${item.categoryColor}, rgba(201,168,76,0.3), transparent)` }} />
                    {/* Featured badge */}
                    <div style={{
                      position: "absolute", top: 18, right: 18,
                      background: "linear-gradient(135deg, #C9A84C, #E8C4A0)",
                      color: "#0A1628",
                      padding: "4px 14px",
                      borderRadius: 50,
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                    }}>প্রধান</div>

                    <div style={{ padding: "2rem" }}>
                      <div style={{ display: "flex", gap: 10, marginBottom: "1.2rem", alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{
                          background: item.categoryColor + "22",
                          color: item.categoryColor,
                          padding: "4px 12px",
                          borderRadius: 50,
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          border: `1px solid ${item.categoryColor}40`,
                        }}>{item.category}</span>

                      </div>

                      <h3 style={{
                        fontFamily: "'Tiro Bangla', serif",
                        color: "#FAF6EF",
                        fontSize: "1.2rem",
                        fontWeight: 400,
                        lineHeight: 1.7,
                        marginBottom: "1rem",
                      }}>{item.title}</h3>

                      <p style={{
                        color: "rgba(250,246,239,0.55)",
                        fontSize: "0.88rem",
                        lineHeight: 1.9,
                        marginBottom: "1.5rem",
                        fontFamily: "'Noto Sans Bengali', sans-serif",
                      }}>{item.excerpt}</p>

                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        color: "#C9A84C", fontSize: "0.82rem", fontWeight: 600,
                        borderBottom: "1px solid rgba(201,168,76,0.3)",
                        paddingBottom: 2,
                      }}>
                        বিস্তারিত পড়ুন <ChevronRight size={14} />
                      </div>
                    </div>
                  </motion.div>
                </FadeIn>
              ))}
            </div>
          </div>
        )}

        {/* Regular news grid */}
        {regular.length > 0 && (
          <div>
            <FadeIn direction="up">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "2rem" }}>
                <div style={{ width: 4, height: 24, background: "#C9A84C", borderRadius: 2 }} />
                <h2 style={{ fontFamily: "'Tiro Bangla', serif", color: "#FAF6EF", fontSize: "1.5rem", fontWeight: 400 }}>সাম্প্রতিক সংবাদ</h2>
              </div>
            </FadeIn>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
              {regular.map((item, i) => (
                <FadeIn key={item.id} delay={i * 0.08} direction="up">
                  <motion.div
                    whileHover={{ y: -5, boxShadow: "0 20px 60px rgba(10,22,40,0.4)", borderColor: "rgba(201,168,76,0.4)" }}
                    onClick={() => setSelectedNews(item)}
                    style={{
                      background: "linear-gradient(145deg, #0d1f3c 0%, #0A1628 100%)",
                      borderRadius: 16,
                      overflow: "hidden",
                      cursor: "pointer",
                      border: "1px solid rgba(201,168,76,0.15)",
                      boxShadow: "0 4px 20px rgba(10,22,40,0.25)",
                      transition: "all 0.3s",
                    }}
                  >
                    <div style={{ height: 3, background: `linear-gradient(90deg, ${item.categoryColor}, rgba(201,168,76,0.2), transparent)` }} />
                    <div style={{ padding: "1.5rem" }}>
                      <div style={{ display: "flex", gap: 8, marginBottom: "1rem", alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{
                          background: item.categoryColor + "22",
                          color: item.categoryColor,
                          padding: "3px 10px",
                          borderRadius: 50,
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          border: `1px solid ${item.categoryColor}35`,
                        }}>{item.category}</span>

                      </div>
                      <h3 style={{
                        fontFamily: "'Tiro Bangla', serif",
                        color: "#FAF6EF",
                        fontSize: "1.05rem",
                        fontWeight: 400,
                        lineHeight: 1.7,
                        marginBottom: "0.8rem",
                      }}>{item.title}</h3>
                      <p style={{ color: "rgba(250,246,239,0.5)", fontSize: "0.83rem", lineHeight: 1.85, marginBottom: "1.2rem", fontFamily: "'Noto Sans Bengali', sans-serif" }}>{item.excerpt}</p>
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        color: "#C9A84C", fontSize: "0.78rem", fontWeight: 600,
                        borderBottom: "1px solid rgba(201,168,76,0.25)",
                        paddingBottom: 2,
                      }}>
                        পড়ুন <ArrowRight size={13} />
                      </div>
                    </div>
                  </motion.div>
                </FadeIn>
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "rgba(253,246,236,0.4)" }}>
            <Search size={40} style={{ margin: "0 auto 1rem", opacity: 0.4 }} />
            <p style={{ fontSize: "1rem" }}>কোনো সংবাদ পাওয়া যায়নি।</p>
          </div>
        )}
      </section>

      {/* ── NEWS DETAIL MODAL ── */}
      <AnimatePresence>
        {selectedNews && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedNews(null)}
            style={{
              position: "fixed", inset: 0, zIndex: 100,
              background: "rgba(10,22,40,0.85)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: "linear-gradient(145deg, #0d1f3c 0%, #0A1628 100%)",
                borderRadius: 24,
                maxWidth: 680,
                width: "100%",
                maxHeight: "88vh",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 40px 100px rgba(0,0,0,0.6)",
                border: "1px solid rgba(201,168,76,0.2)",
              }}
            >
              {/* Modal header accent */}
              <div style={{ height: 4, background: `linear-gradient(90deg, ${selectedNews.categoryColor}, rgba(201,168,76,0.5), transparent)` }} />

              <div style={{ padding: "2rem", overflowY: "auto", flex: 1 }}>
                {/* Top row: category + close */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
                  <span style={{
                    background: selectedNews.categoryColor + "22",
                    color: selectedNews.categoryColor,
                    padding: "5px 14px",
                    borderRadius: 50,
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    border: `1px solid ${selectedNews.categoryColor}40`,
                  }}>{selectedNews.category}</span>
                  <button
                    onClick={() => { setSelectedNews(null); setShowShareMenu(false); }}
                    style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: "rgba(201,168,76,0.12)",
                      border: "1px solid rgba(201,168,76,0.2)",
                      cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "rgba(201,168,76,0.8)",
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>

                <h2 style={{
                  fontFamily: "'Tiro Bangla', serif",
                  color: "#FAF6EF",
                  fontSize: "1.4rem",
                  fontWeight: 400,
                  lineHeight: 1.7,
                  marginBottom: "1.2rem",
                }}>{selectedNews.title}</h2>

                {/* Divider */}
                <div style={{ height: 1, background: "linear-gradient(90deg, rgba(201,168,76,0.3), transparent)", marginBottom: "1.5rem" }} />

                {/* News image if available */}
                {selectedNews.image && (
                  <div style={{ marginBottom: "1.8rem", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(201,168,76,0.2)", boxShadow: "0 12px 40px rgba(0,0,0,0.4)" }}>
                    <img
                      src={selectedNews.image}
                      alt={selectedNews.title}
                      style={{ width: "100%", maxHeight: 380, objectFit: "cover", display: "block" }}
                    />
                  </div>
                )}

                <p style={{
                  color: "rgba(250,246,239,0.75)",
                  fontSize: "1rem",
                  lineHeight: 2.2,
                  marginBottom: "2rem",
                  fontFamily: "'Noto Sans Bengali', sans-serif",
                }}>{selectedNews.content}</p>

                {selectedNews.link && (
                  <a
                    href={selectedNews.link}
                    target={selectedNews.link.startsWith("http") ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      background: "linear-gradient(135deg, #C9A84C, #E8C4A0)",
                      color: "#0A1628",
                      padding: "12px 28px",
                      borderRadius: 50,
                      fontFamily: "'Noto Sans Bengali', sans-serif",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      textDecoration: "none",
                      boxShadow: "0 8px 24px rgba(201,168,76,0.35)",
                      marginBottom: "2rem",
                    }}
                  >
                    {selectedNews.link.startsWith("http") ? <ExternalLink size={16} /> : <ArrowRight size={16} />}
                    {selectedNews.link.startsWith("http") ? "বাইরের লিংক দেখুন" : "পেজে যান"}
                  </a>
                )}

                {/* ── SHARE SECTION ── */}
                <div style={{ marginBottom: "2rem" }}>
                  <div style={{ height: 1, background: "linear-gradient(90deg, rgba(201,168,76,0.2), transparent)", marginBottom: "1.2rem" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <span style={{ color: "rgba(201,168,76,0.8)", fontSize: "0.82rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                      <Share2 size={15} /> শেয়ার করুন
                    </span>
                    {/* Facebook */}
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleShare("facebook", selectedNews.title)}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        background: "#1877F2",
                        color: "#fff",
                        border: "none", cursor: "pointer",
                        padding: "7px 14px", borderRadius: 50,
                        fontSize: "0.78rem", fontWeight: 600,
                      }}
                    >
                      <Facebook size={13} /> Facebook
                    </motion.button>
                    {/* Twitter/X */}
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleShare("twitter", selectedNews.title)}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        background: "#000",
                        color: "#fff",
                        border: "1px solid rgba(255,255,255,0.15)", cursor: "pointer",
                        padding: "7px 14px", borderRadius: 50,
                        fontSize: "0.78rem", fontWeight: 600,
                      }}
                    >
                      <Twitter size={13} /> X
                    </motion.button>
                    {/* WhatsApp */}
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleShare("whatsapp", selectedNews.title)}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        background: "#25D366",
                        color: "#fff",
                        border: "none", cursor: "pointer",
                        padding: "7px 14px", borderRadius: 50,
                        fontSize: "0.78rem", fontWeight: 600,
                      }}
                    >
                      <MessageCircle size={13} /> WhatsApp
                    </motion.button>
                    {/* Copy Link */}
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleShare("copy", selectedNews.title)}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        background: copied ? "rgba(39,174,96,0.2)" : "rgba(201,168,76,0.12)",
                        color: copied ? "#27AE60" : "rgba(201,168,76,0.9)",
                        border: `1px solid ${copied ? "rgba(39,174,96,0.4)" : "rgba(201,168,76,0.25)"}`,
                        cursor: "pointer",
                        padding: "7px 14px", borderRadius: 50,
                        fontSize: "0.78rem", fontWeight: 600,
                        transition: "all 0.3s",
                      }}
                    >
                      {copied ? <Check size={13} /> : <Link2 size={13} />}
                      {copied ? "কপি হয়েছে!" : "লিংক কপি"}
                    </motion.button>
                  </div>
                </div>

                {/* ── COMMENT SECTION ── */}
                <div>
                  <div style={{ height: 1, background: "linear-gradient(90deg, rgba(201,168,76,0.2), transparent)", marginBottom: "1.5rem" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.2rem" }}>
                    <MessageCircle size={16} color="#C9A84C" />
                    <h3 style={{ fontFamily: "'Tiro Bangla', serif", color: "#FAF6EF", fontSize: "1rem", fontWeight: 400, margin: 0 }}>
                      মন্তব্য ({(comments[selectedNews.id] || []).length})
                    </h3>
                  </div>

                  {/* Comment form */}
                  <div style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(201,168,76,0.15)",
                    borderRadius: 14,
                    padding: "1.2rem",
                    marginBottom: "1.5rem",
                  }}>
                    <input
                      type="text"
                      value={commentName}
                      onChange={e => setCommentName(e.target.value)}
                      placeholder="আপনার নাম..."
                      style={{
                        width: "100%", background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(201,168,76,0.2)",
                        borderRadius: 8, padding: "8px 12px",
                        color: "#FAF6EF", fontSize: "0.85rem",
                        fontFamily: "'Noto Sans Bengali', sans-serif",
                        outline: "none", marginBottom: "0.7rem",
                        boxSizing: "border-box",
                      }}
                    />
                    <textarea
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      placeholder="আপনার মন্তব্য লিখুন..."
                      rows={3}
                      style={{
                        width: "100%", background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(201,168,76,0.2)",
                        borderRadius: 8, padding: "8px 12px",
                        color: "#FAF6EF", fontSize: "0.85rem",
                        fontFamily: "'Noto Sans Bengali', sans-serif",
                        outline: "none", resize: "vertical",
                        marginBottom: "0.8rem",
                        boxSizing: "border-box",
                      }}
                    />
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleAddComment(selectedNews.id)}
                      disabled={!commentName.trim() || !commentText.trim()}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        background: commentName.trim() && commentText.trim()
                          ? "linear-gradient(135deg, #C9A84C, #E8C4A0)"
                          : "rgba(201,168,76,0.15)",
                        color: commentName.trim() && commentText.trim() ? "#0A1628" : "rgba(201,168,76,0.4)",
                        border: "none", cursor: commentName.trim() && commentText.trim() ? "pointer" : "default",
                        padding: "9px 20px", borderRadius: 50,
                        fontFamily: "'Noto Sans Bengali', sans-serif",
                        fontWeight: 700, fontSize: "0.82rem",
                        transition: "all 0.3s",
                      }}
                    >
                      <Send size={13} /> মন্তব্য পাঠান
                    </motion.button>
                  </div>

                  {/* Comment list */}
                  {(comments[selectedNews.id] || []).length === 0 ? (
                    <div style={{ textAlign: "center", padding: "1.5rem 0", color: "rgba(250,246,239,0.3)", fontSize: "0.85rem" }}>
                      এখনো কোনো মন্তব্য নেই। প্রথম মন্তব্য করুন!
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                      {(comments[selectedNews.id] || []).map(c => (
                        <div key={c.id} style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(201,168,76,0.1)",
                          borderRadius: 12, padding: "1rem",
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{
                                width: 30, height: 30, borderRadius: "50%",
                                background: "linear-gradient(135deg, #C9A84C, #0d2040)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                              }}>
                                <User size={14} color="#FAF6EF" />
                              </div>
                              <span style={{ color: "#FAF6EF", fontSize: "0.82rem", fontWeight: 600 }}>{c.name}</span>
                            </div>
                            <span style={{ color: "rgba(250,246,239,0.3)", fontSize: "0.72rem" }}>{c.time}</span>
                          </div>
                          <p style={{ color: "rgba(250,246,239,0.7)", fontSize: "0.85rem", lineHeight: 1.7, margin: "0 0 0.6rem", fontFamily: "'Noto Sans Bengali', sans-serif" }}>{c.text}</p>
                          <button
                            onClick={() => handleLikeComment(selectedNews.id, c.id)}
                            style={{
                              display: "inline-flex", alignItems: "center", gap: 5,
                              background: c.liked ? "rgba(201,168,76,0.15)" : "transparent",
                              color: c.liked ? "#C9A84C" : "rgba(250,246,239,0.35)",
                              border: `1px solid ${c.liked ? "rgba(201,168,76,0.3)" : "rgba(255,255,255,0.08)"}`,
                              borderRadius: 50, padding: "3px 10px",
                              cursor: "pointer", fontSize: "0.75rem",
                              transition: "all 0.2s",
                            }}
                          >
                            <ThumbsUp size={11} /> {c.likes > 0 ? c.likes : ""} পছন্দ
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
