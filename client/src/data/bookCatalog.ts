export type BookCatalogItem = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  cover: string;
  description: string;
  flap?: string;
  quote?: string;
  genre: string;
  pages?: string;
  year: string;
  badge: string;
  badgeColor: string;
  buyLink?: string;
  isFeatured?: boolean;
  canRead: boolean;
  accentColor: string;
};

export const BOOK_CATALOG: BookCatalogItem[] = [
  {
    id: 1,
    slug: "abhiman",
    title: "অভিমান",
    subtitle: "অণুগদ্যগ্রন্থ",
    cover: "/images/ebooks/abhiman-cover.jpg",
    description: "না-বলা দীর্ঘশ্বাস, প্রিয় মানুষের বদলে যাওয়া, শূন্যতার হাহাকার এবং আত্মমর্যাদার আলোয় ঘুরে দাঁড়ানোর অনুভূতি নিয়ে লেখা অণুগদ্যগ্রন্থ।",
    flap: "কিছু শব্দ ঠোঁটে এসেও ফিরে যায়, কিছু হাহাকার বুকের বাঁ পাশে জমাট বেঁধে পাথর হয়ে থাকে। আমরা যাকে খুব সাধারণ এক টুকরো ‘অভিমান’ বলে এড়িয়ে যাই, তার আড়ালে লুকিয়ে থাকে এক জীবনের না-বলা দীর্ঘশ্বাস।\n\n‘অভিমান’ কেবল একটি শব্দ নয়; এটি একটি হৃদয়ের ব্যবচ্ছেদ, এক নীরব ময়নাতদন্ত। বইয়ের প্রতিটি পাতায় স্মৃতির সেই ক্ষতগুলো ফুটে উঠেছে, যা সময়ের সঙ্গে মুছে যায় না; বরং আরও গভীর হয়।\n\nতবে এই বই কেবল বেদনার নয়; এটি ঘুরে দাঁড়ানোরও। অন্ধকারের দেয়াল চিরে আলোর পথে হাঁটা, আত্মসম্মান ও মনুষ্যত্বকে পুঁজি করে এগিয়ে যাওয়ার দিকনির্দেশনাও এতে আছে।",
    quote: "প্রতিটি মুহূর্তকে শেষ সময় মনে করে আমি তোমায় ভীষণ রকম ভালোবাসি। তবে তুমি কেন অভিমান করে দীর্ঘ সময় আড়ালে থাক?\n\nযদি একদিন অভিমানের সময় পেরিয়ে শুনতে পাও, তোমার অভিমান ফুরানোর আগেই আমার নিঃশ্বাস ফুরিয়ে গেছে, তখন কি পারবে অভিমান করে থাকতে?",
    genre: "অণুগদ্য",
    year: "নতুন প্রকাশনা",
    badge: "সরাসরি অর্ডার",
    badgeColor: "#E78AA2",
    buyLink: "https://rkmri.co/Te303mA3TEyA/",
    isFeatured: true,
    canRead: false,
    accentColor: "#E78AA2",
  },
  {
    id: 2,
    slug: "dukkhovilash",
    title: "আমি বিচ্ছেদকে বলি দুঃখবিলাস",
    subtitle: "মুদ্রিত রোমান্টিক কবিতার বই",
    cover: "/images/ebooks/dukkhovilash.jpg",
    description: "ভালোবাসা, বিচ্ছেদ ও বেদনাকে নতুন চোখে দেখার এক অনন্য প্রচেষ্টা; জীবনের নতুন আলো খোঁজার ভাষ্য রয়েছে এই বইয়ে।",
    genre: "রোমান্টিক কবিতা",
    year: "মুদ্রিত সংস্করণ",
    badge: "সরাসরি অর্ডার",
    badgeColor: "#D4A843",
    buyLink: "https://rkmri.co/IIAReAoMpRyp/",
    canRead: false,
    accentColor: "#D4A843",
  },
  {
    id: 3,
    slug: "smritir-boshonte",
    title: "স্মৃতির বসন্তে তুমি",
    subtitle: "ই-বুক",
    cover: "/images/ebooks/smritir-boshonte.jpg",
    description: "স্মৃতির গভীরে হারিয়ে যাওয়া প্রিয় মুহূর্তগুলো নিয়ে লেখা এক আবেগঘন কাব্যিক সংকলন।",
    genre: "কবিতা ও গদ্য",
    pages: "৮০+",
    year: "২০২৪",
    badge: "বিনামূল্যে পড়ুন",
    badgeColor: "#7DB7E8",
    canRead: true,
    accentColor: "#7DB7E8",
  },
  {
    id: 4,
    slug: "chand-phool",
    title: "চাঁদফুল",
    subtitle: "ই-বুক",
    cover: "/images/ebooks/chand-phool.jpg",
    description: "প্রকৃতির অপরূপ সৌন্দর্য আর মানবমনের কোমল অনুভূতির মেলবন্ধনে রচিত কবিতার বই।",
    genre: "কবিতা",
    pages: "৬০+",
    year: "২০২৩",
    badge: "বিনামূল্যে পড়ুন",
    badgeColor: "#58B994",
    canRead: true,
    accentColor: "#58B994",
  },
  {
    id: 5,
    slug: "shomoyer-gohvore",
    title: "সময়ের গহ্বরে",
    subtitle: "ই-বুক",
    cover: "/images/ebooks/shomoyer-gohvore.jpg",
    description: "সময়ের স্রোতে হারিয়ে যাওয়া শহর, মানুষ আর স্মৃতির কথা নিয়ে গদ্য ও কবিতার সংকলন।",
    genre: "গদ্য ও কবিতা",
    pages: "১০০+",
    year: "২০২৩",
    badge: "বিনামূল্যে পড়ুন",
    badgeColor: "#F0A35B",
    canRead: true,
    accentColor: "#F0A35B",
  },
  {
    id: 6,
    slug: "onoboddo-lekha",
    title: "মাহবুব সরদার সবুজের অনবদ্য লেখা",
    subtitle: "ই-বুক সংকলন",
    cover: "/images/ebooks/onoboddo-lekha-new.jpg",
    description: "জীবন, ভালোবাসা, বিচ্ছেদ ও মানবিক অনুভূতি নিয়ে ১০০টি নির্বাচিত লেখার সংকলন।",
    genre: "কবিতা ও গদ্য সংকলন",
    pages: "১০১",
    year: "২০২৬",
    badge: "বিনামূল্যে পড়ুন",
    badgeColor: "#A991E8",
    canRead: true,
    accentColor: "#A991E8",
  },
];

export const PRINTED_BOOKS = BOOK_CATALOG.filter((book) => !book.canRead);
export const FREE_EBOOKS = BOOK_CATALOG.filter((book) => book.canRead);

export function bookActionLabel(book: BookCatalogItem) {
  return book.canRead ? "এখনই পড়ুন" : "সরাসরি অর্ডার করুন";
}

export function bookActionHref(book: BookCatalogItem) {
  return book.canRead ? `/ebooks/read/${book.slug}` : book.buyLink || "/ebooks";
}
