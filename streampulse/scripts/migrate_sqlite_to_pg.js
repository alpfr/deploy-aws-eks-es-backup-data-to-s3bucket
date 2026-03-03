/**
 * Migration Script: SQLite -> PostgreSQL
 * This script connects to the legacy local SQLite database and pushes all records into the new PostgreSQL database.
 */
import Database from "better-sqlite3";
import pkg from "pg";
const { Pool } = pkg;
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), "..", ".env") });

const __dirname = dirname(fileURLToPath(import.meta.url));
const SQLITE_PATH = join(__dirname, "..", "data", "streampulse.db");

if (!existsSync(SQLITE_PATH)) {
    console.error(`❌ SQLite database not found at ${SQLITE_PATH}`);
    process.exit(1);
}

const sqlite = new Database(SQLITE_PATH, { readonly: true });
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgres://streamuser:streampass@localhost:15432/streamdb",
});

import { initDB } from "../db.js";

async function run() {
    console.log("🚀 Starting Migration: SQLite -> PostgreSQL");

    // Ensure tables exist before migrating
    await initDB();

    const client = await pool.connect();
    let migratedCount = 0;

    try {
        await client.query("BEGIN");

        // 1. Migrate config
        console.log("Migrating `config` table...");
        const configRows = sqlite.prepare("SELECT * FROM config").all();
        for (const r of configRows) {
            await client.query("INSERT INTO config (key, value) VALUES ($1, $2) ON CONFLICT(key) DO UPDATE SET value=$2", [r.key, r.value]);
        }
        console.log(`  ✅ ${configRows.length} config rows migrated.`);

        // 2. Migrate weekly_data
        console.log("Migrating `weekly_data` table...");
        const weeklyRows = sqlite.prepare("SELECT * FROM weekly_data").all();
        for (const r of weeklyRows) {
            const platformsJson = typeof r.platforms === 'string' ? r.platforms : JSON.stringify(r.platforms || "{}");
            await client.query(`
        INSERT INTO weekly_data (service, date, month, platforms, total) 
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT(service, date) DO NOTHING
      `, [r.service, r.date, r.month || r.date.slice(0, 7), platformsJson, r.total || 0]);
            migratedCount++;
        }
        console.log(`  ✅ ${weeklyRows.length} weekly_data rows migrated.`);

        // 3. Migrate special_events and special_event_data
        console.log("Migrating `special_events` and data...");
        const events = sqlite.prepare("SELECT * FROM special_events").all();
        const eventDataStmt = sqlite.prepare("SELECT * FROM special_event_data WHERE event_id=?");

        for (const ev of events) {
            const res = await client.query(
                "INSERT INTO special_events (name, dates_label) VALUES ($1, $2) ON CONFLICT(name, dates_label) DO UPDATE SET name=$1 RETURNING id",
                [ev.name, ev.dates_label]
            );
            const newEventId = res.rows[0].id;

            const eventData = eventDataStmt.all(ev.id);
            for (const d of eventData) {
                const platformsJson = typeof d.platforms === 'string' ? d.platforms : JSON.stringify(d.platforms || "{}");
                await client.query(`
          INSERT INTO special_event_data (event_id, date, platforms, total)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT(event_id, date) DO NOTHING
        `, [newEventId, d.date, platformsJson, d.total || 0]);
                migratedCount++;
            }
        }
        console.log(`  ✅ ${events.length} special events migrated.`);

        // 4. Migrate upload_history
        console.log("Migrating `upload_history` table...");
        const uploads = sqlite.prepare("SELECT * FROM upload_history").all();
        for (const up of uploads) {
            await client.query(`
        INSERT INTO upload_history (filename, uploaded_at, mode, rows_added, rows_updated, rows_total)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [up.filename, up.uploaded_at, up.mode, up.rows_added, up.rows_updated, up.rows_total]);
            migratedCount++;
        }
        console.log(`  ✅ ${uploads.length} upload records migrated.`);

        // 5. Migrate ai_insights
        console.log("Migrating `ai_insights` table...");
        // Check if ai_insights exists in sqlite first
        try {
            const insights = sqlite.prepare("SELECT * FROM ai_insights").all();
            for (const ins of insights) {
                await client.query(`
          INSERT INTO ai_insights (generated_at, trigger_type, summary, highlights, alerts, raw_prompt_tokens, raw_completion_tokens)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [ins.generated_at, ins.trigger_type, ins.summary, ins.highlights, ins.alerts, ins.raw_prompt_tokens, ins.raw_completion_tokens]);
                migratedCount++;
            }
            console.log(`  ✅ ${insights.length} ai_insights records migrated.`);
        } catch (err) {
            console.log(`  ⚠️ No ai_insights table found in sqlite or error reading it: ${err.message}`);
        }

        await client.query("COMMIT");
        console.log(`🎉 Migration completely successfully! (${migratedCount} total rows moved)`);
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("❌ Migration failed! Rolling back changes.", err);
    } finally {
        client.release();
        sqlite.close();
        await pool.end();
    }
}

run();
