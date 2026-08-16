#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const API_FILE = path.join(ROOT, 'api', 'ssr-og.js');
const PUBLIC_DIR = path.join(ROOT, 'client', 'public');
const MAIN_SITEMAP = path.join(PUBLIC_DIR, 'sitemap.xml');
const NEWS_SITEMAP = path.join(PUBLIC_DIR, 'news-sitemap.xml');
const SITE_URL = 'https://www.mahbubsardarsabuj.com';
const PUBLISHER_NAME = 'সরদার সংবাদ';
const LANGUAGE = 'bn';

function escapeXml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function extractNewsData() {
  const source = fs.readFileSync(API_FILE, 'utf8');
  // Restrict extraction to the dedicated newsData array; never classify writing archive items as news.
  const start = source.indexOf('const newsData = [');
  const end = start >= 0 ? source.indexOf('];', start) : -1;
  if (start < 0 || end < 0) return [];
  const newsSource = source.slice(start, end);
  const objects = [];
  const regex = /\{[\s\S]*?id:\s*(\d+)[\s\S]*?title:\s*"(.*?)"[\s\S]*?date:\s*"(.*?)"[\s\S]*?\}/g;
  let match;
  while ((match = regex.exec(newsSource)) !== null) {
    objects.push({
      id: parseInt(match[1]),
      title: match[2].replace(/\\"/g, '"'),
      date: match[3]
    });
  }
  return objects;
}

const BENGALI_DIGITS = String.fromCharCode(...Array.from({ length: 10 }, (_, i) => 0x09e6 + i));
const MONTHS = {
  'জানুয়ারি': '01', 'জানুয়ারি': '01', 'ফেব্রুয়ারি': '02', 'ফেব্রুয়ারি': '02', 'মার্চ': '03',
  'এপ্রিল': '04', 'মে': '05', 'জুন': '06', 'জুলাই': '07', 'আগস্ট': '08', 'সেপ্টেম্বর': '09',
  'অক্টোবর': '10', 'নভেম্বর': '11', 'ডিসেম্বর': '12',
};
function decodeUnicodeEscapes(value) {
  return String(value).replace(/\\u([0-9a-f]{4})/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));
}
function toAsciiDigits(value) {
  return decodeUnicodeEscapes(value).replace(/[০-৯]/g, (digit) => String(digit.charCodeAt(0) - BENGALI_DIGITS.charCodeAt(0)));
}
function toIsoDate(value) {
  const normalized = toAsciiDigits(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return normalized;
  const match = normalized.match(/^(\d{1,2})\s+([^\s]+)\s+(\d{4})$/);
  if (!match || !MONTHS[match[2]]) return null;
  return `${match[3]}-${MONTHS[match[2]]}-${match[1].padStart(2, '0')}`;
}

function main() {
  try {
    const extracted = extractNewsData();
    const unique = new Map();
    for (const item of extracted) {
      const isoDate = toIsoDate(item.date);
      if (!unique.has(item.id)) unique.set(item.id, { ...item, date: isoDate || item.date });
    }
    const allNewsItems = [...unique.values()];
    const newsItems = allNewsItems.filter((item) => toIsoDate(item.date));
    console.log(`Extracted ${extracted.length} articles; writing ${newsItems.length} dated articles and retaining ${allNewsItems.length - newsItems.length} undated URLs in the regular sitemap.`);
    
    if (allNewsItems.length === 0) {
        console.log("No news items found, skipping sitemap update.");
        return;
    }

    // Build sitemap content
    const urls = newsItems.map((item) => {
      const loc = `${SITE_URL}/news/${item.id}`;
      return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <news:news>\n      <news:publication>\n        <news:name>${escapeXml(PUBLISHER_NAME)}</news:name>\n        <news:language>${LANGUAGE}</news:language>\n      </news:publication>\n              <news:publication_date>${item.date}T00:00:00+06:00</news:publication_date>\n      <news:title>${escapeXml(item.title)}</news:title>\n    </news:news>\n  </url>`;
    }).join('\n');

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n${urls}\n</urlset>\n`;
    
    fs.writeFileSync(NEWS_SITEMAP, sitemapXml);

    const validIds = new Set(newsItems.map((item) => item.id));
    const regularNewsBlocks = allNewsItems
      .filter((item) => !validIds.has(item.id))
      .map((item) => `  <url>\n    <loc>${escapeXml(`${SITE_URL}/news/${item.id}`)}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`)
      .join("\n");
    let mainSitemap = fs.readFileSync(MAIN_SITEMAP, "utf8");
    mainSitemap = mainSitemap.replace(/\s*<url>\s*<loc>https:\/\/www\.mahbubsardarsabuj\.com\/news\/[^<]+<\/loc>[\s\S]*?<\/url>/g, "");
    if (regularNewsBlocks) mainSitemap = mainSitemap.replace("</urlset>", `${regularNewsBlocks}\n</urlset>`);
    fs.writeFileSync(MAIN_SITEMAP, mainSitemap.replace(/\n{3,}/g, "\n\n"));
    console.log(`News SEO synced: ${newsItems.length} dated article(s), ${allNewsItems.length} total news URLs.`);
  } catch (e) {
    console.error('News SEO sync failed:', e.message);
    process.exit(1);
  }
}

main();
