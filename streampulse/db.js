import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://streamuser:streampass@localhost:15432/streamdb",
});

export async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS config (
        key VARCHAR(255) PRIMARY KEY,
        value TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS weekly_data (
        id SERIAL PRIMARY KEY,
        service VARCHAR(255) NOT NULL,
        date VARCHAR(255) NOT NULL,
        month VARCHAR(255) NOT NULL,
        platforms JSONB DEFAULT '{}'::jsonb,
        total INTEGER DEFAULT 0,
        UNIQUE(service, date)
      );
      CREATE TABLE IF NOT EXISTS special_events (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        dates_label VARCHAR(255) NOT NULL,
        UNIQUE(name, dates_label)
      );
      CREATE TABLE IF NOT EXISTS special_event_data (
        id SERIAL PRIMARY KEY,
        event_id INTEGER NOT NULL REFERENCES special_events(id) ON DELETE CASCADE,
        date VARCHAR(255) NOT NULL,
        platforms JSONB DEFAULT '{}'::jsonb,
        total INTEGER DEFAULT 0,
        UNIQUE(event_id, date)
      );
      CREATE TABLE IF NOT EXISTS upload_history (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        mode VARCHAR(50) NOT NULL,
        rows_added INTEGER DEFAULT 0,
        rows_updated INTEGER DEFAULT 0,
        rows_total INTEGER DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS ai_insights (
        id SERIAL PRIMARY KEY,
        generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        trigger_type VARCHAR(50) NOT NULL DEFAULT 'upload',
        summary TEXT NOT NULL,
        highlights JSONB DEFAULT '[]'::jsonb,
        alerts JSONB DEFAULT '[]'::jsonb,
        raw_prompt_tokens INTEGER DEFAULT 0,
        raw_completion_tokens INTEGER DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS idx_weekly_service ON weekly_data(service);
      CREATE INDEX IF NOT EXISTS idx_weekly_date ON weekly_data(date);
    `);
  } finally {
    client.release();
  }
  return pool;
}

export async function getConfig(key) {
  const res = await pool.query("SELECT value FROM config WHERE key=$1", [key]);
  return res.rows.length ? JSON.parse(res.rows[0].value) : null;
}

export async function setConfig(key, value) {
  const valStr = JSON.stringify(value);
  await pool.query(
    "INSERT INTO config (key, value) VALUES ($1, $2) ON CONFLICT(key) DO UPDATE SET value=$2",
    [key, valStr]
  );
}

const COLS = "service, date, month, platforms, total";
function rowVals(r) {
  return [r.service, r.date, r.month || r.date.slice(0, 7), JSON.stringify(r.platforms || {}), r.total || 0];
}

export async function upsertWeeklyBatch(rows) {
  let added = 0, updated = 0;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const row of rows) {
      const existing = await client.query("SELECT id FROM weekly_data WHERE service=$1 AND date=$2", [row.service, row.date]);

      await client.query(`
        INSERT INTO weekly_data (${COLS}) VALUES ($1,$2,$3,$4,$5)
        ON CONFLICT(service,date) DO UPDATE SET month=$3, platforms=$4, total=$5
      `, rowVals(row));

      if (existing.rows.length) updated++; else added++;
    }

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }

  return { added, updated };
}

export async function replaceAllWeekly(rows) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("DELETE FROM weekly_data");

    for (const row of rows) {
      await client.query(`INSERT INTO weekly_data (${COLS}) VALUES ($1,$2,$3,$4,$5)`, rowVals(row));
    }

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }

  return { added: rows.length, updated: 0 };
}

export async function getWeeklyData() {
  const res = await pool.query("SELECT * FROM weekly_data ORDER BY service, date ASC");
  const grouped = {};
  for (const r of res.rows) {
    const platformsStr = typeof r.platforms === 'string' ? r.platforms : JSON.stringify(r.platforms || {});
    r.platforms = JSON.parse(platformsStr || "{}");
    if (!grouped[r.service]) grouped[r.service] = [];
    grouped[r.service].push(r);
  }
  return grouped;
}

export async function getWeeklyByService(svc) {
  const res = await pool.query("SELECT * FROM weekly_data WHERE service=$1 ORDER BY date ASC", [svc]);
  return res.rows.map(r => {
    const platformsStr = typeof r.platforms === 'string' ? r.platforms : JSON.stringify(r.platforms || {});
    return { ...r, platforms: JSON.parse(platformsStr || "{}") };
  });
}

export async function upsertSpecialEvent(ev) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`INSERT INTO special_events (name,dates_label) VALUES ($1,$2) ON CONFLICT(name,dates_label) DO UPDATE SET name=$1`, [ev.name, ev.dates]);
    const row = await client.query("SELECT id FROM special_events WHERE name=$1 AND dates_label=$2", [ev.name, ev.dates]);
    const eid = row.rows[0].id;

    for (const d of ev.data) {
      const pJson = JSON.stringify(d.platforms || {});
      await client.query(`
        INSERT INTO special_event_data (event_id,date,platforms,total)
        VALUES ($1,$2,$3,$4) ON CONFLICT(event_id,date) DO UPDATE SET
        platforms=$3,total=$4
      `, [eid, d.date, pJson, d.total || 0]);
    }

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function replaceAllEvents(events) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("DELETE FROM special_event_data");
    await client.query("DELETE FROM special_events");

    for (const ev of events) {
      await client.query(`INSERT INTO special_events (name,dates_label) VALUES ($1,$2) ON CONFLICT(name,dates_label) DO UPDATE SET name=$1`, [ev.name, ev.dates]);
      const row = await client.query("SELECT id FROM special_events WHERE name=$1 AND dates_label=$2", [ev.name, ev.dates]);
      const eid = row.rows[0].id;

      for (const d of ev.data) {
        const pJson = JSON.stringify(d.platforms || {});
        await client.query(`
          INSERT INTO special_event_data (event_id,date,platforms,total)
          VALUES ($1,$2,$3,$4) ON CONFLICT(event_id,date) DO UPDATE SET
          platforms=$3,total=$4
        `, [eid, d.date, pJson, d.total || 0]);
      }
    }

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function getSpecialEvents() {
  const events = await pool.query("SELECT * FROM special_events ORDER BY id ASC");
  const result = [];
  for (const ev of events.rows) {
    const dataRes = await pool.query("SELECT * FROM special_event_data WHERE event_id=$1 ORDER BY date ASC", [ev.id]);
    result.push({
      id: ev.id, name: ev.name, dates: ev.dates_label,
      data: dataRes.rows.map(d => {
        const platformsStr = typeof d.platforms === 'string' ? d.platforms : JSON.stringify(d.platforms || {});
        return { ...d, platforms: JSON.parse(platformsStr || "{}") };
      }),
    });
  }
  return result;
}

export async function logUpload(info) {
  await pool.query(
    "INSERT INTO upload_history (filename,mode,rows_added,rows_updated,rows_total) VALUES ($1,$2,$3,$4,$5)",
    [info.filename, info.mode, info.rows_added, info.rows_updated, info.rows_total]
  );
}

export async function getUploadHistory() {
  const res = await pool.query("SELECT * FROM upload_history ORDER BY uploaded_at DESC LIMIT 20");
  return res.rows;
}

export async function getStats() {
  const weeklyRes = await pool.query("SELECT COUNT(*) as c FROM weekly_data");
  const eventsRes = await pool.query("SELECT COUNT(*) as c FROM special_events");
  return {
    weeklyRows: parseInt(weeklyRes.rows[0].c, 10) || 0,
    specialEvents: parseInt(eventsRes.rows[0].c, 10) || 0,
  };
}

export async function deleteServiceData(svc) {
  await pool.query("DELETE FROM weekly_data WHERE service=$1", [svc]);
}

/* ── AI Insights ───────────────────────────────────────────────────── */
export async function saveInsight({ trigger_type, summary, highlights, alerts, prompt_tokens, completion_tokens }) {
  await pool.query(
    `INSERT INTO ai_insights (trigger_type, summary, highlights, alerts, raw_prompt_tokens, raw_completion_tokens)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [trigger_type || "upload", summary, highlights || "[]", alerts || "[]", prompt_tokens || 0, completion_tokens || 0]
  );
}

export async function getLatestInsight() {
  const res = await pool.query("SELECT * FROM ai_insights ORDER BY generated_at DESC LIMIT 1");
  return res.rows[0] || null;
}

export async function getInsightHistory(limit = 10) {
  const res = await pool.query("SELECT id, generated_at, trigger_type, summary FROM ai_insights ORDER BY generated_at DESC LIMIT $1", [limit]);
  return res.rows;
}
