import handler from "../api/chat.js";

function invoke(text) {
  return new Promise(async (resolve, reject) => {
    const headers = {};
    const response = { statusCode: 200, body: null };
    const res = {
      setHeader(name, value) { headers[name.toLowerCase()] = value; },
      status(code) { response.statusCode = code; return this; },
      json(body) { response.body = body; resolve({ ...response, headers }); return this; },
      end() { resolve({ ...response, headers }); },
      write() {},
    };
    try {
      await handler({ method: "POST", url: "/api/chat", headers: { "user-agent": "canonical-test" }, body: { messages: [{ role: "user", content: text }] } }, res);
    } catch (error) { reject(error); }
  });
}

const cases = [
  ["বইগুলোর তালিকা দেখাও", /ORDER:অভিমান অর্ডার করুন/, "book list order token"],
  ["অভিমান বইটি অর্ডার করব", /ORDER:অভিমান অর্ডার করুন/, "abhiman order token"],
  ["দুঃখবিলাস বইটি কীভাবে পাব", /ORDER:দুঃখবিলাস অর্ডার করুন/, "dukkhovilash order token"],
  ["মাহবুব সরদার সবুজ কে", /BUTTON:\/about/, "author button"],
  ["সব লেখা কোথায়", /২,৩৫৭টি|BUTTON:\/writings/, "writing total or button"],
  ["সব পেজ দেখাও", /BUTTON:\/privacy-policy|BUTTON:\/terms|BUTTON:\/text-to-speech/, "complete page map"],
  ["ছবি আপস্কেল কীভাবে করব", /BUTTON:\/image-upscaler/, "image tool button"],
  ["নিজের লেখা প্রকাশ করব", /BUTTON:\/amio-likhbo-bastobota/, "community button"],
  ["যোগাযোগের তথ্য দাও", /BUTTON:\/contact/, "contact button"],
];

let failures = 0;
for (const [question, expected, label] of cases) {
  const result = await invoke(question);
  const reply = String(result.body?.reply || "");
  const visibleReply = reply.replace(/\[ORDER:[^|\]]+\|[^\]]+\]/g, "");
  const bad = /undefined|null|\[BUTTON:\s*\]|https:\/\/rkmri\.co/i.test(visibleReply);
  const ok = result.statusCode === 200 && expected.test(reply) && !bad;
  console.log(JSON.stringify({ question, label, status: result.statusCode, ok, reply: reply.slice(0, 260) }));
  if (!ok) failures += 1;
}
if (failures) process.exit(1);
console.log(`canonical chatbot regression passed: ${cases.length}/${cases.length}`);
