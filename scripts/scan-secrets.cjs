#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const allowlist = new Set([
  "package-lock.json",
  "pnpm-lock.yaml",
]);

const patterns = [
  { name: "OpenAI-style API key", regex: /sk-(?=[A-Za-z0-9_-]*\d)[A-Za-z0-9_-]{16,}/g },
  { name: "Telegram bot token", regex: /\b\d{8,12}:[A-Za-z0-9_-]{30,}\b/g },
  { name: "Google API key", regex: /AIza[0-9A-Za-z_-]{35}/g },
  { name: "AWS access key", regex: /AKIA[0-9A-Z]{16}/g },
  { name: "GitHub token", regex: /gh[pousr]_[A-Za-z0-9_]{36,}/g },
];

function listTrackedFiles() {
  const output = execFileSync("git", ["ls-files"], { cwd: root, encoding: "utf8" });
  return output.split("\n").filter(Boolean);
}

function isBinary(buffer) {
  const sample = buffer.subarray(0, Math.min(buffer.length, 8000));
  return sample.includes(0);
}

const findings = [];
for (const relative of listTrackedFiles()) {
  if (allowlist.has(relative)) continue;
  if (relative.startsWith("node_modules/") || relative.startsWith("dist/")) continue;

  const absolute = path.join(root, relative);
  if (!fs.existsSync(absolute)) continue;
  const buffer = fs.readFileSync(absolute);
  if (isBinary(buffer)) continue;
  const content = buffer.toString("utf8");

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.regex.exec(content)) !== null) {
      const before = content.slice(0, match.index);
      const line = before.split(/\r?\n/).length;
      findings.push(`${relative}:${line} ${pattern.name}`);
    }
  }
}

if (findings.length) {
  console.error("Potential secrets detected. Remove them or replace with documented placeholders:");
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}

console.log("Secret scan passed: no high-confidence secrets found in tracked source files.");
