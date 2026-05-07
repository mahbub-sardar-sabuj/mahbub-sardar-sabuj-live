import type { IncomingMessage, ServerResponse } from "node:http";
import { nodeHTTPRequestHandler } from "@trpc/server/adapters/node-http";
import { appRouter } from "../server/routers";
import { sdk } from "../server/_core/sdk";

const COOKIE_NAME = "app_session_id";

type HeaderValue = string | string[] | undefined;
type CompatibleRequest = IncomingMessage & {
  query?: Record<string, unknown>;
  protocol?: string;
  hostname?: string;
};
type CompatibleResponse = ServerResponse & {
  clearCookie?: (name?: string, options?: Record<string, unknown>) => CompatibleResponse;
};

function firstHeaderValue(value: HeaderValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function getRequestProtocol(req: IncomingMessage): string {
  const forwardedProto = firstHeaderValue(req.headers["x-forwarded-proto"] as HeaderValue);
  if (forwardedProto?.split(",").some((proto) => proto.trim().toLowerCase() === "https")) {
    return "https";
  }
  return "http";
}

function serializeExpiredCookie(name: string, options: Record<string, unknown> = {}): string {
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
    hostname:
      firstHeaderValue(req.headers["x-forwarded-host"] as HeaderValue) ||
      firstHeaderValue(req.headers.host as HeaderValue) ||
      "",
  }) as CompatibleRequest;

  const compatibleRes = Object.assign(res, {
    clearCookie(name?: string, options: Record<string, unknown> = {}) {
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
  }) as CompatibleResponse;

  return { compatibleReq, compatibleRes };
}

async function createVercelContext({ req, res }: { req: IncomingMessage; res: ServerResponse }) {
  const { compatibleReq, compatibleRes } = addExpressCompatibility(req, res);
  let user = null;
  try {
    user = await sdk.authenticateRequest(compatibleReq);
  } catch {
    user = null;
  }
  return {
    req: compatibleReq,
    res: compatibleRes,
    user,
  };
}

function getTrpcPath(req: CompatibleRequest): string {
  const trpcPath = req.query?.trpc;
  if (Array.isArray(trpcPath)) return trpcPath.join("/");
  if (typeof trpcPath === "string") return trpcPath;

  const url = req.url ? new URL(req.url, "https://local.invalid") : null;
  const queryPath = url?.searchParams.get("trpc");
  if (queryPath) return queryPath;

  const pathname = url?.pathname ?? "";
  const routePrefix = "/api/trpc/";
  if (pathname.startsWith(routePrefix)) return decodeURIComponent(pathname.slice(routePrefix.length));
  return "";
}

function sendFunctionError(res: ServerResponse, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.error("[tRPC function failure]", error);
  if (!res.headersSent) {
    res.statusCode = 500;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.setHeader("x-app-function-error", message.slice(0, 180));
  }
  res.end(
    JSON.stringify({
      error: "API function failed to initialize.",
      message: message.slice(0, 300),
    }),
  );
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    await nodeHTTPRequestHandler({
      router: appRouter,
      path: getTrpcPath(req as CompatibleRequest),
      req,
      res,
      createContext: createVercelContext,
    });
  } catch (error) {
    sendFunctionError(res, error);
  }
}
