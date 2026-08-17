import handler from "../api/temp-email-proxy.js";

function createResponse() {
  const headers = new Map();
  return {
    statusCode: 200,
    body: undefined,
    setHeader(name, value) {
      headers.set(String(name).toLowerCase(), String(value));
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(value) {
      this.body = value;
      return this;
    },
    end() {
      this.body = undefined;
      return this;
    },
  };
}

async function request(body) {
  const res = createResponse();
  await handler(
    {
      method: "POST",
      body,
      headers: {
        "content-length": String(Buffer.byteLength(JSON.stringify(body))),
        "x-forwarded-for": "127.0.0.97",
      },
      socket: { remoteAddress: "127.0.0.97" },
    },
    res
  );
  return res;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const domains = await request({ action: "domains" });
assert(domains.statusCode === 200, `domains status ${domains.statusCode}`);
const domain = domains.body?.["hydra:member"]?.find((item) => item.isActive)?.domain;
assert(typeof domain === "string" && domain.length > 0, "no active disposable-email domain returned");

const username = `mahbubaudit${Date.now().toString(36)}`;
const password = "audit-only-password";
const account = await request({
  action: "createAccount",
  address: `${username}@${domain}`,
  password,
});
assert(account.statusCode === 201, `createAccount status ${account.statusCode}`);
assert(typeof account.body?.id === "string" && account.body.id.length > 0, "missing mailbox id");
assert(typeof account.body?.token === "string" && account.body.token.length > 0, "missing mailbox token");
assert(typeof account.body?.address === "string" && account.body.address.includes("@"), "missing mailbox address");

const inbox = await request({ action: "messages", token: account.body.token });
assert(inbox.statusCode === 200, `messages status ${inbox.statusCode}`);
assert(Array.isArray(inbox.body?.["hydra:member"]), "messages response is not normalized to a collection");

const cleanup = await request({ action: "deleteAccount", id: account.body.id, token: account.body.token });
assert(cleanup.statusCode === 204, `deleteAccount status ${cleanup.statusCode}`);

console.log("PASS temp-email provider adapter: domains, mailbox session, inbox collection and cleanup");
