import { useState, useEffect, useCallback, useMemo } from "react";
import { Phone, Copy, RefreshCw, MessageSquare, Clock, Globe, ChevronDown, CheckCircle2, AlertCircle, Search, ShieldCheck, Zap, Info } from "lucide-react";
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
}

const PHONE_NUMBERS: PhoneNumber[] = [
  // United States
  { slug: "19282850693-US", number: "19282850693", display: "+1 928 285 0693", country: "United States", flag: "🇺🇸" },
  { slug: "18049660123-US", number: "18049660123", display: "+1 804 966 0123", country: "United States", flag: "🇺🇸" },
  { slug: "17406930721-US", number: "17406930721", display: "+1 740 693 0721", country: "United States", flag: "🇺🇸" },
  { slug: "19035463899-US", number: "19035463899", display: "+1 903 546 3899", country: "United States", flag: "🇺🇸" },
  { slug: "19107086833-US", number: "19107086833", display: "+1 910 708 6833", country: "United States", flag: "🇺🇸" },
  { slug: "12028512183-US", number: "12028512183", display: "+1 202 851 2183", country: "United States", flag: "🇺🇸" },
  
  // United Kingdom
  { slug: "447897034164-UK", number: "447897034164", display: "+44 7897 034164", country: "United Kingdom", flag: "🇬🇧" },
  { slug: "447481344326-UK", number: "447481344326", display: "+44 7481 344326", country: "United Kingdom", flag: "🇬🇧" },
  { slug: "447447150857-UK", number: "447447150857", display: "+44 7447 150857", country: "United Kingdom", flag: "🇬🇧" },
  { slug: "447480787793-UK", number: "447480787793", display: "+44 7480 787793", country: "United Kingdom", flag: "🇬🇧" },
  
  // Canada
  { slug: "12267730771-CA", number: "12267730771", display: "+1 226 773 0771", country: "Canada", flag: "🇨🇦" },
  { slug: "16722023225-CA", number: "16722023225", display: "+1 672 202 3225", country: "Canada", flag: "🇨🇦" },
  
  // Saudi Arabia
  { slug: "966553902441-SA", number: "966553902441", display: "+966 553902441", country: "Saudi Arabia", flag: "🇸🇦" },
  { slug: "966596771203-SA", number: "966596771203", display: "+966 596771203", country: "Saudi Arabia", flag: "🇸🇦" },

  // France
  { slug: "33757195098-FR", number: "33757195098", display: "+33 757 195 098", country: "France", flag: "🇫🇷" },
];

const COUNTRIES = ["সব দেশ", ...Array.from(new Set(PHONE_NUMBERS.map((n) => n.country)))];

export default function TempNumber() {
  const [selectedNumber, setSelectedNumber] = useState<PhoneNumber | null>(null);
  const [messages, setMessages] = useState<SmsMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [filterCountry, setFilterCountry] = useState("সব দেশ");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  const filteredNumbers = useMemo(() => {
    return PHONE_NUMBERS.filter((n) => {
      const matchesCountry = filterCountry === "সব দেশ" || n.country === filterCountry;
      const matchesSearch = n.number.includes(searchQuery) || n.country.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCountry && matchesSearch;
    });
  }, [filterCountry, searchQuery]);

  const fetchSms = useCallback(async (phone: PhoneNumber) => {
    setLoading(true);
    setFetchError(false);
    try {
      let countryCode = "";
      if (phone.country === "United States") countryCode = "us";
      else if (phone.country === "Canada") countryCode = "ca";
      else if (phone.country === "United Kingdom") countryCode = "uk";
      else if (phone.country === "Saudi Arabia") countryCode = "sa";
      else if (phone.country === "France") countryCode = "fr";

      const targetUrl = `https://receive-smss.live/sms/${countryCode}/${phone.number}`;
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}&cache=false`;
      
      const res = await fetch(proxyUrl);
      const data = await res.json();
      const html = data.contents || "";
      
      if (!html || html.trim().length === 0) {
        setFetchError(true);
        return;
      }
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const smsList: SmsMessage[] = [];
      
      const rows = doc.querySelectorAll(".row, .sms-item, div[style*='border-bottom']");
      rows.forEach((el) => {
        const text = el.textContent || "";
        if (text.length > 15 && /\d/.test(text)) {
          const senderEl = el.querySelector(".from, b, strong");
          const timeEl = el.querySelector(".time, .date, span[style*='color']");
          const sender = senderEl?.textContent?.trim() || "System";
          const time = timeEl?.textContent?.trim() || "Just now";
          const message = text.replace(sender, "").replace(time, "").trim().substring(0, 300);
          if (message.length > 5 && !smsList.some(m => m.message === message)) {
            smsList.push({ sender, message, time });
          }
        }
      });

      if (smsList.length === 0) {
        const lines = html.split(/<br\/?>|<\/div>|<\/p>/i);
        lines.forEach(line => {
          const cleanLine = line.replace(/<[^>]*>/g, '').trim();
          if (cleanLine.length > 20 && (cleanLine.includes("code") || /\d{4,8}/.test(cleanLine))) {
            smsList.push({ sender: "SMS", message: cleanLine, time: "Recently" });
          }
        });
      }
      setMessages(smsList.slice(0, 20));
    } catch (error) {
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
    setShowDropdown(false);
    fetchSms(num);
  };

  const handleCopy = () => {
    if (!selectedNumber) return;
    navigator.clipboard.writeText(selectedNumber.number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Seo
        title="টেম্পোরারি ফোন নম্বর — প্রিমিয়াম SMS ভেরিফিকেশন"
        description="বিনামূল্যে ডিসপোজেবল ফোন নম্বর ব্যবহার করুন। কোনো রেজিস্ট্রেশন ছাড়াই তাৎক্ষণিক SMS ভেরিফিকেশন সম্পন্ন করুন।"
        path="/temp-number"
      />
      <Navbar />
      <div className="min-h-screen pb-24" style={{
        fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
        background: "linear-gradient(to bottom, #060E1A, #0a1a33)",
        paddingTop: "120px",
      }}>
        {/* Header Section */}
        <div className="max-w-5xl mx-auto px-4 text-center mb-16">
          <div className="flex justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
              <ShieldCheck size={14} className="text-blue-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">নিরাপদ ও গোপনীয়</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
              <Zap size={14} className="text-yellow-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-500">তাৎক্ষণিক SMS</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight">
            টেম্পোরারি <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-200">ভার্চুয়াল নম্বর</span>
          </h1>
          <p className="text-gray-400 text-xl max-w-3xl mx-auto leading-relaxed">
            আপনার ব্যক্তিগত প্রাইভেসি রক্ষা করুন। আমাদের ফ্রি টেম্পোরারি নম্বর ব্যবহার করে ফেসবুক, হোয়াটসঅ্যাপ বা যেকোনো ওয়েবসাইটের OTP গ্রহণ করুন।
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4">
          {/* Controls Card */}
          <div className="bg-white/5 backdrop-blur-2xl rounded-[32px] p-8 border border-white/10 shadow-3xl mb-12">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="text" 
                  placeholder="নম্বর বা দেশ খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:border-yellow-500/50 outline-none transition-all"
                />
              </div>
              {/* Country Filter */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                {COUNTRIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setFilterCountry(c)}
                    className={`whitespace-nowrap px-5 py-3 rounded-2xl text-sm font-bold transition-all ${
                      filterCountry === c ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20" : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Number Selector */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full flex items-center justify-between px-8 py-5 rounded-[24px] bg-black/60 border border-white/10 hover:border-yellow-500/40 transition-all text-white"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500/20 to-transparent flex items-center justify-center border border-yellow-500/20">
                    <Globe size={24} className="text-yellow-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] text-yellow-500/60 uppercase font-black tracking-widest mb-1">Active Numbers</p>
                    <p className="text-xl font-semibold">
                      {selectedNumber ? `${selectedNumber.flag} ${selectedNumber.display}` : "একটি নম্বর নির্বাচন করুন"}
                    </p>
                  </div>
                </div>
                <ChevronDown size={24} className={`text-gray-500 transition-transform duration-500 ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showDropdown && (
                <div className="absolute z-50 w-full mt-4 rounded-[24px] bg-[#0d1b2e] border border-white/10 shadow-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {filteredNumbers.length > 0 ? filteredNumbers.map((num) => (
                      <button
                        key={num.slug}
                        onClick={() => handleSelectNumber(num)}
                        className="w-full flex items-center gap-5 px-8 py-5 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                      >
                        <span className="text-3xl">{num.flag}</span>
                        <div className="flex-1 text-left">
                          <p className="text-white font-mono text-lg font-bold">{num.display}</p>
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{num.country}</p>
                        </div>
                        {selectedNumber?.slug === num.slug && <CheckCircle2 size={22} className="text-yellow-500" />}
                      </button>
                    )) : (
                      <div className="py-12 text-center text-gray-500">কোনো নম্বর খুঁজে পাওয়া যায়নি</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SMS View Section */}
          {selectedNumber ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="bg-gradient-to-br from-yellow-500/10 via-transparent to-blue-500/5 rounded-[40px] p-10 border border-white/10 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-64 h-64 bg-yellow-500/10 blur-[100px] rounded-full" />
                
                <div className="relative z-10">
                  <div className="flex flex-wrap items-center gap-4 mb-8">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_12px_#22c55e]" />
                      <span className="text-[11px] font-black text-green-500 uppercase tracking-widest">নম্বর সচল আছে</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-400 text-[11px] font-bold">
                      <Clock size={14} />
                      <span>{countdown}S পর অটো রিফ্রেশ</span>
                    </div>
                  </div>

                  <h2 className="text-4xl md:text-5xl font-mono font-black text-white mb-10 tracking-tighter">
                    {selectedNumber.display}
                  </h2>

                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={handleCopy}
                      className={`flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-lg transition-all duration-500 ${
                        copied ? "bg-green-500 text-white" : "bg-yellow-500 text-black hover:shadow-2xl hover:shadow-yellow-500/30 active:scale-95"
                      }`}
                    >
                      {copied ? <CheckCircle2 size={24} /> : <Copy size={24} />}
                      {copied ? "কপি হয়েছে" : "নম্বর কপি করুন"}
                    </button>
                    <button 
                      onClick={() => fetchSms(selectedNumber)}
                      className="flex items-center gap-3 px-8 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all"
                    >
                      <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                      রিফ্রেশ
                    </button>
                  </div>
                </div>
              </div>

              {/* Inbox Card */}
              <div className="bg-white/5 rounded-[32px] p-8 border border-white/10">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black text-white flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                      <MessageSquare size={20} className="text-yellow-500" />
                    </div>
                    ইনবক্স (Inbox)
                  </h3>
                </div>

                {loading && messages.length === 0 ? (
                  <div className="py-24 text-center space-y-6">
                    <div className="inline-block animate-spin rounded-full h-14 w-14 border-4 border-yellow-500/10 border-t-yellow-500 shadow-lg shadow-yellow-500/20"></div>
                    <p className="text-gray-500 font-bold animate-pulse">নতুন মেসেজ চেক করা হচ্ছে...</p>
                  </div>
                ) : fetchError ? (
                  <div className="py-20 text-center bg-red-500/5 border border-red-500/10 rounded-3xl">
                    <AlertCircle size={48} className="text-red-500 mx-auto mb-6 opacity-40" />
                    <p className="text-gray-400 font-bold">সার্ভারে সমস্যা হয়েছে। অন্য একটি নম্বর চেষ্টা করুন।</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-24 text-center bg-black/20 rounded-3xl border border-dashed border-white/5">
                    <p className="text-gray-600 font-medium italic">এখনো কোনো মেসেজ আসেনি। রিফ্রেশ হওয়া পর্যন্ত অপেক্ষা করুন।</p>
                  </div>
                ) : (
                  <div className="grid gap-5">
                    {messages.map((msg, i) => (
                      <div 
                        key={i} 
                        className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/[0.08] transition-all group animate-in fade-in slide-in-from-bottom-4 duration-500"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <span className="px-4 py-1.5 rounded-xl bg-yellow-500/10 text-yellow-500 text-xs font-black border border-yellow-500/20 uppercase tracking-widest">
                            {msg.sender}
                          </span>
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{msg.time}</span>
                        </div>
                        <p className="text-gray-200 leading-relaxed font-mono text-base break-words selection:bg-yellow-500 selection:text-black">
                          {msg.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* How it works section */
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {[
                { icon: Globe, title: "নম্বর নির্বাচন", desc: "তালিকা থেকে আপনার পছন্দের দেশের নম্বর বেছে নিন।" },
                { icon: Copy, title: "কপি ও ব্যবহার", desc: "নম্বরটি কপি করে আপনার কাঙ্ক্ষিত ওয়েবসাইটে দিন।" },
                { icon: MessageSquare, title: "OTP গ্রহণ", desc: "ইনবক্সে আসা ভেরিফিকেশন কোডটি ব্যবহার করুন।" }
              ].map((step, i) => (
                <div key={i} className="bg-white/5 p-8 rounded-3xl border border-white/10 text-center group hover:bg-white/[0.07] transition-all">
                  <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <step.icon size={28} className="text-yellow-500" />
                  </div>
                  <h4 className="text-white font-bold text-lg mb-3">{step.title}</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* Warning Info */}
          <div className="mt-12 bg-blue-500/5 border border-blue-500/10 p-6 rounded-2xl flex gap-4 items-start">
            <Info className="text-blue-400 shrink-0 mt-1" size={20} />
            <p className="text-blue-400/80 text-sm leading-relaxed">
              <strong>সতর্কতা:</strong> এগুলো পাবলিক নম্বর, তাই কোনো গুরুত্বপূর্ণ ব্যক্তিগত বা আর্থিক অ্যাকাউন্টের জন্য ব্যবহার করবেন না। শুধুমাত্র টেম্পোরারি ভেরিফিকেশনের জন্য এটি প্রযোজ্য।
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
