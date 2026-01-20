import { sql } from "../lib/db.js";

const CACHE_TTL_MS = 5_000;
const cache = global.userCache || new Map();
global.userCache = cache;

function getCachedUser(telegramId) {
  const entry = cache.get(telegramId);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(telegramId);
    return null;
  }
  return entry.value;
}

function setCachedUser(telegramId, user) {
  if (!user) return;
  cache.set(telegramId, {
    value: user,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

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
    const cached = getCachedUser(telegramId);
    if (cached) return cached;
    const rows = await sql`
      SELECT *
      FROM users
      WHERE telegram_id = ${telegramId}
      LIMIT 1
    `;
    const user = rows[0] || null;
    setCachedUser(telegramId, user);
    return user;
  } catch (error) {
    console.error("findUserByTelegramId error:", error);
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
    const user = rows[0];
    setCachedUser(telegramId, user);
    return user;
  } catch (error) {
    console.error("updateUserStateAndCategory error:", error);
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
    const user = rows[0];
    setCachedUser(telegramId, user);
    return user;
  } catch (error) {
    console.error("upsertUserRoleAndState error:", error);
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
    const user = rows[0];
    setCachedUser(telegramId, user);
    return user;
  } catch (error) {
    console.error("updateUserCategories error:", error);
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
    const rows = await sql`
      INSERT INTO users (telegram_id, pending_invites, last_invite_sent_at, state)
      VALUES (${telegramId}, ${pendingInvites}, ${lastInviteSentAt}, ${state})
      ON CONFLICT (telegram_id) DO UPDATE SET
        pending_invites = EXCLUDED.pending_invites,
        last_invite_sent_at = EXCLUDED.last_invite_sent_at,
        state = EXCLUDED.state
      RETURNING *
    `;
    const user = rows[0];
    setCachedUser(telegramId, user);
    return user;
  } catch (error) {
    console.error("updateUserPendingInvites error:", error);
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
    const user = rows[0];
    setCachedUser(telegramId, user);
    return user;
  } catch (error) {
    console.error("setUserState error:", error);
    throw error;
  }
}
