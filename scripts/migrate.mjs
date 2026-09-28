import { readdir, readFile } from "node:fs/promises";
import pg from "pg";

try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local (e.g. on Vercel): rely on real environment variables.
}

// Plain TCP works for Neon and any other Postgres (local, Docker, RDS...).
// Prefer Neon's direct URL when available; the pooled one runs through PgBouncer.
const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) {
  console.warn("[migrate] DATABASE_URL is not set, skipping database migrations.");
  process.exit(0);
}

const dir = new URL("../db/migrations/", import.meta.url);
const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
const client = new pg.Client({ connectionString: url });

async function migrate() {
  await client.query(
    "CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())",
  );

  let applied = 0;
  for (const file of files) {
    await client.query("BEGIN");
    try {
      // Serializes concurrent deploys; the re-check below runs after the lock is held.
      await client.query("SELECT pg_advisory_xact_lock(727274)");
      const { rowCount } = await client.query("SELECT 1 FROM schema_migrations WHERE name = $1", [file]);
      if (rowCount) {
        await client.query("COMMIT");
        continue;
      }
      await client.query(await readFile(new URL(file, dir), "utf8"));
      await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
      await client.query("COMMIT");
      applied++;
      console.log(`[migrate] applied ${file}`);
    } catch (err) {
      await client.query("ROLLBACK");
      throw new Error(`${file} failed: ${err.message}`);
    }
  }
  console.log(applied ? `[migrate] ${applied} migration(s) applied.` : "[migrate] database is up to date.");
}

try {
  await client.connect();
  await migrate();
} catch (err) {
  console.error(`[migrate] ${err.message || err.code || err}`);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
