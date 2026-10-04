import { createElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import LiveChatWidget from "../client/src/components/LiveChatWidget";
import { routeNeedsDataClient } from "../client/src/lib/dataClientRequirement";
import { trpc } from "../client/src/lib/trpc";

describe("chatbot live-chat tRPC context", () => {
  it("keeps route providers limited to existing data-dependent routes", () => {
    expect(routeNeedsDataClient("/profile")).toBe(true);
    expect(routeNeedsDataClient("/admin/live-chat")).toBe(true);
    expect(routeNeedsDataClient("/amio-likhbo-bastobota")).toBe(true);
    expect(routeNeedsDataClient("/")).toBe(false);
    expect(routeNeedsDataClient("/writings")).toBe(false);
  });

  it("reproduces the reported context error when mounted without providers", () => {
    expect(() => renderToString(createElement(LiveChatWidget))).toThrow(/Unable to find tRPC Context/);
  });

  it("renders the visitor live-chat widget inside the tRPC and query providers", () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const trpcClient = trpc.createClient({
      links: [httpBatchLink({ url: "http://localhost/api/trpc" })],
    });
    const widget = createElement(LiveChatWidget);
    const app = createElement(
      trpc.Provider,
      { client: trpcClient, queryClient },
      createElement(QueryClientProvider, { client: queryClient }, widget)
    );

    expect(() => renderToString(app)).not.toThrow();
  });
});
