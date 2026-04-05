# Chatbot Fix Notes

## Root Cause
The live `/api/chat` endpoint is returning `HTTP 404: {"error":"Session not found"}`. This indicates the deployed serverless function is trying to use `BUILT_IN_FORGE_*` first, and that proxy/session is no longer valid in production.

## Code Fix Applied
The `api/chat.js` file has been updated so that:

1. `OPENAI_API_KEY` is preferred over `BUILT_IN_FORGE_API_KEY`.
2. Forge is only used as a fallback when no `OPENAI_API_KEY` exists.
3. The chat completions URL is normalized safely.
4. Responses are marked `no-store`.

## Required Production Environment
Set these in Vercel Production:

| Variable | Value |
|---|---|
| `OPENAI_API_KEY` | Your valid OpenAI API key |
| `OPENAI_BASE_URL` | `https://api.openai.com/v1` |
| `OPENAI_MODEL` | `gpt-4.1-mini` |

Optional: remove `BUILT_IN_FORGE_API_KEY` and `BUILT_IN_FORGE_API_URL` from Production to avoid accidental fallback confusion.

## Verification
After redeploy, test:

```bash
curl -i https://www.mahbubsardarsabuj.com/api/chat \
  -X POST \
  -H 'Content-Type: application/json' \
  --data '{"messages":[{"role":"user","content":"মাহবুব সরদার সবুজের পরিচয় দাও"}]}'
```

Expected result: HTTP 200 with JSON containing `reply`.
