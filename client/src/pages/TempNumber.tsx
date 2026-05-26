import { useState, useEffect, useCallback } from "react";
import { Phone, Copy, RefreshCw, MessageSquare, Clock, Globe, ChevronDown } from "lucide-react";
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
  { slug: "3197010291201-Netherlands", number: "3197010291201", display: "+31 97010291201", country: "Netherlands", flag: "🇳🇱" },
  { slug: "3197010291202-Netherlands", number: "3197010291202", display: "+31 97010291202", country: "Netherlands", flag: "🇳🇱" },
  { slug: "3197010291203-Netherlands", number: "3197010291203", display: "+31 97010291203", country: "Netherlands", flag: "🇳🇱" },
  { slug: "3197010291204-Netherlands", number: "3197010291204", display: "+31 97010291204", country: "Netherlands", flag: "🇳🇱" },
  { slug: "3197010291205-Netherlands", number: "3197010291205", display: "+31 97010291205", country: "Netherlands", flag: "🇳🇱" },
  { slug: "3584573994600-Finland", number: "3584573994600", display: "+358 4573994600", country: "Finland", flag: "🇫🇮" },
  { slug: "3584573994601-Finland", number: "3584573994601", display: "+358 4573994601", country: "Finland", flag: "🇫🇮" },
  { slug: "3584573994602-Finland", number: "3584573994602", display: "+358 4573994602", country: "Finland", flag: "🇫🇮" },
  { slug: "3584573994603-Finland", number: "3584573994603", display: "+358 4573994603", country: "Finland", flag: "🇫🇮" },
  { slug: "3584573994604-Finland", number: "3584573994604", display: "+358 4573994604", country: "Finland", flag: "🇫🇮" },
  { slug: "46726405810-Sweden", number: "46726405810", display: "+46 726405810", country: "Sweden", flag: "🇸🇪" },
  { slug: "46726405811-Sweden", number: "46726405811", display: "+46 726405811", country: "Sweden", flag: "🇸🇪" },
  { slug: "46726405812-Sweden", number: "46726405812", display: "+46 726405812", country: "Sweden", flag: "🇸🇪" },
  { slug: "46726405813-Sweden", number: "46726405813", display: "+46 726405813", country: "Sweden", flag: "🇸🇪" },
  { slug: "46726405814-Sweden", number: "46726405814", display: "+46 726405814", country: "Sweden", flag: "🇸🇪" },
  { slug: "46726409551-Sweden", number: "46726409551", display: "+46 726409551", country: "Sweden", flag: "🇸🇪" },
  { slug: "46726409552-Sweden", number: "46726409552", display: "+46 726409552", country: "Sweden", flag: "🇸🇪" },
  { slug: "46726409553-Sweden", number: "46726409553", display: "+46 726409553", country: "Sweden", flag: "🇸🇪" },
  { slug: "46726409554-Sweden", number: "46726409554", display: "+46 726409554", country: "Sweden", flag: "🇸🇪" },
  { slug: "46731299500-Sweden", number: "46731299500", display: "+46 731299500", country: "Sweden", flag: "🇸🇪" },
  { slug: "46731299501-Sweden", number: "46731299501", display: "+46 731299501", country: "Sweden", flag: "🇸🇪" },
  { slug: "46731299502-Sweden", number: "46731299502", display: "+46 731299502", country: "Sweden", flag: "🇸🇪" },
  { slug: "46731299505-Sweden", number: "46731299505", display: "+46 731299505", country: "Sweden", flag: "🇸🇪" },
  { slug: "46731299509-Sweden", number: "46731299509", display: "+46 731299509", country: "Sweden", flag: "🇸🇪" },
  { slug: "447723431202-United Kingdom", number: "447723431202", display: "+44 7723431202", country: "United Kingdom", flag: "🇬🇧" },
  { slug: "447480787793-United Kingdom", number: "447480787793", display: "+44 7480787793", country: "United Kingdom", flag: "🇬🇧" },
  { slug: "447476559840-United Kingdom", number: "447476559840", display: "+44 7476559840", country: "United Kingdom", flag: "🇬🇧" },
  { slug: "447897034164-United Kingdom", number: "447897034164", display: "+44 7897034164", country: "United Kingdom", flag: "🇬🇧" },
  { slug: "447897030765-United Kingdom", number: "447897030765", display: "+44 7897030765", country: "United Kingdom", flag: "🇬🇧" },
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
      // Primary source: receive-sms-online.info (for Netherlands, Finland, Sweden)
      let targetUrl = `https://receive-sms-online.info/get_sms_register.php?phone=${phone.number}`;
      let proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
      let res = await fetch(proxyUrl);
      let data = await res.json();
      let html: string = data.contents || "";
      
      // Fallback: If no messages from primary source, try receive-smss.live for UK/Saudi Arabia
      if (!html || html.trim().length === 0) {
        if (phone.country === "United Kingdom") {
          targetUrl = `https://receive-smss.live/sms/uk/${phone.number}`;
        } else if (phone.country === "Saudi Arabia") {
          targetUrl = `https://receive-smss.live/sms/sa/${phone.number}`;
        }
        proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
        res = await fetch(proxyUrl);
        data = await res.json();
        html = data.contents || "";
      }
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(
        `<table><tbody>${html}</tbody></table>`,
        "text/html"
      );
      const rows = doc.querySelectorAll("tr");
      const smsList: SmsMessage[] = [];
      rows.forEach((row) => {
        const tds = row.querySelectorAll("td");
        if (tds.length >= 3) {
          smsList.push({
            sender: tds[0]?.textContent?.trim() || "Unknown",
            message: tds[1]?.textContent?.trim() || "",
            time: tds[2]?.textContent?.trim() || "",
          });
        }
      });
      setMessages(smsList);
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
    setShowDropdown(false);
    fetchSms(num);
  };

  const handleCopy = () => {
    if (!selectedNumber) return;
    navigator.clipboard.writeText(selectedNumber.display);
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
                  maxHeight: "260px",
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
                  <span>{countdown}s পরে রিফ্রেশ</span>
                </div>
              </div>

              <div
                className="flex items-center gap-3 p-3 rounded-xl mb-4"
                style={{
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <Phone
                  size={20}
                  style={{ color: "#C9A84C", flexShrink: 0 }}
                />
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
              </div>
            </div>
          )}

          {/* Messages Section */}
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
                  className="text-center py-8 rounded-xl"
                  style={{
                    background: "rgba(255,100,100,0.1)",
                    border: "1px solid rgba(255,100,100,0.3)",
                  }}
                >
                  <div className="text-sm" style={{ color: "#ff6464" }}>
                    বার্তা লোড করতে ব্যর্থ। পরে চেষ্টা করুন।
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
                    এখনো কোনো বার্তা নেই
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
