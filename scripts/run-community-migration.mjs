import { readFile } from "node:fs/promises";
import process from "node:process";
import mysql from "mysql2/promise";

const migrations = [
  { id: "20260816_literary_community_extensions", file: "0005_literary_community_extensions.sql" },
  { id: "20260816_community_feed_performance_indexes", file: "0006_community_feed_performance_indexes.sql" },
  { id: "20260816_literary_social_platform", file: "0007_literary_social_platform.sql" },
];
// Database migrations are an explicit operation. A Vercel build must stay deterministic
// and must not try to connect with a deployment-time placeholder DATABASE_URL.
const shouldRunMigrations = process.env.RUN_COMMUNITY_MIGRATIONS === "1";
const databaseUrl = process.env.DATABASE_URL;

if (!shouldRunMigrations || !databaseUrl) {
  console.log("[community-migration] skipped (set RUN_COMMUNITY_MIGRATIONS=1 with a valid database URL to run)");
  process.exit(0);
}

const connection = await mysql.createConnection(databaseUrl);

try {
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS app_schema_migrations (
      id varchar(120) NOT NULL PRIMARY KEY,
      appliedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  for (const migration of migrations) {
    const [appliedRows] = await connection.execute(
      "SELECT id FROM app_schema_migrations WHERE id = ? LIMIT 1",
      [migration.id],
    );
    if (Array.isArray(appliedRows) && appliedRows.length > 0) {
      console.log(`[community-migration] ${migration.id} already applied`);
      continue;
    }

    const source = await readFile(new URL(`../drizzle/${migration.file}`, import.meta.url), "utf8");
    const statements = source
      .split(";")
      .map((statement) => statement.replace(/^\s*--.*$/gm, "").trim())
      .filter(Boolean);

    for (const statement of statements) {
      try {
        await connection.query(statement);
      } catch (error) {
        const code = error?.code;
        const message = String(error?.message || "");
        const duplicateIndex = code === "ER_DUP_KEYNAME" || /Duplicate key name/i.test(message);
        if (!duplicateIndex) throw error;
        console.warn("[community-migration] existing index kept:", message);
      }
    }

    await connection.execute("INSERT INTO app_schema_migrations (id) VALUES (?)", [migration.id]);
    console.log(`[community-migration] ${migration.id} applied successfully`);
  }
} finally {
  await connection.end().catch(() => {});
}
