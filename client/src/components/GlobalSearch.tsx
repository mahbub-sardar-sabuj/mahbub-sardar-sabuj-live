/**
 * GlobalSearch — Full-screen Command Menu / Search Overlay
 * Keyboard shortcut: Ctrl+K / Cmd+K
 * Features: Live search across writings + pages, category filter, keyboard navigation
 * Design: Cinematic Dark Luxury — Deep Navy + Gold
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, BookOpen, FileText, Feather, Images, Newspaper, UserRound, Mail, Mic2, Palette, MailOpen, Phone, CreditCard, Sparkles, Clock, Hash } from "lucide-react";
import { Link } from "wouter";
import { loadWritingsArchive } from "@/lib/loadWritingsArchive";
import type { Writing } from "@/data/writingsArchive";

// ── Bengali transliteration (same as Home.tsx) ────────────────────────────────
const BENGALI_TRANS: Record<string, string> = {
  'অ':'o','আ':'a','ই':'i','ঈ':'i','উ':'u','ঊ':'u','এ':'e','ঐ':'oi','ও':'o','ঔ':'ou',
  'ক':'k','খ':'kh','গ':'g','ঘ':'gh','ঙ':'ng','চ':'ch','ছ':'chh','জ':'j','ঝ':'jh','ঞ':'n',
  'ট':'t','ঠ':'th','ড':'d','ঢ':'dh','ণ':'n','ত':'t','থ':'th','দ':'d','ধ':'dh','ন':'n',
  'প':'p','ফ':'ph','ব':'b','ভ':'bh','ম':'m','য':'j','র':'r','ল':'l','শ':'sh','ষ':'sh','স':'s','হ':'h',
  'ড়':'r','ঢ়':'rh','য়':'y','ৎ':'t',
  'া':'a','ি':'i','ী':'i','ু':'u','ূ':'u','ে':'e','ৈ':'oi','ো':'o','ৌ':'ou',
  'ং':'ng','ঃ':'h','ঁ':'n','্':'',
  ' ':'-','?':'','!':'',',':'','.':'','"':'','\u2018':'','\u2019':'','\u201C':'','\u201D':'','\u2014':'-','\u2013':'-',
};
function makeSlug(title: string, id: number): string {
  let slug = '';
  for (const ch of title) { slug += BENGALI_TRANS[ch] ?? ''; }
  slug = slug.replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase();
  const base = slug.length >= 3 ? slug : `writing-${id}`;
  return `${base}-${id}`;
}

// ── Static pages ──────────────────────────────────────────────────────────────
const PAGES = [
  { label: "হোম", href: "/", icon: FileText, desc: "প্রথম পাতা ও প্রধান পরিচিতি" },
  { label: "পরিচিতি", href: "/about", icon: UserRound, desc: "লেখক পরিচয় ও সংক্ষিপ্ত জীবনপথ" },
  { label: "লেখালেখি ও বই", href: "/writings", icon: BookOpen, desc: "কবিতা, লেখা ও প্রকাশিত বই সংগ্রহ" },
  { label: "আমিও লিখবো বাস্তবতা", href: "/amio-likhbo-bastobota", icon: Feather, desc: "সৃজনশীল লেখালেখির কমিউনিটি" },
  { label: "আবৃত্তি", href: "/facebook-recitations", icon: Mic2, desc: "ভিডিও ও আবৃত্তির উপস্থাপনা" },
  { label: "গ্যালারি", href: "/gallery", icon: Images, desc: "ছবি, মুহূর্ত ও ভিজ্যুয়াল সংগ্রহ" },
  { label: "সরদার সংবাদ", href: "/news", icon: Newspaper, desc: "আপডেট ও সাম্প্রতিক খবর" },
  { label: "যোগাযোগ", href: "/contact", icon: Mail, desc: "ইমেইল ও যোগাযোগের উপায়" },
  { label: "ডিজাইন ফরম্যাট", href: "/editor", icon: Palette, desc: "কার্ড ডিজাইন ও লেখা তৈরি" },
  { label: "টেম্প ইমেইল", href: "/temp-email", icon: MailOpen, desc: "ডিসপোজেবল ইমেইল তৈরি করুন" },
  { label: "টেম্প নম্বর", href: "/temp-number", icon: Phone, desc: "ডিসপোজেবল ফোন নম্বর" },
  { label: "টেম্প কার্ড", href: "/temp-card", icon: CreditCard, desc: "ভার্চুয়াল কার্ড" },
  { label: "ইমেজ আপসেলার", href: "/image-upscaler", icon: Sparkles, desc: "এআই দিয়ে ছবির কোয়ালিটি বাড়ান" },
];

const CAT_COLORS: Record<string, string> = {
  "ভালোবাসা": "#F472B6",
  "বিচ্ছেদ": "#A78BFA",
  "কবিতা": "#60A5FA",
  "ছোট লেখা": "#34D399",
  "জীবনদর্শন": "#FBBF24",
};

// ── Event bus for opening search from Navbar ──────────────────────────────────
export const openGlobalSearch = () => window.dispatchEvent(new CustomEvent("open-global-search"));

// ── Main Component ────────────────────────────────────────────────────────────
export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [writings, setWritings] = useState<Writing[]>([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Load writings archive once
  useEffect(() => {
    loadWritingsArchive().then(setWritings).catch(() => {});
  }, []);

  // Listen for open event from Navbar
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-global-search", handler);
    return () => window.removeEventListener("open-global-search", handler);
  }, []);

  // Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  // Search results
  const q = query.trim().toLowerCase();
  const matchedPages = q
    ? PAGES.filter(p => p.label.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q))
    : PAGES.slice(0, 5);

  const matchedWritings = q
    ? writings.filter(w =>
        w.title.toLowerCase().includes(q) ||
        w.content.toLowerCase().includes(q.slice(0, 12)) ||
        (w.category && w.category.toLowerCase().includes(q))
      ).slice(0, 8)
    : writings.slice(0, 5);

  type ResultItem =
    | { kind: "page"; label: string; href: string; icon: React.ElementType; desc: string }
    | { kind: "writing"; writing: Writing };

  const results: ResultItem[] = [
    ...matchedPages.map(p => ({ kind: "page" as const, ...p })),
    ...matchedWritings.map(w => ({ kind: "writing" as const, writing: w })),
  ];

  const total = results.length;

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setCursor(c => Math.min(c + 1, total - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)); }
    if (e.key === "Enter" && results[cursor]) {
      const item = results[cursor];
      const href = item.kind === "page" ? item.href : `/writings/${makeSlug(item.writing.title, item.writing.id)}`;
      window.location.href = href;
      setOpen(false);
    }
  }, [cursor, results, total]);

  // Scroll cursor item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${cursor}"]`) as HTMLElement | null;
    el?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  const close = () => { setOpen(false); setQuery(""); };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="search-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={close}
            style={{
              position: "fixed", inset: 0, zIndex: 9000,
              background: "rgba(2,4,8,0.82)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            key="search-panel"
            initial={{ opacity: 0, y: -28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed",
              top: "clamp(60px, 10vh, 120px)",
              left: "50%",
              transform: "translateX(-50%)",
              width: "min(680px, calc(100vw - 2rem))",
              zIndex: 9001,
              borderRadius: 20,
              background: "linear-gradient(160deg, rgba(10,18,34,0.99) 0%, rgba(6,12,24,0.99) 100%)",
              border: "1px solid rgba(201,168,76,0.25)",
              boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,76,0.1), inset 0 1px 0 rgba(255,255,255,0.05)",
              overflow: "hidden",
            }}
          >
            {/* Search input row */}
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "14px 18px",
              borderBottom: "1px solid rgba(201,168,76,0.12)",
            }}>
              <Search size={18} color="rgba(201,168,76,0.7)" style={{ flexShrink: 0 }} />
              <input
                ref={inputRef}
                value={query}
                onChange={e => { setQuery(e.target.value); setCursor(0); }}
                onKeyDown={handleKeyDown}
                placeholder="লেখা, পেজ বা ক্যাটাগরি খুঁজুন..."
                style={{
                  flex: 1, background: "none", border: "none", outline: "none",
                  color: "#FAF6EF", fontSize: "1rem",
                  fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                  caretColor: "#C9A84C",
                }}
              />
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <kbd style={{
                  padding: "2px 7px", borderRadius: 6,
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(250,246,239,0.4)", fontSize: "0.68rem",
                  fontFamily: "monospace",
                }}>ESC</kbd>
                <button onClick={close} style={{
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8, padding: "4px 6px", cursor: "pointer", color: "rgba(250,246,239,0.5)",
                  display: "flex", alignItems: "center",
                }}>
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Results */}
            <div
              ref={listRef}
              style={{
                maxHeight: "min(480px, 60vh)",
                overflowY: "auto",
                padding: "8px 0",
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(201,168,76,0.2) transparent",
              }}
            >
              {/* Pages section */}
              {matchedPages.length > 0 && (
                <>
                  <div style={{
                    padding: "6px 18px 4px",
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "0.6rem", letterSpacing: "0.3em",
                    textTransform: "uppercase", color: "rgba(201,168,76,0.55)",
                  }}>পেজ</div>
                  {matchedPages.map((page, i) => {
                    const idx = i;
                    const Icon = page.icon;
                    const isActive = cursor === idx;
                    return (
                      <Link key={page.href} href={page.href} onClick={close}>
                        <div
                          data-idx={idx}
                          style={{
                            display: "flex", alignItems: "center", gap: 12,
                            padding: "10px 18px", cursor: "pointer",
                            background: isActive ? "rgba(201,168,76,0.1)" : "transparent",
                            borderLeft: isActive ? "2px solid #C9A84C" : "2px solid transparent",
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={() => setCursor(idx)}
                        >
                          <div style={{
                            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                            background: isActive ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.05)",
                            border: `1px solid ${isActive ? "rgba(201,168,76,0.35)" : "rgba(255,255,255,0.08)"}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "all 0.15s",
                          }}>
                            <Icon size={15} color={isActive ? "#C9A84C" : "rgba(250,246,239,0.5)"} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                              fontSize: "0.88rem", color: isActive ? "#FAF6EF" : "rgba(250,246,239,0.8)",
                              fontWeight: 600,
                            }}>{page.label}</div>
                            <div style={{
                              fontFamily: "'Noto Sans Bengali', sans-serif",
                              fontSize: "0.72rem", color: "rgba(250,246,239,0.35)",
                              marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            }}>{page.desc}</div>
                          </div>
                          {isActive && <ArrowRight size={14} color="#C9A84C" />}
                        </div>
                      </Link>
                    );
                  })}
                </>
              )}

              {/* Writings section */}
              {matchedWritings.length > 0 && (
                <>
                  <div style={{
                    padding: "10px 18px 4px",
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "0.6rem", letterSpacing: "0.3em",
                    textTransform: "uppercase", color: "rgba(201,168,76,0.55)",
                  }}>লেখা</div>
                  {matchedWritings.map((w, i) => {
                    const idx = matchedPages.length + i;
                    const isActive = cursor === idx;
                    const catColor = CAT_COLORS[w.category] ?? "#FBBF24";
                    const wordCount = w.content.trim().split(/\s+/).length;
                    const readMins = Math.max(1, Math.round(wordCount / 150));
                    const slug = makeSlug(w.title, w.id);
                    const excerpt = w.content.replace(/\s+/g, " ").trim().slice(0, 80);
                    return (
                      <Link key={w.id} href={`/writings/${slug}`} onClick={close}>
                        <div
                          data-idx={idx}
                          style={{
                            display: "flex", alignItems: "flex-start", gap: 12,
                            padding: "10px 18px", cursor: "pointer",
                            background: isActive ? "rgba(201,168,76,0.08)" : "transparent",
                            borderLeft: isActive ? "2px solid #C9A84C" : "2px solid transparent",
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={() => setCursor(idx)}
                        >
                          <div style={{
                            width: 34, height: 34, borderRadius: 10, flexShrink: 0, marginTop: 1,
                            background: `${catColor}18`,
                            border: `1px solid ${catColor}35`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <Feather size={14} color={catColor} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                              fontSize: "0.88rem", color: isActive ? "#FAF6EF" : "rgba(250,246,239,0.8)",
                              fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            }}>{w.title || excerpt.slice(0, 30)}</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                              {w.category && (
                                <span style={{
                                  fontFamily: "'Noto Sans Bengali', sans-serif",
                                  fontSize: "0.65rem", color: catColor,
                                  background: `${catColor}18`, padding: "1px 7px", borderRadius: 999,
                                  border: `1px solid ${catColor}30`,
                                }}>{w.category}</span>
                              )}
                              <span style={{
                                display: "flex", alignItems: "center", gap: 3,
                                fontFamily: "'Noto Sans Bengali', sans-serif",
                                fontSize: "0.65rem", color: "rgba(250,246,239,0.3)",
                              }}>
                                <Clock size={9} /> {readMins} মিনিট
                              </span>
                            </div>
                          </div>
                          {isActive && <ArrowRight size={14} color="#C9A84C" style={{ marginTop: 8, flexShrink: 0 }} />}
                        </div>
                      </Link>
                    );
                  })}
                </>
              )}

              {/* Empty state */}
              {q && results.length === 0 && (
                <div style={{
                  padding: "2.5rem 1rem", textAlign: "center",
                  fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                  color: "rgba(250,246,239,0.3)", fontSize: "0.9rem",
                }}>
                  <Hash size={28} color="rgba(201,168,76,0.2)" style={{ margin: "0 auto 0.8rem" }} />
                  "{query}" এর জন্য কোনো ফলাফল পাওয়া যায়নি
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div style={{
              padding: "8px 18px",
              borderTop: "1px solid rgba(255,255,255,0.05)",
              display: "flex", alignItems: "center", gap: 16,
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "0.65rem", color: "rgba(250,246,239,0.25)",
            }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <kbd style={{ padding: "1px 5px", borderRadius: 4, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", fontSize: "0.6rem" }}>↑↓</kbd> নেভিগেট
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <kbd style={{ padding: "1px 5px", borderRadius: 4, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", fontSize: "0.6rem" }}>↵</kbd> যান
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <kbd style={{ padding: "1px 5px", borderRadius: 4, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", fontSize: "0.6rem" }}>Ctrl K</kbd> টগল
              </span>
              <span style={{ marginLeft: "auto", color: "rgba(201,168,76,0.4)" }}>
                {writings.length > 0 ? `${writings.length}+ লেখা` : "লোড হচ্ছে..."}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
