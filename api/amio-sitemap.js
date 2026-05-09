/**
 * /api/amio-sitemap
 * Dynamic sitemap for "আমিও লিখবো বাস্তবতা" visitor posts.
 * Returns XML sitemap with all approved posts for Google indexing.
 */
import mysql from "mysql2/promise";

const SITE_URL = "https://www.mahbubsardarsabuj.com";

async function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return mysql.createConnection(url);
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(200).end();

  let db;
  try {
    db = await getDb();

    const [rows] = await db.execute(
      `SELECT slug, updatedAt FROM writing_posts
       WHERE status = 'approved'
       ORDER BY updatedAt DESC
       LIMIT 5000`
    );

    const today = new Date().toISOString().split("T")[0];

    const urlEntries = (rows || []).map((post) => {
      const lastmod = post.updatedAt
        ? new Date(post.updatedAt).toISOString().split("T")[0]
        : today;
      return `  <url>
    <loc>${SITE_URL}/amio-likhbo-bastobota/${encodeURIComponent(post.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    }).join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- আমিও লিখবো বাস্তবতা — ভিজিটর পোস্ট সাইটম্যাপ -->
  <!-- Generated: ${today} | Total: ${rows.length} posts -->
  <url>
    <loc>${SITE_URL}/amio-likhbo-bastobota</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
${urlEntries}
</urlset>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
    return res.status(200).send(xml);

  } catch (err) {
    console.error("[amio-sitemap] error:", err);
    // Return minimal valid sitemap on error
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/amio-likhbo-bastobota</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    return res.status(200).send(xml);
  } finally {
    if (db) await db.end().catch(() => {});
  }
}
