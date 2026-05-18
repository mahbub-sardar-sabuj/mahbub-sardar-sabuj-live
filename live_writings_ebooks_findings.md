# লাইভ পরীক্ষা: লেখালেখি ও বই ট্যাব

তারিখ: ২০২৬-০৫-১৮

## পর্যবেক্ষণ

প্রথম পর্যবেক্ষণে `/writings` ও `/ebooks` route-এ static fallback content দেখা যায়, যা নির্দেশ করে যে JavaScript app shell শুরু হতে দেরি করছে। পরে `/ebooks` পেজ সম্পূর্ণ render হয়েছে এবং বইয়ের কনটেন্ট, CTA, cover image, “এখনই পড়ুন” ও “রকমারি থেকে অর্ডার করুন” বোতাম দেখা গেছে। তবে `/writings` পেজে দীর্ঘ সময় spinner দেখা যায় এবং ব্যবহারকারীর কাছে পেজ আটকে আছে বলে মনে হয়।

ব্রাউজার performance data-তে `writings-data` chunk প্রায় ১.২ MB decoded size দেখা গেছে। এই বড় ডেটা route activation-এর সঙ্গে লোড হওয়ায় “লেখালেখি ও বই” ট্যাবের প্রধান route দ্রুত দৃশ্যমান হচ্ছে না। `/ebooks` তুলনামূলকভাবে সুন্দরভাবে render হলেও একই নেভিগেশন ট্যাবের অধীনে `/writings` প্রধান entry হওয়ায় সামগ্রিক অভিজ্ঞতা ক্ষতিগ্রস্ত হচ্ছে।

## সমস্যার সারাংশ

| ক্ষেত্র | সমস্যা | প্রভাব |
|---|---|---|
| `/writings` | দীর্ঘ spinner / delayed route render | ব্যবহারকারী মনে করেন পেজ কাজ করছে না |
| `/writings` data loading | বড় `writingsArchive` chunk | প্রথম লোড ধীর |
| `/ebooks` | render হয়, কিন্তু প্রথমে fallback/spinner delay আছে | perceived performance দুর্বল |
| navigation | “লেখালেখি ও বই” ট্যাব `/writings`-এ যায় | ট্যাবের প্রথম অভিজ্ঞতা দুর্বল |

## পরিবর্তনের পরিকল্পনা

১. `Writings` পেজকে route-level lazy import থেকে eager import করা হবে, যাতে প্রধান “লেখালেখি ও বই” ট্যাব Suspense spinner-এ আটকে না থাকে।

২. ভারী archive লোড চলাকালীন পেজে সুন্দর skeleton/empty-ready layout থাকবে; পুরো পেজ blank/spinner থাকবে না।

৩. `writingsArchive` chunk load ব্যর্থ হলেও পেজ usable থাকবে এবং ব্যবহারকারী বই/ই-বুক section দেখতে পারবেন।

৪. `/ebooks` পেজের first-load অভিজ্ঞতা ঠিক আছে কি না local build ও browser test দিয়ে পুনরায় যাচাই করা হবে।
