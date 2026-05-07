# “আমিও লিখবো বাস্তবতা” MVP বাস্তবায়ন scope

এই phase-এ ট্যাবের ভিতরে শুধু পরিচিতিমূলক landing page নয়, বরং একটি কার্যকর লেখালেখি/social publishing platform-এর ভিত্তি তৈরি করা হবে। বর্তমান repository-তে Manus OAuth/session, MySQL/Drizzle schema, tRPC backend এবং React frontend প্রস্তুত আছে। তাই MVP বাস্তবায়ন বর্তমান কাঠামোর ভিতরেই করা হবে।

| ক্ষেত্র | MVP-তে যা বাস্তবায়ন করা হবে |
|---|---|
| ব্যবহারকারী | logged-in user নিজের নামে post প্রকাশ করতে পারবে; visitor public approved posts দেখতে পারবে |
| পোস্ট | title, category, content, optional media URL, slug, status, featured flag, view count রাখা হবে |
| রিঅ্যাকশন | like, love, sad, inspiring ধরনের reaction count এবং user reaction toggle রাখা হবে |
| কমেন্ট | logged-in user approved post-এ comment করতে পারবে; comment pending/approved/rejected status থাকবে |
| অ্যাডমিন | admin pending/approved/rejected/featured post দেখতে, approve/reject/remove/feature করতে পারবে; comments approve/delete করতে পারবে |
| SEO | public post detail route থাকবে, যাতে title/author/category অনুযায়ী searchable public page তৈরি হয় |
| সীমাবদ্ধতা | Gmail/Apple/mobile login provider আলাদা করে তৈরি করা হবে না, কারণ বর্তমান সাইটে Manus OAuth session আছে; production provider integration পরে আলাদাভাবে করা যাবে |

প্রথম বাস্তবায়নে media upload-এর বদলে optional image/video URL রাখা হবে, কারণ repository-তে storage helper থাকলেও upload UI এবং production storage credential নিশ্চিত করা হয়নি। পরে file upload যোগ করা যাবে।
