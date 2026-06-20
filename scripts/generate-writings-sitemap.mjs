/**
 * generate-writings-sitemap.mjs
 * Regenerates writings-sitemap-*.xml from writingsArchive.json
 * Run: node scripts/generate-writings-sitemap.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PUBLIC = join(ROOT, "client", "public");

// Load archive
const archive = JSON.parse(
  readFileSync(join(PUBLIC, "data", "writingsArchive.json"), "utf-8")
);

// Slug utilities (must match WritingDetailPage.tsx)
const BENGALI_TRANS = {
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

function makeLegacySlug(title, id) {
  let slug = '';
  for (const ch of title) { slug += BENGALI_TRANS[ch] ?? ''; }
  slug = slug.replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase();
  return slug.length >= 3 ? slug : `writing-${id}`;
}

function makeSlug(title, id) {
  return `${makeLegacySlug(title, id)}-${id}`;
}

const BASE = "https://www.mahbubsardarsabuj.com";
const TODAY = new Date().toISOString().split("T")[0];
const CHUNK = 1000;

// Split into chunks of 1000
const chunks = [];
for (let i = 0; i < archive.length; i += CHUNK) {
  chunks.push(archive.slice(i, i + CHUNK));
}

// Write each sitemap file
chunks.forEach((chunk, idx) => {
  const n = idx + 1;
  const urls = chunk.map(w => {
    const slug = makeSlug(w.title, w.id);
    return `  <url>
    <loc>${BASE}/writings/${slug}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  const outPath = join(PUBLIC, `writings-sitemap-${n}.xml`);
  writeFileSync(outPath, xml, "utf-8");
  console.log(`writings-sitemap-${n}.xml → ${chunk.length} URLs`);
});

// Update sitemap-index.xml
const sitemapIndexEntries = chunks.map((_, idx) => {
  const n = idx + 1;
  return `  <sitemap>
    <loc>${BASE}/writings-sitemap-${n}.xml</loc>
    <lastmod>${TODAY}</lastmod>
  </sitemap>`;
}).join("\n");

const indexXml = readFileSync(join(PUBLIC, "sitemap-index.xml"), "utf-8");
// Replace existing writings sitemap entries
const updatedIndex = indexXml.replace(
  /<sitemap>\s*<loc>[^<]*writings-sitemap[^<]*<\/loc>[\s\S]*?<\/sitemap>/g,
  ""
).replace(
  "</sitemapindex>",
  `${sitemapIndexEntries}\n</sitemapindex>`
);
writeFileSync(join(PUBLIC, "sitemap-index.xml"), updatedIndex, "utf-8");
console.log(`sitemap-index.xml updated with ${chunks.length} writings sitemaps`);
console.log(`Total writings in sitemap: ${archive.length}`);
