import { neon } from "@neondatabase/serverless";
import { fetch as undiciFetch, Headers, Request, Response } from "undici";

// Один общий клиент Neon для всех вызовов (кэшируем в global)
const connectionString =
  process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "NEON_DATABASE_URL (или DATABASE_URL) не задана в переменных окружения"
  );
}

// На некоторых рантаймах fetch может отсутствовать/быть сломан — подстрахуемся
if (!globalThis.fetch) globalThis.fetch = undiciFetch;
if (!globalThis.Headers) globalThis.Headers = Headers;
if (!globalThis.Request) globalThis.Request = Request;
if (!globalThis.Response) globalThis.Response = Response;

let sql = global.neonSql;

if (!sql) {
  sql = neon(connectionString);
  global.neonSql = sql;
}

export { sql };
