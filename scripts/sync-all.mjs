/**
 * sync-all.mjs — Master Auto-Sync Script
 * =========================================
 * নতুন লেখা যোগ করার পর এই একটি কমান্ড চালান:
 *   node scripts/sync-all.mjs
 *
 * এটি স্বয়ংক্রিয়ভাবে করবে:
 *   1. writingsArchive.json আপডেট (client/public/data/)
 *   2. writings-sitemap-*.xml আপডেট (সব নতুন লেখা যোগ হবে)
 *   3. chatbotIndex.json আপডেট (AI চ্যাটবট নতুন লেখা পাবে)
 *   4. api/_knowledge/writingsArchive.json আপডেট
 *   5. SSR archive coverage যাচাই
 *   6. Git status দেখাবে
 */

import { execSync, spawnSync } from "child_process";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PUBLIC = join(ROOT, "client", "public");
const SRC_DATA = join(ROOT, "client", "src", "data");
const API_KNOWLEDGE = join(ROOT, "api", "_knowledge");

const SITE_URL = "https://www.mahbubsardarsabuj.com";
const TODAY = new Date().toISOString().split("T")[0];

// ── Color helpers ──────────────────────────────────────────────────────────
const c = {
  green:  (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  blue:   (s) => `\x1b[34m${s}\x1b[0m`,
  red:    (s) => `\x1b[31m${s}\x1b[0m`,
  bold:   (s) => `\x1b[1m${s}\x1b[0m`,
  dim:    (s) => `\x1b[2m${s}\x1b[0m`,
};

function log(icon, msg) { console.log(`${icon}  ${msg}`); }
function ok(msg)  { log(c.green("✓"), msg); }
function info(msg){ log(c.blue("ℹ"), msg); }
function warn(msg){ log(c.yellow("⚠"), msg); }
function err(msg) { log(c.red("✗"), msg); }
function sep()    { console.log(c.dim("─".repeat(56))); }

// ── Bengali slug helpers (must match WritingDetailPage.tsx) ────────────────
const TRANS = {
  'অ':'o','আ':'a','ই':'i','ঈ':'i','উ':'u','ঊ':'u','এ':'e','ঐ':'oi','ও':'o','ঔ':'ou',
  'ক':'k','খ':'kh','গ':'g','ঘ':'gh','ঙ':'ng',
  'চ':'ch','ছ':'chh','জ':'j','ঝ':'jh','ঞ':'n',
  'ট':'t','ঠ':'th','ড':'d','ঢ':'dh','ণ':'n',
  'ত':'t','থ':'th','দ':'d','ধ':'dh','ন':'n',
  'প':'p','ফ':'ph','ব':'b','ভ':'bh','ম':'m',
  'য':'j','র':'r','ল':'l','শ':'sh','ষ':'sh','স':'s','হ':'h',
  'ড়':'r','ঢ়':'rh','য়':'y','ৎ':'t',
  'া':'a','ি':'i','ী':'i','ু':'u','ূ':'u','ে':'e','ৈ':'oi','ো':'o','ৌ':'ou',
  'ং':'ng','ঃ':'h','ঁ':'n','্':'',
  ' ':'-','?':'','!':'',',':'','.':'','"':'',"'":'','—':'-','–':'-',
};

function makeSlug(title, id) {
  let s = '';
  for (const ch of title) s += TRANS[ch] ?? '';
  s = s.replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase();
  const base = s.length >= 3 ? s : `writing-${id}`;
  return `${base}-${id}`;
}

// ── Step 1: Export writingsArchive.json ────────────────────────────────────
function step1_exportArchive() {
  sep();
  info(c.bold("ধাপ ১: writingsArchive.json আপডেট করা হচ্ছে..."));
  try {
    const result = spawnSync("npx", ["tsx", "scripts/export-writings-archive.ts"], {
      cwd: ROOT, stdio: "pipe", encoding: "utf-8"
    });
    if (result.status !== 0) throw new Error(result.stderr || "export failed");
    const archive = JSON.parse(
      readFileSync(join(PUBLIC, "data", "writingsArchive.json"), "utf-8")
    );
    ok(`writingsArchive.json → ${c.bold(archive.length)} টি লেখা`);
    return archive;
  } catch (e) {
    err(`writingsArchive export ব্যর্থ: ${e.message}`);
    // Fallback: read existing
    try {
      return JSON.parse(readFileSync(join(PUBLIC, "data", "writingsArchive.json"), "utf-8"));
    } catch { return []; }
  }
}

// ── Step 2: Generate writings sitemaps ────────────────────────────────────
function step2_generateSitemap(archive) {
  sep();
  info(c.bold("ধাপ ২: writings-sitemap-*.xml আপডেট করা হচ্ছে..."));

  const CHUNK = 1000;
  const chunks = [];
  for (let i = 0; i < archive.length; i += CHUNK) chunks.push(archive.slice(i, i + CHUNK));

  chunks.forEach((chunk, idx) => {
    const n = idx + 1;
    const urls = chunk.map(w => {
      const slug = makeSlug(w.title, w.id);
      return `  <url>\n    <loc>${SITE_URL}/writings/${slug}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`;
    }).join("\n");
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
    writeFileSync(join(PUBLIC, `writings-sitemap-${n}.xml`), xml, "utf-8");
    ok(`writings-sitemap-${n}.xml → ${chunk.length} URLs`);
  });

  // Update sitemap-index.xml
  const idxPath = join(PUBLIC, "sitemap-index.xml");
  if (existsSync(idxPath)) {
    let idx = readFileSync(idxPath, "utf-8");
    // Remove old writings sitemap entries
    idx = idx.replace(/<sitemap>\s*<loc>[^<]*writings-sitemap[^<]*<\/loc>[\s\S]*?<\/sitemap>\s*/g, "");
    const newEntries = chunks.map((_, i) =>
      `  <sitemap>\n    <loc>${SITE_URL}/writings-sitemap-${i+1}.xml</loc>\n    <lastmod>${TODAY}</lastmod>\n  </sitemap>`
    ).join("\n");
    idx = idx.replace("</sitemapindex>", `${newEntries}\n</sitemapindex>`);
    writeFileSync(idxPath, idx, "utf-8");
    ok(`sitemap-index.xml → ${chunks.length} writings sitemaps`);
  }
  ok(`মোট ${archive.length} টি লেখা sitemap-এ যোগ হয়েছে`);
}

// ── Step 3: Update chatbot index ──────────────────────────────────────────
function step3_updateChatbot() {
  sep();
  info(c.bold("ধাপ ৩: AI চ্যাটবট index আপডেট করা হচ্ছে..."));
  try {
    const result = spawnSync("node", ["scripts/build-chatbot-index.mjs"], {
      cwd: ROOT, stdio: "pipe", encoding: "utf-8"
    });
    if (result.status !== 0) throw new Error(result.stderr || "chatbot index failed");
    ok("chatbotIndex.json আপডেট সম্পন্ন");
    // Show count
    const idxPath = join(API_KNOWLEDGE, "chatbotIndex.json");
    if (existsSync(idxPath)) {
      const idx = JSON.parse(readFileSync(idxPath, "utf-8"));
      const count = idx.items?.length ?? idx.writings?.length ?? idx.length ?? "?";
      ok(`চ্যাটবট index → ${c.bold(count)} টি লেখা`);
    }
  } catch (e) {
    warn(`chatbot index আপডেট ব্যর্থ: ${e.message}`);
  }
}

// ── Step 4: Sync api/_knowledge/writingsArchive.json ──────────────────────
function step4_syncApiKnowledge() {
  sep();
  info(c.bold("ধাপ ৪: API knowledge base sync করা হচ্ছে..."));
  try {
    const src = join(PUBLIC, "data", "writingsArchive.json");
    const dst = join(API_KNOWLEDGE, "writingsArchive.json");
    if (existsSync(src)) {
      const data = readFileSync(src, "utf-8");
      writeFileSync(dst, data, "utf-8");
      // Vercel Edge cannot reliably load JSON modules at runtime; emit a bundled JS module for SSR.
      const ssrModulePath = join(API_KNOWLEDGE, "writingsArchive.js");
      writeFileSync(ssrModulePath, `const writingsArchive = ${data};\nexport default writingsArchive;\n`, "utf-8");
      const count = JSON.parse(data).length;
      ok(`api/_knowledge/writingsArchive.json + writingsArchive.js → ${c.bold(count)} টি লেখা`);
    }
  } catch (e) {
    warn(`API knowledge sync ব্যর্থ: ${e.message}`);
  }
}

// ── Step 5: Validate the SSR archive source ───────────────────────────────
function step5_validateSsrArchive(expectedArchive) {
  sep();
  info(c.bold("ধাপ ৫: SSR archive coverage যাচাই করা হচ্ছে..."));
  try {
    const ssrArchivePath = join(API_KNOWLEDGE, "writingsArchive.js");
    const ssrSource = readFileSync(ssrArchivePath, "utf-8");
    const ssrPayload = ssrSource.slice("const writingsArchive = ".length, ssrSource.lastIndexOf(";\nexport default"));
    const ssrArchive = JSON.parse(ssrPayload || "[]");
    const expectedIds = new Set(expectedArchive.map((item) => String(item.id)));
    const ssrIds = new Set(ssrArchive.map((item) => String(item.id)));
    const missing = expectedArchive.filter((item) => !ssrIds.has(String(item.id)));
    if (ssrArchive.length !== expectedArchive.length || missing.length || expectedIds.size !== ssrIds.size) {
      throw new Error(`SSR archive mismatch: expected ${expectedArchive.length}, found ${ssrArchive.length}, missing ${missing.length}`);
    }
    ok(`SSR source → ${c.bold(ssrArchive.length)} টি লেখা; কোনো record missing নেই`);
  } catch (e) {
    err(`SSR archive validation ব্যর্থ: ${e.message}`);
    process.exit(1);
  }
}

// ── Step 6: Git status ────────────────────────────────────────────────────
function step6_gitStatus() {
  sep();
  info(c.bold("ধাপ ৬: পরিবর্তিত ফাইলসমূহ..."));
  try {
    const status = execSync("git status --short", { cwd: ROOT, encoding: "utf-8" });
    if (status.trim()) {
      console.log(c.dim(status.trim()));
      info("এখন commit ও push করুন:");
      console.log(c.yellow(`  cd ${ROOT}`));
      console.log(c.yellow(`  git add -A && git commit -m "sync: writings archive & sitemap update"`));
      console.log(c.yellow(`  git push origin main`));
    } else {
      ok("কোনো পরিবর্তন নেই — সব আপ-টু-ডেট!");
    }
  } catch (e) {
    warn("git status দেখা যায়নি");
  }
}

// ── Main ──────────────────────────────────────────────────────────────────
console.log("\n" + c.bold("🔄  Mahbub Sardar Sabuj — Auto Sync"));
console.log(c.dim(`   ${new Date().toLocaleString("bn-BD")}`));

const archive = step1_exportArchive();
if (archive.length > 0) {
  step2_generateSitemap(archive);
  step3_updateChatbot();
  step4_syncApiKnowledge();
  step5_validateSsrArchive(archive);
} else {
  err("archive খালি — sync বাতিল");
  process.exit(1);
}
step6_gitStatus();

sep();
console.log(c.green(c.bold("✅  সব sync সম্পন্ন!")));
console.log(c.dim("   JSON + Sitemap + Chatbot + API — সব আপডেট হয়েছে\n"));
