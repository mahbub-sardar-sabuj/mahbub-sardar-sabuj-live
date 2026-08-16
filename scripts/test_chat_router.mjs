import handler from '../api/chat.js';

const cases = [
  { name: 'natural wellbeing chat', text: 'কেমন আছেন?', expect: ['আলহামদুলিল্লাহ', 'আপনি কেমন আছেন'] },
  { name: 'natural greeting chat', text: 'আসসালামু আলাইকুম', expect: ['ওয়ালাইকুম আসসালাম', 'কথা বলতে'] },
  { name: 'natural emotional support chat', text: 'আজ মনটা ভালো নেই', expect: ['খারাপ লাগল', 'বলতে পারেন'] },
  { name: 'dukkhovilash order route', text: 'দুঃখবিলাস বই কোথায় কিনব', expect: ['/ebooks', 'IIAReAoMpRyp'] },
  { name: 'abhiman order route', text: 'অভিমান বইটি সরাসরি অর্ডার করতে চাই', expect: ['/ebooks', 'Te303mA3TEyA', 'অণুগদ্যগ্রন্থ'] },
  { name: 'author route', text: 'মাহবুব সরদার সবুজ কে', expect: ['/about', 'কুমিল্লা'] },
  { name: 'writing route', text: 'জীবনদর্শন লেখা দেখাও', expect: ['/writings', 'জীবনদর্শন'] },
  { name: 'writing discovery route', text: 'বিচ্ছেদের সেরা লেখাগুলো দেখাও', expect: ['/writings/', 'বিচ্ছেদ'] },
  { name: 'writing title search route', text: 'কিছু স্মৃতি কখনো ভোলা যায় না লেখাটি পড়তে চাই', expect: ['কিছু স্মৃতি কখনো ভোলা যায় না', '/writings/'] },
  { name: 'help menu route', text: 'তুমি কী কী করতে পারো help', expect: ['লেখক পরিচিতি', '/ebooks', '/contact'] },
  { name: 'book recommendation route', text: 'আমি কোন বই দিয়ে শুরু করব', expect: ['অভিমান', 'অভিমান অর্ডার করুন', 'Te303mA3TEyA', '/ebooks'] },
  {
    name: 'numbered follow-up route',
    messages: [
      { role: 'user', content: 'বিচ্ছেদের সেরা লেখাগুলো দেখাও' },
      { role: 'assistant', content: 'বিচ্ছেদ বিষয়ের নির্বাচিত কিছু লেখা পেলাম:\n\n1. কিছু স্মৃতি কখনো ভোলা যায় না — বিচ্ছেদ\n   পড়তে: [BUTTON:/writings/1241-kichu-smriti-kokhono-vula-zay-na]' },
      { role: 'user', content: '১ নম্বরটা দেখাও' },
    ],
    expect: ['কিছু স্মৃতি কখনো ভোলা যায় না', 'পুরো লেখা পড়তে: [BUTTON:/writings/'],
  },
  { name: 'recitation route', text: 'জানেন বাবা আবৃত্তি শুনব', expect: ['/facebook-recitations', 'জানেন বাবা'] },
  { name: 'contact route', text: 'যোগাযোগ ইমেইল দাও', expect: ['/contact', 'lekhokmahbubsardarsabuj'] },
  { name: 'audio route (Pro Max in-chat)', text: 'অডিও নয়েজ কমাতে পারো?', expect: ['অডিও', 'আপলোড'] },
  { name: 'site route', text: 'ওয়েবসাইটের সব পেজ দেখাও', expect: ['/writings', '/contact'] },
];

function createMockResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(key, value) {
      this.headers[key] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    end() {
      return this;
    },
  };
}

for (const testCase of cases) {
  const req = {
    method: 'POST',
    headers: { 'x-forwarded-for': `127.0.0.${Math.floor(Math.random() * 200) + 1}`, 'user-agent': 'router-regression-test' },
    body: { messages: testCase.messages || [{ role: 'user', content: testCase.text }] },
    socket: { remoteAddress: '127.0.0.1' },
  };
  const res = createMockResponse();
  await handler(req, res);
  if (res.statusCode !== 200) {
    throw new Error(`${testCase.name} failed with status ${res.statusCode}: ${JSON.stringify(res.body)}`);
  }
  const reply = String(res.body?.reply || '');
  for (const expected of testCase.expect) {
    if (!reply.includes(expected)) {
      throw new Error(`${testCase.name} missing ${expected}. Reply: ${reply}`);
    }
  }
  if (res.body?.source !== 'canonical') {
    throw new Error(`${testCase.name} did not use canonical source: ${JSON.stringify(res.body)}`);
  }
  console.log(`PASS ${testCase.name}`);
}

console.log('All chatbot intent router regression tests passed.');
