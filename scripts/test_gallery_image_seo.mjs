import handler from "../api/ssr-og.js";
import { galleryImages, galleryPrimaryImage } from "../api/_knowledge/galleryImages.js";

const response = await handler(new Request("https://www.mahbubsardarsabuj.com/api/ssr-og?path=/gallery"));
const html = await response.text();
const imageTagCount = (html.match(/<img\s/gi) || []).length;
const imageObjectCount = (html.match(/"@type":"ImageObject"/g) || []).length;
const failures = [];

if (response.status !== 200) failures.push(`Expected HTTP 200, received ${response.status}`);
if (imageTagCount !== galleryImages.length) failures.push(`Expected ${galleryImages.length} crawler-visible image tags, found ${imageTagCount}`);
if (!html.includes(`content="${galleryPrimaryImage}"`)) failures.push("Gallery Open Graph image is not the canonical primary portrait");
if (!html.includes(`contentUrl":"${galleryPrimaryImage}"`)) failures.push("Gallery primary ImageObject is missing from JSON-LD");
if (imageObjectCount < galleryImages.length) failures.push(`Expected at least ${galleryImages.length} ImageObject records, found ${imageObjectCount}`);
for (const image of galleryImages) {
  if (!html.includes(image.src)) failures.push(`Missing image URL in crawler HTML: ${image.src}`);
  if (!html.includes(`alt="${image.caption} — মাহবুব সরদার সবুজ"`)) failures.push(`Missing descriptive alt text for: ${image.caption}`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Gallery image SEO regression passed: ${galleryImages.length} images, ${imageTagCount} HTML image tags, ${imageObjectCount} ImageObject records.`);
