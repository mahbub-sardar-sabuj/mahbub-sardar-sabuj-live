# Chatbot V2 Upgrade Plan

এই আপগ্রেডে লক্ষ্য হলো বর্তমান deterministic chatbot router-কে আরও বুদ্ধিমান, context-aware এবং ব্যবহারকারী-বান্ধব করা, যাতে ওয়েবসাইটের লেখক, বই, লেখা, আবৃত্তি, ডিজাইন, অডিও ও যোগাযোগ সংক্রান্ত প্রশ্নে দ্রুত ও নির্ভরযোগ্য উত্তর দেওয়া যায়।

| ক্ষেত্র | বর্তমান সীমাবদ্ধতা | V2 উন্নয়ন |
|---|---|---|
| Context handling | follow-up প্রশ্ন যেমন “১ নম্বরটা দেখাও” বা “ওটার লিংক দাও” সবসময় আগের তালিকার সাথে যুক্ত হয় না। | সাম্প্রতিক assistant response থেকে numbered/button item শনাক্ত করে contextual follow-up route যোগ করা। |
| Writing discovery | category-based result আছে, তবে recommendation style সীমিত। | query theme অনুযায়ী richer curated list, full writing link, এবং “আরও পড়ুন” prompt যোগ করা। |
| Book intelligence | বইয়ের তালিকা আছে, কিন্তু “কোন বই দিয়ে শুরু করব” ধরনের recommendation কম। | book recommendation, purchase/read intent, এবং specific book follow-up উন্নত করা। |
| Fallback quality | fallback helpful হলেও অনেক সময় generic। | help menu, actionable suggestions, এবং relevant page shortcuts সহ guided fallback তৈরি করা। |
| Frontend UX | quick actions আছে, কিন্তু placeholder/tips আর follow-up context আরও পরিষ্কার হতে পারে। | smarter placeholder, pro prompt chips, এবং writing/book-focused quick actions উন্নত করা। |
| Testing | নতুন writing tests আছে, কিন্তু multi-turn/context regression সীমিত। | contextual selection, book recommendation, help/fallback এবং frontend text checks যোগ করা। |

এই scope অনুযায়ী backend-এ deterministic router উন্নত করা হবে, frontend-এ chat experience polish করা হবে, এবং সব পরিবর্তন regression test, TypeScript check ও production build দিয়ে যাচাই করা হবে।
