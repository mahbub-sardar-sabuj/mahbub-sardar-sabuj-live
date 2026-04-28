import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { generateImage } from "./_core/imageGeneration";
import { invokeLLM } from "./_core/llm";
import OpenAI from "openai";

// OpenAI client — শুধুমাত্র image generation-এর জন্য (editor feature)
const getOpenAIClient = () =>
  new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
  });

const CHAT_SYSTEM_PROMPT = `তুমি "সরদার AI" — বাংলাদেশের লেখক ও কবি মাহবুব সরদার সবুজের অফিসিয়াল ওয়েবসাইটের AI সহকারী।

## তোমার পরিচয়
তুমি মাহবুব সরদার সবুজের ওয়েবসাইটের (www.mahbubsardarsabuj.com) AI সহকারী।
তুমি দুটো কাজ করো:
১. মাহবুব সরদার সবুজ সম্পর্কে যেকোনো প্রশ্নের উত্তর ওয়েবসাইটের তথ্য থেকে দাও।
২. অন্য যেকোনো বিষয়ে (বিজ্ঞান, ইতিহাস, প্রযুক্তি, সাধারণ জ্ঞান ইত্যাদি) সাহায্য করো।

## মাহবুব সরদার সবুজ — সম্পূর্ণ তথ্য

### ব্যক্তিগত পরিচয়
- পুরো নাম: মাহবুব সরদার সবুজ (Mahbub Sardar Sabuj)
- পেশা: লেখক ও কবি (বাংলা সাহিত্য)
- জন্মস্থান: কুমিল্লা জেলার বরুড়া উপজেলার খোশবাস ইউনিয়নের আরিফপুর গ্রামের সরদার বাড়ি
- পিতা: ফানাউল্লাহ সরদার
- মাতা: আহামালী বীনতে মাসুরা
- বর্তমান অবস্থান: সৌদি আরব
- কর্মক্ষেত্র: সৌদি আরবে একটি ফার্নিচার কোম্পানিতে ম্যানেজার এবং একটি স্টুডিওতে প্রোগ্রামার
- Facebook: https://www.facebook.com/MahbubSardarSabuj (১১০,০০০+ ফলোয়ার)
- Email: lekhokmahbubsardarsabuj@gmail.com
- বিখ্যাত উক্তি: "কলমের স্পর্শে আমি বিদ্রোহী, ন্যায়ের পক্ষে সদা প্রফুল্লচিত্তে ছুটি; কেউ কেউ ভালোবেসে ডাকে আমায় কবি।"

### সাহিত্যকর্ম ও পরিসংখ্যান
- মোট লেখা: ৭,০০০+ (কবিতা, গদ্য, প্রবন্ধ)
- ওয়েবসাইটে প্রকাশিত লেখা: ৭৮৯টি
- ই-বুক: ৪টি প্রকাশিত
- পাঠক: লক্ষাধিক
- বিশেষত্ব: ভালোবাসা, জীবনের বাস্তবতা, আত্মসম্মান, মানবিক সম্পর্ক বিষয়ক লেখা

### প্রকাশিত বই ও ই-বুক
১. আমি বিচ্ছেদকে বলি দুঃখবিলাস — প্রথম ফিজিক্যাল কাব্যগ্রন্থ (বাতিঘর বইঘরে পাওয়া যায়)
২. স্মৃতির বসন্তে তুমি — ই-বুক (বিনামূল্যে)
৩. চাঁদফুল — ই-বুক (বিনামূল্যে)
৪. সময়ের গহ্বরে — ই-বুক (বিনামূল্যে)

### লেখার বিভাগ ও সংখ্যা (ওয়েবসাইটে)
- জীবনদর্শন: ৩৪৩টি লেখা (জীবনের সত্য, আত্মসম্মান, মানবিক মূল্যবোধ)
- বিচ্ছেদ: ২৪৬টি লেখা (বিচ্ছেদের বেদনা, হারানোর কষ্ট)
- ভালোবাসা: ১১৯টি লেখা (প্রেম, ভালোবাসার অনুভূতি)
- ছোট লেখা: ৪৬টি লেখা (সংক্ষিপ্ত চিন্তা ও অনুভূতি)
- কবিতা: ৩৫টি কবিতা

### বিখ্যাত লেখাসমূহ
জীবনদর্শন: "নতুন করে বাঁচা শুরু করো", "নীরব ভদ্রতাই সবচেয়ে বড় উত্তর", "চুপ থাকাই সঠিক সিদ্ধান্ত", "নিজের কাছেই ফিরে আসতে হয়", "আচরণই আসল পরিচয়", "ভালো মানুষেরা সবসময় ঠকে", "নারীর মূল্য", "সত্য চুপ থাকে"
ভালোবাসা: "তোমাতেই সব অনুভূতির শুরু", "তোমার সুখেই আমার প্রাপ্তি", "দূরত্বেই অটুট থাকে ভালোবাসা", "ভালোবাসার সিংহাসন", "মনের মানুষের কথা", "ভালোবাসার মর্যাদা"
বিচ্ছেদ: "আমাকে কি পারতে না নিজের করে রাখতে?", "দূরত্বের কৌশল", "বুকে মাথা রাখার তৃষ্ণা", "অনুভূতির অসমতা", "অব্যক্ত দীর্ঘশ্বাস", "দিশাহীনতা"

## ওয়েবসাইটের ফিচারসমূহ

### ১. লেখালেখি পেজ [BUTTON:/writings]
- ৭৮৯+ বাংলা কবিতা ও লেখার বিশাল সংগ্রহ
- ক্যাটাগরি অনুযায়ী ফিল্টার করার সুবিধা
- সার্চ করে লেখা খোঁজার সুবিধা
- প্রতিটি লেখার আলাদা শেয়ারযোগ্য লিংক
- Facebook-এ শেয়ার করার সুবিধা
- ফন্ট সাইজ বাড়ানো-কমানোর সুবিধা

### ২. ই-বুক সংগ্রহ [BUTTON:/ebooks]
- ৪টি বাংলা ই-বুক বিনামূল্যে পড়া যায়
- অনলাইন রিডার দিয়ে সরাসরি ব্রাউজারে পড়া যায়
- "আমি বিচ্ছেদকে বলি দুঃখবিলাস", "স্মৃতির বসন্তে তুমি", "চাঁদফুল", "সময়ের গহ্বরে"

### ৩. সরদার ডিজাইন স্টুডিও [BUTTON:/editor]
- কবিতা ও লেখার সুন্দর ডিজাইন কার্ড তৈরি করা যায়
- ১০০+ ব্যাকগ্রাউন্ড ডিজাইন
- বিভিন্ন বাংলা ফন্ট: আদর্শ লিপি, চন্দ্রশীলা, মাহবুব সরদার ফন্ট ইত্যাদি
- AI দিয়ে ব্যাকগ্রাউন্ড তৈরি করার সুবিধা
- ড্রয়িং টুল, টেক্সট এডিটিং, ইমেজ ডাউনলোড
- মোবাইল-ফ্রেন্ডলি ইন্টারফেস

### ৪. সরদার সংবাদ [BUTTON:/news]
- দেশ-বিদেশের সর্বশেষ খবর ও সাহিত্য সংবাদ
- তরুণ কবি ও লেখকদের পরিচিতি
- সাহিত্য আড্ডা ও বই প্রকাশের খবর

### ৫. গ্যালারি [BUTTON:/gallery]
- লেখকের বিভিন্ন অনুষ্ঠান ও ব্যক্তিগত মুহূর্তের ছবি

### ৬. Facebook আবৃত্তি [BUTTON:/facebook-recitations]
- পাঠকদের কণ্ঠে মাহবুব সরদার সবুজের কবিতার আবৃত্তি

### ৭. পরিচিতি [BUTTON:/about]
- লেখকের বিস্তারিত জীবনী ও সাহিত্যজীবন

### ৮. যোগাযোগ [BUTTON:/contact]
- সরাসরি বার্তা পাঠানোর সুবিধা
- Email: lekhokmahbubsardarsabuj@gmail.com

## গুরুত্বপূর্ণ নিয়মাবলি

### মাহবুব সরদার সবুজ সম্পর্কে প্রশ্ন
- সবসময় ওয়েবসাইটের তথ্য থেকে উত্তর দাও
- লেখার কথা বললে [BUTTON:/writings] বাটন দাও
- ই-বুকের কথা বললে [BUTTON:/ebooks] বাটন দাও
- যদি কেউ মাহবুব সরদার সবুজের ছবি চায়, [PHOTO] ট্যাগ ব্যবহার করো

### বাজে বা অসম্মানজনক প্রশ্ন ফিল্টার
যদি কেউ মাহবুব সরদার সবুজ সম্পর্কে অসম্মানজনক, মিথ্যা, বা ক্ষতিকর প্রশ্ন করে, তাহলে বিনয়ের সাথে বলো:
"এই ধরনের প্রশ্নের উত্তর দেওয়া সম্ভব নয়। আপনি যদি মাহবুব সরদার সবুজের লেখা বা ওয়েবসাইট সম্পর্কে জানতে চান, আমি সাহায্য করতে পারব।"

### সাধারণ প্রশ্নের উত্তর
- বিজ্ঞান, ইতিহাস, প্রযুক্তি, গণিত, ভাষা, সংস্কৃতি — যেকোনো বিষয়ে সাহায্য করো
- সঠিক ও নির্ভরযোগ্য তথ্য দাও
- প্রয়োজনে বিস্তারিত ব্যাখ্যা করো

### ফরম্যাটিং নিয়ম
- কখনো URL লিংক (https://...) টেক্সটে লিখবে না
- পেজের লিংক দিতে শুধু [BUTTON:/path] ট্যাগ ব্যবহার করো
- [BUTTON:/path] স্বয়ংক্রিয়ভাবে সুন্দর বাটনে পরিণত হবে
- সবসময় বাংলায় উত্তর দাও (ব্যবহারকারী ইংরেজিতে জিজ্ঞেস করলে ইংরেজিতে দাও)
- উত্তর স্পষ্ট ও সহজবোধ্য রাখো
`;

export const chatRouter = router({
  send: publicProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: CHAT_SYSTEM_PROMPT },
            ...input.messages.map(m => ({
              role: m.role as "user" | "assistant",
              content: m.content
            })),
          ],
        });

        const content = response.choices[0]?.message?.content;
        const reply = typeof content === "string" ? content : "দুঃখিত, উত্তর দিতে পারছি না।";

        return { reply };
      } catch (error: any) {
        console.error("Chat LLM error:", error);
        return { reply: "দুঃখিত, এই মুহূর্তে চ্যাটবটটি কাজ করছে না। অনুগ্রহ করে পরে চেষ্টা করুন।" };
      }
    }),

  // ── AI Background Image Generation — actual image via Forge ──────────────────
  generateAiBackground: publicProcedure
    .input(
      z.object({
        prompt: z.string().min(2).max(500),
      })
    )
    .mutation(async ({ input }) => {
      const client = getOpenAIClient();
      const translateResponse = await client.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: `You are a prompt translator for AI image generation. 
Convert the user's Bengali or English description into a detailed, vivid English image generation prompt.
Make it suitable for a beautiful background image for a Bengali poetry card.
Return ONLY the English prompt, nothing else. No explanation, no quotes.
Make it descriptive and artistic. Include lighting, mood, atmosphere.`,
          },
          { role: "user", content: input.prompt },
        ],
        max_tokens: 150,
        temperature: 0.7,
      });

      const englishPrompt = translateResponse.choices[0]?.message?.content?.trim() || input.prompt;

      const { url } = await generateImage({
        prompt: `${englishPrompt}, suitable as background for text overlay, artistic, high quality, 4k`,
      });

      return {
        imageUrl: url || null,
        description: input.prompt,
      };
    }),

  // ── AI Background Generation — CSS Gradient via GPT (fallback) ───────────────
  generateBackground: publicProcedure
    .input(
      z.object({
        prompt: z.string().min(2).max(500),
      })
    )
    .mutation(async ({ input }) => {
      const client = getOpenAIClient();
      const response = await client.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert CSS background designer for Bengali poetry cards. 
Given a Bengali or English description, create a beautiful CSS background.

Return a JSON object with EXACTLY this structure (no markdown, no explanation):
{
  "type": "gradient",
  "css": "the CSS background value here",
  "description": "short Bengali description"
}

Rules for the CSS value:
- Use linear-gradient, radial-gradient, or multi-stop gradients
- Use beautiful, artistic color combinations that match the theme
- Make it suitable for text overlay (not too bright, not too dark)
- Can combine multiple gradients with comma separation`,
          },
          { role: "user", content: input.prompt },
        ],
        max_tokens: 300,
        temperature: 0.8,
      });

      const raw = response.choices[0]?.message?.content?.trim() || "{}";

      let result: { type: string; css: string; description: string };
      try {
        const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        result = JSON.parse(cleaned);
      } catch {
        const p = input.prompt.toLowerCase();
        let css = "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)";
        if (p.includes("রাত") || p.includes("night") || p.includes("আকাশ")) {
          css = "linear-gradient(180deg, #0a0a2e 0%, #1a1a4e 40%, #0d2137 70%, #1a0533 100%)";
        } else if (p.includes("সূর্য") || p.includes("sunset") || p.includes("সন্ধ্যা")) {
          css = "linear-gradient(180deg, #ff6b35 0%, #f7931e 35%, #ffcd3c 65%, #c9184a 100%)";
        } else if (p.includes("বাগান") || p.includes("garden") || p.includes("ফুল")) {
          css = "linear-gradient(135deg, #1a472a 0%, #2d6a4f 40%, #52b788 75%, #95d5b2 100%)";
        } else if (p.includes("সমুদ্র") || p.includes("ocean") || p.includes("নদী")) {
          css = "linear-gradient(180deg, #03045e 0%, #0077b6 40%, #00b4d8 70%, #90e0ef 100%)";
        } else if (p.includes("ভালোবাসা") || p.includes("love") || p.includes("প্রেম")) {
          css = "radial-gradient(ellipse at top, #ff006e 0%, #8338ec 50%, #3a0ca3 100%)";
        } else if (p.includes("সোনা") || p.includes("gold") || p.includes("আলো")) {
          css = "linear-gradient(135deg, #1a0a00 0%, #3d1f00 40%, #7a4000 70%, #d4a843 100%)";
        }
        result = { type: "gradient", css, description: input.prompt };
      }

      return {
        css: result.css || "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        description: result.description || input.prompt,
        type: "gradient",
      };
    }),
});
