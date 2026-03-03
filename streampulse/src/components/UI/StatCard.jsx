import { TrendingUp, TrendingDown } from "lucide-react";

export function StatCard({ label, value, change, color, sub }) {
    const pos = change >= 0;
    return (
        <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "18px 20px", position: "relative", overflow: "hidden", transition: "all 0.2s", cursor: "default" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = color || "rgba(255,255,255,0.12)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}>
            <div style={{ position: "absolute", top: 0, right: 0, width: 60, height: 60, background: `radial-gradient(circle at top right, ${color}12, transparent)` }} />
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.1, color: "rgba(255,255,255,0.4)", marginBottom: 7 }}>{label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: "#fff", letterSpacing: -0.5, marginBottom: 5, fontFamily: "'Space Mono', monospace" }}>{value}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                {change !== null && change !== undefined && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 7px", borderRadius: 16, fontSize: 10, fontWeight: 600, background: pos ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)", color: pos ? "#34D399" : "#F87171" }}>
                        {pos ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {Math.abs(change).toFixed(1)}%
                    </span>
                )}
                {sub && <span style={{ color: "rgba(255,255,255,0.28)", fontSize: 10 }}>{sub}</span>}
            </div>
        </div>
    );
}
