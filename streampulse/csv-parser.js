/**
 * JHB StreamPulse CSV Parser
 * Parses the complex multi-service side-by-side CSV format
 * where 4 services share columns in each row.
 */

/* ── Helpers ────────────────────────────────────────────────────────── */

function parseVal(v) {
  if (!v || v.trim() === "" || v.trim() === "N/A") return 0;
  const n = parseInt(v.trim().replace(/,/g, ""), 10);
  return isNaN(n) ? 0 : n;
}

function parseDate(d) {
  if (!d) return null;
  d = d.trim();
  // Try M/D/YYYY
  const m = d.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!m) return null;
  let [, month, day, year] = m;
  if (year.length === 2) year = "20" + year;
  if (parseInt(year) < 2020 || parseInt(year) > 2030) return null;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

/* ── Slug Generator ─────────────────────────────────────────────────── */
function makeSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

/* ── Platform branding ─────────────────────────────────────────────── */
const PLATFORM_STYLE = {
  youtube:            { color: "#FF0000", icon: "▶" },
  facebook:           { color: "#1877F2", icon: "f" },
  instagram:          { color: "#E4405F", icon: "◎" },
  x_formerly_twitter: { color: "#9CA3AF", icon: "𝕏" },
  tiktok:             { color: "#00F2EA", icon: "♪" },
  telegram:           { color: "#26A5E4", icon: "✈" },
  boxcast:            { color: "#FF6B35", icon: "▣" },
  pt_s_youtube:       { color: "#FF6666", icon: "▶" },
  emerge:             { color: "#8B5CF6", icon: "⚡" },
  zoom:               { color: "#2D8CFF", icon: "◉" },
};

const SERVICE_PALETTE = [
  { color: "#F59E0B", gradient: ["#F59E0B", "#D97706"] },
  { color: "#6366F1", gradient: ["#6366F1", "#4F46E5"] },
  { color: "#EC4899", gradient: ["#EC4899", "#DB2777"] },
  { color: "#10B981", gradient: ["#10B981", "#059669"] },
  { color: "#3B82F6", gradient: ["#3B82F6", "#2563EB"] },
  { color: "#F43F5E", gradient: ["#F43F5E", "#E11D48"] },
  { color: "#8B5CF6", gradient: ["#8B5CF6", "#7C3AED"] },
  { color: "#14B8A6", gradient: ["#14B8A6", "#0D9488"] },
];

/* ── Month/year regex for stripping from labels ─────────────────────── */
const MONTH_YEAR_RE = /\s*(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\s*$/i;
const VERBOSE_SUFFIX_RE = /\s*(Services?\/?Programs?|Online\s+Viewers?\s+Data)/gi;

// Generate configuration from found platforms
function buildConfig(services) {
  const config = [];
  let sIdx = 0;

  for (const [svcId, entries] of Object.entries(services)) {
    if (entries.length === 0) continue;

    // Find all unique platforms in this service
    const platSet = new Set();
    for (const entry of entries) {
      for (const p of Object.keys(entry.platforms)) platSet.add(p);
    }

    const platforms = Array.from(platSet).map(pId => {
      let name = pId.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      if (pId === 'pt_s_youtube') name = "PT's YouTube";
      else if (pId === 'x_formerly_twitter') name = "X (Twitter)";
      const style = PLATFORM_STYLE[pId] || { color: "#888888", icon: "▶" };
      return { id: pId, name, color: style.color, icon: style.icon };
    });

    const name = entries.length > 0 && entries[0].serviceName ? entries[0].serviceName : svcId.toUpperCase();
    const short = name.length > 20 ? name.slice(0, 20) + "..." : name;
    const sStyle = SERVICE_PALETTE[sIdx % SERVICE_PALETTE.length];
    config.push({
      id: svcId,
      name: name,
      short: short,
      color: sStyle.color,
      gradient: sStyle.gradient,
      platforms
    });
    sIdx++;
  }
  return config;
}

// Default fallback ranges if dynamic detection fails
const DEFAULT_SVC_RANGES = {
  service_1: { id: "service_1", name: "Service 1", colStart: 0, dStart: 1, dEnd: 7 },
};

/* ── Main parse function ────────────────────────────────────────────── */

export function parseCSV(csvText) {
  // Split into rows, handle both \r\n and \n
  const rawRows = csvText.split(/\r?\n/);

  let maxCols = 27; // Baseline fallback
  const parsedRows = rawRows.map((line) => {
    const fields = [];
    let field = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        fields.push(field);
        field = "";
      } else {
        field += ch;
      }
    }
    fields.push(field);
    maxCols = Math.max(maxCols, fields.length);
    return fields;
  });

  const rows = parsedRows.map((r) => {
    while (r.length < maxCols) r.push("");
    return r;
  });

  /* ── Phase 1: Scan top rows for descriptive headers ──────────────── */
  const topHeaders = {};
  for (let i = 0; i < Math.min(3, rows.length); i++) {
    for (let c = 0; c < maxCols; c++) {
      const val = (rows[i][c] || "").trim();
      if (!val || val.length <= 2) continue;
      if (/^\d+$/.test(val)) continue; // skip pure numbers like "16"
      if (val.toLowerCase() === "date") continue;
      if (val.toLowerCase().includes("special programs") || val.toLowerCase().includes("special events")) continue;
      if (!topHeaders[c]) topHeaders[c] = val;
    }
  }

  /* ── Phase 2: Find the first monthly header row (has 3+ dates) ───── */
  let monthlyHeaderRow = -1;
  for (let i = 0; i < Math.min(30, rows.length); i++) {
    let dateCount = 0;
    for (let c = 0; c < maxCols; c++) {
      if (parseDate(rows[i][c])) dateCount++;
    }
    if (dateCount >= 3) {
      monthlyHeaderRow = i;
      break;
    }
  }

  /* ── Phase 3: Identify service columns from the monthly header ───── */
  const svcCols = [];

  if (monthlyHeaderRow >= 0) {
    const mrow = rows[monthlyHeaderRow];
    for (let c = 0; c < maxCols; c++) {
      const val = (mrow[c] || "").trim();
      if (!val || parseDate(val)) continue;

      // Check if following cells contain dates
      let hasFollowingDates = false;
      for (let nc = c + 1; nc < Math.min(c + 8, maxCols); nc++) {
        if (parseDate(mrow[nc])) { hasFollowingDates = true; break; }
      }
      if (!hasFollowingDates) continue;

      // Extract clean service name by stripping "Month YYYY" suffix
      let cleanName = val.replace(MONTH_YEAR_RE, "").trim();

      // If empty after stripping (e.g. "January 2025"), fall back to top header
      if (!cleanName && topHeaders[c]) {
        cleanName = topHeaders[c].replace(VERBOSE_SUFFIX_RE, "").trim();
      }
      if (!cleanName) cleanName = `Service ${svcCols.length + 1}`;

      const id = makeSlug(cleanName);
      svcCols.push({ id, name: cleanName, col: c });
    }
  }

  // Fallback: if monthly detection found nothing, use top headers
  if (svcCols.length === 0) {
    for (const [col, name] of Object.entries(topHeaders)) {
      const cleanName = name.replace(VERBOSE_SUFFIX_RE, "").trim() || name;
      svcCols.push({ id: makeSlug(cleanName), name: cleanName, col: parseInt(col, 10) });
    }
  }

  svcCols.sort((a, b) => a.col - b.col);

  let SVC_RANGES = DEFAULT_SVC_RANGES;
  if (svcCols.length > 0) {
    SVC_RANGES = {};
    for (let idx = 0; idx < svcCols.length; idx++) {
      const svc = svcCols[idx];
      const nextCol = idx < svcCols.length - 1 ? svcCols[idx + 1].col : maxCols;
      SVC_RANGES[svc.id] = { id: svc.id, name: svc.name, colStart: svc.col, dStart: svc.col + 1, dEnd: nextCol };
    }
  }

  const labelCols = Object.values(SVC_RANGES).map(r => r.colStart);

  // Find where "Special Programs" section starts
  let specialStart = rows.length;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0].toLowerCase().includes("special programs") || rows[i][0].toLowerCase().includes("special events")) {
      specialStart = i;
      break;
    }
  }

  const services = {};
  for (const svcId of Object.keys(SVC_RANGES)) {
    services[svcId] = [];
  }

  /* ── Parse regular monthly blocks ─────────────────────────────────── */
  let i = 0;
  while (i < specialStart) {
    const row = rows[i];

    // Find dates for each service in this row
    const allDates = {};
    for (const [svc, info] of Object.entries(SVC_RANGES)) {
      const dates = [];
      for (let c = info.dStart; c < info.dEnd; c++) {
        const d = parseDate(row[c]);
        if (d) dates.push([c, d]);
      }
      if (dates.length > 0) allDates[svc] = dates;
    }

    if (Object.keys(allDates).length === 0) { i++; continue; }

    // Read platform rows below
    let j = i + 1;
    const platformRows = [];
    while (j < specialStart && j < i + 30) {
      const prow = rows[j];
      const allEmpty = labelCols.every(
        (c) => !prow[c] || prow[c].trim() === ""
      );
      const isExplicitTotal = labelCols.some(c => (prow[c] || "").toLowerCase().includes("total"));
      const isImplicitTotal = allEmpty && prow.some((val, c) => !labelCols.includes(c) && parseVal(val) > 0);

      if (isExplicitTotal || isImplicitTotal || (allEmpty && j > i + 1)) break;
      platformRows.push(prow);
      j++;
    }

    // Extract data per service
    for (const [svc, dateCols] of Object.entries(allDates)) {
      const info = SVC_RANGES[svc];
      const lcol = info.colStart;
      const svcName = info.name;

      for (const [col, date] of dateCols) {
        const entry = {
          service: svc,
          serviceName: svcName,
          date,
          month: date.slice(0, 7),
          platforms: {},
          total: 0,
        };

        let total = 0;
        for (const prow of platformRows) {
          const pname = prow[lcol].trim();
          if (pname) {
            const pk = makeSlug(pname);
            const val = parseVal(prow[col]);
            entry.platforms[pk] = val;
            total += val;
          }
        }
        entry.total = total;
        if (total > 0) services[svc].push(entry);
      }
    }

    i = j + 1;
  }

  /* ── Parse special events ─────────────────────────────────────────── */
  const specialEvents = [];

  // Helper: parse platform data from rows below a header
  function parsePlatformBlock(startRow, numDateCols) {
    const pdata = {};
    for (let k = startRow; k < Math.min(startRow + 30, rows.length); k++) {
      const pname = rows[k][0].trim();
      if (pname && !pname.toLowerCase().includes("total")) {
        const pk = makeSlug(pname);
        pdata[pk] = [];
        for (let c = 1; c <= numDateCols; c++) {
          pdata[pk].push(parseVal(rows[k][c]));
        }
      }
    }
    return pdata;
  }

  // Helper: build event entries from platform data and date labels
  function buildEventEntries(dateLabels, pdata) {
    return dateLabels.map((dl, wi) => {
      const entry = { date: dl, platforms: {}, total: 0 };
      let t = 0;
      for (const [pk, vals] of Object.entries(pdata)) {
        const v = vals[wi] || 0;
        entry.platforms[pk] = v;
        t += v;
      }
      entry.total = t;
      return entry;
    });
  }

  // Helper: push event only if it has non-zero data
  function pushIfData(name, dates, entries) {
    const total = entries.reduce((s, e) => s + e.total, 0);
    if (total > 0) {
      specialEvents.push({ name, dates, data: entries });
    }
  }

  /* ── Generic Special Event Parsing ───────────────────────────────── */
  let k = specialStart + 1;
  while (k < rows.length) {
    const row = rows[k];
    const firstCell = row[0]?.trim();
    if (!firstCell || firstCell.toLowerCase().includes("total") || firstCell.toLowerCase().includes("special")) {
      k++; continue;
    }

    // Check if it's an event header (has dates horizontally)
    const dates = [];
    for (let c = 1; c < maxCols; c++) {
      if (row[c]?.trim()) dates.push(row[c].trim());
    }

    // If it has dates, it's likely an event header
    if (dates.length > 0) {
      const pdata = parsePlatformBlock(k + 1, dates.length);
      const edata = buildEventEntries(dates, pdata);
      if (edata.length > 0 && edata.some(e => e.total > 0)) {
        pushIfData(firstCell, dates[0] + (dates.length > 1 ? " – " + dates[dates.length - 1] : ""), edata);
      }
      k += Object.keys(pdata).length + 1;
    } else {
      k++;
    }
  }

  /* ── Summary ──────────────────────────────────────────────────────── */
  const summary = {};
  for (const [svc, entries] of Object.entries(services)) {
    summary[svc] = {
      weeks: entries.length,
      dateRange: entries.length ? [entries[0].date, entries[entries.length - 1].date] : [],
      totalViewers: entries.reduce((s, e) => s + e.total, 0),
    };
  }

  // Build dynamic config from parsed data
  const config = buildConfig(services);

  return {
    services,
    specialEvents,
    summary,
    config,
    totalRows: Object.values(services).reduce((s, a) => s + a.length, 0),
  };
}
