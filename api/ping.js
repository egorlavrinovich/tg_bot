import { sql } from "../src/lib/db.js";

export default async function handler(req, res) {
  const start = Date.now();
  try {
    await sql`SELECT 1`;
    const ms = Date.now() - start;
    return res.status(200).json({ ok: true, dbMs: ms });
  } catch (error) {
    console.error("ping error:", error);
    return res.status(500).json({ ok: false });
  }
}
