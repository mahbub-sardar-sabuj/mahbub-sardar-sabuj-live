# Live temporary email investigation — 2026-09-06

- Live page: https://www.mahbubsardarsabuj.com/temp-email
- Clicking “ইমেইল তৈরি করুন” reproduces the visible error: “ইমেইল সেবাটি এখন ব্যবহার করা যাচ্ছে না। কিছুক্ষণ পর আবার চেষ্টা করুন।”
- Browser POST to `/api/temp-email-proxy` returns an HTML Cloudflare 502 on the custom domain.
- Direct POST to `https://mahbub-sardar-sabuj-live.vercel.app/api/temp-email-proxy` reaches Vercel and returns JSON `{"error":"ইমেইল সেবাটি এখন ব্যবহার করা যাচ্ছে না। কিছুক্ষণ পরে আবার চেষ্টা করুন।"}` with status 502.
- Direct Vercel response headers include `server: Vercel`, `x-vercel-cache: MISS`, and `x-vercel-id: sin1::fra1::...`, so the deployed function is running but its upstream provider calls fail.
- Live `domains` and `createAccount` actions both return the proxy’s generic 502 error.
- GitHub Actions deployment for commit `b6fbea9` completed successfully at 2026-09-06T19:49:33Z.
- Direct browser fetch to `https://api.mail.tm/domains` fails with a CORS/network `TypeError: Failed to fetch`, so direct browser bypass is not viable without a proxy.
- Local proxy test passed after prior changes, but the live Vercel function still cannot reach the upstream mailbox providers.
