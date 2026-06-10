import handler from "../api/chat.js";

const prompts = [
  "মাহবুব সরদার সবুজ কে?",
  "মাহবুব সরদার সবুজের বইগুলো দেখাও",
  "ওয়েবসাইটে কোন কোন ধরনের লেখা আছে?",
  "যোগাযোগ করতে চাই",
  "আমাকে বাংলা কবিতা লেখা শেখাও",
  "আবৃত্তি শুনতে চাই",
  "সরদার ডিজাইন স্টুডিও কীভাবে ব্যবহার করব?",
  "চাঁদফুল ই-বুক কোথায় পড়ব?",
  "সব পেজ দেখাও",
];

function createMockRes() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(key, value) {
      this.headers[key] = value;
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    end(payload = "") {
      this.body = payload;
      return this;
    },
  };
}

async function runPromptSmoke(prompt) {
  const req = {
    method: "POST",
    body: { messages: [{ role: "user", content: prompt }] },
    headers: { "user-agent": "chatbot-regression-test" },
    socket: { remoteAddress: "127.0.0.1" },
  };
  const res = createMockRes();
  await handler(req, res);
  const reply = res.body?.reply || res.body?.error || "";
  const ok = res.statusCode === 200 && reply.length > 40;
  console.log(JSON.stringify({ prompt, status: res.statusCode, source: res.body?.source || (res.body?.fallback ? "fallback" : "ai"), ok, preview: reply.slice(0, 140) }, null, 2));
  if (!ok) process.exitCode = 1;
}

async function runFeedbackSmoke() {
  const req = {
    method: "POST",
    url: "/api/chat?feedback=1",
    body: { reaction: "up" },
    headers: { "user-agent": "chatbot-regression-test" },
    socket: { remoteAddress: "127.0.0.1" },
  };
  const res = createMockRes();
  await handler(req, res);
  const ok = res.statusCode === 200 && res.body?.ok === true;
  console.log(JSON.stringify({ prompt: "feedback smoke", status: res.statusCode, ok, body: res.body }, null, 2));
  if (!ok) process.exitCode = 1;
}

for (const prompt of prompts) {
  await runPromptSmoke(prompt);
}

await runFeedbackSmoke();
