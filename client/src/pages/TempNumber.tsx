import { useState, useEffect, useCallback, useMemo } from "react";
import { Phone, Copy, RefreshCw, MessageSquare, Clock, Globe, ChevronDown, CheckCircle2, AlertCircle, Search, ShieldCheck, Zap, Info, Share2, HelpCircle, ChevronUp } from "lucide-react";
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
  status?: "Online" | "Offline";
}

const PHONE_NUMBERS: PhoneNumber[] = [
  // United States
  { slug: "19282850693-US", number: "19282850693", display: "+1 928 285 0693", country: "United States", flag: "🇺🇸", status: "Online" },
  { slug: "18049660123-US", number: "18049660123", display: "+1 804 966 0123", country: "United States", flag: "🇺🇸", status: "Online" },
  { slug: "17406930721-US", number: "17406930721", display: "+1 740 693 0721", country: "United States", flag: "🇺🇸", status: "Online" },
  { slug: "19035463899-US", number: "19035463899", display: "+1 903 546 3899", country: "United States", flag: "🇺🇸", status: "Online" },
  
  // United Kingdom
  { slug: "447897034164-UK", number: "447897034164", display: "+44 7897 034164", country: "United Kingdom", flag: "🇬🇧", status: "Online" },
  { slug: "447481344326-UK", number: "447481344326", display: "+44 7481 344326", country: "United Kingdom", flag: "🇬🇧", status: "Online" },
  
  // Germany (New)
  { slug: "4932211076460-DE", number: "4932211076460", display: "+49 3221 1076460", country: "Germany", flag: "🇩🇪", status: "Online" },
  { slug: "4928328964105-DE", number: "4928328964105", display: "+49 2832 8964105", country: "Germany", flag: "🇩🇪", status: "Online" },
  { slug: "4972428879037-DE", number: "4972428879037", display: "+49 7242 8879037", country: "Germany", flag: "🇩🇪", status: "Online" },
  
  // Netherlands (New)
  { slug: "3197058016270-NL", number: "3197058016270", display: "+31 970 5801 6270", country: "Netherlands", flag: "🇳🇱", status: "Online" },
  { slug: "3197058016477-NL", number: "3197058016477", display: "+31 970 5801 6477", country: "Netherlands", flag: "🇳🇱", status: "Online" },

  // Sweden (New)
  { slug: "46726420814-SE", number: "46726420814", display: "+46 72 642 0814", country: "Sweden", flag: "🇸🇪", status: "Online" },
  { slug: "46726999163-SE", number: "46726999163", display: "+46 72 699 9163", country: "Sweden", flag: "🇸🇪", status: "Online" },
  
  // Canada
  { slug: "12267730771-CA", number: "12267730771", display: "+1 226 773 0771", country: "Canada", flag: "🇨🇦", status: "Online" },
  
  // Saudi Arabia
  { slug: "966553902441-SA", number: "966553902441", display: "+966 553902441", country: "Saudi Arabia", flag: "🇸🇦", status: "Online" },

  // France
  { slug: "33757195098-FR", number: "33757195098", display: "+33 757 195 098", country: "France", flag: "🇫🇷", status: "Online" },
];

const FAQS = [
  { q: "এটি কি সত্যিই ফ্রি?", a: "হ্যাঁ, আমাদের এই সার্ভিসটি সম্পূর্ণ ফ্রি। কোনো সাবস্ক্রিপশন বা ফি ছাড়াই আপনি SMS গ্রহণ করতে পারবেন।" },
  { q: "আমি কি এই নম্বর দিয়ে WhatsApp ভেরিফাই করতে পারব?", a: "হ্যাঁ, তবে যেহেতু এগুলো পাবলিক নম্বর, অনেক সময় WhatsApp এগুলো ব্লক করে দিতে পারে। আপনি একাধিক নম্বর চেষ্টা করে দেখতে পারেন।" },
  { q: "মেসেজ আসতে কতক্ষণ সময় লাগে?", a: "সাধারণত ৫-৩০ সেকেন্ডের মধ্যে মেসেজ চলে আসে। যদি না আসে, তবে পেজটি রিফ্রেশ করুন।" },
  { q: "আমার প্রাইভেসি কি সুরক্ষিত?", a: "আমরা কোনো ডাটা সেভ করি না। তবে মনে রাখবেন, ইনবক্সটি পাবলিক, তাই অন্যরাও আপনার আসা মেসেজ দেখতে পাবে।" }
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
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
      const c = phone.country.toLowerCase();
      if (c.includes("united states")) countryCode = "us";
      else if (c.includes("canada")) countryCode = "ca";
      else if (c.includes("united kingdom")) countryCode = "uk";
      else if (c.includes("saudi arabia")) countryCode = "sa";
      else if (c.includes("france")) countryCode = "fr";
      else if (c.includes("germany")) countryCode = "de";
      else if (c.includes("netherlands")) countryCode = "nl";
      else if (c.includes("sweden")) countryCode = "se";

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
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handleCopy = () => {
    if (!selectedNumber) return;
    navigator.clipboard.writeText(selectedNumber.number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (!selectedNumber) return;
    const shareText = `Check out this temporary number: ${selectedNumber.display} (${selectedNumber.country})`;
    if (navigator.share) {
      navigator.share({ title: 'Temp Number', text: shareText, url: window.location.href });
    } else {
      navigator.clipboard.writeText(`${shareText} - ${window.location.href}`);
      alert("লিঙ্ক কপি করা হয়েছে!");
    }
  };

  return (
    <>
      <Seo
        title="টেম্পোরারি ফোন নম্বর — বিশ্বব্যাপী SMS ভেরিফিকেশন"
        description="ইউএসএ, ইউকে, জার্মানি সহ বিভিন্ন দেশের ফ্রি ভার্চুয়াল নম্বর ব্যবহার করে তাৎক্ষণিক SMS গ্রহণ করুন।"
        path="/temp-number"
      />
      <Navbar />
      <div className="min-h-screen pb-32" style={{
        fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
        background: "radial-gradient(circle at top right, #0a1a33, #060E1A)",
        paddingTop: "120px",
      }}>
        {/* Hero Section */}
        <div className="max-w-6xl mx-auto px-4 text-center mb-20">
          <div className="flex justify-center gap-3 mb-10">
            <div className="px-5 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-2">
              <Zap size={16} className="text-yellow-500" />
              <span className="text-[11px] font-black uppercase tracking-widest text-yellow-500">Fast & Free Service</span>
            </div>
            <div className="px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center gap-2">
              <ShieldCheck size={16} className="text-blue-400" />
              <span className="text-[11px] font-black uppercase tracking-widest text-blue-400">Privacy Protected</span>
            </div>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white mb-10 tracking-tighter leading-tight">
            গ্লোবাল <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-200">ভার্চুয়াল নম্বর</span>
          </h1>
          <p className="text-gray-400 text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed font-medium">
            বিশ্বের যেকোনো প্রান্ত থেকে ভেরিফিকেশন কোড গ্রহণ করুন। কোনো সিম কার্ড বা রেজিস্ট্রেশন ছাড়াই সম্পূর্ণ বিনামূল্যে।
          </p>
        </div>

        <div className="max-w-5xl mx-auto px-4">
          {/* Main Control Card */}
          <div className="bg-white/5 backdrop-blur-3xl rounded-[48px] p-10 border border-white/10 shadow-4xl mb-16 relative overflow-hidden group">
            <div className="absolute -left-20 -top-20 w-80 h-80 bg-blue-500/5 blur-[120px] rounded-full group-hover:bg-blue-500/10 transition-all duration-1000" />
            
            <div className="relative z-10">
              <div className="grid lg:grid-cols-2 gap-8 mb-10">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={22} />
                  <input 
                    type="text" 
                    placeholder="নম্বর, দেশ বা কোড খুঁজুন..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-black/50 border-2 border-white/5 rounded-[24px] py-5 pl-14 pr-6 text-white text-lg placeholder:text-gray-600 focus:border-yellow-500/40 outline-none transition-all shadow-inner"
                  />
                </div>
                {/* Country Chips */}
                <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
                  {COUNTRIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setFilterCountry(c)}
                      className={`whitespace-nowrap px-6 py-4 rounded-2xl text-sm font-black transition-all duration-300 ${
                        filterCountry === c 
                          ? "bg-yellow-500 text-black shadow-xl shadow-yellow-500/30 scale-105" 
                          : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Number Selection Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredNumbers.slice(0, 9).map((num) => (
                  <button
                    key={num.slug}
                    onClick={() => handleSelectNumber(num)}
                    className={`p-6 rounded-[28px] border-2 transition-all duration-500 text-left group/item relative overflow-hidden ${
                      selectedNumber?.slug === num.slug 
                        ? "bg-yellow-500/10 border-yellow-500/50 shadow-2xl shadow-yellow-500/10" 
                        : "bg-black/30 border-white/5 hover:border-white/20 hover:bg-black/50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-4xl filter drop-shadow-lg">{num.flag}</span>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[9px] font-black text-green-500 uppercase tracking-tighter">Live</span>
                      </div>
                    </div>
                    <p className="text-white font-mono text-lg font-black mb-1 group-hover/item:text-yellow-500 transition-colors">
                      {num.display}
                    </p>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{num.country}</p>
                    
                    {selectedNumber?.slug === num.slug && (
                      <div className="absolute right-4 bottom-4">
                        <CheckCircle2 size={24} className="text-yellow-500" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SMS View Section */}
          {selectedNumber ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
              <div className="bg-gradient-to-br from-yellow-500/20 via-transparent to-blue-500/10 rounded-[56px] p-12 border border-white/10 relative overflow-hidden shadow-4xl">
                <div className="absolute right-0 top-0 p-12 opacity-5">
                  <Phone size={240} className="text-yellow-500" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex flex-wrap items-center gap-5 mb-10">
                    <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-green-500/10 border border-green-500/20">
                      <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_15px_#22c55e]" />
                      <span className="text-xs font-black text-green-500 uppercase tracking-widest">নম্বরটি অনলাইনে আছে</span>
                    </div>
                    <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-bold">
                      <Clock size={16} />
                      <span>{countdown}S পর রিফ্রেশ হবে</span>
                    </div>
                  </div>

                  <h2 className="text-5xl md:text-7xl font-mono font-black text-white mb-12 tracking-tighter selection:bg-yellow-500 selection:text-black">
                    {selectedNumber.display}
                  </h2>

                  <div className="flex flex-wrap gap-5">
                    <button
                      onClick={handleCopy}
                      className={`flex items-center gap-4 px-12 py-6 rounded-[24px] font-black text-xl transition-all duration-500 ${
                        copied ? "bg-green-500 text-white scale-105 shadow-2xl shadow-green-500/30" : "bg-yellow-500 text-black hover:shadow-3xl hover:shadow-yellow-500/40 active:scale-95"
                      }`}
                    >
                      {copied ? <CheckCircle2 size={28} /> : <Copy size={28} />}
                      {copied ? "কপি করা হয়েছে" : "নম্বর কপি করুন"}
                    </button>
                    <button 
                      onClick={handleShare}
                      className="flex items-center gap-4 px-8 py-6 rounded-[24px] bg-white/5 border-2 border-white/10 text-white font-black hover:bg-white/10 transition-all"
                    >
                      <Share2 size={24} />
                      শেয়ার
                    </button>
                  </div>
                </div>
              </div>

              {/* Inbox */}
              <div className="bg-white/5 rounded-[48px] p-12 border border-white/10 shadow-inner">
                <div className="flex items-center justify-between mb-12">
                  <h3 className="text-3xl font-black text-white flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                      <MessageSquare size={28} className="text-yellow-500" />
                    </div>
                    লাইভ ইনবক্স
                  </h3>
                  <button 
                    onClick={() => fetchSms(selectedNumber)}
                    disabled={loading}
                    className="p-4 rounded-2xl bg-white/5 text-gray-400 hover:text-yellow-500 hover:bg-yellow-500/10 transition-all border border-white/5"
                  >
                    <RefreshCw size={24} className={loading ? "animate-spin" : ""} />
                  </button>
                </div>

                {loading && messages.length === 0 ? (
                  <div className="py-32 text-center space-y-8">
                    <div className="relative inline-block">
                      <div className="h-20 w-20 rounded-full border-4 border-yellow-500/10 border-t-yellow-500 animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-10 w-10 rounded-full bg-yellow-500/20 animate-pulse"></div>
                      </div>
                    </div>
                    <p className="text-gray-500 font-black text-lg animate-pulse tracking-widest uppercase">মেসেজ খোঁজা হচ্ছে...</p>
                  </div>
                ) : fetchError ? (
                  <div className="py-24 text-center bg-red-500/5 border-2 border-dashed border-red-500/20 rounded-[40px]">
                    <AlertCircle size={64} className="text-red-500 mx-auto mb-8 opacity-30" />
                    <p className="text-gray-400 text-xl font-bold">সার্ভার থেকে রেসপন্স পাওয়া যাচ্ছে না। অন্য নম্বর দেখুন।</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-32 text-center bg-black/30 rounded-[40px] border-2 border-dashed border-white/5">
                    <p className="text-gray-600 text-lg font-medium italic">ইনবক্স বর্তমানে খালি। কিছুক্ষণ অপেক্ষা করুন।</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {messages.map((msg, i) => (
                      <div 
                        key={i} 
                        className="bg-white/5 border border-white/10 p-10 rounded-[32px] hover:bg-white/[0.08] transition-all group animate-in fade-in slide-in-from-bottom-6 duration-700"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        <div className="flex justify-between items-start mb-6">
                          <span className="px-5 py-2 rounded-xl bg-yellow-500/10 text-yellow-500 text-xs font-black border border-yellow-500/20 uppercase tracking-widest shadow-lg shadow-yellow-500/5">
                            {msg.sender}
                          </span>
                          <span className="text-[11px] text-gray-500 font-black uppercase tracking-widest opacity-60">{msg.time}</span>
                        </div>
                        <p className="text-gray-100 leading-relaxed font-mono text-lg break-words selection:bg-yellow-500 selection:text-black">
                          {msg.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Stats Section */
            <div className="grid md:grid-cols-4 gap-6 mb-20">
              {[
                { label: "সক্রিয় নম্বর", val: "৫০+", icon: Phone },
                { label: "দেশ সমূহ", val: "১০+", icon: Globe },
                { label: "সফল SMS", val: "১০০% ", icon: Zap },
                { label: "প্রাইভেসি", val: "সুরক্ষিত", icon: ShieldCheck }
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 p-8 rounded-[32px] border border-white/10 text-center hover:bg-white/10 transition-all">
                  <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <stat.icon size={24} className="text-yellow-500" />
                  </div>
                  <p className="text-white text-3xl font-black mb-1">{stat.val}</p>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* FAQ Section */}
          <div className="mt-24 max-w-4xl mx-auto">
            <h3 className="text-4xl font-black text-white text-center mb-16 flex items-center justify-center gap-5">
              <HelpCircle size={40} className="text-yellow-500" />
              সাধারণ জিজ্ঞাসা (FAQ)
            </h3>
            <div className="space-y-4">
              {FAQS.map((faq, i) => (
                <div key={i} className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden">
                  <button 
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-white/5 transition-all"
                  >
                    <span className="text-lg font-bold text-white">{faq.q}</span>
                    {openFaq === i ? <ChevronUp className="text-yellow-500" /> : <ChevronDown className="text-gray-500" />}
                  </button>
                  {openFaq === i && (
                    <div className="px-8 pb-8 animate-in fade-in slide-in-from-top-2 duration-300">
                      <p className="text-gray-400 leading-relaxed text-lg">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Info Banner */}
          <div className="mt-24 bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20 p-10 rounded-[40px] flex flex-col md:flex-row gap-8 items-center text-center md:text-left">
            <div className="w-20 h-20 bg-blue-500/20 rounded-3xl flex items-center justify-center shrink-0">
              <Info className="text-blue-400" size={32} />
            </div>
            <div>
              <h4 className="text-white text-xl font-black mb-3">গুরুত্বপূর্ণ তথ্য</h4>
              <p className="text-blue-200/60 text-lg leading-relaxed">
                আমাদের সার্ভিসটি শুধুমাত্র টেম্পোরারি ভেরিফিকেশনের জন্য তৈরি। কোনো ব্যাংকিং লেনদেন বা দীর্ঘমেয়াদী ব্যক্তিগত অ্যাকাউন্টের জন্য এই নম্বরগুলো ব্যবহার না করার অনুরোধ রইল।
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
