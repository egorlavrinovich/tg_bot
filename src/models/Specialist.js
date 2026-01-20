import { sql } from "../lib/db.js";

// Таблица specialists:
// id             SERIAL PRIMARY KEY
// telegram_id    BIGINT UNIQUE NOT NULL
// username       TEXT
// categories     TEXT[]
// rating         NUMERIC
// reviews_count  INT

// Таблица specialist_orders:
// id             SERIAL PRIMARY KEY
// specialist_id  BIGINT (telegram id)
// request_id     INT REFERENCES requests(id)
// reacted_at     TIMESTAMPTZ
// request_text   TEXT
// mark           TEXT

export async function upsertSpecialistWithOrder(
  telegramId,
  username,
  requestId,
  requestText
) {
  const now = new Date();

  await sql`
    INSERT INTO specialists (telegram_id, username, rating, reviews_count)
    VALUES (${telegramId}, ${username}, 0, 0)
    ON CONFLICT (telegram_id) DO UPDATE SET
      username = EXCLUDED.username
  `;

  await sql`
    INSERT INTO specialist_orders (
      specialist_id,
      request_id,
      reacted_at,
      request_text
    )
    VALUES (
      ${telegramId},
      ${requestId},
      ${now},
      ${requestText}
    )
    ON CONFLICT DO NOTHING
  `;

  const rows = await sql`
    SELECT s.*, COUNT(o.id) as orders_count
    FROM specialists s
    LEFT JOIN specialist_orders o
      ON o.specialist_id = s.telegram_id
    WHERE s.telegram_id = ${telegramId}
    GROUP BY s.id
    LIMIT 1
  `;

  return rows[0] || null;
}

export async function findSpecialistByTelegramId(telegramId) {
  const rows = await sql`
    SELECT *
    FROM specialists
    WHERE telegram_id = ${telegramId}
    LIMIT 1
  `;
  return rows[0] || null;
}

export async function updateSpecialistCategories(telegramId, categories) {
  const rows = await sql`
    UPDATE specialists
    SET categories = ${categories}
    WHERE telegram_id = ${telegramId}
    RETURNING *
  `;
  return rows[0];
}

export async function setSpecialistOrderMarkByRequestId(requestId, mark) {
  const rows = await sql`
    UPDATE specialist_orders
    SET mark = ${mark}
    WHERE request_id = ${requestId}
    RETURNING *
  `;
  return rows[0] || null;
}

export async function recalcSpecialistRatingByRequestId(requestId) {
  const orderRows = await sql`
    SELECT specialist_id
    FROM specialist_orders
    WHERE request_id = ${requestId}
    LIMIT 1
  `;
  const order = orderRows[0];
  if (!order) return null;

  const specialistId = order.specialist_id;

  const ratingRows = await sql`
    SELECT
      AVG(CASE
            WHEN mark IS NULL THEN 5::numeric
            ELSE mark::numeric
          END) as avg_mark,
      COUNT(*) as reviews_count
    FROM specialist_orders
    WHERE specialist_id = ${specialistId}
      AND mark IS NOT NULL
  `;

  const avg = ratingRows[0]?.avg_mark || 0;
  const reviewsCount = ratingRows[0]?.reviews_count || 0;

  const rows = await sql`
    UPDATE specialists
    SET rating = ${avg},
        reviews_count = ${reviewsCount}
    WHERE telegram_id = ${specialistId}
    RETURNING *
  `;

  return rows[0] || null;
}
