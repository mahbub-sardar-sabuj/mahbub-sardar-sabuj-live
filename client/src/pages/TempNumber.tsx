import { useState, useEffect, useCallback } from "react";
import { Phone, Copy, RefreshCw, MessageSquare, Clock, Globe, ChevronDown, CheckCircle2, AlertCircle } from "lucide-react";
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
  // United States (Updated 2026)
  { slug: "19282850693-United States", number: "19282850693", display: "+1 928 285 0693", country: "United States", flag: "🇺🇸" },
  { slug: "18049660123-United States", number: "18049660123", display: "+1 804 966 0123", country: "United States", flag: "🇺🇸" },
  { slug: "17406930721-United States", number: "17406930721", display: "+1 740 693 0721", country: "United States", flag: "🇺🇸" },
  { slug: "19035463899-United States", number: "19035463899", display: "+1 903 546 3899", country: "United States", flag: "🇺🇸" },
  { slug: "19107086833-United States", number: "19107086833", display: "+1 910 708 6833", country: "United States", flag: "🇺🇸" },
  { slug: "19787362203-United States", number: "19787362203", display: "+1 978 736 2203", country: "United States", flag: "🇺🇸" },
  { slug: "13254409775-United States", number: "13254409775", display: "+1 325 440 9775", country: "United States", flag: "🇺🇸" },
  { slug: "12028512183-United States", number: "12028512183", display: "+1 202 851 2183", country: "United States", flag: "🇺🇸" },
  
  // United Kingdom (Updated 2026)
  { slug: "447897034164-United Kingdom", number: "447897034164", display: "+44 7897 034164", country: "United Kingdom", flag: "🇬🇧" },
  { slug: "447481344326-United Kingdom", number: "447481344326", display: "+44 7481 344326", country: "United Kingdom", flag: "🇬🇧" },
  { slug: "447447150857-United Kingdom", number: "447447150857", display: "+44 7447 150857", country: "United Kingdom", flag: "🇬🇧" },
  { slug: "447480787793-United Kingdom", number: "447480787793", display: "+44 7480 787793", country: "United Kingdom", flag: "🇬🇧" },
  { slug: "447723431202-United Kingdom", number: "447723431202", display: "+44 7723 431202", country: "United Kingdom", flag: "🇬🇧" },
  
  // Canada (Updated 2026)
  { slug: "12267730771-Canada", number: "12267730771", display: "+1 226 773 0771", country: "Canada", flag: "🇨🇦" },
  { slug: "12267778204-Canada", number: "12267778204", display: "+1 226 777 8204", country: "Canada", flag: "🇨🇦" },
  { slug: "16722023225-Canada", number: "16722023225", display: "+1 672 202 3225", country: "Canada", flag: "🇨🇦" },
  
  // Saudi Arabia (Updated 2026)
  { slug: "966553902441-Saudi Arabia", number: "966553902441", display: "+966 553902441", country: "Saudi Arabia", flag: "🇸🇦" },
  { slug: "966596771203-Saudi Arabia", number: "966596771203", display: "+966 596771203", country: "Saudi Arabia", flag: "🇸🇦" },
];

const COUNTRIES = ["সব দেশ", ...Array.from(new Set(PHONE_NUMBERS.map((n) => n.country)))];

export default function TempNumber() {
  const [selectedNumber, setSelectedNumber] = useState<PhoneNumber | null>(null);
  const [messages, setMessages] = useState<SmsMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [filterCountry, setFilterCountry] = useState("সব দেশ");
  const [showDropdown, setShowDropdown] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  const filteredNumbers =
    filterCountry === "সব দেশ"
      ? PHONE_NUMBERS
      : PHONE_NUMBERS.filter((n) => n.country === filterCountry);

  const fetchSms = useCallback(async (phone: PhoneNumber) => {
    setLoading(true);
    setFetchError(false);
    try {
      let countryCode = "";
      if (phone.country === "United States") countryCode = "us";
      else if (phone.country === "Canada") countryCode = "ca";
      else if (phone.country === "United Kingdom") countryCode = "uk";
      else if (phone.country === "Saudi Arabia") countryCode = "sa";

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
      
      // Advanced Parsing for receive-smss.live
      const rows = doc.querySelectorAll(".row, .sms-item, div[style*='border-bottom']");
      
      rows.forEach((el) => {
        const text = el.textContent || "";
        if (text.length > 15 && /\d/.test(text)) {
          // Attempt to extract sender and message
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

      // Fallback parsing
      if (smsList.length === 0) {
        const lines = html.split(/<br\/?>|<\/div>|<\/p>/i);
        lines.forEach(line => {
          const cleanLine = line.replace(/<[^>]*>/g, '').trim();
          if (cleanLine.length > 20 && (cleanLine.includes("code") || /\d{4,8}/.test(cleanLine))) {
            smsList.push({
              sender: "SMS",
              message: cleanLine,
              time: "Recently"
            });
          }
        });
      }
      
      setMessages(smsList.slice(0, 15));
    } catch (error) {
      console.error("SMS Fetch Error:", error);
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
        title="টেম্পোরারি ফোন নম্বর — বিনামূল্যে SMS গ্রহণ করুন"
        description="বিনামূল্যে ডিসপোজেবল ফোন নম্বর ব্যবহার করুন। কোনো রেজিস্ট্রেশন ছাড়াই SMS ভেরিফিকেশন সম্পন্ন করুন।"
        path="/temp-number"
      />
      <Navbar />
      <div className="min-h-screen pb-20" style={{
        fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
        background: "radial-gradient(circle at top right, #0a1a33, #060E1A)",
        paddingTop: "100px",
      }}>
        {/* Header */}
        <div className="max-w-4xl mx-auto px-4 text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 mb-6">
            <Phone size={14} className="text-yellow-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-500">Live SMS Receiver</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            টেম্পোরারি <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-200">ফোন নম্বর</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            আপনার ব্যক্তিগত নম্বর গোপন রাখুন। আমাদের ফ্রি নম্বর ব্যবহার করে তাৎক্ষণিকভাবে অনলাইন ভেরিফিকেশন কোড গ্রহণ করুন।
          </p>
        </div>

        <div className="max-w-3xl mx-auto px-4">
          {/* Filter & Selection */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
              <div className="flex gap-2 overflow-x-auto pb-2 w-full no-scrollbar">
                {COUNTRIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setFilterCountry(c)}
                    className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm transition-all duration-300 ${
                      filterCountry === c 
                        ? "bg-yellow-500 text-black font-bold shadow-lg shadow-yellow-500/20" 
                        : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full flex items-center justify-between px-6 py-4 rounded-2xl bg-black/40 border border-white/10 hover:border-yellow-500/50 transition-all text-white group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                    <Globe size={20} className="text-yellow-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Select Number</p>
                    <p className="text-lg font-medium">
                      {selectedNumber ? `${selectedNumber.flag} ${selectedNumber.display}` : "একটি নম্বর পছন্দ করুন"}
                    </p>
                  </div>
                </div>
                <ChevronDown size={20} className={`text-gray-500 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showDropdown && (
                <div className="absolute z-50 w-full mt-3 rounded-2xl bg-[#0d1b2e] border border-white/10 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                    {filteredNumbers.map((num) => (
                      <button
                        key={num.slug}
                        onClick={() => handleSelectNumber(num)}
                        className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                      >
                        <span className="text-2xl">{num.flag}</span>
                        <div className="flex-1 text-left">
                          <p className="text-white font-mono font-medium">{num.display}</p>
                          <p className="text-xs text-gray-500">{num.country}</p>
                        </div>
                        {selectedNumber?.slug === num.slug && <CheckCircle2 size={18} className="text-yellow-500" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SMS View */}
          {selectedNumber ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-yellow-500/10 to-transparent rounded-3xl p-8 border border-yellow-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                  <MessageSquare size={120} className="text-yellow-500" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-green-500 uppercase tracking-tighter">Active Now</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 text-[10px]">
                      <Clock size={12} />
                      <span>{countdown}s পর অটো রিফ্রেশ</span>
                    </div>
                  </div>

                  <h2 className="text-3xl md:text-4xl font-mono font-bold text-white mb-8 tracking-tighter">
                    {selectedNumber.display}
                  </h2>

                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all duration-300 ${
                      copied 
                        ? "bg-green-500 text-white" 
                        : "bg-yellow-500 text-black hover:scale-105 active:scale-95 shadow-xl shadow-yellow-500/20"
                    }`}
                  >
                    {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                    {copied ? "কপি হয়েছে!" : "নম্বর কপি করুন"}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <MessageSquare size={20} className="text-yellow-500" />
                    ইনবক্স
                  </h3>
                  <button 
                    onClick={() => fetchSms(selectedNumber)}
                    disabled={loading}
                    className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-yellow-500 transition-colors"
                  >
                    <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                  </button>
                </div>

                {loading && messages.length === 0 ? (
                  <div className="py-20 text-center space-y-4">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-500/20 border-t-yellow-500"></div>
                    <p className="text-gray-500 animate-pulse">মেসেজ লোড হচ্ছে...</p>
                  </div>
                ) : fetchError ? (
                  <div className="py-16 text-center bg-red-500/5 border border-red-500/10 rounded-3xl">
                    <AlertCircle size={40} className="text-red-500 mx-auto mb-4 opacity-50" />
                    <p className="text-gray-400">মেসেজ লোড করতে সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-20 text-center bg-white/5 border border-white/10 rounded-3xl">
                    <p className="text-gray-500 italic">এখনো কোনো মেসেজ আসেনি। রিফ্রেশ করার জন্য অপেক্ষা করুন।</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {messages.map((msg, i) => (
                      <div 
                        key={i} 
                        className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-white/[0.07] transition-all group animate-in fade-in slide-in-from-bottom-4"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span className="px-3 py-1 rounded-lg bg-yellow-500/10 text-yellow-500 text-xs font-bold border border-yellow-500/20">
                            {msg.sender}
                          </span>
                          <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{msg.time}</span>
                        </div>
                        <p className="text-gray-200 leading-relaxed font-mono text-sm break-words">
                          {msg.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-24 text-center bg-white/5 border border-white/10 rounded-[40px] border-dashed">
              <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Phone size={32} className="text-yellow-500 opacity-50" />
              </div>
              <p className="text-gray-400 text-lg">শুরু করতে উপরের তালিকা থেকে একটি নম্বর বেছে নিন</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
