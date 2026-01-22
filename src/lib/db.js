import { neon, neonConfig } from "@neondatabase/serverless";

// Один общий клиент Neon для всех вызовов (кэшируем в global)
const connectionString =
  process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "NEON_DATABASE_URL (или DATABASE_URL) не задана в переменных окружения"
  );
}

if (!globalThis.fetch) {
  throw new Error(
    "Global fetch is missing. Set Node.js >= 18 in Vercel runtime."
  );
}

// Улучшаем производительность и стабильность HTTP-запросов Neon
neonConfig.fetch = globalThis.fetch;
neonConfig.fetchConnectionCache = true;

let sql = global.neonSql;

if (!sql) {
  sql = neon(connectionString);
  global.neonSql = sql;
}

export { sql };
