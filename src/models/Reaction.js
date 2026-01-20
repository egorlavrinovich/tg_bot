import { sql } from "../lib/db.js";

// Таблица reactions:
// id             SERIAL PRIMARY KEY
// request_id     INT REFERENCES requests(id)
// specialist_id  TEXT
// reacted_at     TIMESTAMPTZ

export async function findReaction(requestId, specialistId) {
  const rows = await sql`
    SELECT *
    FROM reactions
    WHERE request_id = ${requestId}
      AND specialist_id = ${specialistId}
    LIMIT 1
  `;
  return rows[0] || null;
}

export async function createReaction(requestId, specialistId) {
  const now = new Date();
  const rows = await sql`
    INSERT INTO reactions (request_id, specialist_id, reacted_at)
    VALUES (${requestId}, ${specialistId}, ${now})
    RETURNING *
  `;
  return rows[0];
}
