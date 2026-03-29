import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";

const sectionStyle: React.CSSProperties = {
  maxWidth: 980,
  margin: "0 auto",
  padding: "0 1.5rem",
};

const cardStyle: React.CSSProperties = {
  background: "rgba(253,246,236,0.04)",
  border: "1px solid rgba(212,168,67,0.18)",
  borderRadius: 20,
  padding: "2rem",
  boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
};

const pStyle: React.CSSProperties = {
  fontFamily: "'Noto Sans Bengali', sans-serif",
  color: "rgba(253,246,236,0.84)",
  fontSize: "1rem",
  lineHeight: 1.95,
  marginBottom: "1rem",
};

export default function About() {
  return (
    <div style={{ background: "linear-gradient(180deg, #0D1B2A 0%, #132238 100%)", minHeight: "100vh" }}>
      <Seo
        title="পরিচিতি | মাহবুব সরদার সবুজ"
        description="লেখক মাহবুব সরদার সবুজের পরিচিতি, সাহিত্যচর্চা, বই, এবং সৃজনশীল যাত্রা সম্পর্কে জানুন।"
        path="/about"
      />
      <Navbar />

      <main style={{ paddingTop: 120, paddingBottom: 72 }}>
        <section style={sectionStyle}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <p style={{ color: "#D4A843", letterSpacing: "0.12em", textTransform: "uppercase", fontSize: "0.84rem", fontFamily: "'Space Grotesk', sans-serif", marginBottom: 12 }}>
              Author Profile
            </p>
            <h1 style={{ fontFamily: "'Tiro Bangla', serif", color: "#FDF6EC", fontSize: "clamp(2rem, 4vw, 3.2rem)", marginBottom: 12 }}>
              About Mahbub Sardar Sabuj
            </h1>
            <p style={{ ...pStyle, margin: "0 auto", maxWidth: 740 }}>
              মাহবুব সরদার সবুজ একজন বাংলা ভাষার লেখক, কবি, এবং আবৃত্তিমনস্ক সৃজনশীল মানুষ, যিনি পাঠকের অনুভূতিকে লেখার ভাষায় তুলে ধরেন।
            </p>
          </div>

          <article style={cardStyle}>
            <p style={pStyle}>
              মাহবুব সরদার সবুজ একজন বাংলা ভাষার লেখক, কবি, এবং আবৃত্তিমনস্ক সৃজনশীল ব্যক্তি, যিনি ভালোবাসা, বিচ্ছেদ, জীবনসংগ্রাম, স্মৃতি, এবং মানবিক অনুভূতিকে সহজ অথচ আবেগঘন ভাষায় প্রকাশ করে পাঠকের কাছে পরিচিত হয়েছেন। তাঁর লেখার স্বর ব্যক্তিগত অনুভব, সামাজিক বাস্তবতা, এবং পাঠকের হৃদয়ের কথাকে একত্রে ধারণ করে।
            </p>

            <p style={pStyle}>
              তিনি কুমিল্লা জেলার বরুড়া উপজেলার খোশবাস ইউনিয়নের আরিফপুর গ্রামের সরদার বাড়িতে জন্মগ্রহণ করেন। কর্মসূত্রে সৌদি আরবে অবস্থান করলেও বাংলা ভাষা, সাহিত্য, এবং পাঠকের সঙ্গে তাঁর সম্পর্ক অটুট রয়েছে। লেখালেখি তাঁর কাছে শুধু শখ নয়; এটি আত্মপ্রকাশ, সংবেদনশীল অভিজ্ঞতার প্রকাশ, এবং পাঠকের সঙ্গে মানসিক সংযোগ তৈরির এক অনন্য মাধ্যম।
            </p>

            <p style={pStyle}>
              মাহবুব সরদার সবুজের হাজার হাজার লেখা বিভিন্ন সামাজিক প্ল্যাটফর্মে প্রকাশিত হয়েছে। তাঁর একাধিক ই-বুক রয়েছে এবং একটি ফিজিক্যাল বইও প্রকাশিত হয়েছে। সাহিত্যচর্চা, আবৃত্তি, এবং পাঠকসংযোগ—এই তিনটি ধারা তাঁর সৃজনশীল পরিচয়ের গুরুত্বপূর্ণ অংশ।
            </p>

            <p style={{ ...pStyle, marginBottom: 0 }}>
              এই ওয়েবসাইটটি তাঁর অফিসিয়াল উপস্থিতি হিসেবে নির্মিত হয়েছে, যাতে পাঠক, শুভানুধ্যায়ী, এবং আগ্রহী দর্শনার্থীরা তাঁর পরিচিতি, বই, লেখালেখি, আবৃত্তি, সংবাদ, গ্যালারি, এবং যোগাযোগের তথ্য এক জায়গা থেকে জানতে পারেন।
            </p>
          </article>
        </section>
      </main>

      <Footer />
    </div>
  );
}
