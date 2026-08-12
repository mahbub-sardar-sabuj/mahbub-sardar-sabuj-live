import handler from "../api/sms-proxy.js";

function createResponse() {
  const result = { status: 200, headers: {}, body: undefined, ended: false };
  const res = {
    setHeader(name, value) {
      result.headers[name.toLowerCase()] = value;
    },
    status(code) {
      result.status = code;
      return this;
    },
    json(body) {
      result.body = body;
      result.ended = true;
      return this;
    },
    end() {
      result.ended = true;
      return this;
    },
  };
  return { res, result };
}

async function invoke(body) {
  const { res, result } = createResponse();
  await handler({ method: "POST", query: { service: "temp-email" }, body }, res);
  if (!result.ended) throw new Error(`No response for ${body.action}`);
  return result;
}

function expect(condition, message) {
  if (!condition) throw new Error(message);
}

const password = `ProxyTest_${Date.now().toString(36)}!a`;
let accountId;
let token;

try {
  const domains = await invoke({ action: "domains" });
  expect(domains.status === 200, `domains returned ${domains.status}`);
  const domain = domains.body?.["hydra:member"]?.find((entry) => entry.isActive)?.domain;
  expect(typeof domain === "string", "no active email domain received");

  const address = `verify${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}@${domain}`;
  const created = await invoke({ action: "createAccount", address, password });
  expect(created.status === 201, `createAccount returned ${created.status}: ${JSON.stringify(created.body)}`);
  accountId = created.body?.id;
  expect(typeof accountId === "string", "created account has no id");

  const tokenResponse = await invoke({ action: "createToken", address, password });
  expect(tokenResponse.status === 200, `createToken returned ${tokenResponse.status}`);
  token = tokenResponse.body?.token;
  expect(typeof token === "string" && token.length > 20, "no valid access token received");

  const messages = await invoke({ action: "messages", token });
  expect(messages.status === 200, `messages returned ${messages.status}`);
  expect(Array.isArray(messages.body?.["hydra:member"]), "messages response has no message array");

  console.log("PASS: temporary-email proxy created an account, obtained a token, and loaded the inbox.");
} finally {
  if (accountId && token) {
    const deleted = await invoke({ action: "deleteAccount", id: accountId, token });
    expect(deleted.status === 204, `deleteAccount returned ${deleted.status}`);
    console.log("PASS: temporary-email test account deleted.");
  }
}
