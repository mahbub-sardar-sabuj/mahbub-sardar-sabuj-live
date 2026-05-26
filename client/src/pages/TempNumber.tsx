import { useState, useEffect, useCallback } from "react";
import { Phone, Copy, RefreshCw, MessageSquare, Clock, Globe, ChevronDown, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
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
  // India
  { slug: "919876543210-India", number: "919876543210", display: "+91 98765 43210", country: "India", flag: "🇮🇳" },
  { slug: "918765432109-India", number: "918765432109", display: "+91 87654 32109", country: "India", flag: "🇮🇳" },
  // Germany
  { slug: "4915212345678-Germany", number: "4915212345678", display: "+49 1521 2345678", country: "Germany", flag: "🇩🇪" },
  // France
  { slug: "33612345678-France", number: "33612345678", display: "+33 6 12 34 56 78", country: "France", flag: "🇫🇷" },
];

const COUNTRIES = ["সব দেশ", ...Array.from(new Set(PHONE_NUMBERS.map((n) => n.country)))];

function formatTimestamp(ts: string): string {
  try {
    const num = parseInt(ts, 10);
    if (!num) return ts;
    const date = new Date(num * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "এইমাত্র";
    if (diffMins < 60) return `${diffMins} মিনিট আগে`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} ঘণ্টা আগে`;
    return date.toLocaleDateString("bn-BD");
  } catch {
    return ts;
  }
}

export default function TempNumber() {
  const [selectedNumber, setSelectedNumber] = useState<PhoneNumber | null>(null);
  const [messages, setMessages] = useState<SmsMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [filterCountry, setFilterCountry] = useState("সব দেশ");
  const [showDropdown, setShowDropdown] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const filteredNumbers =
    filterCountry === "সব দেশ"
      ? PHONE_NUMBERS
      : PHONE_NUMBERS.filter((n) => n.country === filterCountry);

  const fetchSms = useCallback(async (phone: PhoneNumber) => {
    setLoading(true);
    setFetchError(false);
    try {
      let countryCode = "";

      if (phone.country === "United States") {
        countryCode = "us";
      } else if (phone.country === "Canada") {
        countryCode = "ca";
      } else if (phone.country === "United Kingdom") {
        countryCode = "uk";
      } else if (phone.country === "Saudi Arabia") {
        countryCode = "sa";
      } else if (phone.country === "India") {
        countryCode = "in";
      } else if (phone.country === "Germany") {
        countryCode = "de";
      } else if (phone.country === "France") {
        countryCode = "fr";
      }

      const targetUrl = `https://receive-smss.live/sms/${countryCode}/${phone.number}`;
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

      const res = await fetch(proxyUrl);
      if (!res.ok) {
        setFetchError(true);
        setMessages([]);
        return;
      }

      const data = await res.json();
      const html: string = data.contents || "";

      if (!html || html.trim().length === 0) {
        setFetchError(true);
        setMessages([]);
        return;
      }

      // receive-smss.live stores messages in data-attributes on .message-row divs:
      // data-message-body, data-message-from, data-message-time
      // We parse these with a regex since JS rendering fills them server-side in HTML
      const smsList: SmsMessage[] = [];

      const pattern =
        /data-message-id="(\d+)"\s+data-message-body="([^"]*)"\s+data-message-from="([^"]*)"\s+data-message-time="(\d+)"/g;

      let match: RegExpExecArray | null;
      const seen = new Set<string>();

      while ((match = pattern.exec(html)) !== null) {
        const body = match[2].trim();
        const from = match[3].trim() || "Unknown";
        const timeRaw = match[4];

        if (!body || seen.has(match[1])) continue;
        seen.add(match[1]);

        smsList.push({
          sender: from,
          message: body,
          time: formatTimestamp(timeRaw),
        });
      }

      setMessages(smsList);

      if (smsList.length === 0) {
        // No messages yet — not an error, just empty inbox
        setFetchError(false);
      }
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
        title="বিনামূল্যে টেম্পোরারি ফোন নম্বর | ডিসপোজেবল SMS রিসিভার | Temporary Phone Number"
        description="রেজিস্ট্রেশন ছাড়াই তাৎক্ষণিক টেম্পোরারি ফোন নম্বর ব্যবহার করুন। অনলাইন SMS ভেরিফিকেশন, OTP এবং কোড গ্রহণ করুন।"
        path="/temp-number"
        seoKeywords="temporary phone number, temp number, disposable phone number, free temp number, temporary sms receiver, otp receiver, sms verification, অস্থায়ী ফোন নম্বর, টেম্প নম্বর, ডিসপোজেবল ফোন নম্বর, ফ্রি টেম্প নম্বর, অস্থায়ী এসএমএস রিসিভার, ওটিপি রিসিভার, এসএমএস ভেরিফিকেশন"
      />
      <div
        className="min-h-screen"
        style={{
          fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
          background: "linear-gradient(135deg, #060E1A 0%, #0a1628 100%)",
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
                  <span>{countdown}s এ রিফ্রেশ</span>
                </div>
              </div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-mono text-lg font-bold text-white">
                    {selectedNumber.display}
                  </div>
                  <div className="text-xs" style={{ color: "#666" }}>
                    {selectedNumber.flag} {selectedNumber.country}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: copied
                      ? "rgba(74,222,128,0.15)"
                      : "rgba(201,168,76,0.15)",
                    border: `1px solid ${copied ? "#4ade80" : "#C9A84C"}`,
                    color: copied ? "#4ade80" : "#C9A84C",
                  }}
                >
                  <Copy size={14} />
                  {copied ? "কপি হয়েছে!" : "কপি করুন"}
                </button>
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#aaa",
                    opacity: loading ? 0.5 : 1,
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  <RefreshCw size={14} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
                  রিফ্রেশ করুন
                </button>
                <button
                  onClick={() => setShowQr(!showQr)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: "rgba(201,168,76,0.1)",
                    border: "1px solid rgba(201,168,76,0.3)",
                    color: "#C9A84C",
                  }}
                >
                  <QrCode size={14} />
                  QR কোড
                </button>
              </div>
              
              {showQr && (
                <div className="mt-4 p-4 bg-white rounded-xl inline-block">
                  <QRCodeSVG value={selectedNumber.number} size={128} />
                  <div className="text-black text-[10px] mt-2 text-center font-bold">স্ক্যান করুন</div>
                </div>
              )}
            </div>
          )}

          {/* Messages Section */}

          {/* How to Use Section */}
          <div className="mt-12 p-6 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.25)" }}>
            <h2 className="text-xl font-bold text-white mb-4">কীভাবে ব্যবহার করবেন?</h2>
            <ol className="list-decimal list-inside text-gray-300 space-y-2">
              <li>উপরে তালিকা থেকে আপনার পছন্দের একটি টেম্পোরারি ফোন নম্বর বেছে নিন।</li>
              <li>আপনি যে সার্ভিস বা ওয়েবসাইটে রেজিস্ট্রেশন করতে চান, সেখানে এই নম্বরটি ব্যবহার করুন।</li>
              <li>SMS কোড বা OTP আসার জন্য এই পেজে কিছুক্ষণ অপেক্ষা করুন। নতুন বার্তা স্বয়ংক্রিয়ভাবে লোড হবে।</li>
              <li>যদি বার্তা না আসে, তাহলে 'রিফ্রেশ করুন' বাটনে ক্লিক করে ম্যানুয়ালি রিফ্রেশ করতে পারেন।</li>
              <li>আপনার কাজ শেষ হলে, আপনি অন্য একটি নম্বর বেছে নিতে পারেন বা পেজটি বন্ধ করে দিতে পারেন।</li>
            </ol>
          </div>

          {/* FAQ Section */}
          <div className="mt-8 p-6 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.25)" }}>
            <h2 className="text-xl font-bold text-white mb-4">সাধারণ জিজ্ঞাসা (FAQ)</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-white">১. টেম্পোরারি ফোন নম্বর কী?</h3>
                <p className="text-gray-300">টেম্পোরারি ফোন নম্বর হলো একটি অস্থায়ী, ডিসপোজেবল নম্বর যা আপনি অনলাইন রেজিস্ট্রেশন, SMS ভেরিফিকেশন বা OTP গ্রহণের জন্য ব্যবহার করতে পারেন। এটি আপনার আসল ফোন নম্বর গোপন রাখতে সাহায্য করে।</p>
              </div>
              <div>
                <h3 className="font-semibold text-white">২. এই সার্ভিস কি বিনামূল্যে?</h3>
                <p className="text-gray-300">হ্যাঁ, আমাদের টেম্পোরারি ফোন নম্বর সার্ভিস সম্পূর্ণ বিনামূল্যে। কোনো রেজিস্ট্রেশন বা সাবস্ক্রিপশনের প্রয়োজন নেই।</p>
              </div>
              <div>
                <h3 className="font-semibold text-white">৩. SMS আসতে কতক্ষণ সময় লাগে?</h3>
                <p className="text-gray-300">সাধারণত, SMS কোড বা OTP কয়েক সেকেন্ড থেকে কয়েক মিনিটের মধ্যে চলে আসে। যদি না আসে, তাহলে পেজটি রিফ্রেশ করে দেখতে পারেন।</p>
              </div>
              <div>
                <h3 className="font-semibold text-white">৪. আমার পাঠানো SMS কি অন্য কেউ দেখতে পাবে?</h3>
                <p className="text-gray-300">হ্যাঁ, এই নম্বরগুলো পাবলিক এবং এখানে আসা সব SMS সবাই দেখতে পাবে। তাই ব্যক্তিগত বা সংবেদনশীল তথ্যের জন্য এই নম্বর ব্যবহার না করাই ভালো।</p>
              </div>
              <div>
                <h3 className="font-semibold text-white">৫. আমি কি এই নম্বরগুলো দিয়ে SMS পাঠাতে পারব?</h3>
                <p className="text-gray-300">না, এই সার্ভিসটি শুধুমাত্র SMS গ্রহণ করার জন্য ডিজাইন করা হয়েছে। আপনি এই নম্বরগুলো ব্যবহার করে কোনো SMS পাঠাতে পারবেন না।</p>
              </div>
            </div>
          </div>
          {selectedNumber && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare size={16} style={{ color: "#C9A84C" }} />
                <h3 className="text-sm font-semibold text-white">
                  বার্তা ({messages.length})
                </h3>
              </div>
              {loading && !messages.length && (
                <div
                  className="text-center py-8 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(201,168,76,0.25)",
                  }}
                >
                  <div className="text-sm" style={{ color: "#aaa" }}>
                    লোড হচ্ছে...
                  </div>
                </div>
              )}
              {fetchError && (
                <div
                  className="text-center py-8 px-4 rounded-xl"
                  style={{
                    background: "rgba(255,100,100,0.05)",
                    border: "1px solid rgba(255,100,100,0.2)",
                  }}
                >
                  <div className="text-sm" style={{ color: "#ff6464" }}>
                    SMS লোড করতে সমস্যা হয়েছে। কয়েক সেকেন্ড অপেক্ষা করুন এবং রিফ্রেশ করুন।
                  </div>
                </div>
              )}
              {!loading && messages.length === 0 && !fetchError && (
                <div
                  className="text-center py-8 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(201,168,76,0.25)",
                  }}
                >
                  <div className="text-sm" style={{ color: "#aaa" }}>
                    এখনো কোনো বার্তা নেই। কোড পাঠালে এখানে কিছুক্ষণ অপেক্ষা করুন।
                  </div>
                </div>
              )}
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className="mb-3 p-3 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(201,168,76,0.15)",
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-xs font-semibold" style={{ color: "#C9A84C" }}>
                      {msg.sender}
                    </div>
                    <div className="text-xs" style={{ color: "#666" }}>
                      {msg.time}
                    </div>
                  </div>
                  <div className="text-sm" style={{ color: "#ddd" }}>
                    {msg.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
