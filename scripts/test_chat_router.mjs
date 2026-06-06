import handler from '../api/chat.js';

const cases = [
  { name: 'book route', text: 'দুঃখবিলাস বই কোথায় কিনব', expect: ['/ebooks/read/dukkhovilash', 'rkmri.co'] },
  { name: 'author route', text: 'মাহবুব সরদার সবুজ কে', expect: ['/about', 'কুমিল্লা'] },
  { name: 'writing route', text: 'জীবনদর্শন লেখা দেখাও', expect: ['/writings', 'জীবনদর্শন'] },
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
    body: { messages: [{ role: 'user', content: testCase.text }] },
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
