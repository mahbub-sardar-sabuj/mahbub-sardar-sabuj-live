import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import OpenAI from "openai";

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
});
