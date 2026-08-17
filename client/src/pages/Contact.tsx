import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  Check,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Quote,
  Send,
  Sparkles,
  Youtube,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import AdSenseAd, { AD_SLOTS } from "@/components/AdSenseAd";
import { clearBengaliValidation, showBengaliValidation } from "@/lib/bengaliFormValidation";

const GOLD = "#C9A84C";
const GOLD_LIGHT = "#E8C97A";
const BG = "#060E1A";
const TEXT = "#FAF6EF";
const MUTED = "rgba(250,246,239,0.62)";
const CONTACT_PORTRAIT = "/images/og-home-suit.jpg";

const socialLinks = [
  {
    name: "Facebook",
    handle: "MahbubSardarSabuj",
    url: "https://facebook.com/MahbubSardarSabuj",
    icon: Facebook,
    color: "#5B9CFF",
  },
  {
    name: "Instagram",
    handle: "mahbub_sardar_sabuj",
    url: "https://www.instagram.com/mahbub_sardar_sabuj",
    icon: Instagram,
    color: "#F06A9B",
  },
  {
    name: "YouTube",
    handle: "@MahbubSardarSabuj",
    url: "https://youtube.com/@MahbubSardarSabuj",
    icon: Youtube,
    color: "#FF7777",
  },
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(3,10,19,0.50)",
  border: "1px solid rgba(250,246,239,0.10)",
  borderRadius: 16,
  padding: "15px 17px",
  color: TEXT,
  fontFamily: "'AdorshoLipi', sans-serif",
  fontSize: "0.96rem",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.24s ease, box-shadow 0.24s ease, background 0.24s ease",
  WebkitAppearance: "none",
};

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "", website: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [focused, setFocused] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();

    if (!name || !email || !message) {
      setErrorMsg("নাম, ইমেইল ও বার্তা পূরণ করুন।");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setErrorMsg("সঠিক ইমেইল ঠিকানা লিখুন।");
      return;
    }

    setStatus("sending");
    setErrorMsg(null);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, name, email, message }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setStatus("sent");
        setTimeout(() => {
          setStatus("idle");
          setForm({ name: "", email: "", subject: "", message: "", website: "" });
        }, 5000);
      } else {
        setErrorMsg(data.error || "বার্তা পাঠাতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।");
        setStatus("idle");
      }
    } catch {
      setErrorMsg("নেটওয়ার্ক সমস্যা। ইন্টারনেট সংযোগ পরীক্ষা করুন।");
      setStatus("idle");
    }
  };

  const getFocusStyle = (field: string): React.CSSProperties =>
    focused === field
      ? {
          ...inputStyle,
          background: "rgba(13,29,48,0.78)",
          borderColor: "rgba(232,201,122,0.82)",
          boxShadow: "0 0 0 4px rgba(201,168,76,0.12), 0 12px 30px rgba(0,0,0,0.16)",
        }
      : inputStyle;

  return (
    <>
      <style>{`
        .contact-page {
          min-height: 100vh;
          overflow: hidden;
          background:
            radial-gradient(circle at 86% 8%, rgba(201,168,76,0.12), transparent 23%),
            radial-gradient(circle at 8% 44%, rgba(37,92,142,0.16), transparent 24%),
            ${BG};
        }
        .contact-hero {
          position: relative;
          padding: calc(var(--site-nav-offset, 98px) + 36px) 1.5rem 4.4rem;
          overflow: hidden;
        }
        .contact-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 12% 30%, rgba(201,168,76,0.15), transparent 24%),
            radial-gradient(circle at 88% 8%, rgba(55,104,154,0.16), transparent 28%),
            linear-gradient(118deg, rgba(4,12,22,0.92), rgba(7,18,31,0.52) 52%, rgba(4,12,22,0.91));
          pointer-events: none;
        }
        .contact-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(232,201,122,0.11) 0.75px, transparent 0.75px);
          background-size: 26px 26px;
          mask-image: linear-gradient(to bottom, black, transparent 90%);
          opacity: 0.38;
          pointer-events: none;
        }
        .contact-hero-orbit {
          position: absolute !important;
          z-index: 0 !important;
          width: min(74vw, 820px);
          height: min(74vw, 820px);
          right: -13%;
          top: -45%;
          border: 1px solid rgba(232,201,122,0.12);
          border-radius: 50%;
          box-shadow: 0 0 0 60px rgba(201,168,76,0.022), 0 0 110px rgba(201,168,76,0.09);
          pointer-events: none;
        }
        .contact-hero-inner {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: minmax(0, 0.95fr) minmax(320px, 0.78fr);
          align-items: center;
          gap: clamp(2rem, 7vw, 7rem);
          max-width: 1180px;
          margin: 0 auto;
        }
        .contact-hero-copy-column {
          min-width: 0;
          padding: 1.35rem 0;
        }
        .contact-kicker {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          border: 1px solid rgba(232,201,122,0.30);
          background: rgba(201,168,76,0.08);
          border-radius: 999px;
          padding: 7px 15px 7px 11px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.09), 0 12px 34px rgba(0,0,0,0.16);
        }
        .contact-kicker-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: ${GOLD_LIGHT};
          box-shadow: 0 0 0 5px rgba(232,201,122,0.10), 0 0 12px ${GOLD};
        }
        .contact-kicker span {
          color: ${GOLD_LIGHT};
          font-family: 'AdorshoLipi', sans-serif;
          font-size: 0.72rem;
          letter-spacing: 0.22em;
        }
        .contact-hero-title {
          max-width: 680px;
          margin: 1.35rem 0 0;
          color: ${TEXT};
          font-family: 'AdorshoLipi', sans-serif;
          font-size: clamp(2.55rem, 6vw, 5.1rem);
          font-weight: 700;
          letter-spacing: -0.035em;
          line-height: 1.12;
          text-shadow: 0 12px 42px rgba(0,0,0,0.48);
        }
        .contact-hero-title em {
          color: transparent;
          font-style: normal;
          background: linear-gradient(112deg, #AE7B21, #F5E5AB 44%, #C9A84C 72%, #8D6114);
          background-clip: text;
          -webkit-background-clip: text;
          text-shadow: none;
        }
        .contact-hero-copy {
          max-width: 560px;
          margin: 1.2rem 0 0;
          color: ${MUTED};
          font-family: 'AdorshoLipi', sans-serif;
          font-size: clamp(0.98rem, 2vw, 1.08rem);
          line-height: 1.95;
        }
        .contact-hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.8rem;
          margin-top: 1.7rem;
        }
        .contact-hero-action {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-height: 44px;
          padding: 0 17px;
          border: 1px solid rgba(201,168,76,0.30);
          border-radius: 999px;
          color: ${TEXT};
          background: rgba(7,18,31,0.58);
          text-decoration: none;
          font-family: 'AdorshoLipi', sans-serif;
          font-size: 0.86rem;
          transition: transform 0.25s ease, border-color 0.25s ease, background 0.25s ease;
        }
        .contact-hero-action:hover {
          transform: translateY(-2px);
          border-color: rgba(232,201,122,0.72);
          background: rgba(201,168,76,0.10);
        }
        .contact-portrait-stage {
          position: relative;
          width: min(100%, 390px);
          justify-self: end;
          padding: 13px;
        }
        .contact-portrait-stage::before {
          content: "";
          position: absolute;
          inset: 0;
          border: 1px solid rgba(232,201,122,0.48);
          border-radius: 30px;
          background: linear-gradient(145deg, rgba(201,168,76,0.16), rgba(10,25,43,0.08));
          box-shadow: 0 30px 80px rgba(0,0,0,0.52), 0 0 65px rgba(201,168,76,0.13), inset 0 1px 0 rgba(255,255,255,0.18);
        }
        .contact-portrait-stage::after {
          content: "";
          position: absolute;
          width: 58%;
          height: 58%;
          top: -15px;
          right: -15px;
          border: 1px solid rgba(232,201,122,0.26);
          border-radius: 26px;
          pointer-events: none;
        }
        .contact-portrait-frame {
          position: relative;
          z-index: 1;
          aspect-ratio: 4 / 5;
          overflow: hidden;
          border: 1px solid rgba(250,246,239,0.10);
          border-radius: 22px;
          background: #0B1726;
        }
        .contact-portrait-frame img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          filter: contrast(1.05) saturate(0.94) brightness(0.98);
        }
        .contact-portrait-frame::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(145deg, rgba(201,168,76,0.10), transparent 34%, rgba(4,12,22,0.20));
          pointer-events: none;
        }
        .contact-portrait-ornament {
          position: absolute;
          z-index: 2;
          left: -9px;
          bottom: 34px;
          display: grid;
          place-items: center;
          width: 31px;
          height: 31px;
          border: 1px solid rgba(232,201,122,0.56);
          border-radius: 50%;
          color: ${GOLD_LIGHT};
          background: #0A1626;
          box-shadow: 0 0 20px rgba(201,168,76,0.22);
        }
        @media (max-width: 820px) {
          .contact-hero { padding: calc(var(--site-nav-offset, 84px) + 30px) 1rem 3.1rem; }
          .contact-hero-inner { grid-template-columns: 1fr; gap: 1.5rem; max-width: 620px; text-align: center; }
          .contact-hero-copy-column { order: 2; padding: 0; }
          .contact-portrait-stage { order: 1; justify-self: center; width: min(78vw, 340px); padding: 10px; }
          .contact-portrait-stage::after { top: -10px; right: -10px; }
          .contact-hero-title, .contact-hero-copy { margin-left: auto; margin-right: auto; }
          .contact-hero-actions { justify-content: center; }
          .contact-hero-orbit { width: 130vw; height: 130vw; right: -56%; top: -25%; }
        }
        @media (max-width: 430px) {
          .contact-portrait-stage { width: min(82vw, 315px); }
          .contact-portrait-frame { border-radius: 18px; }
          .contact-portrait-stage::before { border-radius: 25px; }
          .contact-hero-title { font-size: clamp(2.25rem, 11vw, 2.85rem); }
          .contact-hero-copy { line-height: 1.85; }
        }
        .contact-main {
          position: relative;
          z-index: 1;
          max-width: 1180px;
          margin: 0 auto;
          padding: 0 1.5rem 6.5rem;
        }
        .contact-layout {
          display: grid;
          grid-template-columns: minmax(0, 0.88fr) minmax(0, 1.32fr);
          gap: clamp(1.25rem, 4vw, 3.75rem);
          align-items: stretch;
        }
        .contact-left {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .contact-section-label {
          display: flex;
          align-items: center;
          gap: 10px;
          color: ${GOLD_LIGHT};
          font-family: 'AdorshoLipi', sans-serif;
          font-size: 0.73rem;
          letter-spacing: 0.18em;
          margin-bottom: 0.85rem;
        }
        .contact-section-label::before {
          content: "";
          width: 30px;
          height: 1px;
          background: linear-gradient(90deg, transparent, ${GOLD});
        }
        .contact-left-title {
          margin: 0;
          color: ${TEXT};
          font-family: 'AdorshoLipi', sans-serif;
          font-size: clamp(1.9rem, 3.5vw, 2.7rem);
          font-weight: 700;
          line-height: 1.28;
        }
        .contact-left-copy {
          max-width: 440px;
          margin: 0.8rem 0 1.65rem;
          color: ${MUTED};
          font-family: 'AdorshoLipi', sans-serif;
          font-size: 0.96rem;
          line-height: 1.85;
        }
        .contact-channel-list {
          display: grid;
          gap: 0.8rem;
        }
        .contact-channel, .contact-location {
          display: flex;
          align-items: center;
          gap: 0.95rem;
          min-width: 0;
          border: 1px solid rgba(250,246,239,0.08);
          border-radius: 19px;
          padding: 1rem;
          background: linear-gradient(135deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018));
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 15px 32px rgba(0,0,0,0.14);
          transition: transform 0.28s ease, border-color 0.28s ease, box-shadow 0.28s ease;
        }
        .contact-channel {
          text-decoration: none;
          cursor: pointer;
        }
        .contact-channel:hover {
          transform: translateX(4px);
          border-color: rgba(232,201,122,0.42);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 20px 38px rgba(0,0,0,0.24);
        }
        .contact-channel-icon {
          display: grid;
          place-items: center;
          width: 45px;
          height: 45px;
          flex: 0 0 45px;
          border: 1px solid rgba(232,201,122,0.24);
          border-radius: 14px;
          color: ${GOLD_LIGHT};
          background: linear-gradient(145deg, rgba(201,168,76,0.19), rgba(201,168,76,0.05));
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.16);
        }
        .contact-channel-eyebrow {
          margin-bottom: 3px;
          color: rgba(250,246,239,0.48);
          font-family: 'AdorshoLipi', sans-serif;
          font-size: 0.68rem;
          letter-spacing: 0.14em;
        }
        .contact-channel-value {
          overflow-wrap: anywhere;
          color: ${TEXT};
          font-family: 'AdorshoLipi', sans-serif;
          font-size: clamp(0.78rem, 1.6vw, 0.94rem);
          font-weight: 600;
        }
        .contact-channel-arrow {
          margin-left: auto;
          color: ${GOLD};
          opacity: 0.75;
          flex: 0 0 auto;
        }
        .contact-location {
          margin-top: 0.8rem;
        }
        .contact-social-title {
          margin: 1.65rem 0 0.8rem;
          color: rgba(250,246,239,0.54);
          font-family: 'AdorshoLipi', sans-serif;
          font-size: 0.72rem;
          letter-spacing: 0.17em;
        }
        .contact-social-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.7rem;
        }
        .contact-social-link {
          min-width: 0;
          padding: 0.9rem 0.65rem;
          border: 1px solid rgba(250,246,239,0.08);
          border-radius: 17px;
          background: rgba(255,255,255,0.025);
          color: ${TEXT};
          text-align: center;
          text-decoration: none;
          transition: transform 0.25s ease, border-color 0.25s ease, background 0.25s ease;
        }
        .contact-social-link:hover {
          transform: translateY(-4px);
          border-color: var(--social-color);
          background: color-mix(in srgb, var(--social-color) 10%, transparent);
        }
        .contact-social-icon {
          display: grid;
          place-items: center;
          width: 34px;
          height: 34px;
          margin: 0 auto 0.45rem;
          border-radius: 11px;
          color: var(--social-color);
          background: color-mix(in srgb, var(--social-color) 11%, transparent);
        }
        .contact-social-name {
          display: block;
          overflow: hidden;
          color: ${TEXT};
          font-family: 'AdorshoLipi', sans-serif;
          font-size: 0.77rem;
          font-weight: 600;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .contact-social-handle {
          display: block;
          overflow: hidden;
          margin-top: 2px;
          color: rgba(250,246,239,0.45);
          font-family: 'AdorshoLipi', sans-serif;
          font-size: 0.60rem;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .contact-quote {
          position: relative;
          margin-top: auto;
          padding: 1.35rem 1.35rem 1.3rem;
          border: 1px solid rgba(201,168,76,0.20);
          border-radius: 20px;
          background: linear-gradient(145deg, rgba(201,168,76,0.115), rgba(201,168,76,0.025));
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.10), 0 22px 50px rgba(0,0,0,0.16);
          overflow: hidden;
        }
        .contact-quote::after {
          content: "";
          position: absolute;
          right: -40px;
          bottom: -70px;
          width: 150px;
          height: 150px;
          border: 1px solid rgba(232,201,122,0.14);
          border-radius: 50%;
        }
        .contact-quote p {
          position: relative;
          z-index: 1;
          margin: 0.7rem 0 0;
          color: ${GOLD_LIGHT};
          font-family: 'AdorshoLipi', sans-serif;
          font-size: 0.98rem;
          font-style: italic;
          line-height: 1.85;
        }
        .contact-quote cite {
          position: relative;
          z-index: 1;
          display: block;
          margin-top: 0.55rem;
          color: rgba(250,246,239,0.52);
          font-family: 'AdorshoLipi', sans-serif;
          font-size: 0.76rem;
          font-style: normal;
        }
        .contact-form-card {
          position: relative;
          padding: clamp(1.3rem, 4vw, 2.8rem);
          border: 1px solid rgba(232,201,122,0.24);
          border-radius: clamp(24px, 4vw, 34px);
          background:
            linear-gradient(145deg, rgba(22,42,64,0.88) 0%, rgba(8,19,33,0.92) 56%, rgba(5,13,24,0.96) 100%);
          box-shadow: 0 38px 100px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.11);
          overflow: hidden;
          backdrop-filter: blur(18px) saturate(125%);
        }
        .contact-form-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 100% 0%, rgba(232,201,122,0.18), transparent 28%),
            linear-gradient(115deg, rgba(255,255,255,0.035), transparent 35%);
          pointer-events: none;
        }
        .contact-form-card::after {
          content: "";
          position: absolute;
          top: 0;
          left: 8%;
          right: 8%;
          height: 2px;
          background: linear-gradient(90deg, transparent, ${GOLD}, ${GOLD_LIGHT}, transparent);
          box-shadow: 0 0 20px rgba(201,168,76,0.55);
          pointer-events: none;
        }
        .contact-form-content {
          position: relative;
          z-index: 1;
        }
        .contact-form-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.75rem;
        }
        .contact-form-title {
          margin: 0;
          color: ${TEXT};
          font-family: 'AdorshoLipi', sans-serif;
          font-size: clamp(1.65rem, 3vw, 2.25rem);
          line-height: 1.25;
        }
        .contact-form-copy {
          max-width: 450px;
          margin: 0.45rem 0 0;
          color: ${MUTED};
          font-family: 'AdorshoLipi', sans-serif;
          font-size: 0.91rem;
          line-height: 1.8;
        }
        .contact-form-mark {
          display: grid;
          place-items: center;
          width: 44px;
          height: 44px;
          flex: 0 0 44px;
          border: 1px solid rgba(232,201,122,0.30);
          border-radius: 15px;
          color: ${GOLD_LIGHT};
          background: rgba(201,168,76,0.10);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.12);
        }
        .contact-form-fields {
          display: flex;
          flex-direction: column;
          gap: 1.05rem;
        }
        .contact-name-email-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
        }
        .contact-field label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          margin: 0 0 0.45rem;
          color: rgba(250,246,239,0.67);
          font-family: 'AdorshoLipi', sans-serif;
          font-size: 0.79rem;
        }
        .contact-field label span {
          color: rgba(250,246,239,0.35);
          font-size: 0.72rem;
        }
        .contact-submit {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          width: 100%;
          min-height: 54px;
          margin-top: 0.35rem;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 16px;
          color: #07111f;
          background: linear-gradient(115deg, #B8892D, #F2D982 48%, #C59C45);
          box-shadow: 0 14px 31px rgba(201,168,76,0.20), inset 0 1px 0 rgba(255,255,255,0.45);
          cursor: pointer;
          font-family: 'AdorshoLipi', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          transition: filter 0.25s ease, box-shadow 0.25s ease;
        }
        .contact-submit:disabled {
          cursor: not-allowed;
          filter: saturate(0.35) brightness(0.85);
        }
        .contact-form-note {
          display: flex;
          justify-content: center;
          gap: 6px;
          margin: 0;
          color: rgba(250,246,239,0.43);
          font-family: 'AdorshoLipi', sans-serif;
          font-size: 0.73rem;
          text-align: center;
        }
        .contact-error {
          border: 1px solid rgba(255,118,118,0.32);
          border-radius: 13px;
          padding: 0.8rem 0.9rem;
          color: #FF9696;
          background: rgba(212,76,76,0.10);
          font-family: 'AdorshoLipi', sans-serif;
          font-size: 0.86rem;
          text-align: center;
        }
        .contact-success {
          min-height: 390px;
          display: grid;
          align-content: center;
          justify-items: center;
          text-align: center;
          padding: 1.5rem;
        }
        .contact-success-icon {
          display: grid;
          place-items: center;
          width: 76px;
          height: 76px;
          border: 1px solid rgba(232,201,122,0.42);
          border-radius: 24px;
          color: ${GOLD_LIGHT};
          background: rgba(201,168,76,0.12);
          box-shadow: 0 0 0 8px rgba(201,168,76,0.055), 0 20px 40px rgba(0,0,0,0.18);
        }
        .contact-success h3 {
          margin: 1.55rem 0 0.65rem;
          color: ${GOLD_LIGHT};
          font-family: 'AdorshoLipi', sans-serif;
          font-size: 1.65rem;
        }
        .contact-success p {
          max-width: 390px;
          margin: 0;
          color: ${MUTED};
          font-family: 'AdorshoLipi', sans-serif;
          font-size: 0.92rem;
          line-height: 1.85;
        }
        input::placeholder, textarea::placeholder { color: rgba(250,246,239,0.30); }
        input:-webkit-autofill, textarea:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 1000px #0c1b2d inset !important;
          -webkit-text-fill-color: ${TEXT} !important;
        }
        @media (max-width: 900px) {
          .contact-layout { grid-template-columns: 1fr; }
          .contact-left { max-width: 720px; width: 100%; margin: 0 auto; }
          .contact-quote { margin-top: 1.35rem; }
        }
        @media (max-width: 600px) {
          .contact-hero { padding: calc(var(--site-nav-offset, 84px) + 35px) 1rem 2.9rem; }
          .contact-main { padding: 0 1rem 4.5rem; }
          .contact-hero-title { font-size: clamp(2.25rem, 11.5vw, 3rem); }
          .contact-hero-actions { gap: 0.6rem; }
          .contact-hero-action { min-height: 41px; padding: 0 14px; font-size: 0.79rem; }
          .contact-name-email-row { grid-template-columns: 1fr; gap: 0.95rem; }
          .contact-social-grid { gap: 0.55rem; }
          .contact-social-link { padding: 0.8rem 0.35rem; border-radius: 14px; }
          .contact-social-name { font-size: 0.69rem; }
          .contact-social-handle { font-size: 0.55rem; }
          .contact-channel, .contact-location { padding: 0.85rem; border-radius: 16px; }
          .contact-channel-icon { width: 41px; height: 41px; flex-basis: 41px; border-radius: 13px; }
          .contact-form-card { border-radius: 24px; padding: 1.2rem; }
          .contact-form-header { margin-bottom: 1.35rem; }
        }
        @media (max-width: 370px) {
          .contact-social-grid { grid-template-columns: 1fr; }
          .contact-social-link { display: flex; align-items: center; gap: 0.6rem; text-align: left; padding: 0.68rem 0.8rem; }
          .contact-social-icon { width: 30px; height: 30px; margin: 0; }
          .contact-channel-value { font-size: 0.72rem; }
        }
        @media (prefers-reduced-motion: reduce) {
          .contact-page *, .contact-page *::before, .contact-page *::after { scroll-behavior: auto !important; transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
        }
      `}</style>

      <div className="contact-page">
        <Seo
          title="যোগাযোগ | মাহবুব সরদার সবুজ | Mahbub Sardar Sabuj Contact"
          description="বাংলাদেশের জনপ্রিয় কবি ও লেখক মাহবুব সরদার সবুজ-এর সঙ্গে যোগাযোগ করুন। ইমেইল, সামাজিক মাধ্যম এবং বার্তা পাঠানোর ফর্ম।"
          path="/contact"
          image="https://www.mahbubsardarsabuj.com/images/og-home-suit.jpg"
          imageAlt="মাহবুব সরদার সবুজ — যোগাযোগ"
          keywords="মাহবুব সরদার সবুজ যোগাযোগ, Mahbub Sardar Sabuj contact, বাংলা লেখক যোগাযোগ, মাহবুব সরদার সবুজ ইমেইল, Mahbub Sardar Sabuj email"
          jsonLd={{
            "@context": "https://schema.org",
            "@type": "ContactPage",
            name: "মাহবুব সরদার সবুজ — যোগাযোগ",
            url: "https://www.mahbubsardarsabuj.com/contact",
            description: "মাহবুব সরদার সবুজের সঙ্গে যোগাযোগ করুন।",
            author: {
              "@type": "Person",
              name: "Mahbub Sardar Sabuj",
              url: "https://www.mahbubsardarsabuj.com/",
              sameAs: [
                "https://facebook.com/MahbubSardarSabuj",
                "https://www.instagram.com/mahbub_sardar_sabuj",
                "https://youtube.com/@MahbubSardarSabuj",
              ],
            },
          }}
        />
        <Navbar />

        <section className="contact-hero">
          <div className="contact-hero-orbit" />
          <div className="contact-hero-inner">
            <motion.div
              className="contact-hero-copy-column"
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.62 }}
            >
              <div className="contact-kicker">
                <span className="contact-kicker-dot" />
                <span>DIRECT CONNECTION</span>
              </div>
              <h1 className="contact-hero-title">কথা হোক <em>সরাসরি</em></h1>
              <p className="contact-hero-copy">
                লেখা, পাঠকের অনুভব কিংবা যেকোনো প্রাসঙ্গিক বিষয়ে যোগাযোগ করুন। আপনার বার্তার জন্য একটি শান্ত, সহজ ও ব্যক্তিগত জায়গা রাখলাম।
              </p>
              <div className="contact-hero-actions">
                <a className="contact-hero-action" href="mailto:lekhokmahbubsardarsabuj@gmail.com"><Mail size={16} /> ইমেইল করুন</a>
                <a className="contact-hero-action" href="#contact-form"><Send size={15} /> বার্তা পাঠান</a>
              </div>
            </motion.div>

            <motion.div
              className="contact-portrait-stage"
              initial={{ opacity: 0, x: 28, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.75, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="contact-portrait-frame">
                <img
                  src={CONTACT_PORTRAIT}
                  alt="মাহবুব সরদার সবুজ কোট পরা প্রতিকৃতি"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
              </div>
              <span className="contact-portrait-ornament" aria-hidden="true"><Sparkles size={15} /></span>
            </motion.div>
          </div>
        </section>

        <main className="contact-main">
          <div className="contact-layout">
            <aside className="contact-left">
              <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55, delay: 0.08 }}>
                <div className="contact-section-label">যোগাযোগের ঠিকানা</div>
                <h2 className="contact-left-title">আপনার বার্তা<br />আমার কাছে গুরুত্বপূর্ণ</h2>
                <p className="contact-left-copy">
                  ইমেইল, সামাজিক মাধ্যম অথবা বার্তা পাঠানোর ফর্ম—আপনার সুবিধামতো মাধ্যম বেছে নিন।
                </p>
              </motion.div>

              <div className="contact-channel-list">
                <motion.a
                  href="mailto:lekhokmahbubsardarsabuj@gmail.com"
                  className="contact-channel"
                  initial={{ opacity: 0, x: -22 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.48, delay: 0.15 }}
                >
                  <span className="contact-channel-icon"><Mail size={20} /></span>
                  <span style={{ minWidth: 0 }}>
                    <span className="contact-channel-eyebrow">ইমেইল</span>
                    <span className="contact-channel-value">lekhokmahbubsardarsabuj@gmail.com</span>
                  </span>
                  <ArrowUpRight className="contact-channel-arrow" size={18} />
                </motion.a>

                <motion.div
                  className="contact-location"
                  initial={{ opacity: 0, x: -22 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.48, delay: 0.21 }}
                >
                  <span className="contact-channel-icon"><MapPin size={20} /></span>
                  <span>
                    <span className="contact-channel-eyebrow">অবস্থান</span>
                    <span className="contact-channel-value">সৌদি আরব</span>
                  </span>
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0, x: -22 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.28 }}>
                <div className="contact-social-title">সামাজিক মাধ্যমে সংযুক্ত থাকুন</div>
                <div className="contact-social-grid">
                  {socialLinks.map((social) => {
                    const SocialIcon = social.icon;
                    return (
                      <a
                        key={social.name}
                        className="contact-social-link"
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ "--social-color": social.color } as React.CSSProperties}
                        aria-label={`${social.name} খুলুন`}
                      >
                        <span className="contact-social-icon"><SocialIcon size={18} /></span>
                        <span className="contact-social-name">{social.name}</span>
                        <span className="contact-social-handle">{social.handle}</span>
                      </a>
                    );
                  })}
                </div>
              </motion.div>

              <motion.blockquote
                className="contact-quote"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.52, delay: 0.38 }}
              >
                <Quote size={18} color={GOLD_LIGHT} />
                <p>“পাঠকের ভালোবাসাই আমার লেখার শক্তি।”</p>
                <cite>— মাহবুব সরদার সবুজ</cite>
              </motion.blockquote>
            </aside>

            <motion.section
              id="contact-form"
              className="contact-form-card"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.62, delay: 0.16 }}
            >
              <div className="contact-form-content">
                <AnimatePresence mode="wait">
                  {status === "sent" ? (
                    <motion.div key="success" className="contact-success" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                      <motion.div className="contact-success-icon" initial={{ scale: 0.6, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 280, delay: 0.08 }}>
                        <Check size={35} />
                      </motion.div>
                      <h3>বার্তা পাঠানো হয়েছে</h3>
                      <p>আপনার বার্তা সফলভাবে পাঠানো হয়েছে। ধন্যবাদ আপনার সময় ও কথার জন্য—আমি শীঘ্রই উত্তর দেব।</p>
                    </motion.div>
                  ) : (
                    <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <div className="contact-form-header">
                        <div>
                          <h2 className="contact-form-title">একটি বার্তা লিখুন</h2>
                          <p className="contact-form-copy">আপনার কথা সরাসরি পৌঁছে দিন। প্রয়োজনীয় ঘরগুলো পূরণ করে পাঠিয়ে দিন।</p>
                        </div>
                        <span className="contact-form-mark"><Sparkles size={20} /></span>
                      </div>

                      <form onSubmit={handleSubmit} className="contact-form-fields">
                        <input
                          type="text"
                          name="website"
                          value={form.website}
                          onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))}
                          tabIndex={-1}
                          autoComplete="off"
                          aria-hidden="true"
                          style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none" }}
                        />

                        <div className="contact-name-email-row">
                          <div className="contact-field">
                            <label htmlFor="contact-name">আপনার নাম *</label>
                            <input
                              id="contact-name"
                              type="text"
                              value={form.name}
                              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                              onInvalid={showBengaliValidation}
                              onInput={clearBengaliValidation}
                              placeholder="পুরো নাম"
                              required
                              style={getFocusStyle("name")}
                              onFocus={() => setFocused("name")}
                              onBlur={() => setFocused(null)}
                            />
                          </div>
                          <div className="contact-field">
                            <label htmlFor="contact-email">ইমেইল *</label>
                            <input
                              id="contact-email"
                              type="email"
                              value={form.email}
                              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                              onInvalid={showBengaliValidation}
                              onInput={clearBengaliValidation}
                              placeholder="your@email.com"
                              required
                              style={getFocusStyle("email")}
                              onFocus={() => setFocused("email")}
                              onBlur={() => setFocused(null)}
                            />
                          </div>
                        </div>

                        <div className="contact-field">
                          <label htmlFor="contact-subject">বিষয় <span>ঐচ্ছিক</span></label>
                          <input
                            id="contact-subject"
                            type="text"
                            value={form.subject}
                            onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
                            placeholder="বার্তার বিষয়"
                            style={getFocusStyle("subject")}
                            onFocus={() => setFocused("subject")}
                            onBlur={() => setFocused(null)}
                          />
                        </div>

                        <div className="contact-field">
                          <label htmlFor="contact-message">বার্তা *</label>
                          <textarea
                            id="contact-message"
                            value={form.message}
                            onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                            onInvalid={showBengaliValidation}
                            onInput={clearBengaliValidation}
                            placeholder="আপনার বার্তা লিখুন..."
                            required
                            rows={6}
                            style={{ ...getFocusStyle("message"), resize: "vertical", lineHeight: 1.9, minHeight: 148 }}
                            onFocus={() => setFocused("message")}
                            onBlur={() => setFocused(null)}
                          />
                        </div>

                        <motion.button
                          type="submit"
                          className="contact-submit"
                          disabled={status === "sending"}
                          whileHover={status !== "sending" ? { y: -2, boxShadow: "0 20px 42px rgba(201,168,76,0.34)" } : {}}
                          whileTap={status !== "sending" ? { scale: 0.985 } : {}}
                        >
                          {status === "sending" ? <><motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>◌</motion.span> পাঠানো হচ্ছে...</> : <><Send size={18} /> বার্তা পাঠান</>}
                        </motion.button>

                        {errorMsg && <div className="contact-error" role="alert">{errorMsg}</div>}
                        <p className="contact-form-note"><MessageCircle size={13} /> * চিহ্নিত ঘরগুলো পূরণ করা আবশ্যক</p>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.section>
          </div>
        </main>

        <div style={{ maxWidth: 800, margin: "0 auto", padding: "1.5rem 1rem" }}>
          <AdSenseAd adSlot={AD_SLOTS.CONTACT_BOTTOM} adFormat="auto" fullWidthResponsive={true} />
        </div>
        <Footer />
      </div>
    </>
  );
}
