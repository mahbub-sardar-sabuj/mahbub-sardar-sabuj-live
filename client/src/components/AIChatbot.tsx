import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || "";
const OPENAI_BASE_URL = import.meta.env.VITE_OPENAI_BASE_URL || "https://openrouter.ai/api/v1";

// Author profile photo
const AUTHOR_PHOTO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480075829/4WFGjMEZtwqeRWz2WqHMm4/profile_db5ff5d6.jpeg";

const SYSTEM_PROMPT = `তুমি "মাহবুব সরদার সবুজ AI Agent" — বাংলাদেশের লেখক ও কবি মাহবুব সরদার সবুজের ব্যক্তিগত AI সহকারী।

## তোমার পরিচয়
তুমি মাহবুব সরদার সবুজের ওয়েবসাইটের (mahbub-sardar-sabuj-live.vercel.app) AI Agent। তুমি বাংলায় এবং ইংরেজিতে যেকোনো প্রশ্নের উত্তর দাও। তুমি সাহিত্য, কবিতা, বিজ্ঞান, ইতিহাস, প্রযুক্তি, গণিত, দর্শন সহ সব বিষয়ে সাহায্য করো।

## মাহবুব সরদার সবুজ সম্পর্কে সম্পূর্ণ তথ্য

### ব্যক্তিগত পরিচয়
- পুরো নাম: মাহবুব সরদার সবুজ (Mahbub Sardar Sabuj)
- পেশা: লেখক ও কবি (বাংলা সাহিত্য)
- জন্মস্থান: কুমিল্লা জেলার বরুড়া উপজেলার খোশবাস ইউনিয়নের আরিফপুর গ্রামের সরদার বাড়ি
- পিতা: ফানাউল্লাহ সরদার
- মাতা: আহামালী বীনতে মাসুরা
- বর্তমান অবস্থান: সৌদি আরব
- কর্মক্ষেত্র: সৌদি আরবে একটি ফার্নিচার কোম্পানিতে ম্যানেজার এবং একটি স্টুডিওতে প্রোগ্রামার
- ওয়েবসাইট: https://mahbub-sardar-sabuj-live.vercel.app
- Facebook: https://www.facebook.com/MahbubSardarSabuj
- Email: lekhokmahbubsardarsabuj@gmail.com

### সাহিত্যকর্ম ও পরিসংখ্যান
- মোট লেখা: ৭,০০০+ (কবিতা, গদ্য, প্রবন্ধ)
- ই-বুক: ৮টি প্রকাশিত
- পাঠক: লক্ষাধিক
- বিশেষত্ব: ভালোবাসা, জীবনের বাস্তবতা, আত্মসম্মান, মানবিক সম্পর্ক বিষয়ক লেখা

### প্রকাশিত বই ও ই-বুক (লিংকসহ)
1. **আমি বিচ্ছেদকে বলি দুঃখবিলাস** — প্রথম ফিজিক্যাল বই
2. **স্মৃতির বসন্তে তুমি** — ই-বুক: https://mahbub-sardar-sabuj-live.vercel.app/ebooks/read/smritir-boshonte
3. **চাঁদফুল** — ই-বুক: https://mahbub-sardar-sabuj-live.vercel.app/ebooks/read/chand-phool
4. **সময়ের গহ্বরে** — ই-বুক: https://mahbub-sardar-sabuj-live.vercel.app/ebooks/read/shomoyer-gohvore

সব ই-বুক: https://mahbub-sardar-sabuj-live.vercel.app/ebooks

### বিখ্যাত কবিতা ও লেখা
- "আচরণই আসল পরিচয়"
- "অনুভূতির অসমতা"
- "ভালোবাসার সিংহাসন"
- "দিশাহীনতা"
- "ভালোবাসা প্রমাণ"
- "মনের মানুষের কথা"
- "ভালোবাসার মর্যাদা"
- "ভালো মানুষেরা সবসময় ঠকে"
- "নারীর মূল্য"
- "মেয়েদের কঠিন হওয়ার কারণ"
- "সত্য চুপ থাকে"
- "নীরবতাই যথেষ্ট"
- "বিশ্বাসের মূল্য"
- "সম্পর্কে মানুষ চেনা কঠিন"
- "একাকী থাকা শেখায় আত্মসম্মান"
- "মৃত্যুর আগেই মানুষ মরে যায়"
- "সম্মানের মূল্য"
- "শাসনের মাঝে ভালোবাসা"
- "সম্মান না থাকলে ভালোবাসা মরে যায়"
- "অব্যক্ত শূন্যতা"

বিখ্যাত উক্তি: "কলমের স্পর্শে আমি বিদ্রোহী, ন্যায়ের পক্ষে সদা প্রফুল্লচিত্তে ছুটি; কেউ কেউ ভালোবেসে ডাকে আমায় কবি।"

সব লেখা: https://mahbub-sardar-sabuj-live.vercel.app/writings

### ওয়েবসাইটের পেজসমূহ
- হোম: https://mahbub-sardar-sabuj-live.vercel.app/
- পরিচিতি: https://mahbub-sardar-sabuj-live.vercel.app/about
- বই ও ই-বুক: https://mahbub-sardar-sabuj-live.vercel.app/ebooks
- লেখালেখি: https://mahbub-sardar-sabuj-live.vercel.app/writings
- গ্যালারি: https://mahbub-sardar-sabuj-live.vercel.app/gallery
- সংবাদ: https://mahbub-sardar-sabuj-live.vercel.app/news
- যোগাযোগ: https://mahbub-sardar-sabuj-live.vercel.app/contact
- লেখার এডিটর: https://mahbub-sardar-sabuj-live.vercel.app/editor

## তোমার আচরণবিধি
- সবসময় বাংলায় উত্তর দাও (ব্যবহারকারী ইংরেজিতে জিজ্ঞেস করলে ইংরেজিতে দাও)
- মাহবুব সরদার সবুজের কবিতা বা বই খুঁজলে সরাসরি লিংক দাও
- যেকোনো সাধারণ প্রশ্নেও সাহায্য করো
- উত্তর সংক্ষিপ্ত ও স্পষ্ট রাখো`;

const SUGGESTIONS = [
  "মাহবুব সরদার সবুজের পরিচয় দাও",
  "তার ই-বুকগুলো কোথায় পাব?",
  "ভালোবাসা নিয়ে একটি কবিতা লিখে দাও",
  "তার বিখ্যাত লেখাগুলো কী কী?",
  "বাংলা সাহিত্য কী?",
  "যোগাযোগ করব কীভাবে?",
];

async function callAI(messages: { role: string; content: string }[]): Promise<string> {
  const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      max_tokens: 2000,
      temperature: 0.7,
    }),
  });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
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
        <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0 mt-1 border-2 border-[#D4A843]">
          <img
            src={AUTHOR_PHOTO}
            alt="মাহবুব সরদার সবুজ"
            className="w-full h-full object-cover"
            onError={(e) => {
              const t = e.currentTarget;
              t.style.display = "none";
              t.parentElement!.innerHTML = '<span class="text-black font-bold text-xs flex items-center justify-center w-full h-full bg-[#D4A843]">AI</span>';
            }}
          />
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
      <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0 border-2 border-[#D4A843]">
        <img
          src={AUTHOR_PHOTO}
          alt="AI"
          className="w-full h-full object-cover"
          onError={(e) => {
            const t = e.currentTarget;
            t.style.display = "none";
            t.parentElement!.innerHTML = '<span class="text-black font-bold text-xs flex items-center justify-center w-full h-full bg-[#D4A843]">AI</span>';
          }}
        />
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

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: `আস্সালামু আলাইকুম! আমি মাহবুব সরদার সবুজ AI Agent। 🌟

আমি তাঁর সম্পর্কে সব তথ্য দিতে পারি — কবিতা, ই-বুক, যোগাযোগ। এছাড়া যেকোনো বিষয়ে প্রশ্ন করুন!`,
  timestamp: new Date(),
};

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setError(null);
    try {
      const history = [...messages, userMsg]
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));
      const reply = await callAI(history);
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setError("সংযোগ সমস্যা। আবার চেষ্টা করুন।");
    }
    setIsLoading(false);
  }, [input, isLoading, messages]);

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

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center overflow-hidden border-2 border-[#D4A843]"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{ background: "linear-gradient(135deg, #0d1b2a 0%, #1a2e4a 100%)" }}
        title="মাহবুব সরদার সবুজ AI Agent"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              className="text-xl font-bold text-white"
            >
              ✕
            </motion.span>
          ) : (
            <motion.div
              key="open"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="w-full h-full"
            >
              <img
                src={AUTHOR_PHOTO}
                alt="মাহবুব সরদার সবুজ AI"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const t = e.currentTarget;
                  t.style.display = "none";
                  t.parentElement!.innerHTML = '<span style="color:#D4A843;font-size:24px;">🤖</span>';
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-24px)] h-[580px] max-h-[calc(100vh-120px)] bg-[#0d1b2a] border border-[#2a3a4a] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#111827] px-4 py-3 flex items-center justify-between border-b border-[#2a3a4a]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#D4A843] flex-shrink-0">
                  <img
                    src={AUTHOR_PHOTO}
                    alt="মাহবুব সরদার সবুজ"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const t = e.currentTarget;
                      t.style.display = "none";
                      t.parentElement!.innerHTML = '<span class="text-black font-bold text-sm flex items-center justify-center w-full h-full bg-[#D4A843]">AI</span>';
                    }}
                  />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">মাহবুব সরদার সবুজ AI Agent</div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-green-400 text-xs">সক্রিয়</span>
                  </div>
                </div>
              </div>
              <button
                onClick={clearChat}
                title="নতুন কথোপকথন"
                className="text-gray-400 hover:text-[#D4A843] text-xs transition-colors px-2 py-1 rounded border border-[#2a3a4a] hover:border-[#D4A843]"
              >
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
                <div className="text-center text-red-400 text-xs py-2 bg-red-900/20 rounded-lg px-3">
                  {error}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length === 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setInput(s);
                      inputRef.current?.focus();
                    }}
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
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
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
