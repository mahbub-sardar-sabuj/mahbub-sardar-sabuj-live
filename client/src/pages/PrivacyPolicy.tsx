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

export default function PrivacyPolicy() {
  return (
    <div style={{ background: "linear-gradient(180deg, #0D1B2A 0%, #132238 100%)", minHeight: "100vh" }}>
      <Seo
        title="Privacy Policy | মাহবুব সরদার সবুজ"
        description="মাহবুব সরদার সবুজ-এর অফিসিয়াল ওয়েবসাইটের Privacy Policy, যেখানে data usage, cookies, এবং visitor privacy সম্পর্কে তথ্য দেওয়া হয়েছে।"
        path="/privacy-policy"
      />
      <Navbar />

      <main style={{ paddingTop: 120, paddingBottom: 72 }}>
        <section style={sectionStyle}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <p style={{ color: "#D4A843", letterSpacing: "0.12em", textTransform: "uppercase", fontSize: "0.84rem", fontFamily: "'Space Grotesk', sans-serif", marginBottom: 12 }}>
              Legal Information
            </p>
            <h1 style={{ fontFamily: "'Tiro Bangla', serif", color: "#FDF6EC", fontSize: "clamp(2rem, 4vw, 3.2rem)", marginBottom: 12 }}>
              Privacy Policy
            </h1>
            <p style={{ ...pStyle, margin: "0 auto", maxWidth: 740 }}>
              এই Privacy Policy-তে ব্যাখ্যা করা হয়েছে যে, এই ওয়েবসাইট ব্যবহার করার সময় কী ধরনের তথ্য সংগ্রহ হতে পারে, কীভাবে তা ব্যবহার করা হয়, এবং third-party services কীভাবে যুক্ত হতে পারে।
            </p>
          </div>

          <article style={cardStyle}>
            <h2 style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: "#FDF6EC", fontSize: "1.1rem", marginBottom: 20 }}>
              কার্যকারিতা শুরুর তারিখ: ২৮ মার্চ ২০২৬
            </h2>

            <p style={pStyle}>
              Mahbub Sardar Sabuj-এর অফিসিয়াল ওয়েবসাইটে আপনাকে স্বাগতম। আপনার গোপনীয়তা আমাদের কাছে গুরুত্বপূর্ণ। এই Privacy Policy-তে ব্যাখ্যা করা হয়েছে যে, আপনি এই ওয়েবসাইট ব্যবহার করলে কী ধরনের তথ্য সংগ্রহ হতে পারে, কীভাবে তা ব্যবহার করা হয়, এবং analytics, embedded content, অথবা advertising services-এর মতো third-party tools ভবিষ্যতে কীভাবে যুক্ত হতে পারে।
            </p>

            <p style={pStyle}>
              আপনি যখন এই ওয়েবসাইটে প্রবেশ করেন, তখন কিছু non-personal technical data স্বয়ংক্রিয়ভাবে লগ হতে পারে। এর মধ্যে browser type, device type, operating system, referral source, visited pages, visit duration, এবং IP-related technical information অন্তর্ভুক্ত থাকতে পারে। এই তথ্য website performance বোঝা, security maintain করা, এবং visitor experience উন্নত করার কাজে ব্যবহার করা হতে পারে।
            </p>

            <p style={pStyle}>
              আপনি যদি ইমেইল, যোগাযোগ ফর্ম, social platform, বা অন্য কোনো মাধ্যমে লেখকের সঙ্গে যোগাযোগ করেন, তাহলে আপনার প্রদত্ত নাম, ইমেইল ঠিকানা, এবং বার্তার বিষয়বস্তু সংরক্ষিত হতে পারে। এই তথ্য শুধুমাত্র যোগাযোগের জবাব দেওয়া, প্রয়োজনীয় উত্তর পাঠানো, অথবা সম্পর্কিত অনুরোধ মূল্যায়নের জন্য ব্যবহার করা হবে। আপনার তথ্য অনুমতি ছাড়া বিক্রি করা হবে না।
            </p>

            <p style={pStyle}>
              এই ওয়েবসাইটে ভবিষ্যতে Google AdSense বা অন্য advertising partner ব্যবহার করা হলে, third-party vendors cookies, web beacons, IP addresses, বা অনুরূপ identifiers ব্যবহার করতে পারে, যাতে visitor behavior অনুযায়ী বিজ্ঞাপন প্রদর্শন, ad measurement, এবং performance analysis করা যায়। Google এবং তার partners আপনার browser-এ cookies সেট করতে পারে বা বিদ্যমান cookies পড়তে পারে, যাতে personalized বা non-personalized ads পরিবেশন করা যায়।
            </p>

            <p style={pStyle}>
              Cookies হলো ছোট data files, যা আপনার browser-এ সংরক্ষিত হয়। এগুলো user preferences মনে রাখা, analytics বোঝা, এবং advertisement delivery বা measurement উন্নত করার জন্য ব্যবহৃত হতে পারে। আপনি চাইলে আপনার browser settings থেকে cookies disable, restrict, বা delete করতে পারেন। তবে এতে website-এর কিছু feature বা experience সীমিত হতে পারে।
            </p>

            <p style={pStyle}>
              এই ওয়েবসাইটে external links থাকতে পারে, যেমন social media profiles, online bookstores, video platforms, বা অন্য third-party websites। আপনি যখন এসব external service-এ প্রবেশ করবেন, তখন তাদের নিজস্ব privacy policy ও terms প্রযোজ্য হবে। তাই external website ব্যবহারের আগে সংশ্লিষ্ট policy পড়ে নেওয়া আপনার দায়িত্ব।
            </p>

            <p style={pStyle}>
              আমরা website security বজায় রাখতে যুক্তিসঙ্গত প্রযুক্তিগত ও প্রশাসনিক ব্যবস্থা অনুসরণ করার চেষ্টা করি। তবে internet-based transmission বা digital storage কোনো ক্ষেত্রেই শতভাগ নিরাপদ নয়। তাই ব্যবহারকারীদের অনুরোধ করা হচ্ছে যে, সংবেদনশীল ব্যক্তিগত তথ্য শেয়ার করার ক্ষেত্রে নিজ দায়িত্বে সতর্ক থাকুন।
            </p>

            <p style={pStyle}>
              এই Privacy Policy সময় সময় পরিবর্তন করা হতে পারে। ভবিষ্যতে policy update হলে revised version এই পেজে প্রকাশ করা হবে। updated policy প্রকাশের পর তা কার্যকর বলে বিবেচিত হবে।
            </p>

            <div style={{ marginTop: 28, paddingTop: 24, borderTop: "1px solid rgba(212,168,67,0.16)" }}>
              <h3 style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: "#D4A843", marginBottom: 14, fontSize: "1rem" }}>
                যোগাযোগ
              </h3>
              <p style={pStyle}><strong>নাম:</strong> মাহবুব সরদার সবুজ</p>
              <p style={pStyle}><strong>ইমেইল:</strong> lekhokmahbubsardarsabuj@gmail.com</p>
              <p style={{ ...pStyle, marginBottom: 0 }}><strong>ওয়েবসাইট:</strong> https://mahbub-sardar-sabuj-live.vercel.app/</p>
            </div>
          </article>
        </section>
      </main>

      <Footer />
    </div>
  );
}
