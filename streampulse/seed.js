/**
 * Seed the database with existing 2025 + 2026 data.
 * Run: node seed.js
 * Or:  node seed.js /path/to/csv  (to import from a CSV file)
 */
import { readFileSync, existsSync } from "fs";
import {
  initDB,
  upsertWeeklyBatch,
  upsertSpecialEvent,
  getStats,
  setConfig,
} from "./db.js";
import { parseCSV } from "./csv-parser.js";

async function main() {
  const pool = await initDB();

  const csvPath = process.argv[2];

  if (csvPath && existsSync(csvPath)) {
    console.log(`\nImporting CSV: ${csvPath}`);
    const csvText = readFileSync(csvPath, "utf-8");
    const parsed = parseCSV(csvText);

    const allRows = [];
    for (const [svc, entries] of Object.entries(parsed.services)) {
      for (const entry of entries) allRows.push({ ...entry, service: svc });
    }

    const result = await upsertWeeklyBatch(allRows);
    console.log(`  Weekly: ${result.added} added, ${result.updated} updated`);

    for (const ev of parsed.specialEvents) {
      await upsertSpecialEvent(ev);
      console.log(`  Event: ${ev.name} (${ev.data.length} entries)`);
    }

    // Save the dynamic config
    if (parsed.config && parsed.config.length > 0) {
      await setConfig("services", parsed.config);
      console.log(`  Config: ${parsed.config.length} services configured`);
    }
  } else {
    console.log("\nSeeding with built-in 2025 + 2026 data...");
    await seedBuiltinData();
  }

  const stats = await getStats();
  console.log(`\nDatabase now contains:`);
  console.log(`  Weekly data rows:  ${stats.weeklyRows}`);
  console.log(`  Special events:    ${stats.specialEvents}`);
  console.log(`  DB file: Postgres Database\n`);

  // Close the pg pool
  await pool.end();
}

/* ═══════════════════════════════════════════════════════════════════════ */

async function seedBuiltinData() {
  // 2026 data (generic placeholder data)
  const data2026 = {
    stream_a: [
      { date: "2026-01-02", platforms: { platform_x: 34, platform_y: 93, platform_z: 7 }, total: 134 },
      { date: "2026-01-09", platforms: { platform_x: 63, platform_y: 101, platform_z: 2 }, total: 166 },
      { date: "2026-01-16", platforms: { platform_x: 31, platform_y: 92, platform_z: 11 }, total: 134 },
      { date: "2026-01-23", platforms: { platform_x: 35, platform_y: 110, platform_z: 16 }, total: 161 },
      { date: "2026-01-30", platforms: { platform_x: 54, platform_y: 97, platform_z: 13 }, total: 164 },
      { date: "2026-02-06", platforms: { platform_x: 40, platform_y: 97, platform_z: 4 }, total: 141 },
    ],
    stream_b: [
      { date: "2026-01-04", platforms: { platform_x: 893, platform_y: 242, platform_w: 13 }, total: 1148 },
      { date: "2026-01-11", platforms: { platform_x: 580, platform_y: 251, platform_w: 6 }, total: 837 },
      { date: "2026-01-18", platforms: { platform_x: 532, platform_y: 206, platform_w: 13 }, total: 751 },
      { date: "2026-01-25", platforms: { platform_x: 1151, platform_y: 301, platform_w: 29 }, total: 1481 },
      { date: "2026-02-01", platforms: { platform_x: 670, platform_y: 168, platform_w: 15 }, total: 853 },
      { date: "2026-02-08", platforms: { platform_x: 481, platform_y: 123, platform_w: 3 }, total: 607 },
    ],
  };

  const specialEvents2026 = [
    {
      name: "Generic Conference 2026", dates: "Jan 18 – Jan 24, 2026",
      data: [
        { date: "01-25", platforms: { platform_x: 925, platform_y: 268 }, total: 1193 },
        { date: "01-26", platforms: { platform_x: 313, platform_y: 153 }, total: 466 },
        { date: "01-27", platforms: { platform_x: 305, platform_y: 129 }, total: 434 },
      ],
    },
  ];

  // Insert 2026 data
  const rows2026 = [];
  for (const [svc, entries] of Object.entries(data2026)) {
    for (const e of entries) {
      rows2026.push({
        service: svc,
        date: e.date,
        month: e.date.slice(0, 7),
        platforms: e.platforms || {},
        total: e.total || 0,
      });
    }
  }

  const result = await upsertWeeklyBatch(rows2026);
  console.log(`  2026 weekly: ${result.added} added`);

  for (const ev of specialEvents2026) {
    await upsertSpecialEvent(ev);
    console.log(`  2026 event: ${ev.name}`);
  }

  // Create generic config
  const config = [
    {
      id: "stream_a", name: "Stream A", short: "Stream A",
      color: "#F59E0B", gradient: ["#F59E0B", "#F59E0B"],
      platforms: [
        { id: "platform_x", name: "Platform X", color: "#888888", icon: "▶" },
        { id: "platform_y", name: "Platform Y", color: "#888888", icon: "▶" },
        { id: "platform_z", name: "Platform Z", color: "#888888", icon: "▶" },
      ]
    },
    {
      id: "stream_b", name: "Stream B", short: "Stream B",
      color: "#6366F1", gradient: ["#6366F1", "#6366F1"],
      platforms: [
        { id: "platform_x", name: "Platform X", color: "#888888", icon: "▶" },
        { id: "platform_y", name: "Platform Y", color: "#888888", icon: "▶" },
        { id: "platform_w", name: "Platform W", color: "#888888", icon: "▶" },
      ]
    }
  ];
  await setConfig("services", config);
  console.log(`  2026 config generated`);
}

main().catch(console.error);
