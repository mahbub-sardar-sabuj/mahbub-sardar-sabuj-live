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
  // USA - Latest & Active
  { slug: "12183924421-US", number: "12183924421", display: "+1 218 392 4421", country: "United States", flag: "🇺🇸", status: "Online", popular: true },
  { slug: "17406930721-US", number: "17406930721", display: "+1 740 693 0721", country: "United States", flag: "🇺🇸", status: "Online" },
  { slug: "15512013981-US", number: "15512013981", display: "+1 551 201 3981", country: "United States", flag: "🇺🇸", status: "Online", popular: true },
  { slug: "12029884948-US", number: "12029884948", display: "+1 202 988 4948", country: "United States", flag: "🇺🇸", status: "Online" },
  { slug: "19065694427-US", number: "19065694427", display: "+1 906 569 4427", country: "United States", flag: "🇺🇸", status: "Online" },
  { slug: "18049660123-US", number: "18049660123", display: "+1 804 966 0123", country: "United States", flag: "🇺🇸", status: "Online" },
  
  // UK - Latest
  { slug: "447723431202-UK", number: "447723431202", display: "+44 7723 431202", country: "United Kingdom", flag: "🇬🇧", status: "Online", popular: true },
  { slug: "447480787793-UK", number: "447480787793", display: "+44 7480 787793", country: "United Kingdom", flag: "🇬🇧", status: "Online" },
  
  // Germany - Latest
  { slug: "4934377319106-DE", number: "4934377319106", display: "+49 3437 7319106", country: "Germany", flag: "🇩🇪", status: "Online", popular: true },
  { slug: "4932211076460-DE", number: "4932211076460", display: "+49 3221 1076460", country: "Germany", flag: "🇩🇪", status: "Online" },
  
  // Netherlands - Latest
  { slug: "3197058016477-NL", number: "3197058016477", display: "+31 970 5801 6477", country: "Netherlands", flag: "🇳🇱", status: "Online" },
  { slug: "3197058016269-NL", number: "3197058016269", display: "+31 970 5801 6269", country: "Netherlands", flag: "🇳🇱", status: "Online" },
];

const COUNTRY_CODE_MAP: Record<string, string> = {
  "United States": "us",
  "United Kingdom": "uk",
  "Germany": "de",
  "Netherlands": "nl",
};

// ক্লায়েন্ট-সাইড ফলব্যাক প্রক্সি (সার্ভার ব্যর্থ হলে)
const PROXY_SERVERS = [
  (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}&cache=false`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
];

// HTML থেকে message parse করা (ক্লায়েন্ট-সাইড ফলব্যাক)
const parseMessagesFromHtml = (html: string): SmsMessage[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const smsList: SmsMessage[] = [];
  const seen = new Set<string>();

  // Strategy 1: data-message-* attributes (নতুন structure)
  const messageRows = doc.querySelectorAll(".message-row[data-message-body]");
  messageRows.forEach((row) => {
    const body = row.getAttribute("data-message-body") || "";
    const from = row.getAttribute("data-message-from") || "Unknown";
    const timeUnix = parseInt(row.getAttribute("data-message-time") || "0", 10);
    const id = row.getAttribute("data-message-id") || body;

    if (!body || body.length < 2 || seen.has(id)) return;
    seen.add(id);

    smsList.push({
      sender: from,
      message: body,
      time: formatTimestamp(timeUnix),
    });
  });

  // Strategy 2: পুরনো .message-row structure (ফলব্যাক)
  if (smsList.length === 0) {
    doc.querySelectorAll(".message-row").forEach((row) => {
      const senderEl = row.querySelector(".truncate, .font-black, span:first-child");
      const timeEl = row.querySelector(".text-gray-400, .text-gray-500, .whitespace-nowrap");
      const bodyEl = row.querySelector(".message-body, div:nth-child(2)");
      if (bodyEl) {
        const message = bodyEl.textContent?.replace("Show more", "").replace("Copy code", "").trim() || "";
        if (message.length > 1) {
          smsList.push({
            sender: senderEl?.textContent?.trim() || "System",
            message,
            time: timeEl?.textContent?.trim() || "Recently",
          });
        }
      }
    });
  }

  // Strategy 3: table rows (শেষ ফলব্যাক)
  if (smsList.length === 0) {
    doc.querySelectorAll("tr").forEach((row) => {
      const cells = row.querySelectorAll("td");
      if (cells.length >= 2) {
        smsList.push({
          sender: cells[0].textContent?.trim() || "Sender",
          message: cells[1].textContent?.trim() || "",
          time: cells[2]?.textContent?.trim() || "Recently",
        });
      }
    });
  }

  return smsList
    .filter((m, i, self) => m.message.length > 2 && self.findIndex((t) => t.message === m.message) === i)
    .slice(0, 30);
};

function formatTimestamp(unix: number): string {
  if (!unix) return "Recently";
  const diffMs = Date.now() - unix * 1000;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffMin < 1) return "এইমাত্র";
  if (diffMin < 60) return `${diffMin} মিনিট আগে`;
  if (diffHr < 24) return `${diffHr} ঘণ্টা আগে`;
  return `${diffDay} দিন আগে`;
}

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

  const fetchSms = useCallback(async (phone: PhoneNumber, attempt: number = 0) => {
    if (attempt === 0) {
      setLoading(true);
      setFetchError(false);
    }

    try {
      const countryCode = COUNTRY_CODE_MAP[phone.country] || "us";

      if (attempt === 0) {
        // ✅ Method 1: নিজস্ব সার্ভার প্রক্সি — JSON response দেয়
        const res = await fetch(
          `/api/sms-proxy?country=${countryCode}&number=${phone.number}`,
          { signal: AbortSignal.timeout(15000) }
        );
        if (!res.ok) throw new Error(`Server proxy returned ${res.status}`);

        const data = await res.json();

        if (data.messages && Array.isArray(data.messages)) {
          setMessages(data.messages);
          setLastUpdated(new Date().toLocaleTimeString("bn-BD"));
          setFetchError(false);
          setLoading(false);
          return;
        }
        throw new Error("No messages in response");
      } else {
        // ✅ Method 2: ক্লায়েন্ট-সাইড প্রক্সি ব্যাকআপ — HTML parse করে
        const targetUrl = `https://receive-smss.live/sms/${countryCode}/${phone.number}`;
        const proxyUrl = PROXY_SERVERS[(attempt - 1) % PROXY_SERVERS.length](targetUrl);

        const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(15000) });
        if (!res.ok) throw new Error("Client proxy fetch failed");

        let html = "";
        if (proxyUrl.includes("allorigins")) {
          const jsonData = await res.json();
          html = jsonData.contents || "";
        } else {
          html = await res.text();
        }

        if (!html || html.length < 200) throw new Error("Empty response");

        const parsed = parseMessagesFromHtml(html);
        setMessages(parsed);
        setLastUpdated(new Date().toLocaleTimeString("bn-BD"));
        setFetchError(false);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error(`SMS fetch attempt ${attempt} failed:`, err);
      if (attempt < 2) {
        fetchSms(phone, attempt + 1);
      } else {
        setFetchError(true);
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!selectedNumber) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchSms(selectedNumber, 0);
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
    fetchSms(num, 0);
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
        robots="noindex, nofollow, noarchive"
      />
      <Navbar />

      <div
        className="min-h-screen pb-32"
        style={{
          fontFamily: "'AdorshoLipi', sans-serif",
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
              স্মার্ট ইনবক্স সক্রিয়
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
                    {num.popular && (
                      <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 text-[9px] font-black uppercase">Popular</span>
                    )}
                  </div>
                  <p className="font-mono text-base font-black text-white">{num.display}</p>
                  <p className="text-gray-500 text-[11px] font-semibold uppercase">{num.country}</p>
                </button>
              ))}
            </div>
          </div>

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
                      onClick={() => fetchSms(selectedNumber, 0)}
                      disabled={loading}
                      className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/[0.06] border border-white/[0.1] text-white font-bold disabled:opacity-50"
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
                        <p className="text-gray-500 font-bold uppercase tracking-widest">মেসেজ খোঁজা হচ্ছে...</p>
                      </div>
                    ) : fetchError ? (
                      <div className="py-16 text-center">
                        <WifiOff size={32} className="text-red-400 mx-auto mb-4" />
                        <p className="text-white font-bold mb-2">সংযোগ সমস্যা</p>
                        <p className="text-gray-500 text-sm mb-6">সার্ভার থেকে ডাটা পাওয়া যাচ্ছে না। দয়া করে আবার চেষ্টা করুন।</p>
                        <button
                          onClick={() => fetchSms(selectedNumber, 0)}
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
                            <p className="text-gray-200 font-mono text-sm whitespace-pre-wrap">{msg.message}</p>
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
