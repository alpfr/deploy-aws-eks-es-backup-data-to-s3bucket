import { useState } from "react";
import { X } from "lucide-react";

export function EntryModal({ onClose, onSubmit, service }) {
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [vals, setVals] = useState({});
    const save = () => {
        const e = { date, month: date.slice(0, 7) };
        service.platforms.forEach(p => { e[p.id] = parseInt(vals[p.id]) || 0; });
        e.total = service.platforms.reduce((s, p) => s + (e[p.id] || 0), 0);
        onSubmit(e); onClose();
    };
    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }} onClick={onClose}>
            <div onClick={e => e.stopPropagation()} style={{ background: "#161628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 26, width: 420, maxHeight: "80vh", overflowY: "auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#fff" }}>Add Weekly Data</h3>
                        <div style={{ fontSize: 11, color: service.color, fontWeight: 600, marginTop: 3 }}>{service.name}</div>
                    </div>
                    <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer" }}><X size={18} /></button>
                </div>
                <label style={{ display: "block", fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Week Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", marginBottom: 14 }} />
                {service.platforms.map(p => (
                    <div key={p.id} style={{ marginBottom: 10 }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.55)", marginBottom: 4, fontWeight: 500 }}>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} /> {p.name}
                        </label>
                        <input type="number" placeholder="0" value={vals[p.id] || ""} onChange={e => setVals(v => ({ ...v, [p.id]: e.target.value }))}
                            style={{ width: "100%", padding: "8px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                    </div>
                ))}
                <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                    <button onClick={onClose} style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Cancel</button>
                    <button onClick={save} style={{ flex: 1, padding: 10, borderRadius: 8, border: "none", background: `linear-gradient(135deg, ${service.gradient[0]}, ${service.gradient[1]})`, color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Save</button>
                </div>
            </div>
        </div>
    );
}
