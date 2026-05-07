import type { IncomingMessage, ServerResponse } from "node:http";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "../server/_core/context";
import type { User } from "../drizzle/schema";

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
    const { sdk } = await import("../server/_core/sdk");
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

function getTrpcPath(req: IncomingMessage & { query?: Record<string, unknown> }) {
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

  res.end(JSON.stringify({
    error: "API function failed to initialize.",
    message: message.slice(0, 300),
  }));
}

export default async function handler(req: IncomingMessage & { query?: Record<string, unknown> }, res: ServerResponse) {
  try {
    const [{ nodeHTTPRequestHandler }, { appRouter }] = await Promise.all([
      import("@trpc/server/adapters/node-http"),
      import("../server/routers"),
    ]);

    await nodeHTTPRequestHandler({
      router: appRouter,
      path: getTrpcPath(req),
      req,
      res,
      createContext: createVercelContext,
    });
  } catch (error) {
    sendFunctionError(res, error);
  }
}
