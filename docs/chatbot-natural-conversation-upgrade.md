# Chatbot Natural Conversation Upgrade

এই আপগ্রেডের লক্ষ্য হলো চ্যাটবটকে মেনু-নির্ভর সহকারী থেকে আরও মানবসুলভ কথোপকথনক্ষম সহকারী হিসেবে উন্নত করা। বর্তমান সমস্যাটি হলো সাধারণ অভিবাদন বা small talk, যেমন “কেমন আছেন?”, “হাই”, “আপনি কি করছেন?”—এসব প্রশ্নের উত্তরে চ্যাটবট সরাসরি বড় মেনু দেখাচ্ছে। এতে কথোপকথনটি স্বাভাবিক মনে হচ্ছে না।

## নীতি

| Conversation Type | Expected Behavior |
|---|---|
| Greeting and well-being | সংক্ষিপ্ত, উষ্ণ ও স্বাভাবিক জবাব দেবে; অপ্রয়োজনীয় মেনু দেখাবে না। |
| Thanks and farewell | ভদ্র, মানবসুলভ ও ছোট উত্তর দেবে। |
| Mood or emotion | আগে সহানুভূতি দেবে, তারপর প্রয়োজন হলে লেখা/কবিতা/লাইভ চ্যাটের প্রস্তাব দেবে। |
| Identity question | নিজের পরিচয় স্বাভাবিকভাবে দেবে, কিন্তু user explicitly না চাইলে বড় feature list দেবে না। |
| Capability/help request | শুধু তখন structured help menu দেখাবে, যখন ব্যবহারকারী সাহায্য/মেনু/কি করতে পারো ধরনের প্রশ্ন করবে। |
| Unknown casual message | “বুঝলাম, আরেকটু খুলে বলবেন?” ধরনের natural fallback দেবে, navigation menu নয়। |

## Routing Priority

প্রথমে natural small-talk detector কাজ করবে, তবে explicit help/menu, বই, লেখা, যোগাযোগ, সাইট navigation এবং অন্যান্য domain intent থাকলে সেগুলো আগের মতো canonical route পাবে। এর ফলে “কেমন আছেন?” স্বাভাবিক উত্তর পাবে, কিন্তু “বই দেখাও” বা “লেখক সম্পর্কে বলুন” নির্দিষ্ট তথ্যভিত্তিক উত্তর পাবে।

## Test Requirements

নতুন regression case যোগ করতে হবে যাতে greeting, well-being, thanks, farewell এবং vague casual message মেনু-ভিত্তিক উত্তর না দেয়। একই সঙ্গে বিদ্যমান book, writing, help, contact route যেন আগের মতো কাজ করে তা নিশ্চিত করতে হবে।
