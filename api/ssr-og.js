export const config = { runtime: "edge" };
const SITE_URL = "https://www.mahbubsardarsabuj.com";
const DEFAULT_IMAGE = `${SITE_URL}/images/og-home-suit.jpg`;
const SITE_NAME = "মাহবুব সরদার সবুজ | Mahbub Sardar Sabuj - লেখক ও কবি";
const newsData = [
  { id: 32, title: "ঠিকমতো বাংলা রিডিং পড়তে পারে না, অথচ এমপি–মন্ত্রী পদে বসে আছে", excerpt: "একজন মন্ত্রী যদি প্রকাশ্যে ঠিকভাবে লিখিত বক্তব্যও পড়তে না পারেন, তা শুধু ব্যক্তিগত অদক্ষতার পরিচয় নয়, বরং রাষ্ট্রের ভাবমূর্তির জন্যও বিব্রতকর।", content: "ঠিকমতো বাংলা রিডিং পড়তে পারে না, অথচ এমপি–মন্ত্রী পদে বসে আছে। একজন মন্ত্রী যদি প্রকাশ্যে ঠিকভাবে লিখিত বক্তব্যও পড়তে না পারেন, তা শুধু ব্যক্তিগত অদক্ষতার পরিচয় নয়, বরং রাষ্ট্রের ভাবমূর্তির জন্যও বিব্রতকর। কারণ, সংসদের প্রতিটি বক্তব্য এখন শুধু দেশের মানুষ নয়, সারা বিশ্বের মানুষও দেখে। ডিজিটাল যুগে কোনো দুর্বলতা আড়াল করার সুযোগ নেই। সবচেয়ে হতাশার বিষয় হলো, এমন ব্যর্থতা চোখে পড়ার পরও একশ্রেণির মানুষ অন্ধ সমর্থনে ব্যস্ত থাকে। গণতন্ত্রে জনপ্রতিনিধির কাজ জনগণের সেবা করা, ব্যক্তিপূজা পাওয়া নয়। নেতৃত্বে থাকা ব্যক্তিদের যোগ্যতা, প্রস্তুতি ও দায়িত্ববোধ নিয়ে প্রশ্ন তোলা নাগরিকের অধিকার। রাষ্ট্রের গুরুত্বপূর্ণ পদে থেকে বারবার অদক্ষতার পরিচয় দেওয়া দেশের জন্য সত্যিই লজ্জার।", image: `${SITE_URL}/images/news/news_32_parliament.jpg`, date: "2026-04-09", category: "রাজনীতি", keywords: "মন্ত্রী, বাংলা রিডিং, সংসদ, রাজনীতি, সরদার সংবাদ" },
  { id: 31, title: "'বিয়ে না করলে কবি হওয়া যায় না'—আড্ডায় মাহবুব সরদার সবুজের রসিক মন্তব্য ঘিরে হাসির রোল", excerpt: "বন্ধুদের আড্ডায় মজার ছলে দেওয়া মাহবুব সরদার সবুজের একটি মন্তব্য ঘিরে উপস্থিতদের মধ্যে তৈরি হয় প্রাণবন্ত আলোচনা ও হাসির আবহ।", content: "বন্ধুদের আড্ডা, চায়ের কাপ আর হালকা হাসি—এমন পরিবেশেই জন্ম নেয় কিছু কথা, যা পরে হয়ে ওঠে আলোচনার বিষয়। সম্প্রতি তেমনি একটি মন্তব্য ঘিরে আড্ডাপ্রেমীদের মধ্যে হাসির রোল পড়ে যায়। মন্তব্যটি ছিল—'বিয়ে না করলে কবি হওয়া যায় না, কবি হতে হলে বিয়ে করতে হয়।' আড্ডায় উপস্থিতরা কেউই কথাটি সিরিয়াসভাবে নেননি। বরং এটি ছিল সম্পূর্ণ রসিকতা আর হাস্যরসের অংশ। উপস্থিত একজন মজা করে বলেন, বিয়ের পরই নাকি মানুষ আসল কবি হয়, কারণ তখনই জীবনের আসল নাটক শুরু হয়। হাসির মধ্যেও আলোচনায় উঠে আসে অনুভূতির বাস্তব দিক। কবিতা আসলে মানুষের অনুভব, উপলব্ধি ও অভিজ্ঞতার বিষয়। শেষে হাসতে হাসতেই এই মন্তব্যটি করেন মাহবুব সরদার সবুজ।", image: `${SITE_URL}/images/news/news31.jpg`, date: "2026-04-06", category: "সাহিত্য", keywords: "মাহবুব সরদার সবুজ, বিয়ে না করলে কবি হওয়া যায় না, সরদার সংবাদ, সাহিত্য" },
  { id: 30, title: "আবু বকরের প্রথম বই 'ভাবনার আঙিনায়' পাঠকমহলে আলোচনায়", excerpt: "তরুণ লেখক আবু বকরের প্রথম আত্মউন্নয়নমূলক গ্রন্থ 'ভাবনার আঙিনায়' ইসলামি মূল্যবোধ ও আত্মবিশ্লেষণধর্মী ভাবনার সংমিশ্রণে ইতোমধ্যেই পাঠকমহলে আলোচনার জন্ম দিয়েছে।", content: "সমকালীন সাহিত্য অঙ্গনে গল্প ও কবিতার ভিড়ের মাঝেও মানুষের অন্তর্গত ভাবনা ও আত্মউন্নয়নভিত্তিক বইয়ের সংখ্যা তুলনামূলকভাবে কম। সেই জায়গা থেকে তরুণ লেখক আবু বকর তার প্রথম বই 'ভাবনার আঙিনায়' প্রকাশ করেছেন। বইটিতে লেখকের নিজস্ব দর্শনের পাশাপাশি ইসলামি মূল্যবোধের একটি সুন্দর সংমিশ্রণ রয়েছে। মানুষের মনের গভীরে লুকিয়ে থাকা নানা অনুভূতি ও ভাবনা তুলে ধরা হয়েছে। প্রতিষ্ঠিত লেখক সালমান হাবিব, সবুজ আহম্মদ মুরসালিন এবং মাহফুজুর রহমান বইটি পড়ে প্রশংসা করেছেন। বইটি মূলত কিশোর, তরুণ এবং বয়োজ্যেষ্ঠ পাঠকদের জন্য উপযোগী।", image: `${SITE_URL}/images/news/news30.jpg`, date: "2026-04-06", category: "সাহিত্য", keywords: "আবু বকর, ভাবনার আঙিনায়, বই, সরদার সংবাদ, সাহিত্য" },
  { id: 29, title: "অমর একুশে বইমেলায় তরুণ লেখক তাহেরুল রাব্বির প্রথম কাব্যগ্রন্থ প্রকাশ", excerpt: "এবারের অমর একুশে বইমেলা ২০২৬-এ প্রকাশিত হয়েছে তরুণ লেখক তাহেরুল রাব্বি-এর বহুল প্রতীক্ষিত প্রথম কাব্যগ্রন্থ নিঃশব্দ কান্নার অনুবাদ।", content: "ঢাকা, ২০২৬: এবারের অমর একুশে বইমেলা ২০২৬-এ প্রকাশিত হয়েছে তরুণ লেখক তাহেরুল রাব্বি-এর বহুল প্রতীক্ষিত প্রথম কাব্যগ্রন্থ 'নিঃশব্দ কান্নার অনুবাদ'। বইটি প্রকাশ করেছে ছায়া প্রকাশনী। প্রথম কাব্যগ্রন্থ হলেও বইটি ইতিমধ্যে পাঠকমহলে আগ্রহের কেন্দ্রবিন্দুতে পরিণত হয়েছে। বইটিতে উঠে এসেছে মানুষের মনের অজানা শূন্যতা, অসম্পূর্ণ ভালোবাসা এবং নিঃসঙ্গতার নিভৃত বেদনাগুলো। পাঠকরা বলছেন, যারা ভাঙা বিশ্বাস আর অদৃশ্য শূন্যতা নিয়ে বেঁচে আছেন, তাদের জন্য এই বইটি হতে পারে এক ধরনের মানসিক আশ্রয়।", image: `${SITE_URL}/images/news/news29.jpg`, date: "2026-04-04", category: "বইমেলা", keywords: "তাহেরুল রাব্বি, নিঃশব্দ কান্নার অনুবাদ, বইমেলা, সরদার সংবাদ" },
  { id: 28, title: "চাকরিজীবী নারীদের নিয়ে কটূক্তি, দুর্ঘটনার পর অনুতপ্ত যুবক", excerpt: "চাকরিজীবী নারীদের নিয়ে অবমাননাকর মন্তব্য করে সামাজিক মাধ্যমে সমালোচনার মুখে পড়া এক যুবক সড়ক দুর্ঘটনায় গুরুতর আহত হয়েছেন।", content: "চাকরিজীবী নারীদের নিয়ে অবমাননাকর মন্তব্য করে সামাজিক মাধ্যমে সমালোচনার মুখে পড়া এক যুবক সড়ক দুর্ঘটনায় গুরুতর আহত হয়েছেন। পরে চিকিৎসা নিতে গিয়ে এক অপ্রত্যাশিত অভিজ্ঞতার মধ্য দিয়ে নিজের ভুল উপলব্ধি করেন তিনি। ওই যুবক সম্প্রতি চাকরি করা মেয়েদের নিয়ে আপত্তিকর মন্তব্য করেন। এরই মধ্যে একদিন রাস্তা দিয়ে যাওয়ার সময় একটি সিএনজি চালিত গাড়ির সঙ্গে ধাক্কা লেগে গুরুতর আহত হন তিনি। আশ্চর্যের বিষয়, যিনি তার চিকিৎসা করেন, তিনি একজন নারী চিকিৎসক। চিকিৎসাধীন অবস্থায় বিষয়টি উপলব্ধি করে ওই যুবক গভীর অনুতাপ প্রকাশ করেন।", image: `${SITE_URL}/images/news/news28.jpg`, date: "2026-04-04", category: "সমাজ", keywords: "চাকরিজীবী নারী, সমাজ, সরদার সংবাদ" },
  { id: 27, title: "সত্য ও ন্যায়ের পথে অবিচল: সরদার সংবাদের অঙ্গীকার", excerpt: "বর্তমান সময়ের তথ্যপ্রবাহে সত্য ও নিরপেক্ষ সংবাদ পৌঁছে দেওয়া একটি বড় দায়িত্ব। এই দায়িত্ববোধ থেকেই পথচলা শুরু করেছে সরদার সংবাদ।", content: "বর্তমান সময়ের তথ্যপ্রবাহে সত্য ও নিরপেক্ষ সংবাদ পৌঁছে দেওয়া একটি বড় দায়িত্ব। এই দায়িত্ববোধ থেকেই পথচলা শুরু করেছে সরদার সংবাদ—একটি বিশ্বস্ত ও মানবিক সংবাদমাধ্যম, যার মূল লক্ষ্য সত্যকে তুলে ধরা এবং ন্যায়ের পক্ষে দৃঢ় অবস্থান নেওয়া। সরদার সংবাদ বিশ্বাস করে, প্রতিটি মানুষের কণ্ঠস্বর গুরুত্বপূর্ণ। সমাজের প্রত্যন্ত অঞ্চল থেকে শুরু করে শহরের কেন্দ্র—যেখানেই ঘটুক কোনো ঘটনা, তা যেন সঠিকভাবে মানুষের সামনে পৌঁছে যায়। শুধু সংবাদ নয়, সরদার সংবাদ সাহিত্যচর্চাকেও সমান গুরুত্ব দেয়। যোগাযোগ: lekhokmahbubsardarsabuj@gmail.com", image: `${SITE_URL}/images/news/sardar-sangbad-mission-og.jpg`, date: "2026-04-04", category: "সংবাদ", keywords: "সরদার সংবাদ, মাহবুব সরদার সবুজ, সত্য, ন্যায়" },
  { id: 26, title: "ভালোবাসা, বেদনা ও নিঃশব্দ অনুভূতির ভাষায় মুরাদ হাসানের কবিতা", excerpt: "চট্টগ্রামের সাতকানিয়া উপজেলার তরুণ কবি মুরাদ হাসান নীরব অনুভূতি আর না-বলা কথাগুলোকে কবিতার ভাষায় প্রকাশ করে ধীরে ধীরে পাঠকের দৃষ্টি আকর্ষণ করছেন।", content: "চট্টগ্রামের সাতকানিয়া উপজেলার তরুণ কবি মুরাদ হাসান নীরব অনুভূতি আর না-বলা কথাগুলোকে কবিতার ভাষায় প্রকাশ করে ধীরে ধীরে পাঠকের দৃষ্টি আকর্ষণ করছেন। তার কবিতায় একদিকে যেমন আছে গভীর একাকিত্ব, তেমনি আছে ভালোবাসা, আক্ষেপ এবং জীবনের অপূর্ণতার বাস্তব চিত্র। সম্প্রতি তার লেখা পাঁচটি কবিতা পাঠকমহলে আলোচনায় এসেছে, যেখানে ফুটে উঠেছে একজন সংবেদনশীল মানুষের অন্তর্জগত। মুরাদ হাসানের কবিতায় ভালোবাসার অনুভূতি, বিচ্ছেদের বেদনা এবং জীবনের গভীর দর্শন একসাথে উঠে আসে।", image: `${SITE_URL}/images/news/murad-hasan-poet-og.jpg`, date: "2026-04-04", category: "সাহিত্য", keywords: "মুরাদ হাসান, কবিতা, সাতকানিয়া, সরদার সংবাদ" },
  { id: 25, title: "ভোলা থেকে উঠে আসা নতুন সাহিত্যকণ্ঠ আকিবুল হাসান", excerpt: "ভালোবাসা, বেদনা আর জীবনের গভীর অনুভূতি—এই তিনটিকেই শব্দে রূপ দিতে ভালোবাসেন তরুণ লেখক আকিবুল হাসান।", content: "ভালোবাসা, বেদনা আর জীবনের গভীর অনুভূতি—এই তিনটিকেই শব্দে রূপ দিতে ভালোবাসেন তরুণ লেখক আকিবুল হাসান। ভোলা জেলার এই তরুণ লেখক ধীরে ধীরে নিজের সাহিত্যভুবন গড়ে তুলছেন। তার লেখায় গ্রামীণ জীবনের সরলতা ও শহুরে জীবনের জটিলতার মিশ্রণ লক্ষ্য করা যায়। পাঠকরা তার লেখায় নিজেদের অনুভূতির প্রতিফলন খুঁজে পান। সরদার সংবাদ তরুণ এই সাহিত্যকণ্ঠকে স্বাগত জানাচ্ছে।", image: `${SITE_URL}/images/news/akibul-hasan-og.jpg`, date: "2026-03-20", category: "সাহিত্য", keywords: "আকিবুল হাসান, ভোলা, কবিতা, সরদার সংবাদ" },
  { id: 24, title: "হাতকড়ায় চেয়ারম্যান: খোশবাসে বেদনা, অনিশ্চয়তায় জনজীবন", excerpt: "কুমিল্লার বরুড়া উপজেলার খোশবাস ইউনিয়নে চেয়ারম্যান নাজমুল হাসান সর্দারের গ্রেফতারের ঘটনায় জনজীবনে নেমে এসেছে অনিশ্চয়তা ও উদ্বেগ।", content: "কুমিল্লার বরুড়া উপজেলার খোশবাস ইউনিয়নে চেয়ারম্যান নাজমুল হাসান সর্দারের গ্রেফতারের ঘটনায় জনজীবনে নেমে এসেছে অনিশ্চয়তা ও উদ্বেগ। স্থানীয় বাসিন্দারা জানান, চেয়ারম্যানের অনুপস্থিতিতে ইউনিয়নের প্রশাসনিক কার্যক্রম ব্যাহত হচ্ছে। বিভিন্ন সরকারি সেবা পেতে মানুষ সমস্যায় পড়ছেন। স্থানীয় সূত্রে জানা গেছে, চেয়ারম্যানকে একটি মামলায় গ্রেফতার করা হয়েছে। ঘটনাটি এলাকায় ব্যাপক আলোচনার জন্ম দিয়েছে।", image: `${SITE_URL}/images/news/khoshbash-chairman-v2-og.jpg`, date: "2026-03-15", category: "সংবাদ", keywords: "খোশবাস, চেয়ারম্যান, কুমিল্লা, সরদার সংবাদ" },
  { id: 21, title: "উদীয়মান তরুণ কবি জাহিদ হাসান—ভালোবাসা, বেদনা ও অনুভূতির কণ্ঠস্বর", excerpt: "ময়মনসিংহের চর-ঝাউগড়া গ্রামের নীরব পরিবেশ থেকে উঠে আসা তরুণ লেখক জাহিদ হাসান ধীরে ধীরে নিজস্ব সাহিত্যভুবন গড়ে তুলছেন।", content: "ময়মনসিংহের চর-ঝাউগড়া গ্রামের নীরব পরিবেশ থেকে উঠে আসা তরুণ লেখক জাহিদ হাসান ধীরে ধীরে নিজস্ব সাহিত্যভুবন গড়ে তুলছেন। তার কবিতায় ভালোবাসা, বেদনা ও জীবনের গভীর অনুভূতি প্রকাশ পায়। গ্রামীণ পরিবেশে বেড়ে উঠলেও তার লেখায় সার্বজনীন মানবিক আবেগ ফুটে ওঠে। পাঠকরা তার কবিতায় নিজেদের হৃদয়ের কথা খুঁজে পান। জাহিদ হাসান বাংলা সাহিত্যে একটি নতুন কণ্ঠস্বর হিসেবে আত্মপ্রকাশ করছেন।", image: `${SITE_URL}/images/news/zahid-hasan-poet-og.jpg`, date: "2026-02-20", category: "সাহিত্য", keywords: "জাহিদ হাসান, কবিতা, ময়মনসিংহ, সরদার সংবাদ" },
  { id: 20, title: "নতুন আঙ্গিকে সাহিত্যচর্চা: চালু হলো লেখক মাহবুব সরদার সবুজের অফিসিয়াল ওয়েবসাইট", excerpt: "ডিজিটাল যুগের সঙ্গে তাল মিলিয়ে সাহিত্যকে আরও সহজলভ্য ও সংগঠিত করতে লেখক মাহবুব সরদার সবুজ তার নতুন অফিসিয়াল ওয়েবসাইট চালু করেছেন।", content: "ডিজিটাল যুগের সঙ্গে তাল মিলিয়ে সাহিত্যকে আরও সহজলভ্য ও সংগঠিত করতে লেখক মাহবুব সরদার সবুজ তার নতুন অফিসিয়াল ওয়েবসাইট চালু করেছেন। ওয়েবসাইটটিতে রয়েছে লেখকের কবিতা, ছোট লেখা, ই-বুক সংগ্রহ, সরদার সংবাদ পোর্টাল, গ্যালারি এবং আরও অনেক কিছু। পাঠকরা এখন সহজেই লেখকের সমস্ত সৃষ্টিকর্ম একটি জায়গায় পাবেন। ওয়েবসাইট ঠিকানা: www.mahbubsardarsabuj.com", image: `${SITE_URL}/images/news/website-launch-og.jpg`, date: "2026-02-10", category: "সংবাদ", keywords: "মাহবুব সরদার সবুজ, ওয়েবসাইট, সরদার সংবাদ" },
  { id: 19, title: "১১০ হাজার ফলোয়ার পূর্ণ: কৃতজ্ঞতা জানালেন লেখক মাহবুব সরদার সবুজ", excerpt: "জনপ্রিয় লেখক মাহবুব সরদার সবুজের অফিসিয়াল প্রোফাইল আইডিতে ফলোয়ার সংখ্যা ১১০ হাজারে পৌঁছেছে।", content: "জনপ্রিয় লেখক মাহবুব সরদার সবুজের অফিসিয়াল প্রোফাইল আইডিতে ফলোয়ার সংখ্যা ১১০ হাজারে পৌঁছেছে। এই মাইলফলক অতিক্রম করে লেখক তার পাঠক ও অনুসরণকারীদের প্রতি আন্তরিক কৃতজ্ঞতা জানিয়েছেন। মাহবুব সরদার সবুজ বলেন, পাঠকদের ভালোবাসা ও সমর্থনই তার লেখালেখির মূল অনুপ্রেরণা। ১১০ হাজার মানুষের বিশ্বাস ও ভালোবাসা তাকে আরও ভালো লেখার অঙ্গীকার করতে উৎসাহিত করছে।", image: `${SITE_URL}/images/news/110k-followers-og.jpg`, date: "2026-01-25", category: "সংবাদ", keywords: "মাহবুব সরদার সবুজ, ১১০ হাজার ফলোয়ার, সরদার সংবাদ" },
  { id: 18, title: "ডিসেম্বরের শহরে বই নিয়ে পাঠকমহলে আগ্রহ বাড়ছে", excerpt: "বাংলা সাহিত্য অঙ্গনে সমকালীন রোমান্টিক ধারার আলোচিত বইগুলোর মধ্যে জায়গা করে নিয়েছে ডিসেম্বরের শহরে।", content: "বাংলা সাহিত্য অঙ্গনে সমকালীন রোমান্টিক ধারার আলোচিত বইগুলোর মধ্যে জায়গা করে নিয়েছে 'ডিসেম্বরের শহরে'। তরুণ লেখক সবুজ আহম্মদ মুরসালিন রচিত এই উপন্যাসটি প্রকাশের পর থেকেই পাঠকদের মধ্যে আগ্রহ ও আলোচনার কেন্দ্রবিন্দুতে রয়েছে। প্রকাশনা প্রতিষ্ঠান ভূমিপ্রকাশ থেকে প্রকাশিত বইটি মূলত ভালোবাসা, বিচ্ছেদ এবং মানসিক অনুভূতির সূক্ষ্ম দিকগুলো তুলে ধরেছে। উপন্যাসটির কাহিনিতে 'আকাশ' ও 'নীলা' নামের দুই চরিত্রের সম্পর্কের গল্প ফুটে উঠেছে।", image: `${SITE_URL}/images/news/december-shohor-og.jpg`, date: "2026-01-15", category: "সাহিত্য", keywords: "ডিসেম্বরের শহরে, বই, মাহবুব সরদার সবুজ, সরদার সংবাদ" },
  { id: 17, title: "আপনার গল্প, আপনার পরিচিতি—এবার বৃহৎ পাঠকের কাছে", excerpt: "ডিজিটাল এই সময়ে নিজের পরিচিতি তুলে ধরা কিংবা ব্যক্তিগত সাফল্যের গল্প শেয়ার করা এখন অনেক সহজ।", content: "ডিজিটাল এই সময়ে নিজের পরিচিতি তুলে ধরা কিংবা ব্যক্তিগত সাফল্যের গল্প শেয়ার করা এখন অনেক সহজ। সেই সুযোগকে আরও বিস্তৃত করতে সরদার সংবাদ প্ল্যাটফর্মে উন্মুক্ত করা হয়েছে সংবাদ ও ব্যক্তিগত পরিচিতি প্রকাশের সুযোগ। যারা নিজেদের সংবাদ বা ব্যক্তিগত তথ্য প্রকাশ করতে চান, তাদেরকে নির্ভুল ও বিস্তারিত তথ্যের পাশাপাশি একটি মানসম্মত ছবি জমা দিতে হবে। নতুন ও প্রতিষ্ঠিত লেখক-কবিদের জন্য রয়েছে বিশেষ সুযোগ। যোগাযোগ: lekhokmahbubsardarsabuj@gmail.com", image: `${SITE_URL}/images/news/platform-announcement-og.jpg`, date: "2025-12-20", category: "সংবাদ", keywords: "সরদার সংবাদ, গল্প, পরিচিতি, মাহবুব সরদার সবুজ" },
  { id: 10, title: "ঢাকা বাতিঘরে তরুণ আবৃত্তিকারদের বই-পরিচিতি", excerpt: "তরুণ আবৃত্তিকার মরিয়ম ও সোহানী ঢাকা বাতিঘরে মাহবুব সরদার সবুজের বই আমি বিচ্ছেদকে বলি দুঃখবিলাস-এর সাথে পরিচিত হন।", content: "ঢাকা: তরুণ আবৃত্তিকার মরিয়ম আক্তার ও সোহানী ইসলাম সমাপ্তি গতকাল রাজধানীর বাতিঘর বইঘরে গিয়ে পরিচিত হয়েছেন লেখক মাহবুব সরদার সবুজের প্রথম প্রকাশিত বই 'আমি বিচ্ছেদকে বলি দুঃখবিলাস'-এর সঙ্গে। বাতিঘর কর্তৃপক্ষ জানায়, বইটি ঘিরে তাদের আগ্রহ ছিল চোখে পড়ার মতো। আবৃত্তির প্রতি ভালোবাসা থেকে তারা শুধু বইটি পড়েই থেমে থাকেননি, বরং নিজেদের কণ্ঠে এর অংশবিশেষ আবৃত্তি করে রেকর্ডও করেন। মাহবুব সরদার সবুজের এই বইটি পাঠকদের জন্য বিনামূল্যে ই-বুক হিসেবে তার ব্যক্তিগত ওয়েবসাইটে উপলব্ধ রয়েছে।", image: `${SITE_URL}/images/news/baighar-visit-og.jpg`, date: "2025-11-10", category: "সাহিত্য", keywords: "ঢাকা বাতিঘর, আবৃত্তি, মাহবুব সরদার সবুজ, সরদার সংবাদ" },
];
const ebookData = [
  { slug: "dukkhovilash", title: "আমি বিচ্ছেদকে বলি দুঃখবিলাস", description: "মাহবুব সরদার সবুজের প্রথম প্রকাশিত কাব্যগ্রন্থ। ভালোবাসা, বিচ্ছেদ ও দুঃখের অনুভূতির কাব্যিক প্রকাশ।", image: `${SITE_URL}/images/ebooks/dukkhovilash.png` },
  { slug: "smritir-boshonte", title: "স্মৃতির বসন্তে তুমি", description: "স্মৃতি ও ভালোবাসার কবিতার সংকলন। হৃদয়ের গভীর অনুভূতির সাহিত্যিক প্রকাশ।", image: `${SITE_URL}/images/ebooks/smritir-boshonte.png` },
  { slug: "chand-phool", title: "চাঁদফুল", description: "প্রকৃতি ও ভালোবাসার কবিতার সংকলন।", image: `${SITE_URL}/images/ebooks/chand-phool.png` },
  { slug: "shomoyer-gohvore", title: "সময়ের গহ্বরে", description: "সময় ও জীবনের গভীরতার কবিতার সংকলন।", image: `${SITE_URL}/images/ebooks/shomoyer-gohvore.png` },
];
const staticPages = {
  "/": { title: "মাহবুব সরদার সবুজ | Mahbub Sardar Sabuj - লেখক ও কবি", description: "লেখক ও কবি মাহবুব সরদার সবুজের অফিসিয়াল ওয়েবসাইট। কবিতা, গল্প, ই-বুক, সংবাদ ও সাহিত্যের এক অনন্য জগৎ।", image: DEFAULT_IMAGE, type: "website", keywords: "মাহবুব সরদার সবুজ, Mahbub Sardar Sabuj, বাংলা লেখক, কবি, লেখালেখি, ই-বুক, সরদার সংবাদ" },
  "/writings": { title: "মাহবুব সরদার সবুজের লেখালেখি | কবিতা ও সাহিত্য", description: "মাহবুব সরদার সবুজের কবিতা, ছোট লেখা, ভালোবাসা ও জীবনদর্শনের বিশাল সংকলন। বাংলা সাহিত্যের অনন্য এক জগৎ।", image: DEFAULT_IMAGE, type: "website", keywords: "মাহবুব সরদার সবুজের লেখালেখি, কবিতা, ছোট লেখা, বাংলা সাহিত্য, লেখক" },
  "/ebooks": { title: "মাহবুব সরদার সবুজের ইবুক | ই-বুক সংগ্রহ", description: "মাহবুব সরদার সবুজের প্রকাশিত ই-বুক সমূহ বিনামূল্যে পড়ুন। আমি বিচ্ছেদকে বলি দুঃখবিলাস, স্মৃতির বসন্তে তুমি, চাঁদফুল ও সময়ের গহ্বরে।", image: `${SITE_URL}/images/ebooks/dukkhovilash.png`, type: "website", keywords: "মাহবুব সরদার সবুজের ইবুক, ই-বুক, দুঃখবিলাস, স্মৃতির বসন্তে তুমি, চাঁদফুল, সময়ের গহ্বরে" },
  "/gallery": { title: "গ্যালারি | মাহবুব সরদার সবুজ", description: "মাহবুব সরদার সবুজের কবিতা ও লেখার ডিজাইন কার্ডের গ্যালারি। সুন্দর ভিজ্যুয়াল কবিতা কার্ড সংগ্রহ।", image: DEFAULT_IMAGE, type: "website", keywords: "মাহবুব সরদার সবুজ গ্যালারি, কবিতা কার্ড, ডিজাইন" },
  "/news": { title: "সরদার সংবাদ | মাহবুব সরদার সবুজ", description: "সরদার সংবাদ — লেখক মাহবুব সরদার সবুজের সর্বশেষ সংবাদ, আপডেট ও সাহিত্য জগতের খবর। বাংলা সাহিত্য ও সংস্কৃতির নিউজ পোর্টাল।", image: DEFAULT_IMAGE, type: "website", keywords: "সরদার সংবাদ, মাহবুব সরদার সবুজ, বাংলা সংবাদ, সাহিত্য সংবাদ" },
  "/about": { title: "পরিচিতি | মাহবুব সরদার সবুজ — লেখক ও কবি", description: "লেখক ও কবি মাহবুব সরদার সবুজের জীবনী, সাহিত্যদর্শন ও প্রকাশিত রচনার পরিচয়। বাংলাদেশের জনপ্রিয় লেখক।", image: DEFAULT_IMAGE, type: "profile", keywords: "মাহবুব সরদার সবুজ পরিচিতি, লেখক জীবনী, কবি" },
  "/contact": { title: "যোগাযোগ | মাহবুব সরদার সবুজ", description: "লেখক মাহবুব সরদার সবুজের সাথে সরাসরি যোগাযোগ করুন। ইমেইল ও সামাজিক মাধ্যমের ঠিকানা।", image: DEFAULT_IMAGE, type: "website", keywords: "মাহবুব সরদার সবুজ যোগাযোগ, ইমেইল, যোগাযোগ" },
  "/facebook-recitations": { title: "মাহবুব সরদার সবুজের আবৃত্তি | ভিডিও সংগ্রহ", description: "মাহবুব সরদার সবুজের ফেসবুক লাইভ আবৃত্তির সংগ্রহ। কবিতা আবৃত্তির ভিডিও দেখুন।", image: DEFAULT_IMAGE, type: "website", keywords: "মাহবুব সরদার সবুজ আবৃত্তি, কবিতা আবৃত্তি, ভিডিও" },
  "/editor": { title: "সরদার ডিজাইন স্টুডিও | মাহবুব সরদার সবুজ", description: "কবিতা ও লেখার সুন্দর ডিজাইন কার্ড তৈরি করুন। সরদার ডিজাইন স্টুডিও।", image: DEFAULT_IMAGE, type: "website", keywords: "সরদার ডিজাইন স্টুডিও, কবিতা কার্ড, ডিজাইন" },
};

function buildJsonLd(og, pathname) {
  const canonicalUrl = og.url || `${SITE_URL}${pathname}`;
  const absImage = og.image && og.image.startsWith("http") ? og.image : `${SITE_URL}${og.image}`;
  const newsMatch = pathname.match(/^\/news\/(\d+)/);
  if (newsMatch) {
    const newsId = parseInt(newsMatch[1]);
    const news = newsData.find((n) => n.id === newsId);
    if (news) {
      return JSON.stringify({
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": news.title,
        "description": news.excerpt,
        "image": [absImage],
        "datePublished": news.date || "2026-01-01",
        "dateModified": news.date || "2026-01-01",
        "author": { "@type": "Person", "name": "মাহবুব সরদার সবুজ", "url": SITE_URL },
        "publisher": { "@type": "Organization", "name": "সরদার সংবাদ", "logo": { "@type": "ImageObject", "url": `${SITE_URL}/images/sardar-sangbad-logo-final.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": canonicalUrl },
        "url": canonicalUrl,
        "inLanguage": "bn",
        "articleSection": news.category || "সংবাদ",
        "keywords": news.keywords || `সরদার সংবাদ, মাহবুব সরদার সবুজ`
      });
    }
  }
  const ebookMatch = pathname.match(/^\/ebooks\/read\/([^/]+)/);
  if (ebookMatch) {
    const slug = ebookMatch[1];
    const ebook = ebookData.find((e) => e.slug === slug);
    if (ebook) {
      return JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Book",
        "name": ebook.title,
        "description": ebook.description,
        "image": absImage,
        "author": { "@type": "Person", "name": "মাহবুব সরদার সবুজ", "url": SITE_URL },
        "url": canonicalUrl,
        "inLanguage": "bn"
      });
    }
  }
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": SITE_NAME,
    "url": SITE_URL,
    "description": og.description,
    "author": { "@type": "Person", "name": "মাহবুব সরদার সবুজ", "url": SITE_URL },
    "inLanguage": "bn"
  });
}

function getOGData(pathname) {
  const newsMatch = pathname.match(/^\/news\/(\d+)/);
  if (newsMatch) {
    const newsId = parseInt(newsMatch[1]);
    const news = newsData.find((n) => n.id === newsId);
    if (news) {
      return { title: news.title + " | সরদার সংবাদ", description: news.excerpt, image: news.image || DEFAULT_IMAGE, url: SITE_URL + pathname, type: "article", keywords: news.keywords || "সরদার সংবাদ, মাহবুব সরদার সবুজ" };
    }
    return { ...staticPages["/news"], url: SITE_URL + pathname };
  }
  const ebookMatch = pathname.match(/^\/ebooks\/read\/([^/]+)/);
  if (ebookMatch) {
    const slug = ebookMatch[1];
    const ebook = ebookData.find((e) => e.slug === slug);
    if (ebook) {
      return { title: ebook.title + " | মাহবুব সরদার সবুজের ইবুক পড়ুন", description: ebook.description, image: ebook.image || DEFAULT_IMAGE, url: SITE_URL + pathname, type: "book", keywords: `মাহবুব সরদার সবুজের ইবুক, ${ebook.title}, ই-বুক পড়ুন` };
    }
    return { ...staticPages["/ebooks"], url: SITE_URL + pathname };
  }
  const cleanPath = pathname.replace(/\/$/, "") || "/";
  if (staticPages[cleanPath]) {
    return { ...staticPages[cleanPath], url: SITE_URL + pathname };
  }
  return { title: "মাহবুব সরদার সবুজ | Mahbub Sardar Sabuj - লেখক ও কবি", description: "লেখক ও কবি মাহবুব সরদার সবুজের অফিসিয়াল ওয়েবসাইট", image: DEFAULT_IMAGE, url: SITE_URL + pathname, type: "website", keywords: "মাহবুব সরদার সবুজ, Mahbub Sardar Sabuj, বাংলা লেখক, কবি" };
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
  const jsonLd = buildJsonLd(og, pathname);

  const newsMatch = pathname.match(/^\/news\/(\d+)/);
  let bodyContent = `<h1>${escapeHtml(og.title)}</h1><p>${escapeHtml(og.description)}</p>`;
  if (newsMatch) {
    const newsId = parseInt(newsMatch[1]);
    const news = newsData.find((n) => n.id === newsId);
    if (news) {
      const articleText = news.content || news.excerpt;
      const paragraphs = articleText.split(/\n+/).filter(p => p.trim()).map(p => `<p>${escapeHtml(p.trim())}</p>`).join("\n  ");
      bodyContent = `<article itemscope itemtype="https://schema.org/NewsArticle">\n  <h1 itemprop="headline">${escapeHtml(news.title)}</h1>\n  <p><strong>বিভাগ:</strong> <span itemprop="articleSection">${escapeHtml(news.category)}</span> | <strong>তারিখ:</strong> <time itemprop="datePublished" datetime="${escapeHtml(news.date)}">${escapeHtml(news.date)}</time></p>\n  <p itemprop="description"><em>${escapeHtml(news.excerpt)}</em></p>\n  <div itemprop="articleBody">\n  ${paragraphs}\n  </div>\n  <p><a href="${escapeHtml(canonicalUrl)}">সম্পূর্ণ পড়ুন — ${escapeHtml(SITE_URL)}</a></p>\n</article>`;
    }
  }

  const html = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(og.title)}</title>
  <meta name="description" content="${escapeHtml(og.description)}" />
  <meta name="keywords" content="${escapeHtml(og.keywords || "মাহবুব সরদার সবুজ, Mahbub Sardar Sabuj")}" />
  <meta name="author" content="মাহবুব সরদার সবুজ" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
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
  <script type="application/ld+json">${jsonLd}</script>
  <meta http-equiv="refresh" content="0; url=${escapeHtml(canonicalUrl)}" />
</head>
<body>
  ${bodyContent}
  <p><a href="${escapeHtml(SITE_URL)}">মাহবুব সরদার সবুজের ওয়েবসাইটে যান</a></p>
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
