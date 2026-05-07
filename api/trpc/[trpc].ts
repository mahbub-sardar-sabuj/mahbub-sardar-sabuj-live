import { nodeHTTPRequestHandler } from "@trpc/server/adapters/node-http";
import type { IncomingMessage, ServerResponse } from "node:http";
import { COOKIE_NAME } from "../../shared/const";
import { appRouter } from "../../server/routers";
import { sdk } from "../../server/_core/sdk";
import type { TrpcContext } from "../../server/_core/context";
import type { User } from "../../drizzle/schema";

function firstHeaderValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function getRequestProtocol(req: IncomingMessage): "http" | "https" {
  const forwardedProto = firstHeaderValue(req.headers["x-forwarded-proto"]);
  if (forwardedProto?.split(",").some(proto => proto.trim().toLowerCase() === "https")) {
    return "https";
  }
  return "http";
}

function serializeExpiredCookie(name: string, options: Record<string, unknown> = {}) {
  const parts = [
    `${name}=`,
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    `Path=${typeof options.path === "string" ? options.path : "/"}`,
  ];

  if (options.httpOnly) parts.push("HttpOnly");
  if (options.secure) parts.push("Secure");
  if (options.sameSite) parts.push(`SameSite=${String(options.sameSite)}`);
  if (typeof options.domain === "string" && options.domain) parts.push(`Domain=${options.domain}`);

  return parts.join("; ");
}

function addExpressCompatibility(req: IncomingMessage, res: ServerResponse) {
  const compatibleReq = Object.assign(req, {
    protocol: getRequestProtocol(req),
    hostname: firstHeaderValue(req.headers["x-forwarded-host"]) || firstHeaderValue(req.headers.host) || "",
  });

  const compatibleRes = Object.assign(res, {
    clearCookie(name: string, options: Record<string, unknown> = {}) {
      const cookieName = name || COOKIE_NAME;
      const nextCookie = serializeExpiredCookie(cookieName, options);
      const previous = res.getHeader("Set-Cookie");
      if (!previous) {
        res.setHeader("Set-Cookie", nextCookie);
      } else if (Array.isArray(previous)) {
        res.setHeader("Set-Cookie", [...previous, nextCookie]);
      } else {
        res.setHeader("Set-Cookie", [String(previous), nextCookie]);
      }
      return compatibleRes;
    },
  });

  return { compatibleReq, compatibleRes };
}

async function createVercelContext({
  req,
  res,
}: {
  req: IncomingMessage;
  res: ServerResponse;
}): Promise<TrpcContext> {
  const { compatibleReq, compatibleRes } = addExpressCompatibility(req, res);
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(compatibleReq as TrpcContext["req"]);
  } catch {
    user = null;
  }

  return {
    req: compatibleReq as TrpcContext["req"],
    res: compatibleRes as TrpcContext["res"],
    user,
  };
}

export default async function handler(req: IncomingMessage & { query?: Record<string, unknown> }, res: ServerResponse) {
  const trpcPath = req.query?.trpc;
  const path = Array.isArray(trpcPath) ? trpcPath.join("/") : String(trpcPath ?? "");

  await nodeHTTPRequestHandler({
    router: appRouter,
    path,
    req,
    res,
    createContext: createVercelContext,
  });
}
