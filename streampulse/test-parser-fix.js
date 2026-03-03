import { readFileSync } from "fs";
import { parseCSV } from "./csv-parser.js";

const csvPath = "/Users/alpfr/Downloads/JHB Service 2020 Online Viewers Count-1 - 2026 Online Viewers Stats (4).csv";
const csvText = readFileSync(csvPath, "utf-8");
const result = parseCSV(csvText);

console.log("=== SERVICES DETECTED ===");
for (const [id, entries] of Object.entries(result.services)) {
  console.log(`  ${id}: ${entries.length} entries, total: ${entries.reduce((s, e) => s + e.total, 0)}`);
  if (entries.length > 0) {
    console.log(`    First: ${entries[0].date} (${entries[0].total})`);
    console.log(`    Last:  ${entries[entries.length - 1].date} (${entries[entries.length - 1].total})`);
    console.log(`    Platforms: ${Object.keys(entries[0].platforms).join(", ")}`);
  }
}

console.log("\n=== CONFIG ===");
for (const svc of result.config) {
  console.log(`  ${svc.id} (${svc.name}) — color: ${svc.color}`);
  for (const p of svc.platforms) {
    console.log(`    ${p.id}: ${p.name} — color: ${p.color}, icon: ${p.icon}`);
  }
}

console.log("\n=== SPECIAL EVENTS ===");
for (const ev of result.specialEvents) {
  const total = ev.data.reduce((s, d) => s + d.total, 0);
  console.log(`  ${ev.name}: ${ev.data.length} entries, total: ${total}`);
}

console.log(`\n=== SUMMARY ===`);
console.log(`  Total rows: ${result.totalRows}`);
console.log(`  Services: ${Object.keys(result.services).length}`);
console.log(`  Special events: ${result.specialEvents.length}`);
