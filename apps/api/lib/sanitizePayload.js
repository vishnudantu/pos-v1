import pool from '../db.js';

const TABLE_COLUMNS = {};
const DROPPED_LOG = new Set();

async function loadTableColumns(table) {
  if (TABLE_COLUMNS[table]) return TABLE_COLUMNS[table];
  const [rows] = await pool.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = ?
  `, [table]);

  if (!rows.length) {
    throw new Error(`sanitizePayload: table "${table}" has no columns or does not exist`);
  }

  const cols = new Set(rows.map(r => r.column_name));
  TABLE_COLUMNS[table] = cols;
  return cols;
}

export function invalidateTableColumns(table) {
  if (table) {
    delete TABLE_COLUMNS[table];
  } else {
    Object.keys(TABLE_COLUMNS).forEach(k => delete TABLE_COLUMNS[k]);
  }
}

/**
 * Whitelist payload fields against real DB columns.
 * - Strips `id`.
 * - Strips unknown columns (logs them once per table).
 * - Converts ISO date strings to MySQL DATETIME format.
 * - Serialises arrays/objects to JSON for TEXT/JSON columns.
 */
export async function sanitizePayload(table, payload, { strict = false, stripId = true } = {}) {
  const allowedCols = await loadTableColumns(table);
  const clean = {};
  const dropped = [];

  for (const [k, v] of Object.entries(payload || {})) {
    if (stripId && k === 'id') continue;
    if (!allowedCols.has(k)) {
      dropped.push(k);
      continue;
    }
    if (v === undefined) continue;

    if (v === null) {
      clean[k] = null;
    } else if (v instanceof Date) {
      clean[k] = v.toISOString().slice(0, 19).replace('T', ' ');
    } else if (Array.isArray(v) || typeof v === 'object') {
      clean[k] = JSON.stringify(v);
    } else if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v)) {
      clean[k] = v.slice(0, 19).replace('T', ' ');
    } else {
      clean[k] = v;
    }
  }

  if (dropped.length) {
    const logKey = `${table}:${dropped.sort().join(',')}`;
    if (!DROPPED_LOG.has(logKey)) {
      DROPPED_LOG.add(logKey);
      console.warn(`[sanitizePayload] table="${table}" dropped unknown fields: ${dropped.join(', ')}`);
    }
    if (strict) {
      throw new Error(`Invalid fields for table "${table}": ${dropped.join(', ')}`);
    }
  }

  return clean;
}
