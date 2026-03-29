import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";

const sectionStyle: React.CSSProperties = {
  maxWidth: 920,
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

export default function Terms() {
  return (
    <div style={{ background: "linear-gradient(180deg, #0D1B2A 0%, #132238 100%)", minHeight: "100vh" }}>
      <Seo
        title="Terms and Conditions | মাহবুব সরদার সবুজ"
        description="মাহবুব সরদার সবুজ-এর অফিসিয়াল ওয়েবসাইট ব্যবহারের শর্তাবলি, নীতিমালা, এবং মেধাস্বত্ব সম্পর্কিত তথ্য।"
        path="/terms"
      />
      <Navbar />

      <main style={{ paddingTop: 120, paddingBottom: 72 }}>
        <section style={sectionStyle}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <p style={{ color: "#D4A843", letterSpacing: "0.12em", textTransform: "uppercase", fontSize: "0.84rem", fontFamily: "'Space Grotesk', sans-serif", marginBottom: 12 }}>
              Website Terms
            </p>
            <h1 style={{ fontFamily: "'Tiro Bangla', serif", color: "#FDF6EC", fontSize: "clamp(2rem, 4vw, 3.2rem)", marginBottom: 12 }}>
              Terms and Conditions
            </h1>
            <p style={{ ...pStyle, margin: "0 auto", maxWidth: 740 }}>
              এই ওয়েবসাইট ব্যবহারের মাধ্যমে আপনি নিচের Terms and Conditions-এর সঙ্গে সম্মত হচ্ছেন।
            </p>
          </div>

          <article style={cardStyle}>
            <h2 style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: "#FDF6EC", fontSize: "1.1rem", marginBottom: 20 }}>
              কার্যকারিতা শুরুর তারিখ: ২৮ মার্চ ২০২৬
            </h2>

            <p style={pStyle}>
              Mahbub Sardar Sabuj-এর অফিসিয়াল ওয়েবসাইটে প্রবেশ ও ব্যবহার করার মাধ্যমে আপনি এই Terms and Conditions-এর সঙ্গে সম্মত হচ্ছেন। যদি আপনি এই শর্তগুলোর সঙ্গে একমত না হন, তাহলে অনুগ্রহ করে এই ওয়েবসাইট ব্যবহার থেকে বিরত থাকুন।
            </p>

            <p style={pStyle}>
              এই ওয়েবসাইটে প্রকাশিত লেখা, ছবি, ডিজাইন উপাদান, ব্র্যান্ডিং, এবং অন্যান্য কনটেন্ট—যেখানে আলাদাভাবে উল্লেখ না থাকে—লেখক বা সংশ্লিষ্ট অধিকারধারীর মেধাস্বত্বের অন্তর্ভুক্ত। কোনো কনটেন্ট অনুমতি ছাড়া পুনঃপ্রকাশ, বাণিজ্যিক ব্যবহার, bulk copying, misleading attribution, বা অন্যভাবে অননুমোদিত ব্যবহারের জন্য গ্রহণযোগ্য নয়।
            </p>

            <p style={pStyle}>
              এই ওয়েবসাইট মূলত সাহিত্য, ব্যক্তিগত পরিচিতি, প্রকাশিত বই, আবৃত্তি, এবং পাঠকসংযোগমূলক তথ্য প্রদানের জন্য নির্মিত। এখানে প্রকাশিত তথ্যকে আইনগত, আর্থিক, চিকিৎসা, বা অন্য কোনো পেশাগত পরামর্শ হিসেবে গণ্য করা যাবে না।
            </p>

            <p style={pStyle}>
              আমরা চেষ্টা করি যে ওয়েবসাইটে প্রকাশিত তথ্য যথাসম্ভব সঠিক, হালনাগাদ, এবং কার্যকর থাকে। তবে সব তথ্য সর্বদা সম্পূর্ণ নির্ভুল, uninterrupted, বা error-free থাকবে—এমন নিশ্চয়তা দেওয়া হচ্ছে না। external platform, online store, social media service, বা third-party link-এর availability বা policy change-এর দায় এই ওয়েবসাইট বহন করবে না।
            </p>

            <p style={pStyle}>
              আপনি এই ওয়েবসাইট এমন কোনোভাবে ব্যবহার করতে পারবেন না, যা unlawful, abusive, disruptive, malicious, বা service-compromising। automated scraping, harmful bot activity, unauthorized access attempt, malware distribution, বা infrastructure misuse গ্রহণযোগ্য নয়।
            </p>

            <p style={pStyle}>
              ভবিষ্যতে এই ওয়েবসাইটে বিজ্ঞাপন, analytics tools, embedded video, বা third-party services সংযুক্ত হলে, সেগুলো সংশ্লিষ্ট provider-এর terms ও policies-এর অধীনেও পরিচালিত হতে পারে।
            </p>

            <p style={{ ...pStyle, marginBottom: 0 }}>
              এই Terms and Conditions সময় সময় update করা হতে পারে। updated version এই পেজে প্রকাশ হওয়ার পর তা কার্যকর বলে গণ্য হবে।
            </p>
          </article>
        </section>
      </main>

      <Footer />
    </div>
  );
}
