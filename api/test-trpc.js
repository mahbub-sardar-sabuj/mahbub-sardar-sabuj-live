// Simple tRPC test endpoint to test Vercel function
// This tests if the basic tRPC handler works without server/routers
import { initTRPC } from "@trpc/server";
import { nodeHTTPRequestHandler } from "@trpc/server/adapters/node-http";

const t = initTRPC.create();
const testRouter = t.router({
  health: t.procedure.query(() => ({ ok: true, time: Date.now() })),
});

export default async function handler(req, res) {
  try {
    await nodeHTTPRequestHandler({
      router: testRouter,
      path: req.query?.trpc || "health",
      req,
      res,
      createContext: () => ({}),
    });
  } catch (error) {
    res.statusCode = 500;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ error: String(error) }));
  }
}
