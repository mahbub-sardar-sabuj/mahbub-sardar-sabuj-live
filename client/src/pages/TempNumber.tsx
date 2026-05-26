import { useState, useEffect, useCallback } from "react";
import { Phone, Copy, RefreshCw, MessageSquare, Clock, Globe, ChevronDown } from "lucide-react";
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
  { slug: "19282850693-United States", number: "19282850693", display: "+1 928 285 0693", country: "United States", flag: "🇺🇸" },
  { slug: "18049660123-United States", number: "18049660123", display: "+1 804 966 0123", country: "United States", flag: "🇺🇸" },
  { slug: "17406930721-United States", number: "17406930721", display: "+1 740 693 0721", country: "United States", flag: "🇺🇸" },
  { slug: "19035463899-United States", number: "19035463899", display: "+1 903 546 3899", country: "United States", flag: "🇺🇸" },
  { slug: "19107086833-United States", number: "19107086833", display: "+1 910 708 6833", country: "United States", flag: "🇺🇸" },
  
  // Canada
  { slug: "12267730771-Canada", number: "12267730771", display: "+1 226 773 0771", country: "Canada", flag: "🇨🇦" },
  { slug: "12267778204-Canada", number: "12267778204", display: "+1 226 777 8204", country: "Canada", flag: "🇨🇦" },
  { slug: "12266404389-Canada", number: "12266404389", display: "+1 226 640 4389", country: "Canada", flag: "🇨🇦" },
  { slug: "16722023225-Canada", number: "16722023225", display: "+1 672 202 3225", country: "Canada", flag: "🇨🇦" },
  { slug: "17828217929-Canada", number: "17828217929", display: "+1 782 821 7929", country: "Canada", flag: "🇨🇦" },
  
  // United Kingdom
  { slug: "447723431202-United Kingdom", number: "447723431202", display: "+44 7723 431202", country: "United Kingdom", flag: "🇬🇧" },
  { slug: "447480787793-United Kingdom", number: "447480787793", display: "+44 7480 787793", country: "United Kingdom", flag: "🇬🇧" },
  { slug: "447476559840-United Kingdom", number: "447476559840", display: "+44 7476 559840", country: "United Kingdom", flag: "🇬🇧" },
  { slug: "447723474128-United Kingdom", number: "447723474128", display: "+44 7723 474128", country: "United Kingdom", flag: "🇬🇧" },
  { slug: "447897034164-United Kingdom", number: "447897034164", display: "+44 7897 034164", country: "United Kingdom", flag: "🇬🇧" },
  { slug: "447897030765-United Kingdom", number: "447897030765", display: "+44 7897 030765", country: "United Kingdom", flag: "🇬🇧" },
  { slug: "447723563833-United Kingdom", number: "447723563833", display: "+44 7723 563833", country: "United Kingdom", flag: "🇬🇧" },
  { slug: "447897016653-United Kingdom", number: "447897016653", display: "+44 7897 016653", country: "United Kingdom", flag: "🇬🇧" },
  
  // Saudi Arabia
  { slug: "966512345678-Saudi Arabia", number: "966512345678", display: "+966 512345678", country: "Saudi Arabia", flag: "🇸🇦" },
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
      let html = "";
      let countryCode = "";

      // Determine country code for API endpoint
      if (phone.country === "United States") {
        countryCode = "us";
      } else if (phone.country === "Canada") {
        countryCode = "ca";
      } else if (phone.country === "United Kingdom") {
        countryCode = "uk";
      } else if (phone.country === "Saudi Arabia") {
        countryCode = "sa";
      }

      // Fetch from receive-smss.live
      const targetUrl = `https://receive-smss.live/sms/${countryCode}/${phone.number}`;
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}&cache=false`;
      
      const res = await fetch(proxyUrl);
      const data = await res.json();
      html = data.contents || "";
      
      if (!html || html.trim().length === 0) {
        setFetchError(true);
        setMessages([]);
        return;
      }
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const smsList: SmsMessage[] = [];
      
      // Parse receive-smss.live structure
      const messageElements = doc.querySelectorAll("div");
      
      let foundMessages = false;
      messageElements.forEach((el) => {
        const text = el.textContent || "";
        
        if (text.length > 10 && (
          text.includes("code") || 
          text.includes("verification") || 
          text.includes("Your") || 
          text.includes("confirm") ||
          /\d{3,8}/.test(text)
        )) {
          const children = Array.from(el.children);
          if (children.length >= 2) {
            const sender = children[0]?.textContent?.trim() || "Unknown";
            const message = text.trim().substring(0, 200);
            const time = children[children.length - 1]?.textContent?.trim() || "";
            
            if (message.length > 10 && !smsList.some(m => m.message === message)) {
              smsList.push({ sender, message, time });
              foundMessages = true;
            }
          }
        }
      });
      
      if (!foundMessages) {
        const textContent = doc.body.textContent || "";
        const lines = textContent.split("\n").filter(line => line.trim().length > 10);
        
        lines.slice(0, 10).forEach((line) => {
          if (line.includes("code") || line.includes("verification") || /\d{3,8}/.test(line)) {
            smsList.push({
              sender: "SMS",
              message: line.trim().substring(0, 200),
              time: "Just now"
            });
          }
        });
      }
      
      setMessages(smsList);
    } catch (error) {
      console.error("SMS Fetch Error:", error);
      setFetchError(true);
      setMessages([]);
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

  const handleRefresh = () => {
    if (!selectedNumber) return;
    setCountdown(30);
    fetchSms(selectedNumber);
  };

  return (
    <>
      <Seo
        title="টেম্পোরারি ফোন নম্বর — বিনামূল্যে SMS গ্রহণ করুন"
        description="বিনামূল্যে ডিসপোজেবল ফোন নম্বর ব্যবহার করুন। কোনো রেজিস্ট্রেশন ছাড়াই SMS ভেরিফিকেশন সম্পন্ন করুন।"
        path="/temp-number"
      />
      <Navbar />
      <div
        className="min-h-screen"
        style={{
          fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
          background: "linear-gradient(135deg, #060E1A 0%, #0a1628 100%)",
          paddingTop: "var(--site-nav-offset, 70px)",
        }}
      >
        {/* Hero */}
        <div className="text-center pt-16 pb-10 px-4">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{
              background: "rgba(201,168,76,0.12)",
              border: "1px solid rgba(201,168,76,0.3)",
            }}
          >
            <Phone size={14} style={{ color: "#C9A84C" }} />
            <span
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "#C9A84C" }}
            >
              বিনামূল্যে
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            টেম্পোরারি ফোন নম্বর
          </h1>
          <p className="text-gray-400 text-base md:text-lg max-w-xl mx-auto">
            রেজিস্ট্রেশন ছাড়াই যেকোনো ওয়েবসাইটে SMS ভেরিফিকেশন সম্পন্ন করুন
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {["তাৎক্ষণিক", "কোনো রেজিস্ট্রেশন নেই", "স্প্যাম প্রতিরোধ", "অটো রিফ্রেশ"].map(
              (f) => (
                <span
                  key={f}
                  className="text-xs px-3 py-1 rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    color: "#aaa",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {f}
                </span>
              )
            )}
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 pb-16">
          {/* Country Filter */}
          <div className="flex gap-2 flex-wrap mb-4">
            {COUNTRIES.map((c) => (
              <button
                key={c}
                onClick={() => setFilterCountry(c)}
                className="text-xs px-3 py-1.5 rounded-full transition-all"
                style={{
                  background:
                    filterCountry === c ? "#C9A84C" : "rgba(255,255,255,0.06)",
                  color: filterCountry === c ? "#060E1A" : "#aaa",
                  border: `1px solid ${filterCountry === c ? "#C9A84C" : "rgba(255,255,255,0.1)"}`,
                  fontWeight: filterCountry === c ? "700" : "400",
                }}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Number Selector Dropdown */}
          <div className="relative mb-4">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(201,168,76,0.3)",
                color: "#fff",
              }}
            >
              <span className="flex items-center gap-2">
                <Globe size={16} style={{ color: "#C9A84C" }} />
                {selectedNumber
                  ? `${selectedNumber.flag} ${selectedNumber.display} (${selectedNumber.country})`
                  : "একটি নম্বর বেছে নিন"}
              </span>
              <ChevronDown
                size={16}
                style={{
                  color: "#C9A84C",
                  transform: showDropdown ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s",
                }}
              />
            </button>

            {showDropdown && (
              <div
                className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden shadow-2xl"
                style={{
                  background: "#0d1b2e",
                  border: "1px solid rgba(201,168,76,0.3)",
                  maxHeight: "300px",
                  overflowY: "auto",
                }}
              >
                {filteredNumbers.map((num) => (
                  <button
                    key={num.slug}
                    onClick={() => handleSelectNumber(num)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-all hover:bg-white/5"
                    style={{
                      color:
                        selectedNumber?.slug === num.slug ? "#C9A84C" : "#ccc",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <span>{num.flag}</span>
                    <span className="font-mono">{num.display}</span>
                    <span className="text-xs ml-auto" style={{ color: "#666" }}>
                      {num.country}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Active Number Card */}
          {selectedNumber && (
            <div
              className="rounded-2xl p-5 mb-6"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(201,168,76,0.25)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ background: "#4ade80" }}
                  ></div>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "#4ade80" }}
                  >
                    নম্বর সক্রিয় আছে
                  </span>
                </div>
                <div
                  className="flex items-center gap-1 text-xs"
                  style={{ color: "#666" }}
                >
                  <Clock size={12} />
                  {countdown}s পর অটো রিফ্রেশ
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left">
                  <div className="text-3xl md:text-4xl font-mono font-bold text-white mb-2 tracking-tighter">
                    {selectedNumber.display}
                  </div>
                  <div className="text-xs text-gray-500">
                    {selectedNumber.country} নম্বর
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all"
                    style={{
                      background: copied
                        ? "rgba(34,197,94,0.15)"
                        : "rgba(201,168,76,0.1)",
                      border: `1px solid ${copied ? "rgba(34,197,94,0.3)" : "rgba(201,168,76,0.3)"}`,
                      color: copied ? "#4ade80" : "#C9A84C",
                    }}
                  >
                    <Copy size={16} />
                    {copied ? "কপি হয়েছে!" : "নম্বর কপি করুন"}
                  </button>
                  <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="p-2 rounded-lg transition-all"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#fff",
                    }}
                  >
                    <RefreshCw
                      size={20}
                      className={loading ? "animate-spin" : ""}
                    />
                  </button>
                </div>
              </div>

              {/* Inbox Area */}
              <div className="mt-8 pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 text-white font-semibold mb-4">
                  <MessageSquare size={18} style={{ color: "#C9A84C" }} />
                  ইনবক্স
                </div>

                <div className="space-y-3">
                  {loading && messages.length === 0 ? (
                    <div className="text-center py-10">
                      <RefreshCw
                        size={24}
                        className="animate-spin mx-auto text-gray-600 mb-2"
                      />
                      <p className="text-sm text-gray-500">মেসেজ লোড হচ্ছে...</p>
                    </div>
                  ) : fetchError ? (
                    <div className="text-center py-10 bg-red-500/5 rounded-xl border border-red-500/10">
                      <p className="text-sm text-red-400">
                        মেসেজ লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।
                      </p>
                    </div>
                  ) : messages.length > 0 ? (
                    messages.map((msg, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl transition-all hover:bg-white/5"
                        style={{
                          background: "rgba(255,255,255,0.02)",
                          border: "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-bold text-gray-400">
                            {msg.sender}
                          </span>
                          <span className="text-[10px] text-gray-600">
                            {msg.time}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">
                          {msg.message}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-600 text-sm">
                        এখনো কোনো মেসেজ আসেনি। অপেক্ষা করুন...
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
