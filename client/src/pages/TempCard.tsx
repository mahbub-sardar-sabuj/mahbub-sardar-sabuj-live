import { useState, useMemo } from "react";
import { 
  CreditCard, ShieldCheck, Zap, RefreshCw, Copy, CheckCircle2, 
  Lock, Globe, Info, AlertCircle, Calendar, Hash, User
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";

interface CardDetails {
  number: string;
  cvv: string;
  expiry: string;
  type: string;
  bank: string;
  country: string;
}

const BINS = [
  { bin: "453590", type: "Visa", bank: "Capital One", country: "USA" },
  { bin: "483698", type: "Visa", bank: "Chase Bank", country: "USA" },
  { bin: "546616", type: "Mastercard", bank: "Citibank", country: "USA" },
  { bin: "512066", type: "Mastercard", bank: "Wells Fargo", country: "USA" },
  { bin: "371449", type: "Amex", bank: "American Express", country: "USA" },
  { bin: "448590", type: "Visa", bank: "Barclays", country: "UK" },
  { bin: "414720", type: "Visa", bank: "Deutsche Bank", country: "Germany" },
];

export default function TempCard() {
  const [generatedCard, setGeneratedCard] = useState<CardDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedBin, setSelectedBin] = useState(BINS[0]);

  const generateLuhn = (prefix: string, length: number) => {
    let cardNum = prefix;
    while (cardNum.length < length - 1) {
      cardNum += Math.floor(Math.random() * 10);
    }

    let sum = 0;
    let shouldDouble = true;
    for (let i = cardNum.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNum.charAt(i));
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }

    const checkDigit = (10 - (sum % 10)) % 10;
    return cardNum + checkDigit;
  };

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      const number = generateLuhn(selectedBin.bin, 16);
      const cvv = Math.floor(Math.random() * 899 + 100).toString();
      
      const month = Math.floor(Math.random() * 12 + 1).toString().padStart(2, '0');
      const year = (new Date().getFullYear() + Math.floor(Math.random() * 5 + 2)).toString().slice(-2);
      
      setGeneratedCard({
        number,
        cvv,
        expiry: `${month}/${year}`,
        type: selectedBin.type,
        bank: selectedBin.bank,
        country: selectedBin.country
      });
      setLoading(false);
    }, 600);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <>
      <Seo 
        title="ফ্রি ভার্চুয়াল ভিসা কার্ড জেনারেটর — টেস্টিং ও ট্রায়াল"
        description="অনলাইন ভেরিফিকেশন এবং ফ্রি ট্রায়ালের জন্য ভ্যালিড ভার্চুয়াল ক্রেডিট কার্ড (Visa, Mastercard) জেনারেট করুন।"
        path="/temp-card"
      />
      <Navbar />

      <div className="min-h-screen pb-32 pt-24" style={{
        background: "linear-gradient(135deg, #060E1A 0%, #0a1628 40%, #0d1f3c 100%)",
        fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif"
      }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="flex justify-center gap-3 mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-bold uppercase tracking-widest">
                <ShieldCheck size={14} /> 100% Safe for Testing
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/25 text-yellow-400 text-xs font-bold uppercase tracking-widest">
                <Zap size={14} /> Instant Generation
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
              ভার্চুয়াল <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500">ভিসা কার্ড</span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              ফ্রি ট্রায়াল এবং অনলাইন টেস্টিংয়ের জন্য তাৎক্ষণিক ভ্যালিড কার্ড জেনারেট করুন। 
              <br />কোনো ব্যক্তিগত তথ্যের প্রয়োজন নেই।
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Control Panel */}
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-3xl border border-white/[0.08] p-8 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Hash className="text-blue-400" size={20} /> কার্ড কনফিগারেশন
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">কার্ডের ধরন ও বিন (BIN) সিলেক্ট করুন</label>
                  <div className="grid grid-cols-1 gap-3">
                    {BINS.map((bin) => (
                      <button
                        key={bin.bin}
                        onClick={() => setSelectedBin(bin)}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          selectedBin.bin === bin.bin 
                          ? "bg-blue-500/10 border-blue-500/50 ring-1 ring-blue-500/50" 
                          : "bg-black/20 border-white/5 hover:border-white/20"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-white font-bold">{bin.type} - {bin.bin}</p>
                            <p className="text-xs text-gray-500">{bin.bank} • {bin.country}</p>
                          </div>
                          {selectedBin.bin === bin.bin && <CheckCircle2 size={18} className="text-blue-400" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="animate-spin" /> : <Zap size={18} />}
                  {loading ? "জেনারেট হচ্ছে..." : "নতুন কার্ড জেনারেট করুন"}
                </button>
              </div>
            </div>

            {/* Visual Card Display */}
            <div className="space-y-8">
              {generatedCard ? (
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                  <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-[2rem] border border-white/10 p-8 shadow-2xl overflow-hidden aspect-[1.586/1]">
                    {/* Card Chips & Logo */}
                    <div className="flex justify-between items-start mb-12">
                      <div className="w-12 h-10 bg-gradient-to-br from-yellow-200 to-yellow-600 rounded-md relative overflow-hidden">
                        <div className="absolute inset-0 opacity-30 grid grid-cols-3 grid-rows-3 gap-px">
                          {[...Array(9)].map((_, i) => <div key={i} className="border border-black/20" />)}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-black italic text-2xl tracking-tighter">{generatedCard.type.toUpperCase()}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Virtual Card</p>
                      </div>
                    </div>

                    {/* Card Number */}
                    <div className="mb-8">
                      <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">Card Number</p>
                      <p className="text-2xl md:text-3xl text-white font-mono tracking-[0.2em] font-bold">
                        {generatedCard.number.match(/.{1,4}/g)?.join(' ')}
                      </p>
                    </div>

                    {/* Expiry & CVV */}
                    <div className="flex gap-12">
                      <div>
                        <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">Expiry</p>
                        <p className="text-white font-mono font-bold text-lg">{generatedCard.expiry}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">CVV</p>
                        <p className="text-white font-mono font-bold text-lg">{generatedCard.cvv}</p>
                      </div>
                    </div>

                    {/* Bank Info */}
                    <div className="absolute bottom-8 right-8 text-right opacity-40">
                      <p className="text-xs text-white font-bold">{generatedCard.bank}</p>
                      <p className="text-[10px] text-white">{generatedCard.country}</p>
                    </div>
                  </div>

                  {/* Copy Buttons */}
                  <div className="grid grid-cols-3 gap-3 mt-6">
                    <button 
                      onClick={() => copyToClipboard(generatedCard.number, 'num')}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3 text-white text-xs flex flex-col items-center gap-2 transition-all"
                    >
                      {copied === 'num' ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
                      নম্বর কপি
                    </button>
                    <button 
                      onClick={() => copyToClipboard(generatedCard.expiry, 'exp')}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3 text-white text-xs flex flex-col items-center gap-2 transition-all"
                    >
                      {copied === 'exp' ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Calendar size={16} />}
                      Expiry কপি
                    </button>
                    <button 
                      onClick={() => copyToClipboard(generatedCard.cvv, 'cvv')}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3 text-white text-xs flex flex-col items-center gap-2 transition-all"
                    >
                      {copied === 'cvv' ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Lock size={16} />}
                      CVV কপি
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white/[0.02] border-2 border-dashed border-white/10 rounded-[2rem] aspect-[1.586/1] flex flex-col items-center justify-center text-center p-8">
                  <CreditCard size={48} className="text-gray-700 mb-4" />
                  <p className="text-gray-500 font-bold">কার্ড জেনারেট করতে বাম পাশের বাটনে ক্লিক করুন</p>
                </div>
              )}

              {/* Info Box */}
              <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-6">
                <h3 className="text-blue-400 font-bold flex items-center gap-2 mb-3">
                  <Info size={16} /> গুরুত্বপূর্ণ তথ্য
                </h3>
                <ul className="space-y-2 text-sm text-gray-400 leading-relaxed">
                  <li className="flex gap-2"><span className="text-blue-500">•</span> এই কার্ডগুলো শুধুমাত্র টেস্টিং এবং ফ্রি ট্রায়াল ভেরিফিকেশনের জন্য।</li>
                  <li className="flex gap-2"><span className="text-blue-500">•</span> এগুলো দিয়ে কোনো আসল পেমেন্ট বা কেনাকাটা করা যাবে না।</li>
                  <li className="flex gap-2"><span className="text-blue-500">•</span> আপনার ব্যক্তিগত নিরাপত্তা বজায় রাখতে এগুলো ব্যবহার করুন।</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
