import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// delay helper
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ✅ FIXED callAI
async function callAI(
  messages: { role: "user" | "assistant" | "system"; content: string }[],
  attempt = 0
): Promise<string> {
  const MAX_RETRIES = 3;
  const TIMEOUT_MS = 30000;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    let data: any = {};
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    // 🔥 error handle
    if (!res.ok) {
      throw new Error(data?.error || `HTTP ${res.status}`);
    }

    // 🔥 reply validate
    if (!data.reply || typeof data.reply !== "string") {
      throw new Error("Invalid API response");
    }

    return data.reply;

  } catch (err: any) {
    clearTimeout(timeoutId);

    if (attempt < MAX_RETRIES - 1) {
      const retryable =
        err?.name === "AbortError" ||
        err?.name === "TypeError" ||
        err?.message?.includes("fetch");

      if (retryable) {
        await delay(1000 * (attempt + 1));
        return callAI(messages, attempt + 1);
      }
    }

    throw new Error("connection_failed");
  }
}

// ================= MAIN =================

export default function AIChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "আস্সালামু আলাইকুম! আমি মাহবুব সরদার সবুজ AI Agent। কী জানতে চান?",
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setError(null);

    const payload = [
      ...messages.map(m => ({ role: m.role, content: m.content })),
      { role: "user", content: text },
    ];

    try {
      const reply = await callAI(payload);

      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: reply,
          timestamp: new Date(),
        },
      ]);
    } catch {
      setError("সংযোগে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  return (
    <div style={{ padding: 20 }}>
      <h2>AI Chatbot</h2>

      <div style={{ minHeight: 300 }}>
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              textAlign: msg.role === "user" ? "right" : "left",
              marginBottom: 10,
            }}
          >
            {msg.content}
          </div>
        ))}

        {isLoading && <p>লিখছে...</p>}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div style={{ color: "red", marginBottom: 10 }}>
          {error}
        </div>
      )}

      <textarea
        ref={inputRef}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="আপনার প্রশ্ন লিখুন..."
        rows={2}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <button onClick={handleSend} disabled={isLoading}>
        পাঠান
      </button>
    </div>
  );
}