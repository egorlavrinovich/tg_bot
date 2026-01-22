import { sql } from "../lib/db.js";
import { logError } from "../lib/logger.js";

// Таблица users в Neon:
// id                SERIAL PRIMARY KEY
// telegram_id       BIGINT UNIQUE NOT NULL
// role              TEXT
// state             TEXT
// selected_category TEXT
// categories        TEXT[]
// pending_invites   JSONB
// last_invite_sent_at TIMESTAMPTZ

export async function findUserByTelegramId(telegramId) {
  try {
    const rows = await sql`
      SELECT *
      FROM users
      WHERE telegram_id = ${telegramId}
      LIMIT 1
    `;
    return rows[0] || null;
  } catch (error) {
    logError("findUserByTelegramId error", error);
    throw error;
  }
}

export async function updateUserStateAndCategory(telegramId, state, selectedCategory) {
  try {
    const rows = await sql`
      INSERT INTO users (telegram_id, state, selected_category)
      VALUES (${telegramId}, ${state}, ${selectedCategory})
      ON CONFLICT (telegram_id) DO UPDATE SET
        state = EXCLUDED.state,
        selected_category = EXCLUDED.selected_category
      RETURNING *
    `;
    return rows[0];
  } catch (error) {
    logError("updateUserStateAndCategory error", error);
    throw error;
  }
}

export async function upsertUserRoleAndState(telegramId, role, state, categories = []) {
  try {
    const rows = await sql`
      INSERT INTO users (telegram_id, role, state, categories)
      VALUES (${telegramId}, ${role}, ${state}, ${categories})
      ON CONFLICT (telegram_id) DO UPDATE SET
        role = EXCLUDED.role,
        state = EXCLUDED.state,
        categories = EXCLUDED.categories
      RETURNING *
    `;
    return rows[0];
  } catch (error) {
    logError("upsertUserRoleAndState error", error);
    throw error;
  }
}

export async function updateUserCategories(telegramId, categories) {
  try {
    const rows = await sql`
      UPDATE users
      SET categories = ${categories}
      WHERE telegram_id = ${telegramId}
      RETURNING *
    `;
    return rows[0];
  } catch (error) {
    logError("updateUserCategories error", error);
    throw error;
  }
}

export async function updateUserPendingInvites(
  telegramId,
  pendingInvites,
  lastInviteSentAt,
  state
) {
  try {
    const pendingInvitesJson = JSON.stringify(pendingInvites || []);
    const rows = await sql`
      INSERT INTO users (telegram_id, pending_invites, last_invite_sent_at, state)
      VALUES (${telegramId}, ${pendingInvitesJson}::jsonb, ${lastInviteSentAt}, ${state})
      ON CONFLICT (telegram_id) DO UPDATE SET
        pending_invites = EXCLUDED.pending_invites,
        last_invite_sent_at = EXCLUDED.last_invite_sent_at,
        state = EXCLUDED.state
      RETURNING *
    `;
    return rows[0];
  } catch (error) {
    logError("updateUserPendingInvites error", error);
    throw error;
  }
}

export async function setUserState(telegramId, state) {
  try {
    const rows = await sql`
      INSERT INTO users (telegram_id, state)
      VALUES (${telegramId}, ${state})
      ON CONFLICT (telegram_id) DO UPDATE SET
        state = EXCLUDED.state
      RETURNING *
    `;
    return rows[0];
  } catch (error) {
    logError("setUserState error", error);
    throw error;
  }
}
