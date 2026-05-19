import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import AdSenseAd from "@/components/AdSenseAd";

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
  marginBottom: "1.5rem",
};

const h2Style: React.CSSProperties = {
  fontFamily: "'Noto Sans Bengali', sans-serif",
  color: "#FDF6EC",
  fontSize: "1.1rem",
  marginBottom: 14,
  marginTop: 28,
  borderLeft: "3px solid #D4A843",
  paddingLeft: 12,
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

      <main style={{ paddingTop: "calc(var(--site-nav-offset, 98px) + 1.5rem)", paddingBottom: 72 }}>
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
              কার্যকারিতা শুরুর তারিখ: ২৮ মার্চ ২০২৬ | সর্বশেষ আপডেট: ১১ মে ২০২৬
            </h2>

            <p style={pStyle}>
              Mahbub Sardar Sabuj-এর অফিসিয়াল ওয়েবসাইটে আপনাকে স্বাগতম। আপনার গোপনীয়তা আমাদের কাছে অত্যন্ত গুরুত্বপূর্ণ। এই Privacy Policy-তে ব্যাখ্যা করা হয়েছে যে, আপনি এই ওয়েবসাইট ব্যবহার করলে কী ধরনের তথ্য সংগ্রহ হতে পারে, কীভাবে তা ব্যবহার করা হয়, এবং analytics, embedded content, অথবা advertising services-এর মতো third-party tools কীভাবে যুক্ত হতে পারে।
            </p>

            <h2 style={h2Style}>১. তথ্য সংগ্রহ</h2>
            <p style={pStyle}>
              আপনি যখন এই ওয়েবসাইটে প্রবেশ করেন, তখন কিছু non-personal technical data স্বয়ংক্রিয়ভাবে লগ হতে পারে। এর মধ্যে browser type, device type, operating system, referral source, visited pages, visit duration, এবং IP-related technical information অন্তর্ভুক্ত থাকতে পারে। এই তথ্য website performance বোঝা, security maintain করা, এবং visitor experience উন্নত করার কাজে ব্যবহার করা হতে পারে।
            </p>
            <p style={pStyle}>
              আপনি যদি ইমেইল, যোগাযোগ ফর্ম, social platform, বা অন্য কোনো মাধ্যমে লেখকের সঙ্গে যোগাযোগ করেন, তাহলে আপনার প্রদত্ত নাম, ইমেইল ঠিকানা, এবং বার্তার বিষয়বস্তু সংরক্ষিত হতে পারে। এই তথ্য শুধুমাত্র যোগাযোগের জবাব দেওয়া, প্রয়োজনীয় উত্তর পাঠানো, অথবা সম্পর্কিত অনুরোধ মূল্যায়নের জন্য ব্যবহার করা হবে। আপনার তথ্য অনুমতি ছাড়া তৃতীয় পক্ষের কাছে বিক্রি বা হস্তান্তর করা হবে না।
            </p>

            <h2 style={h2Style}>২. Google AdSense ও বিজ্ঞাপন নীতি</h2>
            <p style={pStyle}>
              এই ওয়েবসাইটে <strong style={{ color: "#D4A843" }}>Google AdSense</strong> ব্যবহার করা হয়। Google AdSense হলো Google LLC-এর একটি বিজ্ঞাপন পরিষেবা যা ওয়েবসাইটে প্রাসঙ্গিক বিজ্ঞাপন প্রদর্শন করে। Publisher ID: <strong style={{ color: "#D4A843" }}>ca-pub-3350204114310360</strong>
            </p>
            <p style={pStyle}>
              Google, তৃতীয় পক্ষের বিক্রেতা হিসেবে, এই সাইটে বিজ্ঞাপন দেখানোর জন্য কুকি (Cookies) ব্যবহার করে। Google-এর ডার্ট (DART) কুকি ব্যবহারের ফলে ব্যবহারকারীরা এই সাইট এবং ইন্টারনেটের অন্যান্য সাইটগুলিতে তাদের পরিদর্শনের উপর ভিত্তি করে বিজ্ঞাপন দেখতে পান।
            </p>
            <p style={pStyle}>
              ব্যবহারকারীরা চাইলে Google-এর বিজ্ঞাপন এবং কন্টেন্ট নেটওয়ার্কের গোপনীয়তা নীতি পরিদর্শন করে ডার্ট কুকি ব্যবহার থেকে বিরত থাকতে পারেন। আপনার পূর্ববর্তী ব্রাউজিং কার্যকলাপের উপর ভিত্তি করে personalized বিজ্ঞাপন দেখানো হতে পারে। Google DoubleClick cookie ব্যবহার করে বিজ্ঞাপনের কার্যকারিতা পরিমাপ করতে পারে এবং আপনার IP address, browser information, ও device identifier সংগ্রহ করা হতে পারে।
            </p>
            <p style={pStyle}>
              আপনি Google-এর বিজ্ঞাপন সেটিংস পরিবর্তন করতে পারেন:{" "}
              <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" style={{ color: "#D4A843" }}>google.com/settings/ads</a>।
              Google-এর Privacy Policy:{" "}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "#D4A843" }}>policies.google.com/privacy</a>
            </p>

            <h2 style={h2Style}>৩. Cookies নীতি</h2>
            <p style={pStyle}>
              Cookies হলো ছোট data files, যা আপনার browser-এ সংরক্ষিত হয়। এই ওয়েবসাইটে প্রয়োজনীয় Cookies (মূল কার্যকারিতার জন্য), Analytics Cookies (Vercel Analytics), এবং বিজ্ঞাপন Cookies (Google AdSense) ব্যবহার করা হতে পারে। আপনি চাইলে আপনার browser settings থেকে cookies disable, restrict, বা delete করতে পারেন।
            </p>

            <h2 style={h2Style}>৪. তৃতীয় পক্ষের সেবা</h2>
            <p style={pStyle}>
              এই ওয়েবসাইটে Google AdSense (বিজ্ঞাপন), Vercel Analytics (পারফরম্যান্স বিশ্লেষণ), Google Fonts (ফন্ট), এবং YouTube Embeds (ভিডিও কন্টেন্ট) ব্যবহার করা হয়। External links-এ প্রবেশ করলে সংশ্লিষ্ট সাইটের নিজস্ব privacy policy প্রযোজ্য হবে।
            </p>

            <h2 style={h2Style}>৫. শিশুদের গোপনীয়তা</h2>
            <p style={pStyle}>
              এই ওয়েবসাইট ১৩ বছরের কম বয়সী শিশুদের কাছ থেকে ইচ্ছাকৃতভাবে কোনো ব্যক্তিগত তথ্য সংগ্রহ করে না।
            </p>

            <h2 style={h2Style}>৬. তথ্যের নিরাপত্তা ও নীতি পরিবর্তন</h2>
            <p style={pStyle}>
              আমরা website security বজায় রাখতে যুক্তিসঙ্গত প্রযুক্তিগত ও প্রশাসনিক ব্যবস্থা অনুসরণ করার চেষ্টা করি। এই Privacy Policy সময় সময় পরিবর্তন করা হতে পারে। ভবিষ্যতে policy update হলে revised version এই পেজে প্রকাশ করা হবে।
            </p>

            <div style={{ marginTop: 28, paddingTop: 24, borderTop: "1px solid rgba(212,168,67,0.16)" }}>
              <h3 style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: "#D4A843", marginBottom: 14, fontSize: "1rem" }}>
                যোগাযোগ
              </h3>
              <p style={pStyle}><strong>নাম:</strong> মাহবুব সরদার সবুজ</p>
              <p style={pStyle}><strong>ইমেইল:</strong> lekhokmahbubsardarsabuj@gmail.com</p>
              <p style={{ ...pStyle, marginBottom: 0 }}><strong>ওয়েবসাইট:</strong> https://www.mahbubsardarsabuj.com/</p>
            </div>
          </article>
         </section>
        {/* AdSense Ad */}
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "1.5rem 1rem" }}>
          <AdSenseAd adSlot="" adFormat="auto" fullWidthResponsive={true} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
