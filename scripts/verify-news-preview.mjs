import assert from "node:assert/strict";
import handler from "../api/ssr-og.js";

const newsId = Number.parseInt(process.env.NEWS_ID ?? "49", 10);
const expectedTitle = process.env.EXPECTED_TITLE ?? "শীঘ্রই প্রকাশিত হচ্ছে লেখক মাহবুব সরদার সবুজের নতুন বই ‘অভিমান’";
const expectedUrl = `https://www.mahbubsardarsabuj.com/news/${newsId}`;
const expectedImage = "https://www.mahbubsardarsabuj.com/images/news/abhiman-book.jpg";

const request = new Request(`https://www.mahbubsardarsabuj.com/api/ssr-og?path=/news/${newsId}`, {
  headers: { "user-agent": "facebookexternalhit/1.1" },
});
const response = await handler(request);
const html = await response.text();

function meta(property) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = html.match(new RegExp(`<meta\\s+(?:property|name)="${escaped}"\\s+content="([^"]*)"`));
  return match?.[1];
}

assert.equal(response.status, 200, "Crawler renderer must return HTTP 200.");
assert.ok(html.includes(`<title>${expectedTitle} | সরদার সংবাদ | Sardar Sangbad</title>`), "Article title must be present in raw HTML.");
assert.equal(meta("og:url"), expectedUrl, "Open Graph URL must be the canonical article URL.");
assert.equal(meta("og:title"), `${expectedTitle} | সরদার সংবাদ | Sardar Sangbad`, "Open Graph title must match the article.");
assert.equal(meta("og:image"), expectedImage, "Open Graph image must be an absolute article image URL.");
assert.equal(meta("twitter:card"), "summary_large_image", "Large image card metadata must be present.");

console.log(`Facebook preview metadata verified for /news/${newsId}.`);
