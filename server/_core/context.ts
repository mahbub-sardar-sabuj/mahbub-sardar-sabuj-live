import type { IncomingMessage, ServerResponse } from "node:http";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: IncomingMessage & { query?: Record<string, unknown> };
  res: ServerResponse & { clearCookie?: (name: string, options?: Record<string, unknown>) => void };
  user: User | null;
};

export async function createContext(
  opts: { req: IncomingMessage; res: ServerResponse }
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req as TrpcContext["req"],
    res: opts.res as TrpcContext["res"],
    user,
  };
}
