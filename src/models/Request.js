import { sql } from "../lib/db.js";

// Таблица requests в Neon:
// id                 SERIAL PRIMARY KEY
// client_id          BIGINT
// category           TEXT
// text               TEXT
// channel_message_id BIGINT
// expires_at         TIMESTAMPTZ
// status             TEXT
// message_id         TEXT
// telegram_id        BIGINT
// close_request_id   BIGINT
// mark_message_id    BIGINT
// mark               TEXT
// specialist_id      BIGINT

export async function createRequest(data) {
  const {
    clientId,
    category,
    text,
    channelMessageId = null,
    expiresAt,
    status = "active",
    messageId,
    telegramId,
    closeRequestId = null,
    mark = null,
    markMessageId = null,
    specialistId = null,
  } = data;

  const rows = await sql`
    INSERT INTO requests (
      client_id,
      category,
      text,
      channel_message_id,
      expires_at,
      status,
      message_id,
      telegram_id,
      close_request_id,
      mark,
      mark_message_id,
      specialist_id
    )
    VALUES (
      ${clientId},
      ${category},
      ${text},
      ${channelMessageId},
      ${expiresAt},
      ${status},
      ${messageId},
      ${telegramId},
      ${closeRequestId},
      ${mark},
      ${markMessageId},
      ${specialistId}
    )
    RETURNING *
  `;

  return rows[0];
}

export async function closeActiveRequest(telegramId) {
  const rows = await sql`
    UPDATE requests
    SET status = 'closed'
    WHERE id = (
      SELECT id FROM requests
      WHERE client_id = ${telegramId}
        AND status = 'active'
      ORDER BY id DESC
      LIMIT 1
    )
    RETURNING *
  `;
  return rows[0] || null;
}

export async function completeActiveRequest(telegramId, markMessageId) {
  const rows = await sql`
    UPDATE requests
    SET status = 'done',
        mark_message_id = ${markMessageId}
    WHERE id = (
      SELECT id FROM requests
      WHERE client_id = ${telegramId}
        AND status = 'active'
      ORDER BY id DESC
      LIMIT 1
    )
    RETURNING *
  `;
  return rows[0] || null;
}

export async function findRequestByMessageAndNotExpired(messageId) {
  const now = new Date();
  const rows = await sql`
    SELECT *
    FROM requests
    WHERE message_id = ${messageId}
      AND status = 'active'
      AND expires_at > ${now}
    ORDER BY id DESC
    LIMIT 1
  `;
  return rows[0] || null;
}

export async function setRequestMarkByMarkMessageId(markMessageId, mark) {
  const rows = await sql`
    UPDATE requests
    SET mark = ${mark}
    WHERE mark_message_id = ${markMessageId}
    RETURNING *
  `;
  return rows[0] || null;
}
