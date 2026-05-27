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

const PHONE_NUMBERS: PhoneNumber[] = [
  { slug: "19065694427-US", number: "19065694427", display: "+1 906 569 4427", country: "United States", flag: "🇺🇸", status: "Online", popular: true },
  { slug: "12029884959-US", number: "12029884959", display: "+1 202 988 4959", country: "United States", flag: "🇺🇸", status: "Online" },
  { slug: "18126136052-US", number: "18126136052", display: "+1 812 613 6052", country: "United States", flag: "🇺🇸", status: "Online", popular: true },
  { slug: "16813583988-US", number: "16813583988", display: "+1 681 358 3988", country: "United States", flag: "🇺🇸", status: "Online" },
  { slug: "12059733572-US", number: "12059733572", display: "+1 205 973 3572", country: "United States", flag: "🇺🇸", status: "Online" },
  { slug: "18049660123-US", number: "18049660123", display: "+1 804 966 0123", country: "United States", flag: "🇺🇸", status: "Online" },
  { slug: "447897034164-UK", number: "447897034164", display: "+44 7897 034164", country: "United Kingdom", flag: "🇬🇧", status: "Online", popular: true },
  { slug: "4932211076460-DE", number: "4932211076460", display: "+49 3221 1076460", country: "Germany", flag: "🇩🇪", status: "Online", popular: true },
  { slug: "4928328964105-DE", number: "4928328964105", display: "+49 2832 8964105", country: "Germany", flag: "🇩🇪", status: "Online" },
  { slug: "3197058016270-NL", number: "3197058016270", display: "+31 970 5801 6270", country: "Netherlands", flag: "🇳🇱", status: "Online" },
];

const COUNTRY_CODE_MAP: Record<string, string> = {
  "United States": "us",
  "United Kingdom": "uk",
  "Germany": "de",
  "Netherlands": "nl",
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

    // .message-row structure
    const messageRows = doc.querySelectorAll(".message-row");
    messageRows.forEach((row) => {
      const senderEl = row.querySelector(".truncate, .font-black, span:first-child");
      const timeEl = row.querySelector(".text-gray-400, .text-gray-500, .whitespace-nowrap");
      const bodyEl = row.querySelector(".message-body, div:nth-child(2)");
      
      if (bodyEl) {
        const sender = senderEl?.textContent?.trim() || "System";
        const time = timeEl?.textContent?.trim() || "Just now";
        const message = bodyEl.textContent?.replace("Show more", "").replace("Copy code", "").trim() || "";
        if (message.length > 1) smsList.push({ sender, message, time });
      }
    });

    // Table Fallback
    if (smsList.length === 0) {
      doc.querySelectorAll("tr").forEach(row => {
        const cells = row.querySelectorAll("td");
        if (cells.length >= 2) {
          smsList.push({
            sender: cells[0].textContent?.trim() || "Sender",
            message: cells[1].textContent?.trim() || "",
            time: cells[2]?.textContent?.trim() || "Recently"
          });
        }
      });
    }

    return smsList.filter(m => m.message.length > 2).slice(0, 30);
  };

  const fetchSms = useCallback(async (phone: PhoneNumber) => {
    setLoading(true);
    setFetchError(false);
    
    try {
      const countryCode = COUNTRY_CODE_MAP[phone.country] || "us";
      // ✅ এখন আমরা সরাসরি আমাদের নিজস্ব Vercel API প্রক্সি ব্যবহার করছি
      const proxyUrl = `/api/sms-proxy?country=${countryCode}&number=${phone.number}`;

      const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(20000) });
      if (!res.ok) throw new Error("Server error");

      const html = await res.text();
      if (!html || html.length < 500) throw new Error("Invalid response");

      const parsed = parseMessages(html);
      setMessages(parsed);
      setLastUpdated(new Date().toLocaleTimeString("bn-BD"));
      setFetchError(false);
    } catch (err) {
      console.error("Proxy Fetch Failed:", err);
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
    navigator.clipboard.writeText(selectedNumber.number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
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
        <div className="max-w-6xl mx-auto px-4 text-center mb-16">
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {PHONE_NUMBERS.length} নম্বর সক্রিয়
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/25 text-yellow-400 text-xs font-bold uppercase tracking-widest">
              <Zap size={12} />
              নিজস্ব সার্ভার প্রক্সি সক্রিয়
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-tight">
            গ্লোবাল{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-amber-400">
              ভার্চুয়াল নম্বর
            </span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            সিম কার্ড ছাড়াই তাৎক্ষণিক SMS ভেরিফিকেশন কোড গ্রহণ করুন।
            <br />
            সবগুলো নম্বর বর্তমানে কাজ করছে এবং লাইভ আছে।
          </p>
        </div>

        <div className="max-w-5xl mx-auto px-4">
          {/* Number Grid */}
          <div className="bg-white/[0.04] backdrop-blur-xl rounded-3xl border border-white/[0.08] p-6 md:p-8 mb-8 shadow-2xl">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  placeholder="নম্বর বা দেশ খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/40 border border-white/[0.08] rounded-xl py-3.5 pl-11 pr-4 text-white text-sm outline-none focus:border-yellow-500/40"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredNumbers.map((num) => (
                <button
                  key={num.slug}
                  onClick={() => handleSelectNumber(num)}
                  className={`relative p-5 rounded-2xl border text-left transition-all duration-300 ${
                    selectedNumber?.slug === num.slug
                      ? "bg-yellow-500/[0.12] border-yellow-500/50 scale-[1.02]"
                      : "bg-black/25 border-white/[0.07] hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{num.flag}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase">Active</span>
                  </div>
                  <p className="font-mono text-base font-black text-white">{num.display}</p>
                  <p className="text-gray-500 text-[11px] font-semibold uppercase">{num.country}</p>
                </button>
              ))}
            </div>
          </div>

          {/* SMS View Section */}
          <div id="sms-section">
            {selectedNumber ? (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-yellow-500/[0.12] via-transparent to-blue-500/[0.07] rounded-3xl p-8 border border-white/[0.1] shadow-2xl">
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                      <Wifi size={12} /> অনলাইন
                    </span>
                    <span className="text-gray-400 text-xs font-semibold">
                      {countdown}s পর আপডেট হবে
                    </span>
                  </div>

                  <div className="w-full h-1 bg-white/[0.05] rounded-full mb-6 overflow-hidden">
                    <div className="h-full bg-yellow-500 transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
                  </div>

                  <h2 className="text-3xl md:text-5xl font-mono font-black text-white mb-8">
                    {selectedNumber.display}
                  </h2>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleCopy}
                      className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold ${
                        copied ? "bg-emerald-500 text-white" : "bg-yellow-500 text-black"
                      }`}
                    >
                      {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                      {copied ? "কপি হয়েছে!" : "নম্বর কপি করুন"}
                    </button>
                    <button
                      onClick={() => fetchSms(selectedNumber)}
                      className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/[0.06] border border-white/[0.1] text-white font-bold"
                    >
                      <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                      রিফ্রেশ
                    </button>
                  </div>
                </div>

                <div className="bg-white/[0.04] rounded-3xl border border-white/[0.08] overflow-hidden shadow-xl">
                  <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
                    <h3 className="text-white font-black text-lg">লাইভ ইনবক্স</h3>
                    {lastUpdated && <span className="text-gray-600 text-xs">আপডেট: {lastUpdated}</span>}
                  </div>

                  <div className="p-6">
                    {loading && messages.length === 0 ? (
                      <div className="py-24 text-center">
                        <div className="h-12 w-12 border-4 border-yellow-500/20 border-t-yellow-500 animate-spin mx-auto mb-4 rounded-full" />
                        <p className="text-gray-500 font-bold uppercase tracking-widest">মেসেজ লোড হচ্ছে...</p>
                      </div>
                    ) : fetchError ? (
                      <div className="py-16 text-center">
                        <WifiOff size={32} className="text-red-400 mx-auto mb-4" />
                        <p className="text-white font-bold mb-2">সার্ভার সংযোগ সমস্যা</p>
                        <button
                          onClick={() => fetchSms(selectedNumber)}
                          className="px-6 py-2 bg-yellow-500 text-black rounded-xl font-bold"
                        >
                          আবার চেষ্টা করুন
                        </button>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="py-20 text-center">
                        <MessageSquare size={32} className="text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 font-bold">ইনবক্স খালি</p>
                        <p className="text-gray-600 text-sm">কোড পাঠানোর পর কিছুক্ষণ অপেক্ষা করুন।</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {messages.map((msg, i) => (
                          <div key={i} className="bg-black/30 border border-white/[0.07] p-5 rounded-2xl animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-yellow-500 font-black text-xs uppercase">{msg.sender}</span>
                              <span className="text-gray-600 text-[10px]">{msg.time}</span>
                            </div>
                            <p className="text-gray-200 font-mono text-sm">{msg.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-white/[0.02] rounded-3xl border border-white/[0.05]">
                <Phone size={48} className="text-gray-700 mx-auto mb-4" />
                <p className="text-gray-400 font-bold">শুরু করতে একটি নম্বর সিলেক্ট করুন</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
