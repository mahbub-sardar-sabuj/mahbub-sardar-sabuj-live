import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || "";
const OPENAI_BASE_URL = import.meta.env.VITE_OPENAI_BASE_URL || "https://openrouter.ai/api/v1";

async function sendMessage(messages: { role: string; content: string }[]): Promise<string> {
  const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "তুমি একটি বুদ্ধিমান AI সহকারী। তোমার নাম 'সবুজ AI'। তুমি বাংলায় এবং ইংরেজিতে যেকোনো প্রশ্নের উত্তর দিতে পারো। তুমি সাহিত্য, কবিতা, গল্প, বিজ্ঞান, ইতিহাস, প্রযুক্তি, গণিত সহ সব বিষয়ে সাহায্য করো। তুমি মাহবুব সরদার সবুজের ওয়েবসাইটের AI সহকারী।",
        },
        ...messages,
      ],
      max_tokens: 2000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "দুঃখিত, উত্তর দিতে পারছি না।";
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" });
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-[#D4A843] flex items-center justify-center text-black font-bold text-xs mr-2 flex-shrink-0 mt-1">
          AI
        </div>
      )}
      <div className={`max-w-[80%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "bg-[#D4A843] text-black rounded-br-sm"
              : "bg-[#1e2d3d] text-gray-100 rounded-bl-sm border border-[#2a3a4a]"
          }`}
        >
          {message.content}
        </div>
        <span className="text-gray-500 text-xs mt-1 px-1">{formatTime(message.timestamp)}</span>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-[#2a3a4a] flex items-center justify-center text-[#D4A843] font-bold text-xs ml-2 flex-shrink-0 mt-1">
          আপ
        </div>
      )}
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="w-8 h-8 rounded-full bg-[#D4A843] flex items-center justify-center text-black font-bold text-xs mr-2 flex-shrink-0">
        AI
      </div>
      <div className="bg-[#1e2d3d] border border-[#2a3a4a] px-4 py-3 rounded-2xl rounded-bl-sm">
        <div className="flex gap-1 items-center">
          <div className="w-2 h-2 bg-[#D4A843] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 bg-[#D4A843] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 bg-[#D4A843] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "আস্সালামু আলাইকুম! আমি সবুজ AI। আপনাকে কীভাবে সাহায্য করতে পারি? সাহিত্য, কবিতা, বিজ্ঞান, ইতিহাস — যেকোনো বিষয়ে জিজ্ঞেস করুন।",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const history = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const reply = await sendMessage(history);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (e) {
      setError("দুঃখিত, একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome-new",
        role: "assistant",
        content: "নতুন কথোপকথন শুরু হয়েছে। আপনাকে কীভাবে সাহায্য করতে পারি?",
        timestamp: new Date(),
      },
    ]);
    setError(null);
  };

  const SUGGESTIONS = [
    "একটি ছোট কবিতা লিখে দাও",
    "বাংলা সাহিত্যের ইতিহাস বলো",
    "রবীন্দ্রনাথ সম্পর্কে বলো",
    "ভালো লেখার টিপস দাও",
  ];

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#D4A843] text-black shadow-lg shadow-[#D4A843]/30 flex items-center justify-center hover:bg-[#c49030] transition-all"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="AI চ্যাটবট"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} className="text-xl font-bold">✕</motion.span>
          ) : (
            <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} className="text-2xl">🤖</motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-24px)] h-[560px] max-h-[calc(100vh-120px)] bg-[#0d1b2a] border border-[#2a3a4a] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#111827] px-4 py-3 flex items-center justify-between border-b border-[#2a3a4a]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#D4A843] flex items-center justify-center text-black font-bold text-sm">AI</div>
                <div>
                  <div className="text-white font-semibold text-sm">সবুজ AI</div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-green-400 text-xs">সক্রিয়</span>
                  </div>
                </div>
              </div>
              <button onClick={clearChat} title="নতুন কথোপকথন" className="text-gray-400 hover:text-[#D4A843] text-xs transition-colors px-2 py-1 rounded border border-[#2a3a4a] hover:border-[#D4A843]">
                নতুন
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isLoading && <TypingIndicator />}
              {error && (
                <div className="text-center text-red-400 text-xs py-2 bg-red-900/20 rounded-lg px-3">{error}</div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions (shown when only welcome message) */}
            {messages.length === 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setInput(s); inputRef.current?.focus(); }}
                    className="text-xs bg-[#1e2d3d] text-[#D4A843] border border-[#2a3a4a] rounded-full px-3 py-1 hover:border-[#D4A843] transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 py-3 border-t border-[#2a3a4a] bg-[#111827]">
              <div className="flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="আপনার প্রশ্ন লিখুন... (Enter চাপুন)"
                  rows={1}
                  className="flex-1 bg-[#1e2d3d] text-white border border-[#2a3a4a] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#D4A843] resize-none placeholder-gray-500 max-h-24 overflow-y-auto"
                  style={{ minHeight: "40px" }}
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 rounded-xl bg-[#D4A843] text-black flex items-center justify-center hover:bg-[#c49030] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-gray-600 text-xs mt-1 text-center">Shift+Enter = নতুন লাইন</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
