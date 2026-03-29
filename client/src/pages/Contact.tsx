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

export default function Contact() {
  return (
    <div style={{ background: "linear-gradient(180deg, #0D1B2A 0%, #132238 100%)", minHeight: "100vh" }}>
      <Seo
        title="যোগাযোগ | মাহবুব সরদার সবুজ"
        description="লেখক মাহবুব সরদার সবুজ-এর সঙ্গে যোগাযোগের জন্য ইমেইল, সামাজিক মাধ্যম, এবং অফিসিয়াল ওয়েবসাইট তথ্য।"
        path="/contact"
        keywords="মাহবুব সরদার সবুজ যোগাযোগ, Mahbub Sardar Sabuj contact, মাহবুব সরদার সবুজ ইমেইল, বাংলা লেখক যোগাযোগ"
      />
      <Navbar />

      <main style={{ paddingTop: 120, paddingBottom: 72 }}>
        <section style={sectionStyle}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <p style={{ color: "#D4A843", letterSpacing: "0.12em", textTransform: "uppercase", fontSize: "0.84rem", fontFamily: "'Space Grotesk', sans-serif", marginBottom: 12 }}>
              Contact Information
            </p>
            <h1 style={{ fontFamily: "'Tiro Bangla', serif", color: "#FDF6EC", fontSize: "clamp(2rem, 4vw, 3.2rem)", marginBottom: 12 }}>
              যোগাযোগ
            </h1>
            <p style={{ ...pStyle, margin: "0 auto", maxWidth: 740 }}>
              পাঠক, শুভানুধ্যায়ী, প্রকাশনা-সংশ্লিষ্ট ব্যক্তি, অথবা সহযোগিতামূলক যোগাযোগের জন্য নিচের মাধ্যমগুলো ব্যবহার করতে পারেন।
            </p>
          </div>

          <article style={cardStyle}>
            <p style={pStyle}>
              মাহবুব সরদার সবুজ-এর সঙ্গে যোগাযোগের সবচেয়ে উপযুক্ত মাধ্যম হলো ইমেইল এবং অফিসিয়াল সামাজিক মাধ্যম প্রোফাইল।সাহিত্য, প্রকাশনা, বই, পাঠ-প্রতিক্রিয়া, অথবা অন্য যেকোনো গঠনমূলক বিষয়ে যোগাযোগ করা যেতে পারে।            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginTop: "1.5rem" }}>
              <div style={{ ...cardStyle, padding: "1.25rem", borderRadius: 16 }}>
                <h2 style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: "#D4A843", fontSize: "1rem", marginBottom: 10 }}>ইমেইল</h2>
                <p style={{ ...pStyle, marginBottom: 0 }}>lekhokmahbubsardarsabuj@gmail.com</p>
              </div>
              <div style={{ ...cardStyle, padding: "1.25rem", borderRadius: 16 }}>
                <h2 style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: "#D4A843", fontSize: "1rem", marginBottom: 10 }}>অবস্থান</h2>
                <p style={{ ...pStyle, marginBottom: 0 }}>কুমিল্লা, বাংলাদেশ</p>
              </div>
              <div style={{ ...cardStyle, padding: "1.25rem", borderRadius: 16 }}>
                <h2 style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: "#D4A843", fontSize: "1rem", marginBottom: 10 }}>ওয়েবসাইট</h2>
                <p style={{ ...pStyle, marginBottom: 0 }}>https://mahbub-sardar-sabuj-live.vercel.app/</p>
              </div>
            </div>

            <div style={{ marginTop: "1.75rem" }}>
              <h2 style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: "#D4A843", fontSize: "1rem", marginBottom: 12 }}>সামাজিক মাধ্যম</h2>
              <p style={pStyle}>Facebook: https://facebook.com/MahbubSardarSabuj</p>
              <p style={pStyle}>Instagram: https://www.instagram.com/mahbub_sardar_sabuj</p>
              <p style={{ ...pStyle, marginBottom: 0 }}>YouTube: https://youtube.com/@mahbubsardarsabuj</p>
            </div>
          </article>
        </section>
      </main>

      <Footer />
    </div>
  );
}
