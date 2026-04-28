#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const API_FILE = path.join(ROOT, 'api', 'ssr-og.js');
const CLIENT_NEWS_FILE = path.join(ROOT, 'client', 'src', 'pages', 'News.tsx');
const PUBLIC_DIR = path.join(ROOT, 'client', 'public');
const MAIN_SITEMAP = path.join(PUBLIC_DIR, 'sitemap.xml');
const NEWS_SITEMAP = path.join(PUBLIC_DIR, 'news-sitemap.xml');
const SITE_URL = 'https://www.mahbubsardarsabuj.com';
const PUBLISHER_NAME = 'সরদার সংবাদ';
const LANGUAGE = 'bn';
const CHECK_ONLY = process.argv.includes('--check');

function escapeXml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toIsoDateTime(date) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return `${date}T00:00:00+06:00`;
  return date;
}

function extractNewsData() {
  const source = fs.readFileSync(API_FILE, 'utf8');
  const match = source.match(/const newsData = (\[[\s\S]*?\n\]);\s*export default/);
  if (!match) {
    throw new Error('api/ssr-og.js থেকে const newsData array বের করা যায়নি।');
  }

  const sandbox = { SITE_URL, newsData: null };
  vm.runInNewContext(`newsData = ${match[1]};`, sandbox, { timeout: 5000 });
  if (!Array.isArray(sandbox.newsData)) {
    throw new Error('newsData array evaluate করা যায়নি।');
  }
  return sandbox.newsData;
}

function extractClientNewsIds() {
  const source = fs.readFileSync(CLIENT_NEWS_FILE, 'utf8');
  const match = source.match(/const newsData: NewsItem\[\] = \[([\s\S]*?)\];/);
  if (!match) {
    throw new Error('client/src/pages/News.tsx থেকে frontend newsData বের করা যায়নি।');
  }
  return [...match[1].matchAll(/\bid:\s*(\d+)/g)].map((m) => Number(m[1]));
}

function validateNews(newsItems) {
  const errors = [];
  const warnings = [];
  const seenIds = new Set();
  const now = Date.now();
  const twoDaysMs = 2 * 24 * 60 * 60 * 1000;
  const apiIds = newsItems.map((item) => item && item.id).filter(Boolean).sort((a, b) => a - b);
  const clientIds = extractClientNewsIds().sort((a, b) => a - b);
  if (JSON.stringify(apiIds) !== JSON.stringify(clientIds)) {
    errors.push(`frontend News.tsx এবং api/ssr-og.js news ids মিলছে না। frontend=[${clientIds.join(',')}] api=[${apiIds.join(',')}]`);
  }

  for (const item of newsItems) {
    const prefix = `news id ${item && item.id}`;
    if (!item || typeof item !== 'object') {
      errors.push('newsData-তে invalid item আছে।');
      continue;
    }
    if (!Number.isInteger(item.id) || item.id <= 0) errors.push(`${prefix}: id positive integer হতে হবে।`);
    if (seenIds.has(item.id)) errors.push(`${prefix}: duplicate id পাওয়া গেছে।`);
    seenIds.add(item.id);
    if (!item.title || item.title.trim().length < 20) errors.push(`${prefix}: title খুব ছোট বা missing।`);
    if (!item.excerpt || item.excerpt.trim().length < 50) errors.push(`${prefix}: excerpt কমপক্ষে ৫০ অক্ষর হওয়া উচিত।`);
    if (!item.content || item.content.trim().length < 100) errors.push(`${prefix}: content কমপক্ষে ১০০ অক্ষর হওয়া উচিত।`);
    if (!item.category || item.category.trim().length < 2) errors.push(`${prefix}: category missing।`);
    if (!item.keywords || item.keywords.trim().length < 10) warnings.push(`${prefix}: keywords ছোট; Google বুঝতে সুবিধার জন্য keywords রাখুন।`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.date || '')) errors.push(`${prefix}: date অবশ্যই YYYY-MM-DD format-এ হতে হবে।`);
    if (!item.image || !/^https:\/\//.test(item.image)) errors.push(`${prefix}: image absolute https URL হতে হবে।`);

    if (/^\d{4}-\d{2}-\d{2}$/.test(item.date || '')) {
      const publishedAt = new Date(`${item.date}T00:00:00+06:00`).getTime();
      if (Number.isFinite(publishedAt) && publishedAt - now > twoDaysMs) {
        warnings.push(`${prefix}: publication date ভবিষ্যতের তারিখ মনে হচ্ছে; ভুল হলে Google News গ্রহণ নাও করতে পারে।`);
      }
    }

    if (item.image && item.image.startsWith(SITE_URL)) {
      const localImage = path.join(PUBLIC_DIR, item.image.replace(`${SITE_URL}/`, ''));
      if (!fs.existsSync(localImage)) warnings.push(`${prefix}: local image file পাওয়া যায়নি: ${path.relative(ROOT, localImage)}`);
    }
  }

  return { errors, warnings };
}

function sortNews(newsItems) {
  return [...newsItems].sort((a, b) => {
    const byDate = String(b.date).localeCompare(String(a.date));
    if (byDate !== 0) return byDate;
    return b.id - a.id;
  });
}

function buildNewsSitemap(newsItems) {
  const urls = sortNews(newsItems).map((item) => {
    const loc = `${SITE_URL}/news/${item.id}`;
    return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <news:news>\n      <news:publication>\n        <news:name>${escapeXml(PUBLISHER_NAME)}</news:name>\n        <news:language>${LANGUAGE}</news:language>\n      </news:publication>\n      <news:publication_date>${escapeXml(toIsoDateTime(item.date))}</news:publication_date>\n      <news:title>${escapeXml(item.title)}</news:title>\n    </news:news>\n  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n${urls}\n</urlset>\n`;
}

function buildMainNewsBlock(newsItems) {
  return sortNews(newsItems).map((item) => {
    const loc = `${SITE_URL}/news/${item.id}`;
    return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${escapeXml(item.date)}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority>\n    <news:news>\n      <news:publication><news:name>${escapeXml(PUBLISHER_NAME)}</news:name><news:language>${LANGUAGE}</news:language></news:publication>\n      <news:publication_date>${escapeXml(toIsoDateTime(item.date))}</news:publication_date>\n      <news:title>${escapeXml(item.title)}</news:title>\n    </news:news>\n  </url>`;
  }).join('\n');
}

function updateMainSitemap(newsItems) {
  const xml = fs.readFileSync(MAIN_SITEMAP, 'utf8');
  const startMarker = '  <!-- ── সরদার সংবাদ (প্রতিটি নিউজ আলাদা URL) ── -->';
  const endMarker = '  <!-- ── আইনি পেজ ── -->';
  const start = xml.indexOf(startMarker);
  const end = xml.indexOf(endMarker);
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('sitemap.xml-এ news block marker পাওয়া যায়নি।');
  }
  const replacement = `${startMarker}\n${buildMainNewsBlock(newsItems)}\n`;
  return xml.slice(0, start) + replacement + xml.slice(end);
}

function writeOrCheck(filePath, nextContent) {
  const current = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
  if (current === nextContent) return false;
  if (CHECK_ONLY) {
    throw new Error(`${path.relative(ROOT, filePath)} sync করা নেই। npm run news:sync চালান।`);
  }
  fs.writeFileSync(filePath, nextContent, 'utf8');
  return true;
}

function main() {
  const newsItems = extractNewsData();
  const { errors, warnings } = validateNews(newsItems);
  if (warnings.length) {
    console.warn('News SEO warning:');
    for (const warning of warnings) console.warn(`- ${warning}`);
  }
  if (errors.length) {
    console.error('News SEO validation failed:');
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  const newsChanged = writeOrCheck(NEWS_SITEMAP, buildNewsSitemap(newsItems));
  const mainChanged = writeOrCheck(MAIN_SITEMAP, updateMainSitemap(newsItems));
  const mode = CHECK_ONLY ? 'checked' : 'synced';
  console.log(`News SEO ${mode}: ${newsItems.length} article(s). news-sitemap ${newsChanged ? 'updated' : 'unchanged'}, sitemap ${mainChanged ? 'updated' : 'unchanged'}.`);
}

main();
