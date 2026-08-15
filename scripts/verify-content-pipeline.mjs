import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const archivePath = path.join(root, "client/public/data/writingsArchive.json");
const indexPath = path.join(root, "api/_knowledge/chatbotIndex.json");

const archive = JSON.parse(readFileSync(archivePath, "utf8"));
const index = JSON.parse(readFileSync(indexPath, "utf8"));

if (!Array.isArray(archive) || archive.length === 0) {
  throw new Error("Published writings archive is empty or invalid.");
}

const archiveIds = new Set(archive.map((writing) => String(writing.id)));
const indexedWritings = (index.items ?? []).filter((item) => item.type === "writing");
const indexedIds = new Set(indexedWritings.map((item) => String(item.id)));
const missingFromIndex = [...archiveIds].filter((id) => !indexedIds.has(id));
const unknownInIndex = [...indexedIds].filter((id) => !archiveIds.has(id));

if (index.totals?.writings !== archive.length || missingFromIndex.length || unknownInIndex.length) {
  throw new Error(
    `Content pipeline mismatch: archive=${archive.length}, index=${index.totals?.writings ?? "unknown"}, ` +
      `missing=${missingFromIndex.slice(0, 10).join(",") || "none"}, ` +
      `unknown=${unknownInIndex.slice(0, 10).join(",") || "none"}`
  );
}

console.log(`Content pipeline verified: ${archive.length} published writings and ${indexedWritings.length} chatbot entries are synchronized.`);
