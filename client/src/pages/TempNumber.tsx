import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Phone, Copy, RefreshCw, MessageSquare, Clock, Globe,
  CheckCircle2, AlertCircle, Search, ShieldCheck, Zap, Info,
  Share2, HelpCircle, ChevronUp, ChevronDown, Wifi, WifiOff,
  Inbox, ArrowRight, Star, TrendingUp
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";

interface SmsMessage {
  sender: string;
  message: string;
  time: string;
}

interface PhoneNumber {
  slug: string;
  number: string;
  display: string;
  country: string;
  flag: string;
  status: "Online" | "Offline";
  popular?: boolean;
}

// ✅ বর্তমানে সোর্স সাইটে (receive-smss.live) সক্রিয় ও কার্যকর নম্বরগুলো যোগ করা হয়েছে
const PHONE_NUMBERS: PhoneNumber[] = [
  // United States ✅ (Fresh Numbers)
  { slug: "19065694427-US", number: "19065694427", display: "+1 906 569 4427", country: "United States", flag: "🇺🇸", status: "Online", popular: true },
  { slug: "12029884959-US", number: "12029884959", display: "+1 202 988 4959", country: "United States", flag: "🇺🇸", status: "Online" },
  { slug: "18126136052-US", number: "18126136052", display: "+1 812 613 6052", country: "United States", flag: "🇺🇸", status: "Online" },
  { slug: "16813583988-US", number: "16813583988", display: "+1 681 358 3988", country: "United States", flag: "🇺🇸", status: "Online" },
  { slug: "12059733572-US", number: "12059733572", display: "+1 205 973 3572", country: "United States", flag: "🇺🇸", status: "Online" },
  { slug: "18049660123-US", number: "18049660123", display: "+1 804 966 0123", country: "United States", flag: "🇺🇸", status: "Online" },

  // United Kingdom ✅
  { slug: "447897034164-UK", number: "447897034164", display: "+44 7897 034164", country: "United Kingdom", flag: "🇬🇧", status: "Online", popular: true },

  // Germany ✅
  { slug: "4932211076460-DE", number: "4932211076460", display: "+49 3221 1076460", country: "Germany", flag: "🇩🇪", status: "Online", popular: true },
  { slug: "4928328964105-DE", number: "4928328964105", display: "+49 2832 8964105", country: "Germany", flag: "🇩🇪", status: "Online" },

  // Netherlands ✅
  { slug: "3197058016270-NL", number: "3197058016270", display: "+31 970 5801 6270", country: "Netherlands", flag: "🇳🇱", status: "Online" },
];

const COUNTRY_CODE_MAP: Record<string, string> = {
  "United States": "us",
  "United Kingdom": "uk",
  "Germany": "de",
  "Netherlands": "nl",
};

const FAQS = [
  {
    q: "এটি কি সত্যিই ফ্রি?",
    a: "হ্যাঁ, আমাদের এই সার্ভিসটি সম্পূর্ণ ফ্রি। কোনো সাবস্ক্রিপশন বা ফি ছাড়াই আপনি SMS গ্রহণ করতে পারবেন।"
  },
  {
    q: "আমি কি এই নম্বর দিয়ে WhatsApp ভেরিফাই করতে পারব?",
    a: "হ্যাঁ, তবে যেহেতু এগুলো পাবলিক নম্বর, অনেক সময় WhatsApp এগুলো ব্লক করে দিতে পারে। আপনি একাধিক নম্বর চেষ্টা করে দেখতে পারেন।"
  },
  {
    q: "মেসেজ আসতে কতক্ষণ সময় লাগে?",
    a: "সাধারণত ৫–৩০ সেকেন্ডের মধ্যে মেসেজ চলে আসে। যদি না আসে, তবে পেজটি রিফ্রেশ করুন অথবা অন্য নম্বর ব্যবহার করুন।"
  },
  {
    q: "আমার প্রাইভেসি কি সুরক্ষিত?",
    a: "আমরা কোনো ডাটা সেভ করি না। তবে মনে রাখবেন, ইনবক্সটি পাবলিক, তাই অন্যরাও আপনার আসা মেসেজ দেখতে পাবে।"
  }
];

const COUNTRIES = ["সব দেশ", ...Array.from(new Set(PHONE_NUMBERS.map((n) => n.country)))];

const COUNTRY_FLAGS: Record<string, string> = {
  "সব দেশ": "🌍",
  "United States": "🇺🇸",
  "United Kingdom": "🇬🇧",
  "Germany": "🇩🇪",
  "Netherlands": "🇳🇱",
};

export default function TempNumber() {
  const [selectedNumber, setSelectedNumber] = useState<PhoneNumber | null>(null);
  const [messages, setMessages] = useState<SmsMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [filterCountry, setFilterCountry] = useState("সব দেশ");
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchError, setFetchError] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const filteredNumbers = useMemo(() => {
    return PHONE_NUMBERS.filter((n) => {
      const matchesCountry = filterCountry === "সব দেশ" || n.country === filterCountry;
      const matchesSearch =
        n.number.includes(searchQuery) ||
        n.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.display.includes(searchQuery);
      return matchesCountry && matchesSearch;
    });
  }, [filterCountry, searchQuery]);

  const parseMessages = (html: string): SmsMessage[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const smsList: SmsMessage[] = [];

    // Strategy 1: Look for new message-row structure (May 2026 update)
    const messageRows = doc.querySelectorAll(".message-row");
    messageRows.forEach((row) => {
      const senderEl = row.querySelector(".truncate, .font-black");
      const timeEl = row.querySelector(".text-gray-400, .text-gray-500, .whitespace-nowrap");
      const bodyEl = row.querySelector(".message-body");
      
      if (bodyEl) {
        const sender = senderEl?.textContent?.trim() || "System";
        const time = timeEl?.textContent?.trim() || "Just now";
        const message = bodyEl.textContent?.replace("Show more", "").replace("Copy code", "").trim() || "";
        
        if (message.length > 2) {
          smsList.push({ sender, message, time });
        }
      }
    });

    // Strategy 2: Fallback for older structures
    if (smsList.length === 0) {
      const rows = doc.querySelectorAll("table tr, .sms-row, .message-row-old");
      rows.forEach((row) => {
        const cells = row.querySelectorAll("td, .cell");
        if (cells.length >= 2) {
          const sender = cells[0]?.textContent?.trim() || "System";
          const message = cells[1]?.textContent?.trim() || "";
          const time = cells[2]?.textContent?.trim() || cells[cells.length - 1]?.textContent?.trim() || "Just now";
          if (message.length > 2) {
            smsList.push({ sender, message, time });
          }
        }
      });
    }

    // Strategy 3: Universal text extraction if container is found
    if (smsList.length === 0) {
      const container = doc.getElementById("messagesContainer");
      if (container) {
        const items = container.querySelectorAll("div");
        items.forEach(item => {
          const text = item.textContent || "";
          if (text.length > 20 && /\d/.test(text)) {
            // Very basic heuristic to avoid duplicates and non-messages
            if (!smsList.some(m => m.message.substring(0, 20) === text.substring(0, 20))) {
              smsList.push({ sender: "SMS", message: text.trim().substring(0, 500), time: "Recently" });
            }
          }
        });
      }
    }

    return smsList.slice(0, 25);
  };

  const fetchSms = useCallback(async (phone: PhoneNumber) => {
    setLoading(true);
    setFetchError(false);
    try {
      const countryCode = COUNTRY_CODE_MAP[phone.country] || "us";
      const targetUrl = `https://receive-smss.live/sms/${countryCode}/${phone.number}`;
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}&cache=false`;

      const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(20000) });

      if (!res.ok) {
        setFetchError(true);
        return;
      }

      const data = await res.json();
      const html = data.contents || "";

      if (!html || html.trim().length < 100) {
        setFetchError(true);
        return;
      }

      const parsed = parseMessages(html);
      setMessages(parsed);
      setLastUpdated(new Date().toLocaleTimeString("bn-BD"));
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedNumber) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchSms(selectedNumber);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [selectedNumber, fetchSms]);

  const handleSelectNumber = (num: PhoneNumber) => {
    setSelectedNumber(num);
    setMessages([]);
    setCountdown(30);
    setFetchError(false);
    fetchSms(num);
    setTimeout(() => {
      document.getElementById("sms-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleCopy = () => {
    if (!selectedNumber) return;
    navigator.clipboard.writeText(selectedNumber.number); // Copy raw number for verification
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = () => {
    if (!selectedNumber) return;
    const shareText = `ফ্রি টেম্পোরারি নম্বর: ${selectedNumber.display} (${selectedNumber.country})`;
    if (navigator.share) {
      navigator.share({ title: "টেম্প নম্বর", text: shareText, url: window.location.href });
    } else {
      navigator.clipboard.writeText(`${shareText} — ${window.location.href}`);
      alert("লিঙ্ক কপি করা হয়েছে!");
    }
  };

  const progressPercent = ((30 - countdown) / 30) * 100;

  return (
    <>
      <Seo
        title="টেম্পোরারি ফোন নম্বর — বিশ্বব্যাপী SMS ভেরিফিকেশন"
        description="ইউএসএ, ইউকে, জার্মানি ও নেদারল্যান্ডসের ফ্রি ভার্চুয়াল নম্বর ব্যবহার করে তাৎক্ষণিক SMS গ্রহণ করুন। কোনো রেজিস্ট্রেশন নেই।"
        path="/temp-number"
      />
      <Navbar />

      <div
        className="min-h-screen pb-32"
        style={{
          fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
          background: "linear-gradient(135deg, #060E1A 0%, #0a1628 40%, #0d1f3c 100%)",
          paddingTop: "100px",
        }}
      >
        {/* ─── Hero Section ─── */}
        <div className="max-w-6xl mx-auto px-4 text-center mb-16">
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {PHONE_NUMBERS.length} নম্বর সক্রিয়
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/25 text-yellow-400 text-xs font-bold uppercase tracking-widest">
              <Zap size={12} />
              সম্পূর্ণ বিনামূল্যে
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-tight">
            গ্লোবাল{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-amber-400">
              ভার্চুয়াল নম্বর
            </span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            বিশ্বের যেকোনো প্রান্ত থেকে ভেরিফিকেশন কোড গ্রহণ করুন।
            <br className="hidden md:block" />
            সিম কার্ড বা রেজিস্ট্রেশন ছাড়াই তাৎক্ষণিক SMS ভেরিফিকেশন।
          </p>
        </div>

        <div className="max-w-5xl mx-auto px-4">
          {/* ─── Stats Bar ─── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { label: "সক্রিয় নম্বর", val: `${PHONE_NUMBERS.length}`, icon: Phone, color: "yellow" },
              { label: "দেশ সমূহ", val: `${COUNTRIES.length - 1}`, icon: Globe, color: "blue" },
              { label: "SMS সফলতা", val: "৯৯%", icon: TrendingUp, color: "emerald" },
              { label: "প্রাইভেসি", val: "সুরক্ষিত", icon: ShieldCheck, color: "purple" },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-5 text-center hover:bg-white/[0.07] transition-all duration-300"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 ${
                    stat.color === "yellow"
                      ? "bg-yellow-500/15"
                      : stat.color === "blue"
                      ? "bg-blue-500/15"
                      : stat.color === "emerald"
                      ? "bg-emerald-500/15"
                      : "bg-purple-500/15"
                  }`}
                >
                  <stat.icon
                    size={20}
                    className={
                      stat.color === "yellow"
                        ? "text-yellow-400"
                        : stat.color === "blue"
                        ? "text-blue-400"
                        : stat.color === "emerald"
                        ? "text-emerald-400"
                        : "text-purple-400"
                    }
                  />
                </div>
                <p className="text-white text-2xl font-black mb-1">{stat.val}</p>
                <p className="text-gray-500 text-[11px] font-semibold uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* ─── Number Selection Card ─── */}
          <div className="bg-white/[0.04] backdrop-blur-xl rounded-3xl border border-white/[0.08] p-6 md:p-8 mb-8 shadow-2xl">
            {/* Search + Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  placeholder="নম্বর বা দেশ খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/40 border border-white/[0.08] rounded-xl py-3.5 pl-11 pr-4 text-white text-sm placeholder:text-gray-600 focus:border-yellow-500/40 focus:ring-1 focus:ring-yellow-500/20 outline-none transition-all"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {COUNTRIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setFilterCountry(c)}
                    className={`whitespace-nowrap flex items-center gap-1.5 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                      filterCountry === c
                        ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/25"
                        : "bg-white/[0.05] text-gray-400 hover:bg-white/[0.09] border border-white/[0.06]"
                    }`}
                  >
                    <span>{COUNTRY_FLAGS[c] || "🌐"}</span>
                    <span>{c}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Number Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredNumbers.map((num) => {
                const isSelected = selectedNumber?.slug === num.slug;
                return (
                  <button
                    key={num.slug}
                    onClick={() => handleSelectNumber(num)}
                    className={`relative p-5 rounded-2xl border text-left transition-all duration-300 group ${
                      isSelected
                        ? "bg-yellow-500/[0.12] border-yellow-500/50 shadow-lg shadow-yellow-500/10 scale-[1.02]"
                        : "bg-black/25 border-white/[0.07] hover:border-white/20 hover:bg-black/40 hover:scale-[1.01]"
                    }`}
                  >
                    {num.popular && !isSelected && (
                      <span className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-400 text-[9px] font-black uppercase tracking-wider">
                        <Star size={8} fill="currentColor" />
                        জনপ্রিয়
                      </span>
                    )}
                    {isSelected && (
                      <span className="absolute top-3 right-3">
                        <CheckCircle2 size={20} className="text-yellow-500" />
                      </span>
                    )}

                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{num.flag}</span>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tight">Live</span>
                      </div>
                    </div>

                    <p
                      className={`font-mono text-base font-black mb-1 transition-colors ${
                        isSelected ? "text-yellow-400" : "text-white group-hover:text-yellow-400"
                      }`}
                    >
                      {num.display}
                    </p>
                    <p className="text-gray-500 text-[11px] font-semibold uppercase tracking-wider">{num.country}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ─── SMS View Section ─── */}
          <div id="sms-section">
            {selectedNumber ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Selected Number Display */}
                <div className="relative bg-gradient-to-br from-yellow-500/[0.12] via-transparent to-blue-500/[0.07] rounded-3xl p-8 border border-white/[0.1] overflow-hidden shadow-2xl">
                  <div className="absolute right-6 top-6 opacity-[0.04]">
                    <Phone size={180} className="text-yellow-500" />
                  </div>

                  <div className="relative z-10">
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                        <Wifi size={12} />
                        অনলাইন
                      </span>
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-gray-400 text-xs font-semibold">
                        <Clock size={12} />
                        {countdown}s পর আপডেট
                      </span>
                      {lastUpdated && (
                        <span className="text-gray-600 text-xs">
                          সর্বশেষ: {lastUpdated}
                        </span>
                      )}
                    </div>

                    <div className="w-full h-1 bg-white/[0.05] rounded-full mb-6 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full transition-all duration-1000"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-4xl">{selectedNumber.flag}</span>
                      <h2 className="text-3xl md:text-5xl font-mono font-black text-white tracking-tight">
                        {selectedNumber.display}
                      </h2>
                    </div>
                    <p className="text-gray-500 text-sm font-semibold uppercase tracking-widest mb-8">
                      {selectedNumber.country}
                    </p>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={handleCopy}
                        className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-base transition-all duration-300 ${
                          copied
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 scale-105"
                            : "bg-yellow-500 text-black hover:bg-yellow-400 hover:shadow-xl hover:shadow-yellow-500/30 active:scale-95"
                        }`}
                      >
                        {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                        {copied ? "কপি হয়েছে!" : "নম্বর কপি করুন"}
                      </button>
                      <button
                        onClick={() => fetchSms(selectedNumber)}
                        className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/[0.06] border border-white/[0.1] text-white font-bold hover:bg-white/[0.1] transition-all"
                      >
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                        রিফ্রেশ
                      </button>
                    </div>
                  </div>
                </div>

                {/* Inbox */}
                <div className="bg-white/[0.04] rounded-3xl border border-white/[0.08] overflow-hidden shadow-xl">
                  <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                        <Inbox size={20} className="text-yellow-500" />
                      </div>
                      <div>
                        <h3 className="text-white font-black text-lg">লাইভ ইনবক্স</h3>
                        <p className="text-gray-600 text-xs">
                          {messages.length > 0 ? `${messages.length}টি মেসেজ` : "মেসেজের অপেক্ষায়..."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {loading && messages.length === 0 ? (
                      <div className="py-24 text-center space-y-5">
                        <div className="h-16 w-16 rounded-full border-4 border-yellow-500/20 border-t-yellow-500 animate-spin mx-auto" />
                        <p className="text-gray-500 font-semibold text-sm animate-pulse uppercase tracking-widest">
                          মেসেজ খোঁজা হচ্ছে...
                        </p>
                      </div>
                    ) : fetchError ? (
                      <div className="py-16 text-center">
                        <WifiOff size={28} className="text-red-400 mx-auto mb-4" />
                        <p className="text-gray-300 font-bold text-lg mb-2">সংযোগ সমস্যা</p>
                        <button
                          onClick={() => fetchSms(selectedNumber)}
                          className="px-5 py-2.5 rounded-xl bg-yellow-500/10 text-yellow-400 text-sm font-bold hover:bg-yellow-500/20 transition-all"
                        >
                          আবার চেষ্টা করুন
                        </button>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="py-20 text-center">
                        <MessageSquare size={28} className="text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 font-semibold mb-1">ইনবক্স এখনো খালি</p>
                        <p className="text-gray-600 text-sm">
                          এই নম্বরে SMS পাঠান, কিছুক্ষণের মধ্যে এখানে দেখা যাবে।
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {messages.map((msg, i) => (
                          <div
                            key={i}
                            className="bg-black/30 border border-white/[0.07] p-5 rounded-2xl hover:bg-black/40 transition-all group animate-in fade-in slide-in-from-bottom-4 duration-500"
                            style={{ animationDelay: `${i * 80}ms` }}
                          >
                            <div className="flex justify-between items-center mb-3">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-black uppercase tracking-wider">
                                {msg.sender}
                              </span>
                              <span className="text-gray-600 text-[11px] font-medium">{msg.time}</span>
                            </div>
                            <p className="text-gray-100 leading-relaxed font-mono text-sm break-words">
                              {msg.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/[0.03] rounded-3xl border border-white/[0.07] p-8 mb-8">
                <h3 className="text-white font-black text-xl mb-6 text-center">কীভাবে ব্যবহার করবেন?</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { step: "১", title: "নম্বর বেছে নিন", desc: "তালিকা থেকে আপনার পছন্দের দেশের নম্বর সিলেক্ট করুন।", icon: Phone },
                    { step: "২", title: "নম্বর কপি করুন", desc: "নম্বরটি কপি করে কাঙ্ক্ষিত সাইটে ভেরিফিকেশনের জন্য ব্যবহার করুন।", icon: Copy },
                    { step: "৩", title: "SMS দেখুন", desc: "ইনবক্সে আসা কোডটি কপি করে ভেরিফিকেশন সম্পন্ন করুন।", icon: MessageSquare },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 p-5 rounded-2xl bg-black/20 border border-white/[0.05]">
                      <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0">
                        <item.icon size={18} className="text-yellow-500" />
                      </div>
                      <div>
                        <p className="text-yellow-500 text-xs font-black uppercase tracking-widest mb-1">ধাপ {item.step}</p>
                        <p className="text-white font-bold text-sm mb-1">{item.title}</p>
                        <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ─── FAQ Section ─── */}
          <div className="mt-16 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-8">
              <HelpCircle size={28} className="text-yellow-500" />
              <h3 className="text-2xl font-black text-white">সাধারণ জিজ্ঞাসা</h3>
            </div>
            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <div
                  key={i}
                  className="bg-white/[0.04] rounded-2xl border border-white/[0.07] overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/[0.04] transition-all"
                  >
                    <span className="text-base font-bold text-white pr-4">{faq.q}</span>
                    {openFaq === i ? (
                      <ChevronUp size={18} className="text-yellow-500 shrink-0" />
                    ) : (
                      <ChevronDown size={18} className="text-gray-500 shrink-0" />
                    )}
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-5 animate-in fade-in slide-in-from-top-2 duration-200">
                      <p className="text-gray-400 leading-relaxed text-sm">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
