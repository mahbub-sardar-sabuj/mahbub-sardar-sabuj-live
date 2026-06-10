import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  WEBSITE_KNOWLEDGE,
  SITE_PAGES,
  BOOKS,
  WRITING_CATEGORIES,
  RECITATIONS,
  CHATBOT_TOOLS,
} from "../api/_knowledge/siteKnowledge.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const writingsPath = path.join(root, "api/_knowledge/writingsArchive.json");
const outputPath = path.join(root, "api/_knowledge/chatbotIndex.json");

function normalizeText(value = "") {
  return String(value || "")
    .toLowerCase()
    .replace(/[“”‘’]/g, "'")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function unique(items) {
  return [...new Set(items.filter(Boolean).map((item) => String(item).trim()).filter(Boolean))];
}

const BENGALI_TRANS = {
  'অ':'o','আ':'a','ই':'i','ঈ':'i','উ':'u','ঊ':'u','এ':'e','ঐ':'oi','ও':'o','ঔ':'ou',
  'ক':'k','খ':'kh','গ':'g','ঘ':'gh','ঙ':'ng','চ':'ch','ছ':'chh','জ':'j','ঝ':'jh','ঞ':'n',
  'ট':'t','ঠ':'th','ড':'d','ঢ':'dh','ণ':'n','ত':'t','থ':'th','দ':'d','ধ':'dh','ন':'n',
  'প':'p','ফ':'ph','ব':'b','ভ':'bh','ম':'m','য':'j','র':'r','ল':'l','শ':'sh','ষ':'sh','স':'s','হ':'h',
  'ড়':'r','ঢ়':'rh','য়':'y','ৎ':'t','া':'a','ি':'i','ী':'i','ু':'u','ূ':'u','ে':'e','ৈ':'oi','ো':'o','ৌ':'ou',
  'ং':'ng','ঃ':'h','ঁ':'n','্':'',' ':'-','?':'','!':'',',':'','.':'','"':'','\'':'','—':'-','–':'-',
};
function makeLegacySlug(title = "") {
  let slug = "";
  for (const ch of title) slug += BENGALI_TRANS[ch] ?? "";
  slug = slug.replace(/-+/g, "-").replace(/^-|-$/g, "").toLowerCase();
  return slug.length >= 3 ? slug : "writing-unknown";
}
function makeWritingSlug(title, id) {
  return `${makeLegacySlug(title)}-${id}`;
}

function item(type, id, title, pathName, description, keywords = [], extra = {}) {
  const searchText = normalizeText([
    type,
    title,
    description,
    pathName,
    ...keywords,
    ...Object.values(extra).filter((value) => typeof value === "string"),
  ].join(" "));
  return {
    type,
    id: String(id),
    title,
    path: pathName,
    description,
    keywords: unique(keywords),
    searchText,
    ...extra,
  };
}

const writings = JSON.parse(fs.readFileSync(writingsPath, "utf8"));

const items = [];
for (const page of SITE_PAGES) {
  items.push(item("page", page.key, page.label, page.path, page.description, page.keywords, { priority: 70 }));
}
for (const book of BOOKS) {
  items.push(item("book", book.key, book.title, book.readPath, book.summary, [...(book.keywords || []), book.theme, book.type, book.availability], {
    priority: 95,
    buyUrl: book.buyUrl || "",
    year: book.year,
    pages: book.pages,
  }));
}
for (const category of WRITING_CATEGORIES) {
  items.push(item("writing_category", category.name, category.name, category.path, category.description, [...(category.keywords || []), `${category.count} লেখা`], {
    priority: 90,
    count: category.count,
  }));
}
for (const recitation of RECITATIONS) {
  items.push(item("recitation", recitation.title, recitation.title, recitation.path, recitation.theme, recitation.keywords || [], { priority: 80 }));
}
for (const tool of CHATBOT_TOOLS) {
  items.push(item("tool", tool.key, tool.label, tool.key === "live" ? "/contact" : "/", tool.description, tool.keywords || [], { priority: 75 }));
}

const writingItems = writings.map((writing) => {
  const content = String(writing.content || "");
  const excerpt = content.length > 220 ? `${content.slice(0, 220).trim()}…` : content;
  return item("writing", writing.id, writing.title, `/writings/${makeWritingSlug(writing.title, writing.id)}`, excerpt, [writing.title, writing.category, writing.date], {
    priority: 55,
    category: writing.category || "",
    date: writing.date || "",
    contentLength: content.length,
  });
});
items.push(...writingItems);

const byType = items.reduce((acc, entry) => {
  acc[entry.type] = (acc[entry.type] || 0) + 1;
  return acc;
}, {});

const index = {
  version: "2026.06-chatbot-index-v1",
  generatedAt: new Date().toISOString(),
  totals: {
    items: items.length,
    writings: writings.length,
    byType,
  },
  author: WEBSITE_KNOWLEDGE.author,
  items,
};

fs.writeFileSync(outputPath, JSON.stringify(index, null, 2));
console.log(`Chatbot index generated: ${items.length} item(s) -> ${outputPath}`);
