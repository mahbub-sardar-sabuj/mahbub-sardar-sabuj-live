import { readFile } from "node:fs/promises";
import process from "node:process";
import mysql from "mysql2/promise";

const migrationId = "20260816_literary_community_extensions";
const isDeploymentBuild = process.env.VERCEL === "1" || process.env.RUN_COMMUNITY_MIGRATIONS === "1";
const databaseUrl = process.env.DATABASE_URL;

if (!isDeploymentBuild || !databaseUrl) {
  console.log("[community-migration] skipped (no deployment database context)");
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

  const [appliedRows] = await connection.execute(
    "SELECT id FROM app_schema_migrations WHERE id = ? LIMIT 1",
    [migrationId],
  );
  if (Array.isArray(appliedRows) && appliedRows.length > 0) {
    console.log(`[community-migration] ${migrationId} already applied`);
    process.exit(0);
  }

  const source = await readFile(new URL("../drizzle/0005_literary_community_extensions.sql", import.meta.url), "utf8");
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

  await connection.execute("INSERT INTO app_schema_migrations (id) VALUES (?)", [migrationId]);
  console.log(`[community-migration] ${migrationId} applied successfully`);
} finally {
  await connection.end().catch(() => {});
}
