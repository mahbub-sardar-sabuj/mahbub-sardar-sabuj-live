import handler from "../api/ssr-og.js";

async function getResponse(path) {
  return handler(new Request(`https://example.test/api/ssr-og?path=${encodeURIComponent(path)}`));
}

const redirect = await getResponse("/ebooks/read/dukkhovilash");
if (redirect.status !== 302 || redirect.headers.get("location") !== "https://www.mahbubsardarsabuj.com/ebooks") {
  throw new Error(`Old Dukkhovilash reader did not redirect correctly: ${redirect.status} ${redirect.headers.get("location")}`);
}

const ebooks = await getResponse("/ebooks");
const html = await ebooks.text();
const required = ["অভিমান", "https://rkmri.co/Te303mA3TEyA/", "https://rkmri.co/IIAReAoMpRyp/"];
for (const value of required) {
  if (!html.includes(value)) throw new Error(`SSR books page is missing: ${value}`);
}
if (html.includes("/ebooks/read/dukkhovilash")) {
  throw new Error("SSR books page still exposes the Dukkhovilash reader URL");
}

console.log("PASS SSR Dukkhovilash redirect");
console.log("PASS SSR books page direct-order links");
