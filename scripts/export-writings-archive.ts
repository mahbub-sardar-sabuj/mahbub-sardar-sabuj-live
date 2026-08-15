import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { writings } from "../client/src/data/writingsArchive";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const outputPath = resolve(projectRoot, "client/public/data/writingsArchive.json");

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(writings, null, 2)}\n`, "utf8");

console.log(`Writings archive exported: ${writings.length} item(s) -> ${outputPath}`);
