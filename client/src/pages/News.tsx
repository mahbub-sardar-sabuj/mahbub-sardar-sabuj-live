/**
 * সংবাদ পেজ — Professional News Portal
 * Design: Premium literary news portal with Navy/Gold theme
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Tag, Search, ChevronRight, BookOpen, Mic2, Award, Calendar, ExternalLink, X, Share2, Facebook, Twitter, MessageCircle, Link2, Check, Send, ThumbsUp, User } from "lucide-react";
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
    id: 24,
    image: "/images/news/khoshbash-chairman-v2.png",
    title: "হাতকড়ায় চেয়ারম্যান: খোশবাসে বেদনা, অনিশ্চয়তায় জনজীবন",
    excerpt: "কুমিল্লার বরুড়া উপজেলার খোশবাস ইউনিয়নে চেয়ারম্যান নাজমুল হাসান সর্দারের গ্রেফতারের ঘটনায় জনজীবনে নেমে এসেছে অনিশ্চয়তা ও উদ্বেগ।",
    content: `কুমিল্লার বরুড়া উপজেলার খোশবাস ইউনিয়নে যেন এক অদ্ভুত ভারী নীরবতা নেমে এসেছে। আলোচনার কেন্দ্রবিন্দুতে একটাই নাম—চেয়ারম্যান নাজমুল হাসান সর্দার। যিনি একসময় জনগণের ভোটে নির্বাচিত হয়ে নেতৃত্ব দিয়েছেন, আজ তাকেই হাতকড়া পরা অবস্থায় দেখতে হচ্ছে এলাকাবাসীকে।

চার মাস আগে রাজনৈতিক মামলায় কারাভোগ শেষে জামিনে মুক্তি পান তিনি। কিন্তু মুক্তি পেলেও স্বাভাবিক দায়িত্বে ফেরা হয়নি। ৫ আগস্টের পর থেকে ইউনিয়ন পরিষদে বসা বন্ধ হয়ে যায় তার। রাজনৈতিক চাপ ও অনিশ্চয়তার মধ্যে সময় কাটছিল তার।

এই সময়টাতে প্রশাসনিক দায়িত্ব পালন করেন প্যানেল চেয়ারম্যান আয়েত আলী। কার্যক্রম চললেও সাধারণ মানুষের মধ্যে এক ধরনের শূন্যতা ছিল, কারণ তারা তাদের নির্বাচিত প্রতিনিধিকেই দেখতে চেয়েছিল।

পরিস্থিতির পরিবর্তনে নতুন করে আশার সঞ্চার হয়। আইনি প্রক্রিয়ার মাধ্যমে দায়িত্ব ফিরে পাওয়ার উদ্যোগ নেন নাজমুল হাসান সর্দার। হাইকোর্টে রুল জারি হয়, এবং তিনি পুনরায় পরিষদে বসার প্রস্তুতিও নিচ্ছিলেন। স্থানীয় পর্যায়ে যোগাযোগ বাড়াচ্ছিলেন, স্বাভাবিক কার্যক্রমে ফেরার পরিকল্পনা করছিলেন।

কিন্তু সেই প্রস্তুতির মাঝেই নতুন করে বাধা আসে। গত ২৯ মার্চ খোশবাস ইউনিয়ন পরিষদ ঘিরে উত্তেজনা সৃষ্টি হয়। একটি পক্ষ পরিষদ কার্যক্রমে প্রতিবন্ধকতা তৈরি করে, ফলে পরিস্থিতি আরও জটিল হয়ে ওঠে।

এদিকে শারীরিকভাবেও ভীষণ অসুস্থ হয়ে পড়েন তিনি। চিকিৎসাধীন অবস্থায় তাকে একাধিক ব্যাগ রক্ত দিতে হয়। অসুস্থ শরীর নিয়েই তাকে আদালতে হাজির হতে হয়।

৩০ মার্চ কুমিল্লা আদালতে একটি আর্থিক লেনদেন সংক্রান্ত মামলায় হাজিরা দিতে গেলে সেখান থেকেই তাকে গ্রেফতার করা হয়। অভিযোগ—ইট ক্রয় সংক্রান্ত টাকার বিষয়ে প্রতারণা। অভিযোগকারী ব্যক্তি তার পরিচিতজন বলেও জানা গেছে।

 can be seen in the video of him being handcuffed that spread on social media. There, a tired and dejected man is seen. The video has created emotion in many—some are surprised, some are silent.

Currently, the activities of the Union Parishad have come to a standstill. Common people are suffering after coming to take necessary services. Various works including birth registration have fallen into uncertainty.

The local conscious circles think that the incident is not just of one person—it has shaken the administrative and social reality of the entire area. They have called for a speedy solution so that public service becomes normal.

Khoshbash is now waiting—when will this uncertainty pass, when will their daily life return to its normal rhythm.`,
    category: "জাতীয়",
    categoryColor: "#E44A4A",
    date: "৩ এপ্রিল ২০২৬",
    readTime: "৫ মিনিট",
    featured: true,
    tag: "সংবাদ",
  },
  {
    id: 25,
    image: "/images/news/akibul-hasan.png.PNG",
    title: "ভোলা থেকে উঠে আসা নতুন সাহিত্যকণ্ঠ আকিবুল হাসান",
    excerpt: "ভালোবাসা, বেদনা আর জীবনের গভীর অনুভূতি—এই তিনটিকেই শব্দে রূপ দিতে ভালোবাসেন তরুণ লেখক আকিবুল হাসান।",
    content: `নাম: আকিবুল হাসান | জন্ম: ৫ এপ্রিল ২০০৪ | ঠিকানা: ভোলা জেলা, লালমোহন উপজেলা

ভালোবাসা, বেদনা আর জীবনের গভীর অনুভূতি—এই তিনটিকেই শব্দে রূপ দিতে ভালোবাসেন তরুণ লেখক আকিবুল হাসান। তার লেখায় ব্যক্তিগত আবেগ যেমন ফুটে ওঠে, তেমনি সম্পর্কের সূক্ষ্ম বাস্তবতা ও সময়ের নির্মম দিকগুলোও সহজ ভাষায় প্রকাশ পায়।

মায়ের প্রতি অগাধ ভালোবাসা, প্রেমের অপেক্ষা, বিচ্ছেদের কষ্ট এবং বাস্তবতার মুখোমুখি হওয়া—এই বিষয়গুলো তার কবিতার মূল উপজীব্য। শব্দচয়ন সহজ হলেও অনুভূতির গভীরতা পাঠকের মনে দীর্ঘস্থায়ী ছাপ ফেলে।

নতুন প্রজন্মের এই লেখক তার অনুভূতিগুলোকে সাহিত্যের মাধ্যমে তুলে ধরে ধীরে ধীরে নিজের একটি আলাদা পরিচয় তৈরি করার পথে এগিয়ে যাচ্ছেন।

⸻

মা

মা তোর গর্বে জম্মে আমি ধন্য
তোর ছেলে একটা জগৎ বানাবে শুধু তোরই জন্য।
আমার মন শুধু তোর নাম জপে
আমি তোর চরণে নিজেকে দিবো সঁপে
আকাশে উজ্জ্বল উপগ্রহ কে করে দিবো বাদ
তুই ই আমার জগৎতের আলোকিত চাঁদ
তোকে কী করে করবো ফরিয়াদ
তোর চারণেই যে আমার জান্নাত।

মা তুই যে আমার নয়নের মনি
আমি দুনিয়াতেই বেহেশতে সুখ পাই
আমার পাশে তুই থাকোস যখনই।

জন্মের পর আমার ছোট্ট হাত দিয়ে
প্রথমই ধরেছিলাম তোর তর্জনী
তোর মুখের হাসির জন্য পুরো বিশ্ব কে
করে দিবো কোরবানি।

তুই আমার মা তুই -ই আমার দুনিয়া
আমি বাঁচি যখন আমার মাথার উপর থাকে তোর ছায়া।

⸻

ছায়া নীড়

রৌদ্রের পানে রয়েছি অপেক্ষায়,
তুমি আসিবে বলে, চেয়ে আছি পথের পানে।
তুমি আসিয়া মায়া কইরা
বাড়াইয়া দিবা তোমার হাত,
তখন আমি তোমার তর্জনী ধরে
নিয়ে যাব ছায়া নীড়ের তরে।

দুজন, দুজনরে বাসিব ভালো,
সব যন্ত্রণা যাব ভুলে।
বেঁচে থাকবো শুধু একে অপরের জন্য,
পুরো বিশ্ব যায় যাক চলে।

⸻

তুমি হীন উদাসীন

তুমি বিহীন, সময়টা যেন উদাসীন
সকালটা ও যেন আঁধারে ডোবা -
তুমি বিহীন এই চাঞ্চলময় শহরটাকেও লাগে বোবা।

তুমি বিহীন বিকেলটা যেন লাগে ফেকাশে -
তুমি বিহীন যেন মেঘগুলো আর সাজে না ওই নীল আকাশে।

তুমি বিহীন সন্ধ্যাটাও যেন দীর্ঘমেয়াদি
চারোদিকে শুধু দুঃখের ক্লান্তি।

তুমি বিহীন হয়ে গেছি আছি এক বেদুইন,
আনন্দ গুলো যেন হাহাকারে ভরা উদাসীন।

তুমি বিহীন আমার একদিনের এই ভারী হাল
তবে তুমি বিহীন কাটাবো কিভাবে চিরকাল…?

⸻

ইশকে জাম

আগে ভাবতাম—ইশক হলো ভাগ্যতরী, সাচ্চা আসিকের এতে থাকে নাম;
এখন বুঝি—ইশকও এক পণ্য, অর্থের দরেই ওঠে নিলাম।

স্বপ্নের মতন ছিলো প্রেম, এখন শুধু হিসেব-খাতার দাম—
যার কাছে বেশি মুদ্রা, তার হাতেই জিতে যায় মোহাব্বতের জাম।

⸻

তুমি ফিরবে বলে

আজ বহুদিন হলো তুমি নেই আমার পাশে
তাই রাতের আকাশে তারা গণনা কিংবা কখনো জোসনায় ভিজি একাই বসে।

হাত খরচের টাকা থেকে কিছু অংশ সরিয়ে রাখি
তুমি ফিরলে গোলাপ আর রেশমী চুরি কিনে দিব বলে।

আলমিরাতে থাকা সেই খয়রি রঙের পাঞ্জাবি টা আজও রেখেছি যত্নে
কারণ তোমার দেওয়া স্পর্শ সুবাস যে আজও ছড়িয়ে আছে এতে।

ধরা হয়নি অন্য কারোর হাত।
তুমি ফিরলে তোমার ফেলে আসা আগের সেই পাগল প্রেমিকটা উপহার দিব তোমার হাতে।

তাছাড়া এখনও কত স্বপ্ন সাজিয়ে রেখেছি দু চোখ জুড়ে
শুধু তুমি ফিরবে বলে।

তোমার ফেরার অপেক্ষায় আজও আমার অগোছালো জীবনটা সাজানো হয়নি—তুমি এসে সাজাবে বলে।

বিশেষ দিন কিংবা দিবস গুলো তেমন উদযাপন করা হয়নি—তুমি ফিরলে তোমার সাথে আনন্দে মাতবো বলে।

তোমার স্মৃতিচারণা কত রাত্রি যে করেছি অনিদ্রায় যাপন
তোমাকে ফিরে পাবার আশায় কাউকে করিনি আপন।`,
    category: "সাহিত্য",
    categoryColor: "#8E44AD",
    date: "৩ এপ্রিল ২০২৬",
    readTime: "৫ মিনিট",
    featured: true,
    tag: "লেখালেখি",
    views: 789,
  },
  {
    id: 10,
    title: "ঢাকা বাতিঘরে তরুণ আবৃত্তিকারদের বই-পরিচিতি",
    excerpt: "তরুণ আবৃত্তিকার মরিয়ম ও সোহানী ঢাকা বাতিঘরে মাহবুব সরদার সবুজের বই \"আমি বিচ্ছেদকে বলি দুঃখবিলাস\"-এর সাথে পরিচিত হন এবং আবৃত্তি রেকর্ড করেন।",
    content: `ঢাকা: তরুণ আবৃত্তিকার মরিয়ম আক্তার ও সোহানী ইসলাম সমাপ্তি গতকাল রাজধানীর বাতিঘর বইঘরে গিয়ে পরিচিত হয়েছেন লেখক মাহবুব সরদার সবুজের প্রথম প্রকাশিত বই “আমি বিচ্ছেদকে বলি দুঃখবিলাস”-এর সঙ্গে।

বাতিঘর কর্তৃপক্ষ জানায়, বইটি ঘিরে তাদের আগ্রহ ছিল চোখে পড়ার মতো। আবৃত্তির প্রতি ভালোবাসা থেকে তারা শুধু বইটি পড়েই থেমে থাকেননি, বরং নিজেদের কণ্ঠে এর অংশবিশেষ আবৃত্তি করে রেকর্ডও করেন। এতে করে বইটির আবেগ ও অনুভূতিকে তারা নতুনভাবে প্রকাশের চেষ্টা করেছেন।

জানা গেছে, মাহবুব সরদার সবুজের এই বইটি পাঠকদের জন্য বিনামূল্যে ই-বুক হিসেবে তার ব্যক্তিগত ওয়েবসাইটে উপলব্ধ রয়েছে। পাশাপাশি, যারা প্রিন্ট কপি সংগ্রহ করতে চান, তারা অনলাইন বই বিক্রয় প্ল্যাটফর্ম রকমারি থেকেও বইটি সংগ্রহ করতে পারবেন।

তরুণ এই দুই আবৃত্তিকার মনে করেন, সমসাময়িক সাহিত্য ও আবৃত্তির মধ্যে সংযোগ তৈরি করা জরুরি। তাদের এমন উদ্যোগ নতুন প্রজন্মের পাঠক ও শ্রোতাদের কাছে সাহিত্যকে আরও আকর্ষণীয় করে তুলতে সহায়ক হবে।`,
    category: "সাহিত্য",
    categoryColor: "#C9A84C",
    date: "১ এপ্রিল ২০২৬",
    readTime: "২ মিনিট",
    featured: false,
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
    content: "সরদার ডিজাইন স্টুডিওতে যুক্ত হয়েছে বহুল প্রতীক্ষিত ৪K আপস্কেল ফিচার. এই ফিচারটি ব্যবহার করে পাঠকরা তাদের তৈরি ডিজাইন কার্ড বা যেকোনো ছবিকে ৪K মানে উন্নত করতে পারবেন। Laplacian sharpening ও unsharp mask প্রযুক্তি ব্যবহার করে ছবির প্রতিটি বিস্তারিত তুলে আনা হয়। আগের ও পরের তুলনা দেখার জন্য রয়েছে বিশেষ স্লাইডার। সম্পূর্ণ বিনামূল্যে এই ফিচারটি ব্যবহার করুন।",
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
    excerpt: "ওয়েবসাইটে যুক্ত হয়েছে AI চ্যাটবট. লেখক মাহবুব সরদার সবুজ সম্পর্কে যেকোনো প্রশ্নের উত্তর পাবেন তাৎক্ষণিকভাবে।",
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
    id: 11,
    title: "লেখকের সাথে সরাসরি যোগাযোগ করুন",
    excerpt: "যোগাযোগ পেজে এখন সরাসরি বার্তা পাঠানোর সুবিধা রয়েছে। লেখক নিজে প্রতিটি বার্তার উত্তর দেন।",
    content: "মাহবুব সরদার সবুজের ওয়েবসাইটে এখন সরাসরি যোগাযোগ করার সুবিধা যুক্ত করা হয়েছে। পাঠকরা তাদের মতামত, পরামর্শ বা যেকোনো জিজ্ঞাসা সরাসরি লেখকের কাছে পাঠাতে পারবেন। লেখক ব্যক্তিগতভাবে প্রতিটি বার্তার উত্তর দেওয়ার চেষ্টা করেন।",
    category: "যোগাযোগ",
    categoryColor: "#9B59B6",
    date: "এপ্রিল ২০২৬",
    readTime: "১ মিনিট",
    featured: false,
    tag: "যোগাযোগ",
    link: "/contact",
  },
  {
    id: 12,
    title: "ডিজাইন স্টুডিওতে ড্রয়িং টুল — নিজেই আঁকুন",
    excerpt: "পেন্সিল, ব্রাশ, ইরেজার, লাইন, আয়তক্ষেত্র, বৃত্ত ও তীর — ৭টি ড্রয়িং টুল দিয়ে এখন ক্যানভাসে সরাসরি আঁকা যাবে।",
    content: "সরদার ডিজাইন স্টুডিওতে নতুন ড্রয়িং টুলস যুক্ত হয়েছে। এখন আপনি পেন্সিল, ব্রাশ, ইরেজার ব্যবহার করে ক্যানভাসে সরাসরি আঁকতে পারবেন। এছাড়াও জ্যামিতিক আকার যেমন লাইন, আয়তক্ষেত্র, বৃত্ত ও তীর চিহ্ন যুক্ত করার সুবিধা রয়েছে। এটি আপনার ডিজাইনকে আরও সৃজনশীল করে তুলবে।",
    category: "ওয়েবসাইট",
    categoryColor: "#4A90D9",
    date: "এপ্রিল ২০২৬",
    readTime: "২ মিনিট",
    featured: false,
    tag: "ফিচার",
    link: "/editor",
  },
  {
    id: 13,
    title: "লেখকের জীবনী ও সাহিত্যকর্মের পূর্ণ পরিচয় এখন অনলাইনে",
    excerpt: "সম্পর্কে পেজে লেখকের জীবন, সাহিত্যদর্শন ও প্রকাশিত রচনার বিস্তারিত তথ্য পাওয়া যাচ্ছে।",
    content: "মাহবুব সরদার সবুজের ওয়েবসাইটের 'পরিচিতি' সেকশনে লেখকের বিস্তারিত জীবনী ও সাহিত্যকর্মের তথ্য যুক্ত করা হয়েছে। এখানে লেখকের শৈশব, শিক্ষা, সাহিত্যিক যাত্রা এবং তাঁর প্রকাশিত বইগুলো সম্পর্কে বিস্তারিত জানতে পারবেন।",
    category: "লেখক পরিচিতি",
    categoryColor: "#34495E",
    date: "এপ্রিল ২০২৬",
    readTime: "৩ মিনিট",
    featured: false,
    tag: "পরিচিতি",
    link: "/about",
  },
  {
    id: 14,
    title: "ওয়েবসাইটে যুক্ত হলো ক্রপ ও ইমেজ অ্যাডজাস্টমেন্ট টুল",
    excerpt: "ডিজাইন স্টুডিওতে এখন ছবি ক্রপ করা এবং উজ্জ্বলতা, কনট্রাস্ট, স্যাচুরেশন সরাসরি নিয়ন্ত্রণ করা যাবে।",
    content: "সরদার ডিজাইন স্টুডিওতে ছবি এডিট করার নতুন ফিচার যুক্ত হয়েছে। এখন আপনি আপলোড করা ছবি সরাসরি ক্রপ করতে পারবেন। এছাড়াও ছবির উজ্জ্বলতা (Brightness), কনট্রাস্ট (Contrast) এবং স্যাচুরেশন (Saturation) নিয়ন্ত্রণ করার জন্য স্লাইডার যুক্ত করা হয়েছে।",
    category: "ওয়েবসাইট",
    categoryColor: "#4A90D9",
    date: "এপ্রিল ২০২৬",
    readTime: "২ মিনিট",
    featured: false,
    tag: "ফিচার",
    link: "/editor",
  },
  {
    id: 15,
    title: "বাবা — আমার সবচেয়ে বড় অনুপ্রেরণা",
    excerpt: "বাবার অনুপ্রেরণায়ই লেখক হয়ে ওঠার স্বপ্ন দেখেছিলেন মাহবুব সরদার সবুজ। বাবার প্রতি কৃতজ্ঞতা ও ভালোবাসার কথা লিখেছেন লেখক।",
    content: "লেখক মাহবুব সরদার সবুজের জীবনে তাঁর বাবার ভূমিকা অপরিসীম। বাবার অনুপ্রেরণা ও উৎসাহেই তিনি সাহিত্যচর্চায় উদ্বুদ্ধ হয়েছেন। লেখকের মতে, তাঁর প্রতিটি সাফল্যের পেছনে বাবার দোয়া ও দিকনির্দেশনা কাজ করেছে। বাবার প্রতি শ্রদ্ধা জানিয়ে তিনি এই বিশেষ লেখাটি প্রকাশ করেছেন।",
    category: "পরিবার",
    categoryColor: "#F1C40F",
    date: "এপ্রিল ২০২৬",
    readTime: "২ মিনিট",
    featured: false,
    tag: "অনুপ্রেরণা",
  },
  {
    id: 16,
    title: "পাঠকদের ভালোবাসায় ওয়েবসাইট ১০,০০০ ভিজিটর অতিক্রম করলো",
    excerpt: "মাত্র কয়েক মাসে ওয়েবসাইটটি ১০,০০০-এরও বেশি পাঠকের কাছে পৌঁছেছে। লেখক পাঠকদের প্রতি কৃতজ্ঞতা জানিয়েছেন।",
    content: "মাহবুব সরদার সবুজের অফিশিয়াল ওয়েবসাইটটি একটি নতুন মাইলফলক স্পর্শ করেছে। যাত্রা শুরুর মাত্র কয়েক মাসের মধ্যেই ১০,০০০-এরও বেশি পাঠক ওয়েবসাইটটি পরিদর্শন করেছেন। পাঠকদের এই অভূতপূর্ব সাড়ায় লেখক অত্যন্ত আনন্দিত ও কৃতজ্ঞ।",
    category: "মাইলফলক",
    categoryColor: "#1ABC9C",
    date: "এপ্রিল ২০২৬",
    readTime: "১ মিনিট",
    featured: false,
    tag: "সাফল্য",
  }
];

export default function News() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("সব");
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const newsId = params.get('id');
      if (newsId) {
        const newsItem = newsData.find(item => item.id === parseInt(newsId));
        if (newsItem) {
          setSelectedNews(newsItem);
        }
      }
    }
  }, []);

  const categories = ["সব", ...Array.from(new Set(newsData.map(item => item.category)))];

  const featured = newsData.filter(item => item.featured);
  const filtered = newsData.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "সব" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddComment = (newsId: number) => {
    if (!commentName.trim() || !commentText.trim()) return;
    const newComment: Comment = {
      id: Date.now(),
      name: commentName,
      text: commentText,
      time: "এখনই",
      likes: 0,
      liked: false
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
      )
    }));
  };

  const getShareUrl = (newsId: number) => {
    if (typeof window === 'undefined') return '';
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?id=${newsId}`;
  };

  const shareTitle = selectedNews ? selectedNews.title : '';

  const handleCopyLink = (newsId: number) => {
    navigator.clipboard.writeText(getShareUrl(newsId));
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div style={{ background: "#050B14", minHeight: "100vh", color: "#FAF6EF" }}>
      <Seo 
        title={selectedNews ? `${selectedNews.title} | সংবাদ ও আপডেট` : "সংবাদ ও আপডেট | মাহবুব সরদার সবুজ"}
        description={selectedNews ? selectedNews.excerpt : "মাহবুব সরদার সবুজের সর্বশেষ সংবাদ, প্রকাশনা আপডেট, সাহিত্যকর্ম ও অনুষ্ঠানের তথ্য।"}
        path={selectedNews ? `/news?id=${selectedNews.id}` : "/news"}
        image={selectedNews?.image}
      />
      <Navbar />
      
      {/* Header */}
      <div style={{ 
        padding: "100px 20px 60px", 
        textAlign: "center",
        background: "linear-gradient(to bottom, rgba(13,32,64,0.4), transparent)"
      }}>
        <motion.span 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ color: "#C9A84C", fontSize: "0.9rem", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 600 }}
        >সাম্প্রতিক</motion.span>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ 
            fontFamily: "'Tiro Bangla', serif", 
            fontSize: "3.5rem", 
            margin: "15px 0",
            background: "linear-gradient(135deg, #FAF6EF 0%, #C9A84C 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>সংবাদ ও আপডেট</motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ color: "rgba(250,246,239,0.6)", maxWidth: "600px", margin: "0 auto", fontSize: "1.1rem" }}>
          লেখক মাহবুব সরদার সবুজের সর্বশেষ খবর, প্রকাশনা ও ওয়েবসাইট আপডেট
        </motion.p>

        {/* Search */}
        <div style={{ position: "relative", maxWidth: "500px", margin: "40px auto 0" }}>
          <Search style={{ position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", color: "rgba(201,168,76,0.5)" }} size={20} />
          <input 
            type="text" 
            placeholder="সংবাদ খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(201,168,76,0.2)",
              borderRadius: "50px",
              padding: "15px 20px 15px 50px",
              color: "#FAF6EF",
              fontSize: "1rem",
              outline: "none",
              transition: "all 0.3s",
              boxSizing: "border-box"
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = "#C9A84C"}
            onBlur={(e) => e.currentTarget.style.borderColor = "rgba(201,168,76,0.2)"}
          />
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px 100px" }}>
        {/* Welcome Section */}
        <div style={{ 
          background: "rgba(201,168,76,0.03)", 
          border: "1px solid rgba(201,168,76,0.1)",
          borderRadius: "20px",
          padding: "30px",
          textAlign: "center",
          marginBottom: "60px"
        }}>
          <span style={{ color: "rgba(201,168,76,0.6)", fontSize: "0.8rem", letterSpacing: "2px", textTransform: "uppercase" }}>স্বাগতম</span>
          <h2 style={{ fontFamily: "'Tiro Bangla', serif", margin: "10px 0", fontSize: "1.5rem" }}>মাহবুব সরদার সবুজের অফিসিয়াল ওয়েবসাইটে স্বাগতম।</h2>
          <p style={{ color: "rgba(250,246,239,0.7)", fontSize: "1rem" }}>
            <span style={{ color: "#C9A84C" }}>"সরদার ডিজাইন স্টুডিও"</span> দিয়ে নিজের পছন্দের কবিতা বা উক্তি দিয়ে সুন্দর ডিজাইন তৈরি করে সহজেই শেয়ার করুন—সম্পূর্ণ ফ্রি।
          </p>
        </div>

        {/* Categories */}
        <div style={{ 
          display: "flex", 
          gap: "10px", 
          overflowX: "auto", 
          paddingBottom: "20px",
          marginBottom: "40px",
          scrollbarWidth: "none"
        }} className="no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: "8px 20px",
                borderRadius: "50px",
                background: selectedCategory === cat ? "#C9A84C" : "rgba(255,255,255,0.05)",
                color: selectedCategory === cat ? "#050B14" : "rgba(250,246,239,0.7)",
                border: "1px solid " + (selectedCategory === cat ? "#C9A84C" : "rgba(201,168,76,0.1)"),
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontSize: "0.9rem",
                fontWeight: 600,
                transition: "all 0.3s"
              }}
            >{cat}</button>
          ))}
        </div>

        {/* Featured news */}
        {selectedCategory === "সব" && !searchTerm && featured.length > 0 && (
          <div style={{ marginBottom: "80px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "30px" }}>
              <div style={{ height: "2px", width: "40px", background: "#C9A84C" }}></div>
              <h2 style={{ fontFamily: "'Tiro Bangla', serif", color: "#FAF6EF", fontSize: "1.5rem", fontWeight: 400 }}>প্রধান সংবাদ</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: featured.length >= 2 ? "1fr 1fr" : "1fr", gap: "1.5rem" }} className="news-grid">
              {featured.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  onClick={() => setSelectedNews(item)}
                  style={{
                    position: "relative",
                    height: "400px",
                    borderRadius: "24px",
                    overflow: "hidden",
                    cursor: "pointer",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
                  }}
                >
                  <div style={{ 
                    position: "absolute", 
                    inset: 0, 
                    background: item.image ? `url(${item.image}) center/cover` : "linear-gradient(45deg, #0d2040, #050B14)",
                    transition: "transform 0.5s ease"
                  }} className="hover-zoom"></div>
                  <div style={{ 
                    position: "absolute", 
                    inset: 0, 
                    background: "linear-gradient(to top, rgba(5,11,20,0.95) 0%, rgba(5,11,20,0.4) 50%, transparent 100%)" 
                  }}></div>
                  
                  <div style={{ position: "absolute", top: "20px", left: "20px", display: "flex", gap: "10px" }}>
                    <span style={{ 
                      background: item.categoryColor, 
                      color: "#fff", 
                      padding: "4px 12px", 
                      borderRadius: "50px", 
                      fontSize: "0.75rem", 
                      fontWeight: 700 
                    }}>{item.category}</span>
                    <span style={{ 
                      background: "rgba(201,168,76,0.8)", 
                      color: "#050B14", 
                      padding: "4px 12px", 
                      borderRadius: "50px", 
                      fontSize: "0.75rem", 
                      fontWeight: 700 
                    }}>প্রধান</span>
                  </div>

                  <div style={{ position: "absolute", bottom: "30px", left: "30px", right: "30px" }}>
                    <h3 style={{ 
                      fontFamily: "'Tiro Bangla', serif", 
                      fontSize: "1.8rem", 
                      color: "#FAF6EF", 
                      margin: "0 0 15px",
                      lineHeight: 1.3
                    }}>{item.title}</h3>
                    <p style={{ color: "rgba(250,246,239,0.7)", fontSize: "0.95rem", margin: "0 0 20px", lineHeight: 1.6 }}>{item.excerpt}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px", color: "#C9A84C", fontWeight: 600, fontSize: "0.9rem" }}>
                      <span>বিস্তারিত পড়ুন</span>
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Regular news grid */}
        <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "30px" }}>
          <div style={{ height: "2px", width: "40px", background: "#C9A84C" }}></div>
          <h2 style={{ fontFamily: "'Tiro Bangla', serif", color: "#FAF6EF", fontSize: "1.5rem", fontWeight: 400 }}>
            {selectedCategory === "সব" ? "সাম্প্রতিক সংবাদ" : selectedCategory}
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "2rem" }}>
          {filtered.filter(item => selectedCategory !== "সব" || !item.featured).map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              viewport={{ once: true }}
              onClick={() => setSelectedNews(item)}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(201,168,76,0.1)",
                borderRadius: "24px",
                overflow: "hidden",
                cursor: "pointer",
                transition: "all 0.3s"
              }}
              whileHover={{ y: -10, borderColor: "rgba(201,168,76,0.3)", background: "rgba(255,255,255,0.05)" }}
            >
              {item.image && (
                <div style={{ height: "200px", overflow: "hidden" }}>
                  <img src={item.image} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}
              <div style={{ padding: "25px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                  <span style={{ 
                    color: item.categoryColor, 
                    fontSize: "0.75rem", 
                    fontWeight: 700, 
                    textTransform: "uppercase",
                    letterSpacing: "1px"
                  }}>{item.category}</span>
                </div>
                <h3 style={{ 
                  fontFamily: "'Tiro Bangla', serif", 
                  fontSize: "1.3rem", 
                  color: "#FAF6EF", 
                  margin: "0 0 15px",
                  lineHeight: 1.4,
                  minHeight: "3.6em"
                }}>{item.title}</h3>
                <p style={{ 
                  color: "rgba(250,246,239,0.6)", 
                  fontSize: "0.9rem", 
                  lineHeight: 1.6, 
                  margin: "0 0 20px",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden"
                }}>{item.excerpt}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "rgba(250,246,239,0.4)", fontSize: "0.8rem" }}>{item.date}</span>
                  <div style={{ color: "#C9A84C", display: "flex", alignItems: "center", gap: "5px", fontSize: "0.9rem", fontWeight: 600 }}>
                    <span>পড়ুন</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* News Detail Modal */}
      <AnimatePresence>
        {selectedNews && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1000,
              background: "rgba(5,11,20,0.95)",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px"
            }}
            onClick={() => setSelectedNews(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              style={{
                width: "100%",
                maxWidth: "800px",
                maxHeight: "90vh",
                background: "#0d2040",
                borderRadius: "30px",
                border: "1px solid rgba(201,168,76,0.2)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                position: "relative"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedNews(null)}
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  zIndex: 10,
                  background: "rgba(0,0,0,0.5)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff",
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer"
                }}
              ><X size={20} /></button>

              <div style={{ overflowY: "auto", padding: "40px" }} className="custom-scrollbar">
                {/* Modal Title */}
                <h2 style={{ fontFamily: "'Tiro Bangla', serif", fontSize: "2.5rem", color: "#FAF6EF", margin: "0 0 30px", lineHeight: 1.3 }}>{selectedNews.title}</h2>
                
                {/* News Image */}
                {selectedNews.image && (
                  <div style={{ borderRadius: "20px", overflow: "hidden", marginBottom: "30px" }}>
                    <img src={selectedNews.image} alt={selectedNews.title} style={{ width: "100%", height: "auto" }} />
                  </div>
                )}

                {/* News Content */}
                <div style={{ 
                  color: "rgba(250,246,239,0.8)", 
                  fontSize: "1.15rem", 
                  lineHeight: 1.8,
                  fontFamily: "'Noto Sans Bengali', sans-serif",
                  whiteSpace: "pre-wrap"
                }}>
                  {selectedNews.content}
                </div>

                {/* Share Options - Moved to Bottom of Content */}
                <div style={{ 
                  marginTop: "40px", 
                  padding: "20px", 
                  background: "rgba(255,255,255,0.03)", 
                  borderRadius: "20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  border: "1px solid rgba(201,168,76,0.1)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Share2 size={18} color="#C9A84C" />
                    <span style={{ color: "rgba(250,246,239,0.6)", fontSize: "0.95rem", fontWeight: 600 }}>এই সংবাদটি শেয়ার করুন:</span>
                  </div>
                  
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <a 
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl(selectedNews.id))}`} 
                      target="_blank" rel="noopener noreferrer"
                      style={{ color: "#1877F2", background: "rgba(24,119,242,0.1)", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s" }}
                      title="ফেসবুকে শেয়ার করুন"
                    ><Facebook size={18} /></a>
                    <a 
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(getShareUrl(selectedNews.id))}&text=${encodeURIComponent(shareTitle)}`} 
                      target="_blank" rel="noopener noreferrer"
                      style={{ color: "#1DA1F2", background: "rgba(29,161,242,0.1)", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s" }}
                      title="টুইটারে শেয়ার করুন"
                    ><Twitter size={18} /></a>
                    <a 
                      href={`https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + getShareUrl(selectedNews.id))}`} 
                      target="_blank" rel="noopener noreferrer"
                      style={{ color: "#25D366", background: "rgba(37,211,102,0.1)", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s" }}
                      title="হোয়াটসঅ্যাপে শেয়ার করুন"
                    ><MessageCircle size={18} /></a>
                    <button 
                      onClick={() => handleCopyLink(selectedNews.id)}
                      style={{ background: "rgba(201,168,76,0.1)", border: "none", color: copySuccess ? "#27AE60" : "#C9A84C", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.3s" }}
                      title="লিঙ্ক কপি করুন"
                    >
                      {copySuccess ? <Check size={18} /> : <Link2 size={18} />}
                    </button>
                  </div>
                </div>

                {selectedNews.link && (
                  <div style={{ marginTop: "30px" }}>
                    <a 
                      href={selectedNews.link}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "10px",
                        background: "#C9A84C",
                        color: "#050B14",
                        padding: "12px 30px",
                        borderRadius: "50px",
                        fontWeight: 700,
                        textDecoration: "none",
                        transition: "all 0.3s"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                      onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                    >
                      আরও দেখুন <ExternalLink size={18} />
                    </a>
                  </div>
                )}

                {/* Interaction Section */}
                <div style={{ marginTop: "60px", borderTop: "1px solid rgba(201,168,76,0.1)", paddingTop: "40px" }}>
                  <h3 style={{ fontFamily: "'Tiro Bangla', serif", fontSize: "1.5rem", marginBottom: "20px" }}>মতামত দিন</h3>
                  <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "20px", padding: "25px", marginBottom: "30px" }}>
                    <input 
                      type="text" 
                      placeholder="আপনার নাম"
                      value={commentName}
                      onChange={(e) => setCommentName(e.target.value)}
                      style={{
                        width: "100%", background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(201,168,76,0.2)",
                        borderRadius: 8, padding: "10px 15px",
                        color: "#FAF6EF", fontSize: "0.9rem",
                        marginBottom: "15px", outline: "none",
                        boxSizing: "border-box"
                      }}
                    />
                    <textarea 
                      placeholder="আপনার মন্তব্য লিখুন..."
                      rows={3}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      style={{
                        width: "100%", background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(201,168,76,0.2)",
                        borderRadius: 8, padding: "10px 15px",
                        color: "#FAF6EF", fontSize: "0.9rem",
                        marginBottom: "15px", outline: "none",
                        resize: "vertical", boxSizing: "border-box"
                      }}
                    />
                    <button 
                      onClick={() => handleAddComment(selectedNews.id)}
                      disabled={!commentName || !commentText}
                      style={{
                        background: commentName && commentText ? "#C9A84C" : "rgba(201,168,76,0.2)",
                        color: "#050B14", border: "none",
                        padding: "10px 25px", borderRadius: "50px",
                        fontWeight: 700, cursor: "pointer"
                      }}
                    >পাঠান</button>
                  </div>

                  {/* Comments List */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {(comments[selectedNews.id] || []).map(comment => (
                      <div key={comment.id} style={{ background: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "15px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                          <span style={{ fontWeight: 700, color: "#C9A84C" }}>{comment.name}</span>
                          <span style={{ fontSize: "0.8rem", color: "rgba(250,246,239,0.4)" }}>{comment.time}</span>
                        </div>
                        <p style={{ color: "rgba(250,246,239,0.7)", fontSize: "0.95rem", lineHeight: 1.6 }}>{comment.text}</p>
                        <button 
                          onClick={() => handleLikeComment(selectedNews.id, comment.id)}
                          style={{ 
                            background: "none", border: "none", 
                            color: comment.liked ? "#C9A84C" : "rgba(250,246,239,0.4)",
                            display: "flex", alignItems: "center", gap: "5px",
                            marginTop: "10px", cursor: "pointer", fontSize: "0.85rem"
                          }}
                        >
                          <ThumbsUp size={14} /> {comment.likes} পছন্দ
                        </button>
                      </div>
                    ))}
                  </div>
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
