/**
 * /api/amio-post-seo?slug=<slug>
 * SSR endpoint for "আমিও লিখবো বাস্তবতা" post pages.
 * Returns full HTML with SEO meta tags, Open Graph, and JSON-LD structured data.
 * Google bots get this HTML; human users are redirected to the SPA.
 */
import mysql from "mysql2/promise";

const SITE_URL = "https://www.mahbubsardarsabuj.com";
const DEFAULT_IMAGE = `${SITE_URL}/images/og-home-suit.jpg`;
const SITE_NAME = "মাহবুব সরদার সবুজ | Mahbub Sardar Sabuj";
const AMIO_NAME = "আমিও লিখবো বাস্তবতা";

const CATEGORY_LABELS = {
  experience: "অভিজ্ঞতা",
  story: "গল্প",
  poem: "কবিতা",
  thought: "ভাবনা",
  photo: "ছবি",
  video: "ভিডিও",
};

const SCHEMA_TYPES = {
  poem: "Poem",
  story: "ShortStory",
  experience: "Article",
  thought: "Article",
  photo: "Article",
  video: "Article",
};

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return mysql.createConnection(url);
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  const slug = req.query?.slug || new URL(req.url, "http://localhost").searchParams.get("slug");
  if (!slug) {
    return res.status(400).json({ error: "slug required" });
  }

  const canonicalUrl = `${SITE_URL}/amio-likhbo-bastobota/${slug}`;

  let db;
  try {
    db = await getDb();

    // Fetch post from DB
    const [rows] = await db.execute(
      `SELECT id, slug, title, authorName, authorOpenId, category, content, mediaUrl, mediaType,
              viewCount, createdAt, updatedAt
       FROM writing_posts
       WHERE slug = ? AND status = 'approved'
       LIMIT 1`,
      [slug]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "post not found" });
    }

    const post = rows[0];
    const catLabel = CATEGORY_LABELS[post.category] || post.category;
    const schemaType = SCHEMA_TYPES[post.category] || "Article";
    const description = String(post.content).slice(0, 200).replace(/\n/g, " ").trim();
    const postImage = post.mediaUrl && post.mediaType === "image" && String(post.mediaUrl).startsWith("http")
      ? post.mediaUrl
      : DEFAULT_IMAGE;

    const publishedTime = new Date(post.createdAt).toISOString();
    const modifiedTime = new Date(post.updatedAt).toISOString();

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": schemaType,
      "headline": post.title,
      "description": description,
      "url": canonicalUrl,
      "datePublished": publishedTime,
      "dateModified": modifiedTime,
      "author": {
        "@type": "Person",
        "name": post.authorName,
      },
      "publisher": {
        "@type": "Organization",
        "name": AMIO_NAME,
        "url": SITE_URL,
      },
      "inLanguage": "bn-BD",
      "isAccessibleForFree": true,
      "genre": catLabel,
      "image": postImage,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": canonicalUrl,
      },
    };

    const contentHtml = String(post.content)
      .split("\n")
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => `<p>${escapeHtml(p)}</p>`)
      .join("");

    const title = `${post.title} — ${post.authorName} | ${AMIO_NAME}`;
    const keywords = `${post.authorName}, ${catLabel}, আমিও লিখবো বাস্তবতা, বাস্তব গল্প, বাংলা লেখা, মাহবুব সরদার সবুজ`;

    const html = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="keywords" content="${escapeHtml(keywords)}">
  <meta name="author" content="${escapeHtml(post.authorName)}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <link rel="canonical" href="${canonicalUrl}">

  <!-- Open Graph -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(postImage)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="${escapeHtml(SITE_NAME)}">
  <meta property="og:locale" content="bn_BD">
  <meta property="article:published_time" content="${publishedTime}">
  <meta property="article:modified_time" content="${modifiedTime}">
  <meta property="article:section" content="${escapeHtml(catLabel)}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(postImage)}">

  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>

  <!-- Redirect human users to SPA; keep bots on this page -->
  <script>
    if (!/bot|crawler|spider|googlebot|bingbot|yandex|baidu|duckduck|facebookexternalhit|facebot|twitterbot|whatsapp|linkedinbot|slackbot|telegrambot|discordbot|pinterest|applebot/i.test(navigator.userAgent)) {
      window.location.replace("${canonicalUrl}");
    }
  </script>
</head>
<body>
  <header>
    <nav>
      <a href="${SITE_URL}">মাহবুব সরদার সবুজ | Mahbub Sardar Sabuj</a>
      &rsaquo;
      <a href="${SITE_URL}/amio-likhbo-bastobota">আমিও লিখবো বাস্তবতা</a>
    </nav>
  </header>
  <main>
    <article itemscope itemtype="https://schema.org/${schemaType}">
      <header>
        <h1 itemprop="headline">${escapeHtml(post.title)}</h1>
        <p>
          <span itemprop="author" itemscope itemtype="https://schema.org/Person">
            <strong itemprop="name">${escapeHtml(post.authorName)}</strong>
          </span>
          &bull;
          <span itemprop="genre">${escapeHtml(catLabel)}</span>
          &bull;
          <time itemprop="datePublished" datetime="${publishedTime}">
            ${new Date(post.createdAt).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" })}
          </time>
        </p>
      </header>

      ${postImage !== DEFAULT_IMAGE ? `<figure><img src="${escapeHtml(postImage)}" alt="${escapeHtml(post.title)}" itemprop="image" style="max-width:100%;border-radius:12px"></figure>` : ""}

      <div itemprop="articleBody" style="line-height:2;font-size:1.05rem">
        ${contentHtml}
      </div>

      <footer style="margin-top:2rem;padding-top:1rem;border-top:1px solid #eee">
        <p>
          <a href="${SITE_URL}/amio-likhbo-bastobota">← আমিও লিখবো বাস্তবতা ফিডে ফিরুন</a>
          &nbsp;|&nbsp;
          <a href="${SITE_URL}">মাহবুব সরদার সবুজ অফিসিয়াল ওয়েবসাইট</a>
        </p>
        <meta itemprop="dateModified" content="${modifiedTime}">
        <meta itemprop="inLanguage" content="bn-BD">
        <meta itemprop="isAccessibleForFree" content="true">
      </footer>
    </article>
  </main>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
    return res.status(200).send(html);

  } catch (err) {
    console.error("[amio-post-seo] error:", err);
    return res.status(500).json({ error: "internal error" });
  } finally {
    if (db) await db.end().catch(() => {});
  }
}
