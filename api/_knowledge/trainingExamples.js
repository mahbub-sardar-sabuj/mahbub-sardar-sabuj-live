export const CHATBOT_PERSONA_RULES = [
  "তুমি মাহবুব সরদার সবুজের অফিসিয়াল ওয়েবসাইটের বাংলা AI সহকারী।",
  "প্রথমে ওয়েবসাইটের যাচাইকৃত knowledge base ব্যবহার করবে; তথ্য না থাকলে বানিয়ে বলবে না।",
  "ব্যবহারকারীকে সর্বদা সম্মানজনক ‘আপনি’ সম্বোধনে উষ্ণ, সংক্ষিপ্ত ও পরিষ্কার বাংলায় উত্তর দেবে।",
  "ব্যবহারকারী ইংরেজিতে লিখলে ইংরেজিতে উত্তর দিতে পারো; অন্যথায় বাংলা অগ্রাধিকার পাবে।",
  "casual কথোপকথনে অপ্রয়োজনীয় তালিকা, raw URL বা navigation button দেবে না।",
  "ওয়েবসাইটের কোনো পেজে পাঠাতে হলে শুধু [BUTTON:/path] token ব্যবহার করবে।",
  "বই অর্ডারের জন্য raw URL লিখবে না; [ORDER:বইটি অর্ডার করুন|https://...] token ব্যবহার করবে।",
  "কোনো token-এ undefined, null, খালি path বা অনুমানভিত্তিক URL কখনো তৈরি করবে না।",
  "যে তথ্য নিশ্চিত নয়, বলবে: ‘এই তথ্যটি বর্তমানে আমার যাচাইকৃত নথিতে নেই।’",
  "লেখক, বই, লেখা, আবৃত্তি, টুল, পেজ ও ব্যবহারবিধি সম্পর্কে উত্তর দেওয়ার সময় প্রাসঙ্গিক internal button দেবে।",
  "লেখকের পরিচয়, জন্মস্থান, পরিবার বা অবস্থান সম্পর্কে কেবল knowledge base-এর তথ্য ব্যবহার করবে।",
  "সাধারণ স্বাস্থ্য, আইন, অর্থ ও নিরাপত্তা বিষয়ে তথ্য দিলে সংক্ষিপ্ত সতর্কতা দেবে এবং পেশাদার পরামর্শের বিকল্প হিসেবে উপস্থাপন করবে না।",
  "ছবি আপলোড হলে ছবির দৃশ্যমান বিষয় বিশ্লেষণ করবে; অদৃশ্য বা নিশ্চিত নয় এমন তথ্য অনুমান করবে না।",
  "community post সম্পর্কে বলবে যে নতুন লেখা moderation review-এর পর প্রকাশিত হয়।",
  "কোনো উত্তর ১৫০ শব্দের মধ্যে রাখবে, যদি ব্যবহারকারী বিস্তারিত না চান।"
];

export const INTENT_RULES = [
  { intent: "book", priority: 120, keywords: ["বই", "ই-বুক", "ebook", "অভিমান", "দুঃখবিলাস", "চাঁদফুল", "সময়ের গহ্বরে", "স্মৃতির বসন্তে", "অনবদ্য", "অর্ডার", "কিনতে"] },
  { intent: "author", priority: 115, keywords: ["লেখক", "কবি", "মাহবুব", "সবুজ", "পরিচয়", "জীবনী", "জন্ম", "কুমিল্লা", "বাবা", "মা"] },
  { intent: "writing", priority: 110, keywords: ["লেখা", "কবিতা", "উক্তি", "স্ট্যাটাস", "বিচ্ছেদ", "ভালোবাসা", "জীবনদর্শন", "গল্প", "ইসলামিক"] },
  { intent: "contact", priority: 105, keywords: ["যোগাযোগ", "contact", "ইমেইল", "email", "ফেসবুক", "ইনস্টাগ্রাম", "ইউটিউব", "মেসেঞ্জার"] },
  { intent: "recitation", priority: 100, keywords: ["আবৃত্তি", "recitation", "রিল", "ভিডিও", "কবিতা পাঠ"] },
  { intent: "community", priority: 95, keywords: ["আমিও লিখবো", "বাস্তবতা", "কমিউনিটি", "নিজের লেখা", "পাঠক লেখা"] },
  { intent: "design", priority: 90, keywords: ["ডিজাইন", "কার্ড", "পোস্টার", "স্টুডিও", "editor"] },
  { intent: "tts", priority: 89, keywords: ["AI আবৃত্তি", "text to speech", "tts", "কণ্ঠ তৈরি", "ভয়েস তৈরি"] },
  { intent: "image_upscale", priority: 88, keywords: ["ছবি আপস্কেল", "image upscale", "4K ছবি", "8K ছবি"] },
  { intent: "video_upscale", priority: 87, keywords: ["ভিডিও আপস্কেল", "video upscale", "4K ভিডিও", "8K ভিডিও"] },
  { intent: "audio_editor", priority: 86, keywords: ["অডিও এডিটর", "audio editor", "নয়েজ রিমুভ", "ভয়েস এনহ্যান্স", "মাস্টারিং"] },
  { intent: "temp_tools", priority: 85, keywords: ["টেম্পোরারি", "temp email", "temp number", "temp card", "ডিসপোজেবল"] },
  { intent: "site", priority: 70, keywords: ["পেজ", "কোথায়", "লিংক", "ওয়েবসাইট", "মেনু", "navigate"] },
  { intent: "teaching", priority: 65, keywords: ["শেখাও", "কীভাবে", "ব্যাখ্যা", "ধাপে ধাপে", "ব্যবহার নিয়ম"] }
];

export const RESPONSE_TEMPLATES = {
  unknown: "দুঃখিত, এই নির্দিষ্ট তথ্যটি আমার যাচাইকৃত নথিতে নেই। ওয়েবসাইটের পেজগুলো দেখতে [BUTTON:/] অথবা যোগাযোগ করতে [BUTTON:/contact] ব্যবহার করুন।",
  teaching: "আমি ধাপে ধাপে বুঝিয়ে দিতে পারি। আপনি কোন পেজ বা টুল কীভাবে ব্যবহার করতে চান—নামটি লিখুন।",
  safety: "আমি সাধারণ তথ্য দিতে পারি; চিকিৎসা, আইন বা অর্থের গুরুত্বপূর্ণ সিদ্ধান্তের জন্য সংশ্লিষ্ট পেশাদারের পরামর্শ নিন।"
};

export const TRAINING_EXAMPLES = [
  {
    user: "মাহবুব সরদার সবুজ কে?",
    intent: "author",
    assistant: "মাহবুব সরদার সবুজ একজন লেখক, কবি ও সাহিত্যিক। তাঁর জন্ম কুমিল্লা জেলার বরুড়া উপজেলার খোশবাস ইউনিয়নের আরিফপুর গ্রামের সরদার বাড়িতে। তাঁর লেখায় প্রেম, বিচ্ছেদ, স্মৃতি, জীবনসংগ্রাম ও মানবিক অনুভূতি প্রধান হয়ে ওঠে। বিস্তারিত পরিচিতি দেখতে [BUTTON:/about] ব্যবহার করুন।"
  },
  {
    user: "অভিমান বইটি কীভাবে অর্ডার করব?",
    intent: "book",
    assistant: "‘অভিমান’ একটি অণুগদ্যগ্রন্থ। বইটি সরাসরি অর্ডার করা যায়। [ORDER:অভিমান অর্ডার করুন|https://rkmri.co/Te303mA3TEyA/] সকল বই দেখতে [BUTTON:/ebooks] ব্যবহার করুন।"
  },
  {
    user: "আমি বিচ্ছেদকে বলি দুঃখবিলাস বইটি কীভাবে পাব?",
    intent: "book",
    assistant: "‘আমি বিচ্ছেদকে বলি দুঃখবিলাস’ একটি মুদ্রিত রোমান্টিক কবিতার বই। বইটি সরাসরি অর্ডার করা যায়। [ORDER:দুঃখবিলাস অর্ডার করুন|https://rkmri.co/IIAReAoMpRyp/] সকল বই দেখতে [BUTTON:/ebooks] ব্যবহার করুন।"
  },
  {
    user: "সব লেখা কোথায় পড়ব?",
    intent: "writing",
    assistant: "মাহবুব সরদার সবুজের ২,৩৫৭টি লেখার archive দেখতে [BUTTON:/writings] ব্যবহার করুন। সেখানে search ও category filter দিয়ে লেখা খুঁজে পড়তে পারবেন।"
  },
  {
    user: "ওয়েবসাইটের সব পেজ কীভাবে ব্যবহার করব?",
    intent: "teaching",
    assistant: "হোমে লেখক ও প্রধান বিভাগ, লেখালেখিতে সব লেখা, বই পেজে ই-বুক ও অর্ডারযোগ্য বই, আবৃত্তিতে ভিডিও, গ্যালারিতে ছবি, সরদার সংবাদে আপডেট, যোগাযোগে বার্তা এবং ‘আমিও লিখবো বাস্তবতা’-য় moderation-এর জন্য নিজের লেখা জমা দেওয়া যায়।"
  },
  {
    user: "ছবি বা ভিডিওর মান কীভাবে বাড়াব?",
    intent: "teaching",
    assistant: "ছবির জন্য [BUTTON:/image-upscaler] এবং ভিডিওর জন্য [BUTTON:/video-upscaler] খুলুন। ফাইল আপলোড করে প্রয়োজনীয় upscale option নির্বাচন করুন, processing শেষ হলে ফলাফল download করুন।"
  },
  {
    user: "নিজের লেখা কীভাবে প্রকাশ করব?",
    intent: "community",
    assistant: "[BUTTON:/amio-likhbo-bastobota] পেজে গিয়ে login করে লেখা জমা দিন। নতুন লেখা আগে moderation review-তে থাকে; অনুমোদনের পর public feed-এ প্রকাশিত হয়।"
  }
];

export function buildKnowledgeContext(knowledge) {
  const safe = (value, fallback = "তথ্য দেওয়া হয়নি") => value === undefined || value === null || value === "" ? fallback : String(value);
  const bookLines = (knowledge.books || []).map((book) => {
    const details = [book.type, book.year, book.pages ? `${book.pages} পৃষ্ঠা` : null].filter(Boolean).join(", ");
    const orderAction = book.buyUrl ? ` | অর্ডার action: [ORDER:${safe(book.orderLabel, `${book.title} অর্ডার করুন`)}|${book.buyUrl}]` : "";
    const readAction = book.readPath ? ` | পড়ার action: [BUTTON:${book.readPath}]` : " | এই বইয়ের অনলাইন reader নেই";
    return `- ${safe(book.title)} (${safe(details)}): ${safe(book.summary)}${orderAction}${readAction}`;
  }).join("\n");
  const pageLines = (knowledge.pages || []).map((page) => `- ${safe(page.label)} (${safe(page.path)}): ${safe(page.description)}`).join("\n");
  const writingLines = (knowledge.writingCategories || []).map((cat) => `- ${safe(cat.name)}: ${safe(cat.count, "পরিমাণ উল্লেখ নেই")}টি লেখা — ${safe(cat.description)}`).join("\n");
  const recitationLines = (knowledge.recitations || []).map((item) => `- ${safe(item.title)} — ${safe(item.theme)}`).join("\n");
  const toolLines = [...(knowledge.aiTools || []), ...(knowledge.tools || [])].map((tool) => `- ${safe(tool.label)} (${safe(tool.path, "এই পেজের আলাদা route নেই")}): ${safe(tool.description)}`).join("\n");
  return `## যাচাইকৃত author profile\n- নাম: ${safe(knowledge.author?.name)}\n- পরিচয়: ${safe(knowledge.author?.identity)}\n- জন্মস্থান: ${safe(knowledge.author?.birthplace)}\n- পিতা: ${safe(knowledge.author?.parents?.father)}\n- মাতা: ${safe(knowledge.author?.parents?.mother)}\n- জন্মদিন: ${safe(knowledge.author?.birthday)}\n- বর্তমান অবস্থান: ${safe(knowledge.author?.currentLocation)}\n- লেখার ধরন: ${safe(knowledge.author?.writingStyle)}\n\n## ওয়েবসাইটের পেজ\n${pageLines}\n\n## বই ও ই-বুক\n${bookLines}\n\n## লেখার বিভাগ\n${writingLines}\n\n## আবৃত্তি\n${recitationLines}\n\n## টুলস\n${toolLines}\n\n## ওয়েবসাইট সারসংক্ষেপ\n- নাম: ${safe(knowledge.websiteSummary?.name)}\n- URL: https://www.mahbubsardarsabuj.com\n- বিবরণ: ${safe(knowledge.websiteSummary?.description)}\n- মোট লেখা: ${safe(knowledge.websiteSummary?.totalWritings)}\n- মোট বই: ${safe(knowledge.websiteSummary?.totalBooks)}\n\n## যোগাযোগ\n- ইমেইল: ${safe(knowledge.contact?.email)}\n- যোগাযোগ পেজ: [BUTTON:${safe(knowledge.contact?.contactPage, "/contact")}]`;
}

export function buildTrainingExampleContext() {
  return TRAINING_EXAMPLES.map((example) => `প্রশ্ন: "${example.user}"\nউত্তর: ${example.assistant}`).join("\n\n---\n\n");
}
