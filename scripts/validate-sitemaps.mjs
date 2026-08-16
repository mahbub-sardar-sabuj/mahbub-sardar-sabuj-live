import { readFileSync } from "node:fs";

const files = [
  "client/public/sitemap.xml",
  "client/public/sitemap-index.xml",
  "client/public/news-sitemap.xml",
  "client/public/writings-sitemap-1.xml",
  "client/public/writings-sitemap-2.xml",
  "client/public/writings-sitemap-3.xml",
];

for (const file of files) {
  const xml = readFileSync(file, "utf8");
  if (!xml.startsWith("<?xml")) throw new Error(`${file}: missing XML declaration`);
  if (!xml.includes("<urlset") && !xml.includes("<sitemapindex")) throw new Error(`${file}: missing sitemap root`);
  const locCount = (xml.match(/<loc>https:\/\/www\.mahbubsardarsabuj\.com\//g) || []).length;
  if (locCount === 0) throw new Error(`${file}: no canonical loc entries`);
  if (xml.includes("bichhed-kobita")) throw new Error(`${file}: contains redirecting legacy URL`);
  console.log(`${file}: valid canonical sitemap shape (${locCount} URLs)`);
}
