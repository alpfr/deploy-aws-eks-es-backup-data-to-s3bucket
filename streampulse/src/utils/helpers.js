export const fmt = (n) => {
    if (n === null || n === undefined) return "–";
    return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toString();
};

export const pct = (cur, prev) => (!prev || prev === 0 ? 0 : ((cur - prev) / prev) * 100);

export const fmtDateNice = (iso) => {
    if (!iso) return "–";
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export const getWeekNumber = (iso) => {
    const d = new Date(iso + "T00:00:00");
    const start = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d - start) / 86400000 + start.getDay() + 1) / 7);
};
