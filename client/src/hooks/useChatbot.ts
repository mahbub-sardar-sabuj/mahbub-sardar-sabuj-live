// client/src/hooks/useChatbot.ts
// Custom hook for chatbot state management with Session Memory
import { useState, useRef, useCallback } from "react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  imageUrl?: string;
  userAudioName?: string;
  userAudioSize?: number;
  userAudioMime?: string;
  userAudioUrl?: string;
  userAudioInstruction?: string;
  audioUrl?: string;
  audioFilename?: string;
  audioDescription?: string;
  audioAppliedSteps?: string[];
  audioIntent?: string;
  audioPipeline?: string[];
  audioTechnicalNote?: string;
  audioVocalContext?: string;
  processingVersion?: string;
  operationsApplied?: string[];
  outputSizeKB?: number;
  isCopied?: boolean;
  reaction?: "up" | "down" | null;
  // Streaming support
  isStreaming?: boolean;
}

export type AIMessageContent =
  | string
  | { type: "text"; text: string }[]
  | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }>;

// ── Session Memory: remembers context within the current browser session ──────
// Stores lightweight topic context so the chatbot can resolve pronouns like "এটি"
interface SessionContext {
  lastTopic?: string;      // e.g., "book:dukkhovilash"
  lastTopicLabel?: string; // e.g., "আমি বিচ্ছেদকে বলি দুঃখবিলাস"
  lastIntent?: string;     // e.g., "book", "author", "writing"
  turnCount: number;
}

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: `আস্সালামু আলাইকুম! আমি মাহবুব সরদার সবুজ AI Agent—আপনার সাধারণ AI সহকারী, ওয়েবসাইট গাইড, ভিশন সহায়ক ও অডিও স্টুডিও।

আপনি যে কোনো প্রশ্ন করতে পারেন, ছবি/অডিও/ভিডিও দিতে পারেন, বই-লেখা-আবৃত্তি খুঁজতে পারেন বা সরাসরি লাইভ সাপোর্ট নিতে পারেন।`,
  timestamp: new Date(),
};

// ── Streaming AI call ──────────────────────────────────────────────────────────
async function callAIStreaming(
  messages: { role: "user" | "assistant" | "system"; content: AIMessageContent }[],
  onDelta: (delta: string) => void,
  onDone: (fullReply: string) => void,
  onError: (err: string) => void
): Promise<void> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 50000);

  try {
    const res = await fetch("/api/chat-stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      // Fallback to non-streaming
      const data = await res.json().catch(() => ({}));
      onError(data?.error || "সংযোগে সমস্যা হয়েছে।");
      return;
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let fullReply = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;

        try {
          const json = JSON.parse(trimmed.slice(6));
          if (json.error) {
            onError(json.error);
            return;
          }
          if (json.delta) {
            fullReply += json.delta;
            onDelta(json.delta);
          }
          if (json.done) {
            onDone(json.fullReply || fullReply);
            return;
          }
        } catch {
          // skip malformed chunk
        }
      }
    }

    // If stream ended without explicit done
    if (fullReply) onDone(fullReply);
    else onError("উত্তর পাওয়া যায়নি।");

  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err?.name === "AbortError") {
      onError("উত্তর পেতে বেশি সময় লাগছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } else {
      // Fallback to non-streaming chat API
      try {
        const fallbackRes = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages }),
        });
        const data = await fallbackRes.json();
        if (data.reply) onDone(data.reply);
        else onError("সংযোগে সমস্যা হয়েছে।");
      } catch {
        onError("ইন্টারনেট সংযোগ পরীক্ষা করুন এবং আবার চেষ্টা করুন।");
      }
    }
  }
}

// ── Session Memory helpers ─────────────────────────────────────────────────────
function updateSessionContext(
  ctx: SessionContext,
  userText: string,
  aiReply: string
): SessionContext {
  const newCtx = { ...ctx, turnCount: ctx.turnCount + 1 };

  // Detect book mentions
  const bookPatterns: [RegExp, string, string][] = [
    [/দুঃখবিলাস|dukkhovilash/i, "book:dukkhovilash", "আমি বিচ্ছেদকে বলি দুঃখবিলাস"],
    [/স্মৃতির বসন্তে|smritir/i, "book:smritir-boshonte", "স্মৃতির বসন্তে তুমি"],
    [/চাঁদফুল|chand.phool/i, "book:chand-phool", "চাঁদফুল"],
    [/সময়ের গহ্বরে|shomoyer/i, "book:shomoyer-gohvore", "সময়ের গহ্বরে"],
    [/অনবদ্য|onoboddo/i, "book:onoboddo-lekha", "অনবদ্য লেখা"],
  ];

  for (const [pattern, topic, label] of bookPatterns) {
    if (pattern.test(userText) || pattern.test(aiReply)) {
      newCtx.lastTopic = topic;
      newCtx.lastTopicLabel = label;
      newCtx.lastIntent = "book";
      return newCtx;
    }
  }

  // Detect author intent
  if (/মাহবুব|সবুজ|লেখক|কবি|পরিচয়/i.test(userText)) {
    newCtx.lastIntent = "author";
  }

  // Detect writing intent
  if (/লেখা|কবিতা|writings|বিচ্ছেদ|ভালোবাসা/i.test(userText)) {
    newCtx.lastIntent = "writing";
  }

  return newCtx;
}

// Resolve pronouns like "এটি", "এটা", "এই বইটি" using session context
function resolvePronouns(text: string, ctx: SessionContext): string {
  if (!ctx.lastTopicLabel) return text;

  const pronounPattern = /^(এটি|এটা|এই বইটি|এই বইটা|এটার|এটির|সেটি|সেটা|ওটি|ওটা)\s/;
  if (pronounPattern.test(text.trim())) {
    return text.replace(pronounPattern, `${ctx.lastTopicLabel} `);
  }
  return text;
}

// ── Main hook ──────────────────────────────────────────────────────────────────
export function useChatbot() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isAudioMode, setIsAudioMode] = useState(false);
  const [audioProcessing, setAudioProcessing] = useState(false);
  const [audioProcessingStage, setAudioProcessingStage] = useState<string | null>(null);

  const sessionContextRef = useRef<SessionContext>({ turnCount: 0 });
  const retryPayloadRef = useRef<{ role: "user" | "assistant" | "system"; content: AIMessageContent }[] | null>(null);
  const lastAudioBlobRef = useRef<{ blob: Blob; name: string } | null>(null);

  const clearChat = useCallback(() => {
    setMessages([{
      ...WELCOME_MESSAGE,
      id: `welcome-${Date.now()}`,
      content: "নতুন কথোপকথন শুরু হয়েছে। আপনি লেখক, বই, ই-বুক, আবৃত্তি, লেখা, যোগাযোগ বা অডিও এডিট সম্পর্কে জিজ্ঞেস করতে পারেন।",
      timestamp: new Date(),
    }]);
    setError(null);
    setInput("");
    setImagePreview(null);
    setAudioFile(null);
    setIsAudioMode(false);
    sessionContextRef.current = { turnCount: 0 };
  }, []);

  const handleReact = useCallback((msgId: string, reaction: "up" | "down") => {
    setMessages(prev => prev.map(m =>
      m.id === msgId
        ? { ...m, reaction: m.reaction === reaction ? null : reaction }
        : m
    ));
  }, []);

  // ── Send message with streaming ──────────────────────────────────────────────
  const sendMessage = useCallback(async (
    text: string,
    imgPreview?: string | null
  ) => {
    if ((!text.trim() && !imgPreview) || isLoading) return;

    const resolvedText = resolvePronouns(text.trim(), sessionContextRef.current);

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: resolvedText || "দয়া করে এই ছবিটি বিশ্লেষণ করুন।",
      timestamp: new Date(),
      imageUrl: imgPreview || undefined,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setImagePreview(null);
    setIsLoading(true);
    setError(null);

    // Build clean history for AI
    const cleanHistory = messages
      .filter(m => m.role === "user" || m.role === "assistant")
      .filter(m => {
        const c = typeof m.content === "string" ? m.content : "";
        if (c.startsWith("[PHOTO]") || c === "[CONTACT]" || c.startsWith("[LIVE_CHAT]")) return false;
        if (m.audioUrl) return false;
        return true;
      })
      .map(m => ({ role: m.role as "user" | "assistant", content: m.content }));

    const userContent: AIMessageContent = imgPreview
      ? [
          ...(resolvedText ? [{ type: "text" as const, text: resolvedText }] : [{ type: "text" as const, text: "দয়া করে এই ছবিটি বিশ্লেষণ করুন।" }]),
          { type: "image_url" as const, image_url: { url: imgPreview } },
        ]
      : resolvedText;

    const payload = [
      ...cleanHistory,
      { role: "user" as const, content: userContent },
    ];

    retryPayloadRef.current = payload;

    // Create a placeholder streaming message
    const streamMsgId = `ai-stream-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: streamMsgId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    }]);

    await callAIStreaming(
      payload,
      // onDelta: update streaming message in real-time
      (delta) => {
        setMessages(prev => prev.map(m =>
          m.id === streamMsgId
            ? { ...m, content: m.content + delta }
            : m
        ));
      },
      // onDone: finalize message
      (fullReply) => {
        setMessages(prev => prev.map(m =>
          m.id === streamMsgId
            ? { ...m, content: fullReply, isStreaming: false }
            : m
        ));
        // Update session context
        sessionContextRef.current = updateSessionContext(
          sessionContextRef.current,
          resolvedText,
          fullReply
        );
        setIsLoading(false);
      },
      // onError
      (errMsg) => {
        setMessages(prev => prev.filter(m => m.id !== streamMsgId));
        setError(errMsg);
        setIsLoading(false);
      }
    );
  }, [isLoading, messages]);

  const retryLastMessage = useCallback(async () => {
    if (!retryPayloadRef.current) return;
    setIsLoading(true);
    setError(null);

    const streamMsgId = `ai-retry-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: streamMsgId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    }]);

    await callAIStreaming(
      retryPayloadRef.current,
      (delta) => {
        setMessages(prev => prev.map(m =>
          m.id === streamMsgId ? { ...m, content: m.content + delta } : m
        ));
      },
      (fullReply) => {
        setMessages(prev => prev.map(m =>
          m.id === streamMsgId ? { ...m, content: fullReply, isStreaming: false } : m
        ));
        setIsLoading(false);
      },
      (errMsg) => {
        setMessages(prev => prev.filter(m => m.id !== streamMsgId));
        setError(errMsg);
        setIsLoading(false);
      }
    );
  }, []);

  return {
    messages,
    setMessages,
    input,
    setInput,
    isLoading,
    error,
    setError,
    imagePreview,
    setImagePreview,
    audioFile,
    setAudioFile,
    isAudioMode,
    setIsAudioMode,
    audioProcessing,
    setAudioProcessing,
    audioProcessingStage,
    setAudioProcessingStage,
    lastAudioBlobRef,
    retryPayloadRef,
    sessionContext: sessionContextRef,
    sendMessage,
    retryLastMessage,
    clearChat,
    handleReact,
  };
}
