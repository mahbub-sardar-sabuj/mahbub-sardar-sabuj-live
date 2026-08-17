import handler from "../api/ssr-og.js";

const cases = [
  {
    path: "//writings",
    expectedTitle:
      "বাংলা কবিতা ও লেখা | মাহবুব সরদার সবুজ | ২৩৫৭টি লেখা সংগ্রহ",
    expectedCanonical: "https://www.mahbubsardarsabuj.com/writings",
  },
  {
    path: "//news/10",
    expectedCanonical: "https://www.mahbubsardarsabuj.com/news/10",
    expectsNewsTitle: true,
  },
];

for (const testCase of cases) {
  const request = new Request(
    `https://www.mahbubsardarsabuj.com/api/ssr-og?path=${encodeURIComponent(testCase.path)}`,
    { headers: { "user-agent": "Googlebot/2.1" } }
  );
  const response = await handler(request);
  const html = await response.text();
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1] || "";
  const canonical =
    html.match(/<link rel="canonical" href="([^"]+)"/)?.[1] || "";

  if (testCase.expectedTitle && title !== testCase.expectedTitle) {
    throw new Error(`Unexpected title for ${testCase.path}: ${title}`);
  }
  if (testCase.expectsNewsTitle && !title.includes("সরদার সংবাদ")) {
    throw new Error(`News title missing for ${testCase.path}: ${title}`);
  }
  if (canonical !== testCase.expectedCanonical) {
    throw new Error(`Unexpected canonical for ${testCase.path}: ${canonical}`);
  }

  console.log(`PASS ${testCase.path} -> ${title}`);
}
