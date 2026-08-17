import type { Express, Request, Response } from "express";
import { pathToFileURL } from "url";
import path from "path";

type VercelStyleHandler = (req: Request, res: Response) => unknown | Promise<unknown>;

const apiHandlerCache = new Map<string, Promise<VercelStyleHandler>>();

function loadApiHandler(fileName: string): Promise<VercelStyleHandler> {
  if (!apiHandlerCache.has(fileName)) {
    const fileUrl = pathToFileURL(path.join(process.cwd(), "api", fileName)).href;
    apiHandlerCache.set(
      fileName,
      import(fileUrl).then((module) => {
        const handler = module.default as VercelStyleHandler | undefined;
        if (typeof handler !== "function") {
          throw new Error(`API handler ${fileName} does not export a default function`);
        }
        return handler;
      })
    );
  }

  return apiHandlerCache.get(fileName)!;
}

function registerApiHandler(app: Express, routePath: string, fileName: string, queryString?: string) {
  app.all(routePath, async (req: Request, res: Response) => {
    const originalUrl = req.url;
    try {
      if (queryString && !req.url.includes("?")) {
        req.url = `${req.url}?${queryString}`;
      }
      const handler = await loadApiHandler(fileName);
      await handler(req, res);
    } catch (error) {
      console.error(`[Standalone API] ${routePath} failed:`, error);
      if (!res.headersSent) {
        res.status(500).json({ error: "সার্ভার ত্রুটি" });
      }
    } finally {
      req.url = originalUrl;
    }
  });
}

/**
 * Registers file-based API routes when the bundled Express server is run directly.
 *
 * Vercel serves files under /api automatically, but the standalone production server
 * otherwise falls through to the SPA HTML for these paths. Registering the same
 * handlers here keeps local/VM production, smoke tests, and alternative Node hosting
 * behavior aligned with the deployed site.
 */
export function registerStandaloneApiRoutes(app: Express) {
  registerApiHandler(app, "/api/profile", "profile.js");
  registerApiHandler(app, "/api/upload", "upload.js");
  registerApiHandler(app, "/api/chat", "chat.js");
  registerApiHandler(app, "/api/chat-stream", "chat.js", "stream=1");
  registerApiHandler(app, "/api/analytics", "chat.js", "analytics=1");
  registerApiHandler(app, "/api/chatbot-notify", "chatbot-notify.js");
  registerApiHandler(app, "/api/temp-email-proxy", "temp-email-proxy.js");
  registerApiHandler(app, "/api/image-upscale", "image-upscale.js");
  registerApiHandler(app, "/api/audio-edit", "audio-edit.js");
  registerApiHandler(app, "/api/video-to-audio", "video-to-audio.js");
  registerApiHandler(app, "/mahbubsardarsabuj2026bd.txt", "indexnow-key.js");
}
