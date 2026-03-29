import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || "https://openrouter.ai/api/v1",
});

// Translate Bengali prompt to English for image generation
async function translateToEnglish(bengaliPrompt: string): Promise<string> {
  const res = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a translator. Translate the given Bengali text to English. Return ONLY the English translation, nothing else. Make it suitable as an image generation prompt — descriptive, artistic, and vivid.",
      },
      { role: "user", content: bengaliPrompt },
    ],
    max_tokens: 200,
    temperature: 0.3,
  });
  return res.choices[0]?.message?.content?.trim() || bengaliPrompt;
}

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
            content:
              "তুমি একটি বুদ্ধিমান AI সহকারী। তুমি বাংলায় এবং ইংরেজিতে যেকোনো প্রশ্নের উত্তর দিতে পারো। তুমি সাহিত্য, কবিতা, গল্প, বিজ্ঞান, ইতিহাস, প্রযুক্তি সহ সব বিষয়ে সাহায্য করো। তুমি মাহবুব সরদার সবুজের ওয়েবসাইটের AI সহকারী। তোমার নাম 'সবুজ AI'।",
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

  // ── AI Background Image Generation ──────────────────────────────────────────
  generateBackground: publicProcedure
    .input(
      z.object({
        prompt: z.string().min(2).max(500),
      })
    )
    .mutation(async ({ input }) => {
      // Translate Bengali prompt to English
      const englishPrompt = await translateToEnglish(input.prompt);

      // Build artistic prompt for background card design
      const finalPrompt = `Beautiful artistic background for a poetry card: ${englishPrompt}. Aesthetic, painterly, soft colors, no text, no people, high quality digital art, suitable for text overlay.`;

      // Use Pollinations.ai — free, no API key needed, returns image URL
      const encodedPrompt = encodeURIComponent(finalPrompt);
      const seed = Math.floor(Math.random() * 999999);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1080&height=1080&seed=${seed}&nologo=true&enhance=true`;

      return {
        imageUrl,
        englishPrompt,
      };
    }),
});
