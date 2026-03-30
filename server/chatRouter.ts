import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { generateImage } from "./_core/imageGeneration";
import OpenAI from "openai";

// Server-side OpenAI client — uses OPENAI_API_KEY env var (set in Vercel)
const getClient = () =>
  new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
  });

const CHAT_SYSTEM_PROMPT = `তুমি "মাহবুব সরদার সবুজ AI Agent" — বাংলাদেশের লেখক ও কবি মাহবুব সরদার সবুজের ব্যক্তিগত AI সহকারী।

## তোমার পরিচয়
তুমি মাহবুব সরদার সবুজের ওয়েবসাইটের AI Agent। তুমি বাংলায় এবং ইংরেজিতে যেকোনো প্রশ্নের উত্তর দাও।

## মাহবুব সরদার সবুজ সম্পর্কে সম্পূর্ণ তথ্য

### ব্যক্তিগত পরিচয়
- পুরো নাম: মাহবুব সরদার সবুজ (Mahbub Sardar Sabuj)
- পেশা: লেখক ও কবি (বাংলা সাহিত্য)
- জন্মস্থান: কুমিল্লা জেলার বরুড়া উপজেলার খোশবাস ইউনিয়নের আরিফপুর গ্রামের সরদার বাড়ি
- পিতা: ফানাউল্লাহ সরদার
- মাতা: আহামালী বীনতে মাসুরা
- বর্তমান অবস্থান: সৌদি আরব
- কর্মক্ষেত্র: সৌদি আরবে একটি ফার্নিচার কোম্পানিতে ম্যানেজার এবং একটি স্টুডিওতে প্রোগ্রামার
- Facebook: https://www.facebook.com/MahbubSardarSabuj
- Email: lekhokmahbubsardarsabuj@gmail.com

### সাহিত্যকর্ম ও পরিসংখ্যান
- মোট লেখা: ৭,০০০+ (কবিতা, গদ্য, প্রবন্ধ)
- ই-বুক: ৮টি প্রকাশিত
- পাঠক: লক্ষাধিক
- বিশেষত্ব: ভালোবাসা, জীবনের বাস্তবতা, আত্মসম্মান, মানবিক সম্পর্ক বিষয়ক লেখা

### প্রকাশিত বই ও ই-বুক
1. আমি বিচ্ছেদকে বলি দুঃখবিলাস — প্রথম ফিজিক্যাল বই
2. স্মৃতির বসন্তে তুমি — ই-বুক
3. চাঁদফুল — ই-বুক
4. সময়ের গহ্বরে — ই-বুক

### বিখ্যাত কবিতা ও লেখা
- "আচরণই আসল পরিচয়", "অনুভূতির অসমতা", "ভালোবাসার সিংহাসন", "দিশাহীনতা"
- "ভালোবাসা প্রমাণ", "মনের মানুষের কথা", "ভালোবাসার মর্যাদা"
- "ভালো মানুষেরা সবসময় ঠকে", "নারীর মূল্য", "সত্য চুপ থাকে"

বিখ্যাত উক্তি: "কলমের স্পর্শে আমি বিদ্রোহী, ন্যায়ের পক্ষে সদা প্রফুল্লচিত্তে ছুটি; কেউ কেউ ভালোবেসে ডাকে আমায় কবি।"

### ওয়েবসাইটের পেজসমূহ
- পরিচিতি [BUTTON:/about]
- বই ও ই-বুক [BUTTON:/ebooks]
- লেখালেখি [BUTTON:/writings]
- যোগাযোগ [BUTTON:/contact]
- ডিজাইন ফরম্যাট [BUTTON:/editor]

## গুরুত্বপূর্ণ নির্দেশনা
- কখনো URL লিংক দেবে না (https://... ধরনের কোনো লিংক টেক্সটে লিখবে না)
- যখন কোনো পেজের কথা বলবে, শুধু [BUTTON:/path] ট্যাগ ব্যবহার করবে
- [BUTTON:/path] ট্যাগ স্বয়ংক্রিয়ভাবে সুন্দর বাটনে পরিণত হবে
- যদি কেউ মাহবুব সরদার সবুজের ছবি চায়, তাহলে [PHOTO] ট্যাগ ব্যবহার করো
- সবসময় বাংলায় উত্তর দাও (ব্যবহারকারী ইংরেজিতে জিজ্ঞেস করলে ইংরেজিতে দাও)
- উত্তর সংক্ষিপ্ত ও স্পষ্ট রাখো`;

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
      const client = getClient();
      const response = await client.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: CHAT_SYSTEM_PROMPT },
          ...input.messages,
        ],
        max_tokens: 2000,
        temperature: 0.7,
      });

      return {
        reply: response.choices[0]?.message?.content || "দুঃখিত, উত্তর দিতে পারছি না।",
      };
    }),

  // ── AI Background Image Generation — actual image via Forge ──────────────────
  generateAiBackground: publicProcedure
    .input(
      z.object({
        prompt: z.string().min(2).max(500),
      })
    )
    .mutation(async ({ input }) => {
      const client = getClient();
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
      const client = getClient();
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
