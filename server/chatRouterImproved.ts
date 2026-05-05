import { router, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import { getOpenAIClient } from "./_core/openai";
import { generateImage } from "./_core/generateImage";
import { validateAndSanitizeInput, createSecureSystemPrompt } from "./_core/promptSecurity";

// সিস্টেম প্রম্পট (নিরাপদ সংস্করণ)
const CHAT_SYSTEM_PROMPT = createSecureSystemPrompt(`তুমি "মাহবুব সরদার সবুজ AI Agent" — বাংলাদেশের লেখক ও কবি মাহবুব সরদার সবুজের ব্যক্তিগত, বুদ্ধিমান AI সহকারী।

## তোমার পরিচয় ও ব্যক্তিত্ব
তুমি মাহবুব সরদার সবুজের ওয়েবসাইটের AI Agent। তুমি উষ্ণ, ধৈর্যশীল, বুদ্ধিমান এবং সত্যিকারের সহায়ক।

তোমার স্বভাব:
- তুমি কখনো ব্যবহারকারীকে হতাশ করো না — সমস্যার সমাধান খোঁজো
- তুমি প্রশ্ন বুঝে উত্তর দাও — শুধু কীওয়ার্ড ধরে নয়
- তুমি ছোট প্রশ্নে সংক্ষিপ্ত, জটিল প্রশ্নে বিস্তারিত উত্তর দাও
- তুমি ভুল স্বীকার করো, কিন্তু অনুমান করে ভুল তথ্য দাও না

## ভাষা ও যোগাযোগের নিয়ম
- সবসময় শুদ্ধ ও নির্ভুল বাংলা বানান ব্যবহার করবে
- ভদ্র ও সম্মানজনক ভাষায় কথা বলবে
- সহজ, পরিষ্কার ও প্রাঞ্জল বাংলায় উত্তর দেবে
- অপ্রয়োজনীয় ইমোজি বা বিশেষ চিহ্ন ব্যবহার করবে না`);

// এরর ক্লাস
class ChatError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public isRetryable: boolean = false
  ) {
    super(message);
  }
}

// রিট্রাই লজিক সহ এপিআই কল
async function callAIWithRetry(
  client: any,
  messages: any[],
  maxRetries: number = 3,
  timeout: number = 30000
): Promise<string> {
  let lastError: ChatError | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await Promise.race([
        client.chat.completions.create({
          model: "gpt-4.1-mini",
          messages,
          temperature: 0.7,
          max_tokens: 1000,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Request timeout")), timeout)
        ),
      ]);

      clearTimeout(timeoutId);

      const content = response.choices[0]?.message?.content;
      if (typeof content === "string") {
        return content;
      }

      throw new ChatError(
        "INVALID_RESPONSE",
        "এআই থেকে বৈধ উত্তর পাওয়া যায়নি।",
        500,
        true
      );
    } catch (error: any) {
      if (error instanceof ChatError) {
        lastError = error;
      } else if (error?.name === "AbortError" || error?.message?.includes("timeout")) {
        lastError = new ChatError(
          "TIMEOUT",
          `প্রচেষ্টা ${attempt}/${maxRetries}: চ্যাটবট সাড়া দিতে অনেক সময় নিচ্ছে।`,
          504,
          true
        );
      } else if (error?.status === 429) {
        lastError = new ChatError(
          "RATE_LIMIT",
          `প্রচেষ্টা ${attempt}/${maxRetries}: অনেক বেশি অনুরোধ পাঠানো হয়েছে।`,
          429,
          true
        );
      } else if (error?.status === 401 || error?.status === 403) {
        lastError = new ChatError(
          "AUTH_ERROR",
          "এপিআই কী অবৈধ বা মেয়াদ উত্তীর্ণ।",
          401,
          false
        );
      } else if (error?.status === 500 || error?.status === 502 || error?.status === 503) {
        lastError = new ChatError(
          "SERVER_ERROR",
          `প্রচেষ্টা ${attempt}/${maxRetries}: এআই সার্ভার অনুপলব্ধ।`,
          503,
          true
        );
      } else {
        lastError = new ChatError(
          "UNKNOWN_ERROR",
          `প্রচেষ্টা ${attempt}/${maxRetries}: ${error?.message || "অজানা ত্রুটি"}`,
          500,
          true
        );
      }

      if (!lastError.isRetryable || attempt === maxRetries) {
        break;
      }

      // এক্সপোনেনশিয়াল ব্যাকঅফ
      const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError || new ChatError("UNKNOWN_ERROR", "সকল প্রচেষ্টা ব্যর্থ হয়েছে।", 500, false);
}

export const chatRouter = router({
  // ── চ্যাট মেসেজ এপিআই ──────────────────────────────────
  sendMessage: publicProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string().min(1).max(5000),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // ইনপুট ভ্যালিডেশন এবং স্যানিটাইজেশন
        const lastUserMessage = input.messages
          .filter((m) => m.role === "user")
          .pop();

        if (!lastUserMessage) {
          throw new ChatError(
            "NO_USER_MESSAGE",
            "কোনো ব্যবহারকারীর বার্তা পাওয়া যায়নি।",
            400,
            false
          );
        }

        const { isValid, sanitized, warning } = validateAndSanitizeInput(
          lastUserMessage.content
        );

        if (!isValid) {
          throw new ChatError(
            "INVALID_INPUT",
            "ইনপুট বৈধ নয়। অনুগ্রহ করে আপনার বার্তা পরীক্ষা করুন।",
            400,
            false
          );
        }

        // এআই কল করুন
        const client = getOpenAIClient();
        const messages = [
          { role: "system" as const, content: CHAT_SYSTEM_PROMPT },
          ...input.messages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.role === "user" ? sanitized : m.content,
          })),
        ];

        const reply = await callAIWithRetry(client, messages);

        return {
          reply,
          warning: warning ? `⚠️ ${warning}` : undefined,
        };
      } catch (error: any) {
        console.error("Chat error:", error);

        if (error instanceof ChatError) {
          return {
            reply: `দুঃখিত, একটি ত্রুটি ঘটেছে।\n\n${error.message}\n\n💡 পরামর্শ: আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন এবং আবার চেষ্টা করুন।`,
            error: error.code,
          };
        }

        return {
          reply: "দুঃখিত, এই মুহূর্তে চ্যাটবটটি কাজ করছে না। অনুগ্রহ করে পরে চেষ্টা করুন।",
          error: "UNKNOWN_ERROR",
        };
      }
    }),

  // ── এআই ব্যাকগ্রাউন্ড ইমেজ জেনারেশন ──────────────────────
  generateAiBackground: publicProcedure
    .input(
      z.object({
        prompt: z.string().min(2).max(500),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { sanitized } = validateAndSanitizeInput(input.prompt);

        const client = getOpenAIClient();
        const translateResponse = await client.chat.completions.create({
          model: "gpt-4.1-mini",
          messages: [
            {
              role: "system",
              content: `আপনি একটি এআই ইমেজ জেনারেশন প্রম্পট অনুবাদক। ব্যবহারকারীর বাংলা বা ইংরেজি বর্ণনাকে একটি বিস্তারিত, প্রাণবন্ত ইংরেজি ইমেজ জেনারেশন প্রম্পটে রূপান্তরিত করুন। এটি একটি বাংলা কবিতা কার্ডের জন্য সুন্দর ব্যাকগ্রাউন্ড ইমেজের জন্য উপযুক্ত হওয়া উচিত। শুধুমাত্র ইংরেজি প্রম্পট ফেরত দিন, অন্য কিছু নয়। কোনো ব্যাখ্যা বা উদ্ধৃতি নেই। এটি বর্ণনামূলক এবং শৈল্পিক করুন। আলোকসজ্জা, মেজাজ, পরিবেশ অন্তর্ভুক্ত করুন।`,
            },
            { role: "user", content: sanitized },
          ],
          max_tokens: 150,
          temperature: 0.7,
        });

        const englishPrompt =
          translateResponse.choices[0]?.message?.content?.trim() || sanitized;

        const { url } = await generateImage({
          prompt: `${englishPrompt}, suitable as background for text overlay, artistic, high quality, 4k`,
        });

        return {
          imageUrl: url || null,
          description: input.prompt,
        };
      } catch (error: any) {
        console.error("Image generation error:", error);
        return {
          imageUrl: null,
          description: input.prompt,
          error: "ইমেজ জেনারেশন ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
        };
      }
    }),

  // ── এআই ব্যাকগ্রাউন্ড জেনারেশন (CSS গ্রেডিয়েন্ট ফলব্যাক) ────
  generateBackground: publicProcedure
    .input(
      z.object({
        prompt: z.string().min(2).max(500),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { sanitized } = validateAndSanitizeInput(input.prompt);

        const client = getOpenAIClient();
        const response = await client.chat.completions.create({
          model: "gpt-4.1-mini",
          messages: [
            {
              role: "system",
              content: `আপনি বাংলা কবিতা কার্ডের জন্য একজন বিশেষজ্ঞ CSS ব্যাকগ্রাউন্ড ডিজাইনার। একটি বাংলা বা ইংরেজি বর্ণনা দেওয়া হলে, একটি সুন্দর CSS ব্যাকগ্রাউন্ড তৈরি করুন। এই JSON অবজেক্টটি ফেরত দিন (মার্কডাউন বা ব্যাখ্যা ছাড়াই):
{
  "type": "gradient",
  "css": "এখানে CSS ব্যাকগ্রাউন্ড মান",
  "description": "সংক্ষিপ্ত বাংলা বর্ণনা"
}

CSS মানের জন্য নিয়ম:
- linear-gradient, radial-gradient বা মাল্টি-স্টপ গ্রেডিয়েন্ট ব্যবহার করুন
- থিমের সাথে মেলে এমন সুন্দর, শৈল্পিক রঙের সমন্বয় ব্যবহার করুন
- টেক্সট ওভারলে-র জন্য উপযুক্ত করুন (খুব উজ্জ্বল বা খুব অন্ধকার নয়)
- একাধিক গ্রেডিয়েন্ট কমা দিয়ে একত্রিত করতে পারেন`,
            },
            { role: "user", content: sanitized },
          ],
          max_tokens: 300,
          temperature: 0.8,
        });

        const raw = response.choices[0]?.message?.content?.trim() || "{}";

        try {
          const cleaned = raw
            .replace(/```json\n?/g, "")
            .replace(/```\n?/g, "")
            .trim();
          const result = JSON.parse(cleaned);

          return {
            css:
              result.css ||
              "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
            description: result.description || input.prompt,
            type: "gradient",
          };
        } catch {
          // ফলব্যাক: থিম-ভিত্তিক ডিফল্ট গ্রেডিয়েন্ট
          const p = sanitized.toLowerCase();
          let css = "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)";

          if (p.includes("রাত") || p.includes("night") || p.includes("আকাশ")) {
            css =
              "linear-gradient(180deg, #0a0a2e 0%, #1a1a4e 40%, #0d2137 70%, #1a0533 100%)";
          } else if (p.includes("সূর্য") || p.includes("sunset") || p.includes("সন্ধ্যা")) {
            css =
              "linear-gradient(180deg, #ff6b35 0%, #f7931e 35%, #ffcd3c 65%, #c9184a 100%)";
          } else if (p.includes("বাগান") || p.includes("garden") || p.includes("ফুল")) {
            css =
              "linear-gradient(135deg, #1a472a 0%, #2d6a4f 40%, #52b788 75%, #95d5b2 100%)";
          } else if (p.includes("সমুদ্র") || p.includes("ocean") || p.includes("নদী")) {
            css =
              "linear-gradient(180deg, #03045e 0%, #0077b6 40%, #00b4d8 70%, #90e0ef 100%)";
          } else if (p.includes("ভালোবাসা") || p.includes("love") || p.includes("প্রেম")) {
            css = "radial-gradient(ellipse at top, #ff006e 0%, #8338ec 50%, #3a0ca3 100%)";
          } else if (p.includes("সোনা") || p.includes("gold") || p.includes("আলো")) {
            css =
              "linear-gradient(135deg, #1a0a00 0%, #3d1f00 40%, #7a4000 70%, #d4a843 100%)";
          }

          return {
            css,
            description: input.prompt,
            type: "gradient",
          };
        }
      } catch (error: any) {
        console.error("Background generation error:", error);
        return {
          css: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          description: input.prompt,
          type: "gradient",
          error: "ব্যাকগ্রাউন্ড জেনারেশন ব্যর্থ হয়েছে। ডিফল্ট ব্যাকগ্রাউন্ড ব্যবহার করা হচ্ছে।",
        };
      }
    }),
});
