#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const HOST = process.env.INDEXNOW_HOST || 'www.mahbubsardarsabuj.com';
const BASE_URL = `https://${HOST}`;
const ENDPOINT = process.env.INDEXNOW_ENDPOINT || 'https://api.indexnow.org/indexnow';
const KEY = process.env.INDEXNOW_KEY || findIndexNowKey();
const KEY_LOCATION = `${BASE_URL}/${KEY}.txt`;
const MAX_URLS = Number(process.env.INDEXNOW_MAX_URLS || 10000);

function findIndexNowKey() {
  const publicDir = path.join(process.cwd(), 'client', 'public');
  const files = fs.readdirSync(publicDir)
    .filter((name) => /^[a-f0-9]{32}\.txt$/i.test(name))
    .sort();
  if (files.length === 0) {
    throw new Error('IndexNow key file not found in client/public.');
  }
  const fileName = files[files.length - 1];
  return fileName.replace(/\.txt$/i, '');
}

async function readXml(urlOrPath) {
  if (/^https?:\/\//i.test(urlOrPath)) {
    const res = await fetch(urlOrPath, { redirect: 'follow' });
    if (!res.ok) throw new Error(`Failed to fetch ${urlOrPath}: HTTP ${res.status}`);
    return res.text();
  }
  return fs.readFileSync(path.resolve(urlOrPath), 'utf8');
}

function extractLocs(xml) {
  const matches = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)];
  return matches.map((m) => m[1].trim()).filter(Boolean);
}

async function collectUrls() {
  const sources = process.argv.slice(2);
  const defaultSources = [
    'client/public/sitemap.xml',
    'client/public/news-sitemap.xml',
  ];
  const urls = new Set([BASE_URL, `${BASE_URL}/news`, `${BASE_URL}/writings`]);
  for (const source of (sources.length ? sources : defaultSources)) {
    const xml = await readXml(source);
    for (const loc of extractLocs(xml)) {
      if (loc.startsWith(BASE_URL)) urls.add(loc);
    }
  }
  return [...urls].slice(0, MAX_URLS);
}

async function main() {
  const urlList = await collectUrls();
  const payload = { host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList };
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });
  const body = await res.text();
  console.log(JSON.stringify({ endpoint: ENDPOINT, status: res.status, statusText: res.statusText, submittedUrlCount: urlList.length, keyLocation: KEY_LOCATION, responseBody: body.slice(0, 500) }, null, 2));
  if (![200, 202].includes(res.status)) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
