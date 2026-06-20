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
  // Very simple extraction that doesn't execute code
  const objects = [];
  const regex = /\{[\s\S]*?id:\s*(\d+)[\s\S]*?title:\s*"(.*?)"[\s\S]*?date:\s*"(.*?)"[\s\S]*?\}/g;
  let match;
  while ((match = regex.exec(source)) !== null) {
    objects.push({
      id: parseInt(match[1]),
      title: match[2].replace(/\\"/g, '"'),
      date: match[3]
    });
  }
  return objects;
}

function main() {
  try {
    const newsItems = extractNewsData();
    console.log(`Extracted ${newsItems.length} articles.`);
    
    if (newsItems.length === 0) {
        console.log("No news items found, skipping sitemap update.");
        return;
    }

    // Build sitemap content
    const urls = newsItems.map((item) => {
      const loc = `${SITE_URL}/news/${item.id}`;
      return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <news:news>\n      <news:publication>\n        <news:name>${escapeXml(PUBLISHER_NAME)}</news:name>\n        <news:language>${LANGUAGE}</news:language>\n      </news:publication>\n      <news:publication_date>${item.date}T00:00:00+06:00</news:publication_date>\n      <news:title>${escapeXml(item.title)}</news:title>\n    </news:news>\n  </url>`;
    }).join('\n');

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n${urls}\n</urlset>\n`;
    
    fs.writeFileSync(NEWS_SITEMAP, sitemapXml);
    console.log(`News SEO synced: ${newsItems.length} article(s).`);
  } catch (e) {
    console.error('News SEO sync failed:', e.message);
    process.exit(1);
  }
}

main();
