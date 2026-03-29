import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import OpenAI from "openai";
import { generateImage } from "./_core/imageGeneration";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || "https://openrouter.ai/api/v1",
});

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
      const response = await client.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: `তুমি মাহবুব সরদার সবুজের ব্যক্তিগত AI সহকারী। তুমি বাংলায় কথা বলো।

মাহবুব সরদার সবুজ সম্পর্কে তথ্য:
- তিনি একজন বাংলাদেশী লেখক ও কবি
- তার প্রকাশিত বই: "আমি বিচ্ছেদকে বিল দুঃখবিলাস" (প্রথম ফিজিক্যাল বই)
- ই-বুক: "স্মৃতির বসন্তে তুমি", "চাঁদফুল", "সমেয়র গহুরে"
- তিনি ভালোবাসা, জীবনের বাস্তবতা, আত্মসম্মান ও মানবিক সম্পর্কের বিষয়ে লেখেন
- ওয়েবসাইট: mahbub-sardar-sabuj-live.vercel.app

গুরুত্বপূর্ণ নিয়ম:
- কখনো URL বা লিংক দেবে না
- পরিবর্তে [BUTTON:/path|বাটন টেক্সট] ফরম্যাট ব্যবহার করো
- উদাহরণ: [BUTTON:/about|পরিচিতি পেজ দেখুন]
- উদাহরণ: [BUTTON:/ebooks|ই-বুক সংগ্রহ দেখুন]
- উদাহরণ: [BUTTON:/writings|লেখালেখি দেখুন]
- উদাহরণ: [BUTTON:/gallery|গ্যালারি দেখুন]
- উদাহরণ: [BUTTON:/contact|যোগাযোগ করুন]

যদি কেউ লেখকের ছবি চায়: [PHOTO] ট্যাগ ব্যবহার করো।`,
          },
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
      // First, translate Bengali prompt to English using GPT for better image generation
      const translateResponse = await client.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: `You are a prompt translator for AI image generation. 
Convert the user's Bengali or English description into a detailed, vivid English image generation prompt.
Make it suitable for a beautiful background image for a Bengali poetry card.
Return ONLY the English prompt, nothing else. No explanation, no quotes.
Make it descriptive and artistic. Include lighting, mood, atmosphere.
Examples:
- "আকাশের ছবি" → "Beautiful blue sky with soft white clouds, golden sunlight, serene atmosphere, photorealistic, high quality"
- "রাতের আকাশ" → "Stunning night sky filled with stars and milky way, deep blue and purple tones, moonlight, dreamy atmosphere"
- "সমুদ্রের ছবি" → "Breathtaking ocean view with turquoise waves, golden beach, sunset light reflecting on water, peaceful and majestic"
- "বাগানের ছবি" → "Lush green garden with colorful flowers in bloom, morning dew, soft sunlight filtering through leaves, vibrant and serene"
- "ভালোবাসার ছবি" → "Romantic rose petals scattered on soft fabric, warm pink and red tones, bokeh background, dreamy and tender atmosphere"`,
          },
          {
            role: "user",
            content: input.prompt,
          },
        ],
        max_tokens: 150,
        temperature: 0.7,
      });

      const englishPrompt = translateResponse.choices[0]?.message?.content?.trim() || input.prompt;
      
      // Generate the actual image
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
- Can combine multiple gradients with comma separation
- Examples of good gradients:
  - Night sky: "linear-gradient(135deg, #0a0a2e 0%, #1a1a4e 40%, #0d2137 100%)"
  - Sunset: "linear-gradient(180deg, #ff6b35 0%, #f7931e 30%, #ffcd3c 60%, #c9184a 100%)"
  - Garden: "linear-gradient(135deg, #1a472a 0%, #2d6a4f 40%, #52b788 70%, #95d5b2 100%)"
  - Ocean: "linear-gradient(180deg, #03045e 0%, #0077b6 40%, #00b4d8 70%, #90e0ef 100%)"
  - Rose: "radial-gradient(ellipse at top, #ff006e 0%, #8338ec 50%, #3a0ca3 100%)"`,
          },
          {
            role: "user",
            content: input.prompt,
          },
        ],
        max_tokens: 300,
        temperature: 0.8,
      });

      const raw = response.choices[0]?.message?.content?.trim() || "{}";
      
      // Parse the JSON response
      let result: { type: string; css: string; description: string };
      try {
        // Remove markdown code blocks if present
        const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        result = JSON.parse(cleaned);
      } catch {
        // Fallback: generate a default gradient based on keywords
        const prompt = input.prompt.toLowerCase();
        let css = "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)";
        
        if (prompt.includes("রাত") || prompt.includes("night") || prompt.includes("আকাশ")) {
          css = "linear-gradient(180deg, #0a0a2e 0%, #1a1a4e 40%, #0d2137 70%, #1a0533 100%)";
        } else if (prompt.includes("সূর্য") || prompt.includes("sunset") || prompt.includes("সন্ধ্যা")) {
          css = "linear-gradient(180deg, #ff6b35 0%, #f7931e 35%, #ffcd3c 65%, #c9184a 100%)";
        } else if (prompt.includes("বাগান") || prompt.includes("garden") || prompt.includes("ফুল")) {
          css = "linear-gradient(135deg, #1a472a 0%, #2d6a4f 40%, #52b788 75%, #95d5b2 100%)";
        } else if (prompt.includes("সমুদ্র") || prompt.includes("ocean") || prompt.includes("নদী")) {
          css = "linear-gradient(180deg, #03045e 0%, #0077b6 40%, #00b4d8 70%, #90e0ef 100%)";
        } else if (prompt.includes("ভালোবাসা") || prompt.includes("love") || prompt.includes("প্রেম")) {
          css = "radial-gradient(ellipse at top, #ff006e 0%, #8338ec 50%, #3a0ca3 100%)";
        } else if (prompt.includes("সোনা") || prompt.includes("gold") || prompt.includes("আলো")) {
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
