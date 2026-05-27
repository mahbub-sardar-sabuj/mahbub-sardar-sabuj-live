import type { Writing } from "@/data/writingsArchive";

let cachedWritings: Writing[] | null = null;
let pendingWritings: Promise<Writing[]> | null = null;

/**
 * Load the large literary archive as a static JSON asset instead of bundling it
 * into JavaScript. This keeps the initial app and route chunks smaller while
 * still allowing the archive to be cached aggressively by the browser/CDN.
 */
export function loadWritingsArchive(): Promise<Writing[]> {
  if (cachedWritings) return Promise.resolve(cachedWritings);
  if (pendingWritings) return pendingWritings;

  pendingWritings = fetch("/data/writingsArchive.json", {
    headers: { Accept: "application/json" },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load writings archive: ${response.status}`);
      }
      return response.json() as Promise<Writing[]>;
    })
    .then((writings) => {
      cachedWritings = writings;
      return writings;
    })
    .finally(() => {
      pendingWritings = null;
    });

  return pendingWritings;
}
