import { neon } from "@neondatabase/serverless";

// Один общий клиент Neon для всех вызовов (кэшируем в global)
const connectionString =
  process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "NEON_DATABASE_URL (или DATABASE_URL) не задана в переменных окружения"
  );
}

let sql = global.neonSql;

if (!sql) {
  sql = neon(connectionString);
  global.neonSql = sql;
}

export { sql };
