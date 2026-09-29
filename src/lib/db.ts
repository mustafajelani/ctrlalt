import { neon } from "@neondatabase/serverless";
import { Pool, type PoolClient } from "pg";

type Row = Record<string, any>;
type Sql = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Row[]>;
type Db = { sql: Sql; pool: Pool };

function createDb(url: string): Db {
  // One small pg pool serves interactive transactions everywhere (Neon or local Postgres).
  const pool = new Pool({ connectionString: url, max: 5 });
  // For single queries, Neon's HTTP driver is fastest on serverless; other hosts use the pool.
  if (new URL(url).hostname.endsWith(".neon.tech")) {
    const query = neon(url);
    return { pool, sql: (strings, ...values) => query(strings, ...values) as Promise<Row[]> };
  }
  return {
    pool,
    sql: async (strings, ...values) => {
      const text = strings.reduce((acc, part, i) => acc + part + (i < values.length ? `$${i + 1}` : ""), "");
      return (await pool.query(text, values)).rows;
    },
  };
}

// Reuse one pool across dev hot reloads instead of leaking a new one per edit.
const cache = globalThis as unknown as { __cadDb?: Db };
const db = process.env.DATABASE_URL ? (cache.__cadDb ??= createDb(process.env.DATABASE_URL)) : null;

export const sql = db?.sql ?? null;

/** Runs `fn` inside BEGIN/COMMIT on one connection, rolling back if it throws. */
export async function transaction<T>(fn: (tx: PoolClient) => Promise<T>): Promise<T> {
  if (!db) throw new Error("Database is not configured");
  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

export const DB_OFFLINE_MESSAGE = "Online requests aren't connected yet. Please call us at (215) 279-7222.";
