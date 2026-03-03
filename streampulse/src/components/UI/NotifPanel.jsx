import { X, CheckCircle, AlertCircle, Bell } from "lucide-react";

export function NotifPanel({ items, onClose, onRead }) {
    return (
        <div style={{ position: "absolute", top: 46, right: 0, width: 360, background: "#161628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, zIndex: 100, boxShadow: "0 20px 60px rgba(0,0,0,0.6)", maxHeight: 420, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: "#fff" }}>Notifications</span>
                <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer" }}><X size={15} /></button>
            </div>
            <div style={{ overflowY: "auto", flex: 1 }}>
                {items.length === 0 && <div style={{ padding: 28, textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 12 }}>No notifications</div>}
                {items.map((n, i) => (
                    <div key={i} onClick={() => onRead(i)} style={{ padding: "11px 16px", borderBottom: "1px solid rgba(255,255,255,0.03)", cursor: "pointer", background: n.read ? "transparent" : "rgba(99,102,241,0.04)" }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                            {n.type === "success" ? <CheckCircle size={14} color="#34D399" style={{ marginTop: 2, flexShrink: 0 }} /> :
                                n.type === "warning" ? <AlertCircle size={14} color="#FBBF24" style={{ marginTop: 2, flexShrink: 0 }} /> :
                                    <Bell size={14} color="#818CF8" style={{ marginTop: 2, flexShrink: 0 }} />}
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 12, color: "#fff", lineHeight: 1.45 }}>{n.message}</div>
                                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 3 }}>{n.service} · {n.time}</div>
                            </div>
                            {!n.read && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#818CF8", marginTop: 5, flexShrink: 0 }} />}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
