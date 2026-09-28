import { neon } from "@neondatabase/serverless";
import { Pool } from "pg";

type Row = Record<string, any>;
type Sql = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Row[]>;

function createSql(url: string): Sql {
  // Neon's HTTP driver is fastest on serverless but only speaks to Neon; use plain pg for any other Postgres.
  if (new URL(url).hostname.endsWith(".neon.tech")) {
    const query = neon(url);
    return (strings, ...values) => query(strings, ...values) as Promise<Row[]>;
  }
  const pool = new Pool({ connectionString: url, max: 5 });
  return async (strings, ...values) => {
    const text = strings.reduce((acc, part, i) => acc + part + (i < values.length ? `$${i + 1}` : ""), "");
    return (await pool.query(text, values)).rows;
  };
}

// Reuse one pool across dev hot reloads instead of leaking a new one per edit.
const cache = globalThis as unknown as { __cadSql?: Sql };
export const sql = process.env.DATABASE_URL ? (cache.__cadSql ??= createSql(process.env.DATABASE_URL)) : null;

export const DB_OFFLINE_MESSAGE = "Online requests aren't connected yet. Please call us at (215) 279-7222.";
