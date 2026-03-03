import { useState, useEffect, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import {
  Search, Bell, TrendingUp, TrendingDown, Upload, Plus, X, Eye, Calendar,
  AlertCircle, CheckCircle, Filter, BarChart3, Layers, Lock, Unlock, LogOut, Shield,
  Download, FileText, RefreshCw, Database, UploadCloud, Check, Loader, HelpCircle, Info,
  ChevronRight, Monitor, Sparkles, Zap, Star, MessageSquare
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════
   SERVICE & PLATFORM DEFINITIONS — matches your Excel exactly
   ═══════════════════════════════════════════════════════════════════════ */

const SERVICES = [
  {
    id: "insights", name: "Insights with PT", short: "Insights",
    color: "#F59E0B", gradient: ["#F59E0B", "#D97706"],
    platforms: [
      { id: "youtube", name: "YouTube", color: "#FF0000", icon: "▶" },
      { id: "facebook", name: "Facebook", color: "#1877F2", icon: "f" },
      { id: "x", name: "X (Twitter)", color: "#1DA1F2", icon: "𝕏" },
      { id: "instagram", name: "Instagram", color: "#E4405F", icon: "◉" },
      { id: "pt_youtube", name: "PT's YouTube", color: "#FF4444", icon: "▶" },
    ]
  },
  {
    id: "jhb", name: "JHB Services/Programs", short: "JHB Main",
    color: "#6366F1", gradient: ["#6366F1", "#4F46E5"],
    platforms: [
      { id: "youtube", name: "YouTube", color: "#FF0000", icon: "▶" },
      { id: "facebook", name: "Facebook", color: "#1877F2", icon: "f" },
      { id: "x", name: "X (Twitter)", color: "#1DA1F2", icon: "𝕏" },
      { id: "instagram", name: "Instagram", color: "#E4405F", icon: "◉" },
      { id: "telegram", name: "Telegram", color: "#0088CC", icon: "✈" },
      { id: "emerge", name: "Emerge", color: "#10B981", icon: "◆" },
      { id: "boxcast", name: "BoxCast", color: "#8B5CF6", icon: "■" },
    ]
  },
  {
    id: "charlotte", name: "JHB Charlotte", short: "Charlotte",
    color: "#EC4899", gradient: ["#EC4899", "#DB2777"],
    platforms: [
      { id: "youtube", name: "YouTube", color: "#FF0000", icon: "▶" },
      { id: "facebook", name: "Facebook", color: "#1877F2", icon: "f" },
      { id: "x", name: "X (Twitter)", color: "#1DA1F2", icon: "𝕏" },
      { id: "instagram", name: "Instagram", color: "#E4405F", icon: "◉" },
      { id: "telegram", name: "Telegram", color: "#0088CC", icon: "✈" },
    ]
  },
  {
    id: "biblestudy", name: "Bible Study – Word Power", short: "Bible Study",
    color: "#14B8A6", gradient: ["#14B8A6", "#0D9488"],
    platforms: [
      { id: "youtube", name: "YouTube", color: "#FF0000", icon: "▶" },
      { id: "facebook", name: "Facebook", color: "#1877F2", icon: "f" },
      { id: "x", name: "X (Twitter)", color: "#1DA1F2", icon: "𝕏" },
      { id: "instagram", name: "Instagram", color: "#E4405F", icon: "◉" },
      { id: "telegram", name: "Telegram", color: "#0088CC", icon: "✈" },
      { id: "zoom", name: "Zoom", color: "#2D8CFF", icon: "Z" },
      { id: "boxcast", name: "BoxCast", color: "#8B5CF6", icon: "■" },
    ]
  },
];

/* ═══════════════════════════════════════════════════════════════════════
   API CONFIGURATION
   ═══════════════════════════════════════════════════════════════════════ */

const API_BASE = "/api";

/* Data loaded from API — no hardcoded data needed */



/* ═══════════════════════════════════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════════════════════════════════ */

const fmt = (n) => {
  if (n === null || n === undefined) return "–";
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toString();
};
const pct = (cur, prev) => (!prev || prev === 0 ? 0 : ((cur - prev) / prev) * 100);
const fmtDateNice = (iso) => {
  if (!iso) return "–";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};
const getWeekNumber = (iso) => {
  const d = new Date(iso + "T00:00:00");
  const start = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - start) / 86400000 + start.getDay() + 1) / 7);
};

/* ═══════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════════════ */

function StatCard({ label, value, change, color, sub }) {
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

function NotifPanel({ items, onClose, onRead }) {
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

function EntryModal({ onClose, onSubmit, service }) {
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

/* ═══════════════════════════════════════════════════════════════════════
   ADMIN CONFIGURATION
   ═══════════════════════════════════════════════════════════════════════ */

function AdminLoginModal({ onClose, onSuccess, color, gradient }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (data.success) {
        onSuccess(pin, data.timeout);
        onClose();
      } else {
        setError("Invalid PIN. Please try again.");
        setShake(true); setPin("");
        setTimeout(() => setShake(false), 500);
      }
    } catch {
      setError("Server error. Is the backend running?");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && pin.length > 0) handleSubmit();
    if (e.key === "Escape") onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        style={{
          background: "#161628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: 32, width: 360,
          animation: shake ? "shakeX 0.4s ease-in-out" : "fadeIn 0.2s ease-out"
        }}>
        <style>{`
          @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
          @keyframes shakeX { 0%,100% { transform: translateX(0); } 20%,60% { transform: translateX(-8px); } 40%,80% { transform: translateX(8px); } }
        `}</style>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Shield size={24} color="#fff" />
          </div>
        </div>
        <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: "#fff", textAlign: "center" }}>Admin Access</h3>
        <p style={{ margin: "0 0 20px", fontSize: 12, color: "rgba(255,255,255,0.35)", textAlign: "center" }}>Enter your PIN to add or modify records</p>

        <input
          type="password" inputMode="numeric" maxLength={6} autoFocus value={pin}
          onChange={e => { setPin(e.target.value.replace(/\D/g, "")); setError(""); }}
          onKeyDown={handleKeyDown}
          placeholder="• • • •"
          style={{
            width: "100%", padding: "14px 16px", background: "rgba(255,255,255,0.05)", border: `1.5px solid ${error ? "#F87171" : "rgba(255,255,255,0.1)"}`,
            borderRadius: 10, color: "#fff", fontSize: 22, outline: "none", boxSizing: "border-box", textAlign: "center",
            fontFamily: "'Space Mono', monospace", letterSpacing: 8, transition: "border-color 0.2s"
          }}
          onFocus={e => { if (!error) e.target.style.borderColor = `${color}60`; }}
          onBlur={e => { if (!error) e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
        />
        {error && <div style={{ fontSize: 11, color: "#F87171", textAlign: "center", marginTop: 8, fontWeight: 500 }}>{error}</div>}

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 11, borderRadius: 9, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Cancel</button>
          <button onClick={handleSubmit} disabled={pin.length < 4}
            style={{ flex: 1, padding: 11, borderRadius: 9, border: "none", background: pin.length >= 4 ? `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})` : "rgba(255,255,255,0.06)", color: pin.length >= 4 ? "#fff" : "rgba(255,255,255,0.2)", cursor: pin.length >= 4 ? "pointer" : "not-allowed", fontSize: 12, fontWeight: 600, transition: "all 0.2s" }}>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}><Unlock size={13} /> Unlock</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   CSV UPLOAD MODAL
   ═══════════════════════════════════════════════════════════════════════ */

function UploadModal({ onClose, adminPin, onUploadComplete, color, gradient }) {
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState("merge");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith(".csv") || f.type === "text/csv")) setFile(f);
    else setError("Please upload a .csv file");
  };

  const handleFileSelect = (e) => {
    const f = e.target.files[0];
    if (f) { setFile(f); setError(null); setResult(null); }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true); setError(null); setResult(null);
    try {
      const fd = new FormData();
      fd.append("csv", file);
      fd.append("mode", mode);
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        headers: { "X-Admin-Pin": adminPin },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setResult(data);
      onUploadComplete();
    } catch (err) {
      setError(err.message);
    }
    setUploading(false);
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background:"#161628", border:"1px solid rgba(255,255,255,0.1)", borderRadius:18, padding:28, width:440, maxHeight:"85vh", overflowY:"auto", animation:"fadeIn 0.2s ease-out" }}>
        <style>{`@keyframes fadeIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}`}</style>

        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:40, height:40, borderRadius:12, background:`linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <UploadCloud size={20} color="#fff" />
            </div>
            <div>
              <h3 style={{ margin:0, fontSize:16, fontWeight:700, color:"#fff" }}>Upload CSV</h3>
              <p style={{ margin:0, fontSize:11, color:"rgba(255,255,255,0.35)" }}>Import viewer data from spreadsheet</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.3)", cursor:"pointer", padding:4 }}><X size={18} /></button>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragOver ? color : "rgba(255,255,255,0.1)"}`,
            borderRadius: 14, padding: "28px 20px", textAlign: "center",
            background: dragOver ? `${color}08` : "rgba(255,255,255,0.015)",
            transition: "all 0.2s", cursor: "pointer", marginBottom: 16,
          }}
          onClick={() => document.getElementById("csv-file-input").click()}
        >
          <input id="csv-file-input" type="file" accept=".csv" onChange={handleFileSelect} style={{ display:"none" }} />
          {file ? (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
              <FileText size={20} color={color} />
              <div>
                <div style={{ color:"#fff", fontSize:13, fontWeight:600 }}>{file.name}</div>
                <div style={{ color:"rgba(255,255,255,0.35)", fontSize:10 }}>{(file.size / 1024).toFixed(1)} KB</div>
              </div>
              <button onClick={e => { e.stopPropagation(); setFile(null); setResult(null); }}
                style={{ background:"rgba(248,113,113,0.1)", border:"none", borderRadius:6, padding:4, cursor:"pointer", color:"#F87171" }}>
                <X size={14} />
              </button>
            </div>
          ) : (
            <>
              <Upload size={28} color="rgba(255,255,255,0.15)" style={{ marginBottom:8 }} />
              <div style={{ color:"rgba(255,255,255,0.4)", fontSize:12, fontWeight:500 }}>Drop CSV file here or click to browse</div>
              <div style={{ color:"rgba(255,255,255,0.2)", fontSize:10, marginTop:4 }}>Supports the JHB multi-service format</div>
            </>
          )}
        </div>

        {/* Mode selector */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:10, fontWeight:600, textTransform:"uppercase", letterSpacing:1, color:"rgba(255,255,255,0.35)", marginBottom:8 }}>Import Mode</div>
          <div style={{ display:"flex", gap:8 }}>
            {[
              { id:"merge", label:"Merge / Append", desc:"Add new weeks, update existing" },
              { id:"replace", label:"Replace All", desc:"Clear all data, import fresh" },
            ].map(m => (
              <button key={m.id} onClick={() => setMode(m.id)}
                style={{
                  flex:1, padding:"10px 12px", borderRadius:10, cursor:"pointer", textAlign:"left",
                  background: mode === m.id ? `${color}12` : "rgba(255,255,255,0.02)",
                  border: `1.5px solid ${mode === m.id ? `${color}40` : "rgba(255,255,255,0.06)"}`,
                  transition: "all 0.2s",
                }}>
                <div style={{ color: mode === m.id ? "#fff" : "rgba(255,255,255,0.5)", fontSize:12, fontWeight:600, marginBottom:2 }}>{m.label}</div>
                <div style={{ color:"rgba(255,255,255,0.25)", fontSize:10 }}>{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Result */}
        {result && (
          <div style={{ padding:14, borderRadius:10, background:"rgba(52,211,153,0.06)", border:"1px solid rgba(52,211,153,0.15)", marginBottom:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
              <Check size={14} color="#34D399" />
              <span style={{ color:"#34D399", fontSize:12, fontWeight:600 }}>Upload Successful</span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:18, fontWeight:700, color:"#fff", fontFamily:"'Space Mono',monospace" }}>{result.rows}</div>
                <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", textTransform:"uppercase" }}>Total Rows</div>
              </div>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:18, fontWeight:700, color:"#34D399", fontFamily:"'Space Mono',monospace" }}>{result.added}</div>
                <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", textTransform:"uppercase" }}>New</div>
              </div>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:18, fontWeight:700, color:"#F59E0B", fontFamily:"'Space Mono',monospace" }}>{result.updated}</div>
                <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", textTransform:"uppercase" }}>Updated</div>
              </div>
            </div>
            {result.stats && (
              <div style={{ marginTop:10, padding:"8px 10px", background:"rgba(255,255,255,0.03)", borderRadius:8 }}>
                {Object.entries(result.stats).map(([svc, s]) => (
                  <div key={svc} style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"rgba(255,255,255,0.4)", padding:"2px 0" }}>
                    <span>{svc}</span>
                    <span>{s.weeks} weeks • {s.totalViewers?.toLocaleString()} viewers</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ padding:12, borderRadius:10, background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.2)", marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
            <AlertCircle size={14} color="#F87171" />
            <span style={{ color:"#F87171", fontSize:11 }}>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onClose} style={{ flex:1, padding:11, borderRadius:9, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:"rgba(255,255,255,0.5)", cursor:"pointer", fontSize:12, fontWeight:600 }}>
            {result ? "Done" : "Cancel"}
          </button>
          {!result && (
            <button onClick={handleUpload} disabled={!file || uploading}
              style={{
                flex:1, padding:11, borderRadius:9, border:"none",
                background: file && !uploading ? `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})` : "rgba(255,255,255,0.06)",
                color: file && !uploading ? "#fff" : "rgba(255,255,255,0.2)",
                cursor: file && !uploading ? "pointer" : "not-allowed",
                fontSize:12, fontWeight:600, transition:"all 0.2s",
                display:"flex", alignItems:"center", justifyContent:"center", gap:5,
              }}>
              {uploading ? <><Loader2 size={13} style={{ animation:"spin 1s linear infinite" }} /> Uploading...</> : <><UploadCloud size={13} /> Upload &amp; Import</>}
              <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   AI INSIGHTS PANEL
   ═══════════════════════════════════════════════════════════════════════ */

const INSIGHT_ICONS = {
  trending_up: TrendingUp,
  trending_down: TrendingDown,
  star: Star,
  alert: AlertCircle,
  zap: Zap,
};

const SEVERITY_STYLES = {
  info:    { bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.2)", color: "#818CF8", icon: Info },
  warning: { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", color: "#F59E0B", icon: AlertCircle },
  success: { bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.2)", color: "#34D399", icon: CheckCircle },
};

const SERVICE_COLORS = { jhb: "#6366F1", insights: "#F59E0B", charlotte: "#EC4899", biblestudy: "#10B981", all: "#818CF8" };

function InsightsPanel({ insights, onClose, onGenerate, isAdmin, isLoading, error }) {
  const overlay = { position: "fixed", inset: 0, background: "rgba(5,5,15,0.85)", backdropFilter: "blur(8px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 };
  const modal = { background: "#12122a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, width: "100%", maxWidth: 680, maxHeight: "85vh", overflow: "auto", position: "relative" };

  const hasData = insights && insights.available;

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "sticky", top: 0, background: "#12122a", zIndex: 1, borderRadius: "20px 20px 0 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #8B5CF6, #6366F1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles size={18} color="#fff" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#fff" }}>AI Insights</h2>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>
                {hasData ? `Generated ${new Date(insights.generated_at + "Z").toLocaleString()}` : "Powered by Claude"}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {isAdmin && (
              <button onClick={onGenerate} disabled={isLoading}
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 9, border: "none", background: isLoading ? "rgba(139,92,246,0.15)" : "linear-gradient(135deg, #8B5CF6, #6366F1)", color: "#fff", cursor: isLoading ? "default" : "pointer", fontSize: 11, fontWeight: 600, opacity: isLoading ? 0.7 : 1 }}>
                {isLoading ? <><Loader size={12} style={{ animation: "spin 1s linear infinite" }} /> Analyzing...</> : <><RefreshCw size={12} /> Generate</>}
              </button>
            )}
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer", color: "rgba(255,255,255,0.4)" }}>
              <X size={16} />
            </button>
          </div>
        </div>

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

        <div style={{ padding: "16px 24px 24px" }}>
          {error && (
            <div style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", marginBottom: 16, display: "flex", alignItems: "flex-start", gap: 10 }}>
              <AlertCircle size={16} color="#F87171" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#F87171", marginBottom: 2 }}>Error</div>
                <div style={{ fontSize: 11, color: "rgba(248,113,113,0.7)", lineHeight: 1.5 }}>{error}</div>
              </div>
            </div>
          )}

          {!hasData && !isLoading && !error && (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <Sparkles size={40} color="rgba(139,92,246,0.3)" style={{ marginBottom: 16 }} />
              <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>No Insights Yet</h3>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", lineHeight: 1.6, maxWidth: 380, margin: "0 auto 20px" }}>
                {isAdmin
                  ? "Click \"Generate\" to analyze your streaming data with AI, or upload a CSV to auto-generate insights."
                  : "Log in as admin and upload a CSV or click Generate to create AI-powered insights."}
              </p>
              {!insights?.configured && (
                <div style={{ padding: "10px 16px", borderRadius: 10, background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <AlertCircle size={14} color="#F59E0B" />
                  <span style={{ fontSize: 11, color: "#F59E0B" }}>Set ANTHROPIC_API_KEY environment variable to enable AI insights</span>
                </div>
              )}
            </div>
          )}

          {isLoading && !hasData && (
            <div style={{ textAlign: "center", padding: "50px 20px" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #8B5CF6, #6366F1)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16, animation: "pulse 2s ease-in-out infinite" }}>
                <Sparkles size={22} color="#fff" />
              </div>
              <style>{`@keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.08); opacity: 0.8; } }`}</style>
              <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>Analyzing your data...</h3>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Claude is reviewing trends across all services and platforms</p>
            </div>
          )}

          {hasData && (
            <>
              {/* Executive Summary */}
              <div style={{ padding: "16px 18px", borderRadius: 14, background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(99,102,241,0.04))", border: "1px solid rgba(139,92,246,0.15)", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <MessageSquare size={13} color="#A78BFA" />
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#A78BFA", textTransform: "uppercase", letterSpacing: 0.8 }}>Executive Summary</span>
                </div>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: "rgba(255,255,255,0.75)" }}>
                  {insights.summary}
                </p>
              </div>

              {/* Highlights */}
              {insights.highlights && insights.highlights.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>Key Highlights</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {insights.highlights.map((h, i) => {
                      const IconComp = INSIGHT_ICONS[h.icon] || Zap;
                      const svcColor = SERVICE_COLORS[h.service] || "#818CF8";
                      return (
                        <div key={i} style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                            <IconComp size={14} color={svcColor} />
                            <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>{h.title}</span>
                          </div>
                          <div style={{ fontSize: 11, lineHeight: 1.6, color: "rgba(255,255,255,0.4)" }}>{h.detail}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Platform Insight */}
              {insights.platform_insight && (
                <div style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.1)", marginBottom: 16, display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <BarChart3 size={16} color="#6366F1" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#818CF8", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>Platform Analysis</div>
                    <div style={{ fontSize: 12, lineHeight: 1.6, color: "rgba(255,255,255,0.55)" }}>{insights.platform_insight}</div>
                  </div>
                </div>
              )}

              {/* Alerts */}
              {insights.alerts && insights.alerts.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>Alerts & Observations</div>
                  {insights.alerts.map((a, i) => {
                    const s = SEVERITY_STYLES[a.severity] || SEVERITY_STYLES.info;
                    const AlertIcon = s.icon;
                    return (
                      <div key={i} style={{ padding: "10px 14px", borderRadius: 10, background: s.bg, border: `1px solid ${s.border}`, marginBottom: 6, display: "flex", alignItems: "center", gap: 10 }}>
                        <AlertIcon size={14} color={s.color} style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: s.color, lineHeight: 1.5 }}>{a.message}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Recommendation */}
              {insights.recommendation && (
                <div style={{ padding: "14px 18px", borderRadius: 14, background: "linear-gradient(135deg, rgba(52,211,153,0.06), rgba(16,185,129,0.03))", border: "1px solid rgba(52,211,153,0.15)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <Sparkles size={13} color="#34D399" />
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#34D399", textTransform: "uppercase", letterSpacing: 0.8 }}>Recommendation</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, lineHeight: 1.7, color: "rgba(255,255,255,0.6)" }}>
                    {insights.recommendation}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Footer */}
          <div style={{ marginTop: 20, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.15)" }}>Powered by Claude · Anthropic</div>
            <button onClick={onClose} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #8B5CF6, #6366F1)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   ABOUT / HELP MODAL
   ═══════════════════════════════════════════════════════════════════════ */

function AboutModal({ onClose }) {
  const overlay = { position: "fixed", inset: 0, background: "rgba(5,5,15,0.85)", backdropFilter: "blur(8px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 };
  const modal = { background: "#12122a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, width: "100%", maxWidth: 640, maxHeight: "85vh", overflow: "auto", position: "relative" };
  const sectionTitle = { fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 };
  const text = { fontSize: 12, lineHeight: 1.7, color: "rgba(255,255,255,0.5)" };
  const featureCard = { background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: 14, marginBottom: 8 };
  const featureTitle = { fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.8)", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 };
  const featureText = { fontSize: 11, lineHeight: 1.6, color: "rgba(255,255,255,0.4)" };
  const kbd = { display: "inline-block", padding: "2px 7px", borderRadius: 5, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 10, fontFamily: "'Space Mono', monospace", color: "rgba(255,255,255,0.5)", marginLeft: 2, marginRight: 2 };
  const divider = { height: 1, background: "rgba(255,255,255,0.04)", margin: "18px 0" };
  const badge = (color, bg) => ({ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 6, background: bg, color: color, fontSize: 10, fontWeight: 600 });

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "sticky", top: 0, background: "#12122a", zIndex: 1, borderRadius: "20px 20px 0 0" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #6366F1, #4F46E5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff" }}>JH</div>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#fff" }}>JHB StreamPulse</h2>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>v2.0 — Online Streaming Viewers Dashboard</div>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer", color: "rgba(255,255,255,0.4)" }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: "16px 24px 24px" }}>

          {/* What is StreamPulse */}
          <div style={sectionTitle}><Monitor size={15} color="#6366F1" /> About StreamPulse</div>
          <p style={text}>
            StreamPulse tracks online streaming viewers for Jesus House Baltimore across multiple platforms
            and services. It provides weekly analytics, trend analysis, and special event tracking to help
            church leadership understand audience engagement and growth patterns.
          </p>

          <div style={divider} />

          {/* Services */}
          <div style={sectionTitle}><Layers size={15} color="#EC4899" /> Services Tracked</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 4 }}>
            <div style={featureCard}>
              <div style={featureTitle}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#F59E0B" }}></span> Insights with PT</div>
              <div style={featureText}>YouTube, Facebook, X, Instagram, PT's YouTube</div>
            </div>
            <div style={featureCard}>
              <div style={featureTitle}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#6366F1" }}></span> JHB Services/Programs</div>
              <div style={featureText}>YouTube, Facebook, X, Instagram, Telegram, Emerge, BoxCast</div>
            </div>
            <div style={featureCard}>
              <div style={featureTitle}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#EC4899" }}></span> JHB Charlotte</div>
              <div style={featureText}>YouTube, Facebook, X, Instagram, Telegram</div>
            </div>
            <div style={featureCard}>
              <div style={featureTitle}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981" }}></span> Bible Study – Word Power</div>
              <div style={featureText}>YouTube, Facebook, X, Instagram, Telegram, Zoom, BoxCast</div>
            </div>
          </div>

          <div style={divider} />

          {/* Dashboard Tabs */}
          <div style={sectionTitle}><BarChart3 size={15} color="#F59E0B" /> Dashboard Tabs</div>

          <div style={featureCard}>
            <div style={featureTitle}><Eye size={13} color="#6366F1" /> Overview</div>
            <div style={featureText}>Main view showing the weekly viewer chart, platform breakdown with percentages, and a donut chart of the current distribution. Toggle between Area, Line, and Bar chart styles using the controls above the chart.</div>
          </div>
          <div style={featureCard}>
            <div style={featureTitle}><TrendingUp size={13} color="#34D399" /> Trends</div>
            <div style={featureText}>Month-over-month growth analysis. Shows how total viewers and individual platform numbers are changing over time, with percentage growth indicators.</div>
          </div>
          <div style={featureCard}>
            <div style={featureTitle}><Calendar size={13} color="#F59E0B" /> Weekly Comparison</div>
            <div style={featureText}>Side-by-side stacked bar chart comparing each week's platform breakdown. Useful for spotting which platforms are growing or shrinking week-to-week.</div>
          </div>
          <div style={featureCard}>
            <div style={featureTitle}><Layers size={13} color="#EC4899" /> All Services</div>
            <div style={featureText}>Cross-service comparison on one chart — compare JHB, Charlotte, Insights, and Bible Study side by side. Special Events are also displayed at the bottom of this tab, showing viewer data for 14 Days of Glory, The Word Works, MYPC, PENIEL, GLC, Solution Night, Watch Night, and more.</div>
          </div>
          <div style={featureCard}>
            <div style={featureTitle}><FileText size={13} color="#818CF8" /> Data Table</div>
            <div style={featureText}>Full spreadsheet view of all weekly records with platform columns. Sorted by most recent first. Use the date filter to narrow the range.</div>
          </div>

          <div style={divider} />

          {/* Header Controls */}
          <div style={sectionTitle}><Filter size={15} color="#34D399" /> Controls & Filters</div>

          <div style={featureCard}>
            <div style={featureTitle}><Calendar size={13} color="#F59E0B" /> Date Filter</div>
            <div style={featureText}>Click the date button in the header to set a "From" and "To" date range. All charts and tables filter to only show data within that range. Click "Clear" to reset.</div>
          </div>
          <div style={featureCard}>
            <div style={featureTitle}><Search size={13} color="#818CF8" /> Search</div>
            <div style={featureText}>Type a platform name (e.g. "youtube" or "zoom") to filter the platform breakdown and highlight matching data. Works across all tabs.</div>
          </div>
          <div style={featureCard}>
            <div style={featureTitle}><Bell size={13} color="#F59E0B" /> Notifications</div>
            <div style={featureText}>The bell icon shows data insights like peak weeks, growth streaks, and notable changes. Red badge shows unread count. Click to read and dismiss.</div>
          </div>

          <div style={divider} />

          {/* Admin Features */}
          <div style={sectionTitle}><Shield size={15} color="#34D399" /> Admin Features</div>
          <p style={{ ...text, marginBottom: 12 }}>
            Click <span style={badge("rgba(255,255,255,0.5)", "rgba(255,255,255,0.05)")}>🔒 Add Data</span> and enter the admin PIN to unlock these features. Admin session lasts 30 minutes.
          </p>

          <div style={featureCard}>
            <div style={featureTitle}><Plus size={13} color="#6366F1" /> Add Data</div>
            <div style={featureText}>Manually add a single week's viewer data. Select the service, enter the date, and fill in viewer counts per platform.</div>
          </div>
          <div style={featureCard}>
            <div style={featureTitle}><UploadCloud size={13} color="#818CF8" /> Upload CSV</div>
            <div style={featureText}>
              Drag & drop or browse for a CSV file in the JHB format. Two modes available:
              <br />• <strong style={{ color: "rgba(255,255,255,0.6)" }}>Merge</strong> — adds new data and updates existing rows (safe, non-destructive)
              <br />• <strong style={{ color: "rgba(255,255,255,0.6)" }}>Replace</strong> — clears all existing data and replaces with the uploaded file
              <br />The parser automatically handles the multi-service side-by-side format and special events sections.
            </div>
          </div>
          <div style={featureCard}>
            <div style={featureTitle}><Download size={13} color="#34D399" /> Export CSV</div>
            <div style={featureText}>Download all data as a CSV file. Available to all users (no admin required). Includes all services, dates, and platform columns.</div>
          </div>

          <div style={divider} />

          {/* AI Insights */}
          <div style={sectionTitle}><Sparkles size={15} color="#8B5CF6" /> AI Insights (Powered by Claude)</div>
          <p style={text}>
            StreamPulse can analyze your streaming data with AI and generate natural-language summaries,
            trend highlights, platform analysis, alerts, and actionable recommendations.
          </p>

          <div style={featureCard}>
            <div style={featureTitle}><Sparkles size={13} color="#8B5CF6" /> How It Works</div>
            <div style={featureText}>
              <br />• <strong style={{ color: "rgba(255,255,255,0.6)" }}>Auto-generate after upload</strong> — Every CSV upload automatically triggers AI analysis in the background
              <br />• <strong style={{ color: "rgba(255,255,255,0.6)" }}>Manual generate</strong> — Admins can click "Generate" in the AI Insights panel anytime
              <br />• <strong style={{ color: "rgba(255,255,255,0.6)" }}>View insights</strong> — Click the ✨ AI Insights button in the header, or the purple banner on the Overview tab
            </div>
          </div>
          <div style={featureCard}>
            <div style={featureTitle}><Zap size={13} color="#F59E0B" /> Setup</div>
            <div style={featureText}>
              Get an API key from <strong style={{ color: "rgba(255,255,255,0.6)" }}>console.anthropic.com</strong> → API Keys → Create Key. Then start the server with: <span style={kbd}>ANTHROPIC_API_KEY=sk-ant-... node server.js</span>
            </div>
          </div>
          <div style={featureCard}>
            <div style={featureTitle}><Info size={13} color="#34D399" /> Cost</div>
            <div style={featureText}>
              Each AI Insights generation costs roughly <strong style={{ color: "#34D399" }}>$0.01–$0.02</strong> (uses Claude Sonnet, ~1,500 tokens per call). Very affordable — even generating daily would cost under $1/month.
            </div>
          </div>

          <div style={divider} />

          {/* Technical Info */}
          <div style={sectionTitle}><Database size={15} color="#818CF8" /> Technical Details</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div style={featureCard}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>Stack</div>
              <div style={featureText}>Node.js + Express backend, SQLite database, React frontend with Recharts</div>
            </div>
            <div style={featureCard}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>API</div>
              <div style={featureText}>REST API at /api/data, /api/stats, /api/export, /api/upload, /api/special-events</div>
            </div>
            <div style={featureCard}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>Running</div>
              <div style={featureText}>Server on port 8000 — start with <span style={kbd}>node server.js</span> or <span style={kbd}>start.command</span></div>
            </div>
            <div style={featureCard}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>Deployment</div>
              <div style={featureText}>Local, Docker, or Kubernetes (EKS/GKE). See README.md for full instructions.</div>
            </div>
          </div>

          <div style={divider} />

          {/* Quick Tips */}
          <div style={sectionTitle}><CheckCircle size={15} color="#6366F1" /> Quick Tips</div>
          <div style={{ ...text, lineHeight: 2 }}>
            <span style={{ color: "rgba(255,255,255,0.65)" }}>•</span> Switch between services using the colored tabs below the header<br/>
            <span style={{ color: "rgba(255,255,255,0.65)" }}>•</span> Hover over any chart element to see detailed tooltip data<br/>
            <span style={{ color: "rgba(255,255,255,0.65)" }}>•</span> Special Events are in the <span style={badge("#EC4899", "rgba(236,72,153,0.1)")}>All Services</span> tab — scroll down to see them<br/>
            <span style={{ color: "rgba(255,255,255,0.65)" }}>•</span> The stat cards show total viewers, latest week, weekly average, and peak week<br/>
            <span style={{ color: "rgba(255,255,255,0.65)" }}>•</span> Upload new CSV data anytime — Merge mode keeps existing data safe<br/>
            <span style={{ color: "rgba(255,255,255,0.65)" }}>•</span> Export CSV to get all your data in spreadsheet format<br/>
            <span style={{ color: "rgba(255,255,255,0.65)" }}>•</span> Set up ANTHROPIC_API_KEY to enable AI-powered insights after every upload
          </div>

          {/* Footer */}
          <div style={{ marginTop: 20, padding: "14px 0 0", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>Jesus House Baltimore © 2025–2026</div>
            <button onClick={onClose} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #6366F1, #4F46E5)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN DASHBOARD
   ═══════════════════════════════════════════════════════════════════════ */

export default function StreamPulse() {
  const [data, setData] = useState({});
  const [specialEvents, setSpecialEvents] = useState([]);
  const [activeService, setActiveService] = useState("jhb");
  const [activeTab, setActiveTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [showNotif, setShowNotif] = useState(false);
  const [showEntry, setShowEntry] = useState(false);
  const [chartType, setChartType] = useState("area");
  const [notifications, setNotifications] = useState([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminTimer, setAdminTimer] = useState(null);
  const [adminPin, setAdminPin] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState(null);
  const [showInsights, setShowInsights] = useState(false);
  const [aiConfigured, setAiConfigured] = useState(false);

  // Load data from API
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/data`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json.data || {});
      setSpecialEvents(json.events || []);
      setApiError(null);
    } catch (err) {
      setApiError(err.message);
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); loadInsights(); }, []);

  // Load existing AI insights
  const loadInsights = async () => {
    try {
      const statusRes = await fetch(`${API_BASE}/insights/status`);
      if (statusRes.ok) {
        const status = await statusRes.json();
        setAiConfigured(status.configured);
        if (status.hasInsights) {
          const res = await fetch(`${API_BASE}/insights`);
          if (res.ok) {
            const data = await res.json();
            if (data.available) setInsights(data);
          }
        }
      }
    } catch { /* AI not available, that's fine */ }
  };

  // Generate new AI insights (admin only)
  const generateInsights = async () => {
    setInsightsLoading(true);
    setInsightsError(null);
    try {
      const res = await fetch(`${API_BASE}/insights/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Pin": adminPin },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate insights");
      }
      const data = await res.json();
      setInsights({ available: true, ...data });
      setShowInsights(true);
    } catch (err) {
      setInsightsError(err.message);
    } finally {
      setInsightsLoading(false);
    }
  };

  // Auto-logout admin after timeout
  useEffect(() => {
    if (isAdmin) {
      const timer = setTimeout(() => { setIsAdmin(false); setAdminPin(""); }, 30 * 60 * 1000);
      setAdminTimer(timer);
      return () => clearTimeout(timer);
    }
  }, [isAdmin]);

  const handleAdminLogin = (pin, timeout) => {
    setIsAdmin(true);
    setAdminPin(pin);
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setAdminPin("");
    if (adminTimer) clearTimeout(adminTimer);
    setShowEntry(false);
  };

  const service = SERVICES.find(s => s.id === activeService);
  const svcData = data[activeService] || [];
  const sorted = useMemo(() => [...svcData].sort((a, b) => a.date.localeCompare(b.date)), [svcData]);

  const filtered = useMemo(() => {
    let result = sorted;
    if (dateFrom) result = result.filter(r => r.date >= dateFrom);
    if (dateTo) result = result.filter(r => r.date <= dateTo);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(r => r.date.includes(q) || r.month.includes(q) || service.platforms.some(p => p.name.toLowerCase().includes(q)));
    }
    return result;
  }, [sorted, search, service, dateFrom, dateTo]);

  const dateRangeLabel = useMemo(() => {
    if (dateFrom && dateTo) return `${dateFrom} → ${dateTo}`;
    if (dateFrom) return `From ${dateFrom}`;
    if (dateTo) return `Up to ${dateTo}`;
    return "All Time";
  }, [dateFrom, dateTo]);

  const setPresetRange = (preset) => {
    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth();
    if (preset === "all") { setDateFrom(""); setDateTo(""); }
    else if (preset === "thisMonth") {
      setDateFrom(`${y}-${String(m + 1).padStart(2, "0")}-01`);
      setDateTo(now.toISOString().split("T")[0]);
    } else if (preset === "lastMonth") {
      const lm = m === 0 ? 11 : m - 1;
      const ly = m === 0 ? y - 1 : y;
      const lastDay = new Date(ly, lm + 1, 0).getDate();
      setDateFrom(`${ly}-${String(lm + 1).padStart(2, "0")}-01`);
      setDateTo(`${ly}-${String(lm + 1).padStart(2, "0")}-${lastDay}`);
    } else if (preset === "last4wk") {
      const from = new Date(now); from.setDate(from.getDate() - 28);
      setDateFrom(from.toISOString().split("T")[0]);
      setDateTo(now.toISOString().split("T")[0]);
    } else if (preset === "ytd") {
      setDateFrom(`${y}-01-01`);
      setDateTo(now.toISOString().split("T")[0]);
    }
  };

  useEffect(() => {
    const notes = [];
    SERVICES.forEach(svc => {
      const d = [...(data[svc.id] || [])].sort((a, b) => a.date.localeCompare(b.date));
      if (d.length < 2) return;
      const latest = d[d.length - 1], prev = d[d.length - 2];
      const ch = pct(latest.total, prev.total);
      if (Math.abs(ch) > 10) notes.push({ type: ch > 0 ? "success" : "warning", message: `${svc.short} total ${ch > 0 ? "up" : "down"} ${Math.abs(ch).toFixed(0)}% (${fmt(latest.total)} vs ${fmt(prev.total)})`, service: svc.short, time: latest.date, read: false });
      svc.platforms.forEach(p => {
        const lv = latest[p.id], pv = prev[p.id];
        if (lv > 0 && pv > 0) {
          const pc = pct(lv, pv);
          if (pc > 30) notes.push({ type: "success", message: `${p.name} on ${svc.short}: +${pc.toFixed(0)}% to ${fmt(lv)}`, service: svc.short, time: latest.date, read: false });
          if (pc < -30) notes.push({ type: "warning", message: `${p.name} on ${svc.short}: ${pc.toFixed(0)}% to ${fmt(lv)}`, service: svc.short, time: latest.date, read: false });
        }
      });
    });
    setNotifications(notes);
  }, [data]);

  const latest = sorted[sorted.length - 1] || {};
  const prev = sorted[sorted.length - 2] || {};
  const totalChange = pct(latest.total, prev.total);

  const months = useMemo(() => {
    const m = {};
    filtered.forEach(e => { if (!m[e.month]) m[e.month] = []; m[e.month].push(e); });
    return Object.entries(m).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  const crossData = useMemo(() => {
    const allMonths = new Set();
    SERVICES.forEach(svc => (data[svc.id] || []).forEach(e => allMonths.add(e.month)));
    return [...allMonths].sort().map(month => {
      const entry = { month };
      SERVICES.forEach(svc => { entry[svc.id] = (data[svc.id] || []).filter(e => e.month === month).reduce((s, e) => s + (e.total || 0), 0); });
      return entry;
    });
  }, [data]);

  const grandTotal = SERVICES.reduce((s, svc) => s + (data[svc.id] || []).reduce((ss, e) => ss + (e.total || 0), 0), 0);

  const addEntry = async (entry) => {
    try {
      const res = await fetch(`${API_BASE}/data`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Pin": adminPin },
        body: JSON.stringify({ entries: [{ ...entry, service: activeService }] }),
      });
      if (!res.ok) throw new Error("Failed to save");
      await loadData(); // Reload from DB
    } catch (err) {
      console.error("Save error:", err);
      // Fallback: update local state
      setData(d => {
        const arr = [...(d[activeService] || [])];
        const idx = arr.findIndex(r => r.date === entry.date);
        if (idx >= 0) arr[idx] = entry; else arr.push(entry);
        return { ...d, [activeService]: arr };
      });
    }
  };

  const unread = notifications.filter(n => !n.read).length;
  const TABS = [
    { id: "overview", label: "Overview", icon: <Eye size={13} /> },
    { id: "trends", label: "Trends", icon: <TrendingUp size={13} /> },
    { id: "weekly", label: "Weekly Comparison", icon: <Calendar size={13} /> },
    { id: "cross", label: "All Services", icon: <Layers size={13} /> },
    { id: "table", label: "Data Table", icon: <BarChart3 size={13} /> },
  ];

  const pie = service.platforms.map(p => ({ name: p.name, value: latest[p.id] || 0, color: p.color })).filter(d => d.value > 0);

  const card = { background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 20 };

  const renderChart = (chartData, height = 300) => {
    const C = chartType === "bar" ? BarChart : chartType === "line" ? LineChart : AreaChart;
    const D = chartType === "bar" ? Bar : chartType === "line" ? Line : Area;
    return (
      <ResponsiveContainer width="100%" height={height}>
        <C data={chartData} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} tickFormatter={v => v?.slice(5) || v} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} />
          <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} tickFormatter={fmt} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} />
          <Tooltip contentStyle={{ background: "#1a1a30", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 11, color: "#fff" }} formatter={v => [fmt(v), ""]} />
          <Legend wrapperStyle={{ fontSize: 10 }} />
          {service.platforms.map(p => (
            <D key={p.id} type="monotone" dataKey={p.id} name={p.name} stroke={p.color}
              fill={chartType === "area" ? `${p.color}20` : p.color} strokeWidth={2}
              dot={chartData.length < 12} fillOpacity={chartType === "area" ? 0.3 : 0.85}
              radius={chartType === "bar" ? [3, 3, 0, 0] : undefined} connectNulls />
          ))}
        </C>
      </ResponsiveContainer>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0c0c1d", color: "#fff", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />

      {/* HEADER */}
      <header style={{ padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(12,12,29,0.95)", backdropFilter: "blur(16px)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(135deg, ${service.gradient[0]}, ${service.gradient[1]})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, transition: "all 0.3s" }}>JH</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 15, fontWeight: 700, letterSpacing: -0.3 }}>JHB StreamPulse</h1>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>Online Streaming Viewers Dashboard</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setShowDateFilter(!showDateFilter)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 8, border: `1px solid ${(dateFrom || dateTo) ? service.color + "50" : "rgba(255,255,255,0.08)"}`, background: (dateFrom || dateTo) ? `${service.color}12` : "rgba(255,255,255,0.04)", color: (dateFrom || dateTo) ? service.color : "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>
            <Calendar size={13} />
            {dateRangeLabel}
          </button>
          <div style={{ position: "relative" }}>
            <Search size={13} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.25)" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search platforms..."
              style={{ padding: "7px 10px 7px 28px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#fff", fontSize: 11, outline: "none", width: 140 }} />
          </div>
          {isAdmin ? (
            <>
              <button onClick={() => setShowEntry(true)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "7px 12px", borderRadius: 8, border: "none", background: `linear-gradient(135deg, ${service.gradient[0]}, ${service.gradient[1]})`, color: "#fff", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                <Plus size={12} /> Add Data
              </button>
              <button onClick={() => setShowUpload(true)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "7px 12px", borderRadius: 8, border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.08)", color: "#A5B4FC", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                <UploadCloud size={12} /> Upload CSV
              </button>
              <button onClick={() => window.open(`${API_BASE}/export`, '_blank')} style={{ display: "flex", alignItems: "center", gap: 4, padding: "7px 12px", borderRadius: 8, border: "1px solid rgba(52,211,153,0.2)", background: "rgba(52,211,153,0.06)", color: "#34D399", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                <Download size={12} /> Export
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 3, padding: "5px 10px", borderRadius: 7, background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)" }}>
                <Shield size={11} color="#34D399" />
                <span style={{ fontSize: 10, fontWeight: 600, color: "#34D399" }}>Admin</span>
              </div>
              <button onClick={handleAdminLogout} title="Logout admin" style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.15)", borderRadius: 8, padding: 7, cursor: "pointer", color: "#F87171", display: "flex", alignItems: "center" }}>
                <LogOut size={14} />
              </button>
            </>
          ) : (
            <>
            <button onClick={() => window.open(`${API_BASE}/export`, '_blank')} style={{ display: "flex", alignItems: "center", gap: 4, padding: "7px 12px", borderRadius: 8, border: "1px solid rgba(52,211,153,0.15)", background: "rgba(52,211,153,0.04)", color: "rgba(52,211,153,0.6)", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
              <Download size={12} /> Export
            </button>
            <button onClick={() => setShowAdminLogin(true)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "7px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.35)", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
              <Lock size={12} /> Add Data
            </button>
            </>
          )}
          <button onClick={() => setShowInsights(true)} title="AI Insights" style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 8, border: insights?.available ? "1px solid rgba(139,92,246,0.3)" : "1px solid rgba(255,255,255,0.08)", background: insights?.available ? "rgba(139,92,246,0.08)" : "rgba(255,255,255,0.04)", color: insights?.available ? "#A78BFA" : "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
            <Sparkles size={13} /> AI Insights
          </button>
          <button onClick={() => setShowAbout(true)} title="About & Help" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: 7, cursor: "pointer", color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center" }}>
            <HelpCircle size={15} />
          </button>
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowNotif(!showNotif)} style={{ position: "relative", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: 7, cursor: "pointer", color: "rgba(255,255,255,0.5)" }}>
              <Bell size={15} />
              {unread > 0 && <span style={{ position: "absolute", top: -3, right: -3, minWidth: 15, height: 15, borderRadius: "50%", background: "#EF4444", color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>{unread}</span>}
            </button>
            {showNotif && <NotifPanel items={notifications} onClose={() => setShowNotif(false)} onRead={i => setNotifications(ns => ns.map((n, idx) => idx === i ? { ...n, read: true } : n))} />}
          </div>
        </div>
      </header>

      {/* DATE RANGE PICKER */}
      {showDateFilter && (
        <div style={{
          padding: "14px 24px", background: "rgba(15,15,30,0.98)", borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", backdropFilter: "blur(16px)",
          animation: "slideDown 0.2s ease-out"
        }}>
          <style>{`@keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
          
          {/* Quick Presets */}
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, marginRight: 2 }}>Quick:</span>
            {[
              { id: "all", label: "All Time" },
              { id: "ytd", label: "YTD" },
              { id: "thisMonth", label: "This Month" },
              { id: "lastMonth", label: "Last Month" },
              { id: "last4wk", label: "Last 4 Weeks" },
            ].map(p => {
              const isActive = (p.id === "all" && !dateFrom && !dateTo);
              return (
                <button key={p.id} onClick={() => setPresetRange(p.id)}
                  style={{
                    padding: "5px 10px", borderRadius: 6, fontSize: 10, fontWeight: 600, cursor: "pointer",
                    border: `1px solid ${isActive ? service.color + "50" : "rgba(255,255,255,0.08)"}`,
                    background: isActive ? `${service.color}15` : "rgba(255,255,255,0.03)",
                    color: isActive ? service.color : "rgba(255,255,255,0.45)",
                    transition: "all 0.15s"
                  }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = `${service.color}30`; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; } }}>
                  {p.label}
                </button>
              );
            })}
          </div>

          <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.08)" }} />

          {/* Custom Date Range */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>From:</span>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              style={{
                padding: "6px 10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 7, color: "#fff", fontSize: 11, outline: "none", fontFamily: "'DM Sans', sans-serif",
                colorScheme: "dark"
              }}
              onFocus={e => { e.target.style.borderColor = `${service.color}60`; }}
              onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }} />

            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>To:</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              style={{
                padding: "6px 10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 7, color: "#fff", fontSize: 11, outline: "none", fontFamily: "'DM Sans', sans-serif",
                colorScheme: "dark"
              }}
              onFocus={e => { e.target.style.borderColor = `${service.color}60`; }}
              onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }} />
          </div>

          {/* Clear + Count */}
          {(dateFrom || dateTo) && (
            <>
              <button onClick={() => { setDateFrom(""); setDateTo(""); }}
                style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 6, border: "1px solid rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.08)", color: "#F87171", cursor: "pointer", fontSize: 10, fontWeight: 600 }}>
                <X size={11} /> Clear
              </button>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>
                {filtered.length} {filtered.length === 1 ? "entry" : "entries"} in range
              </span>
            </>
          )}
        </div>
      )}

      <div style={{ padding: "18px 24px", maxWidth: 1320, margin: "0 auto" }}>

        {/* SERVICE SELECTOR */}
        <div style={{ display: "flex", gap: 8, marginBottom: 18, overflowX: "auto", paddingBottom: 2 }}>
          {SERVICES.map(svc => {
            const active = svc.id === activeService;
            const d = [...(data[svc.id] || [])].sort((a, b) => a.date.localeCompare(b.date));
            const last = d[d.length - 1];
            return (
              <button key={svc.id} onClick={() => setActiveService(svc.id)}
                style={{ padding: "10px 16px", borderRadius: 11, border: `1.5px solid ${active ? svc.color : "rgba(255,255,255,0.06)"}`, background: active ? `${svc.color}10` : "rgba(255,255,255,0.015)", cursor: "pointer", display: "flex", flexDirection: "column", gap: 3, minWidth: 150, transition: "all 0.2s", textAlign: "left" }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = `${svc.color}35`; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: active ? svc.color : "rgba(255,255,255,0.55)" }}>{svc.short}</div>
                <div style={{ fontSize: 19, fontWeight: 700, color: "#fff", fontFamily: "'Space Mono', monospace" }}>{last ? fmt(last.total) : "–"}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>{d.length} weeks · {svc.platforms.length} platforms</div>
              </button>
            );
          })}
        </div>

        {/* WEEK DISPLAY BANNER */}
        {filtered.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 18px", marginBottom: 14, background: `linear-gradient(135deg, ${service.color}08, ${service.color}03)`, border: `1px solid ${service.color}20`, borderRadius: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `${service.color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Calendar size={17} color={service.color} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: service.color, marginBottom: 3 }}>
                {filtered.length === 1 ? "Displaying Week" : `Displaying ${filtered.length} Weeks`}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
                {filtered.length === 1
                  ? `${fmtDateNice(filtered[0].date)}  ·  Week ${getWeekNumber(filtered[0].date)}`
                  : `${fmtDateNice(filtered[0].date)}  →  ${fmtDateNice(filtered[filtered.length - 1].date)}`
                }
              </div>
              {filtered.length > 1 && (
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
                  Week {getWeekNumber(filtered[0].date)} – Week {getWeekNumber(filtered[filtered.length - 1].date)}, {filtered[0].date.slice(0, 4)}
                </div>
              )}
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, color: "rgba(255,255,255,0.3)", marginBottom: 3 }}>Latest Week Total</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", fontFamily: "'Space Mono', monospace" }}>
                {fmt(filtered[filtered.length - 1].total)}
              </div>
            </div>
          </div>
        )}

        {/* KPI CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 10, marginBottom: 18 }}>
          <StatCard label="Latest Total" value={fmt(latest.total || 0)} change={totalChange} color={service.color} sub={`Week of ${latest.date || "–"}`} />
          <StatCard label="Peak Viewers" value={fmt(Math.max(...filtered.map(d => d.total || 0), 0))} change={null} color="#F59E0B" sub="Best in range" />
          <StatCard label="Top Platform" value={service.platforms.reduce((best, p) => ((latest[p.id] || 0) > (latest[best.id] || 0) ? p : best), service.platforms[0])?.name || "–"} change={null} color="#EC4899" sub={`${fmt(Math.max(...service.platforms.map(p => latest[p.id] || 0), 0))} viewers`} />
          <StatCard label="Grand Total (All)" value={fmt(grandTotal)} change={null} color="#6366F1" sub="All services" />
        </div>

        {/* AI INSIGHTS BANNER */}
        {insights?.available && insights?.summary && (
          <div onClick={() => setShowInsights(true)} style={{
            padding: "12px 18px", borderRadius: 14, marginBottom: 18, cursor: "pointer",
            background: "linear-gradient(135deg, rgba(139,92,246,0.06), rgba(99,102,241,0.03))",
            border: "1px solid rgba(139,92,246,0.12)",
            display: "flex", alignItems: "center", gap: 14,
            transition: "all 0.2s",
          }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg, #8B5CF6, #6366F1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Sparkles size={15} color="#fff" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#A78BFA", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3 }}>AI Insights</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                {insights.summary}
              </div>
            </div>
            <ChevronRight size={16} color="rgba(139,92,246,0.4)" style={{ flexShrink: 0 }} />
          </div>
        )}

        {/* TABS + CHART CONTROLS */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", gap: 2, background: "rgba(255,255,255,0.02)", borderRadius: 9, padding: 3 }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 13px", borderRadius: 7, border: "none", background: activeTab === tab.id ? `${service.color}18` : "transparent", color: activeTab === tab.id ? "#fff" : "rgba(255,255,255,0.35)", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
          {["overview", "trends"].includes(activeTab) && (
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              {["area", "line", "bar"].map(t => (
                <button key={t} onClick={() => setChartType(t)}
                  style={{ padding: "4px 9px", borderRadius: 6, border: `1px solid ${chartType === t ? service.color + "40" : "rgba(255,255,255,0.06)"}`, background: chartType === t ? `${service.color}12` : "transparent", color: chartType === t ? service.color : "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 10, fontWeight: 600, textTransform: "capitalize" }}>
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ═══ OVERVIEW ═══ */}
        {activeTab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 14 }}>
            <div style={card}>
              <h3 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>
                {service.name} — Weekly Viewers
                {filtered.length > 0 && <span style={{ fontWeight: 500, color: "rgba(255,255,255,0.3)", fontSize: 10, marginLeft: 8 }}>Wk {getWeekNumber(filtered[0].date)}–{getWeekNumber(filtered[filtered.length - 1].date)}</span>}
              </h3>
              {renderChart(filtered)}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={card}>
                <h3 style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>Platform Share</h3>
                {pie.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={170}>
                      <PieChart><Pie data={pie} cx="50%" cy="50%" innerRadius={48} outerRadius={74} dataKey="value" paddingAngle={3} stroke="none">{pie.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie>
                        <Tooltip contentStyle={{ background: "#1a1a30", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 11, color: "#fff" }} formatter={v => [fmt(v), ""]} /></PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, justifyContent: "center" }}>
                      {pie.map(d => <span key={d.name} style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 3 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: d.color }} /> {d.name}</span>)}
                    </div>
                  </>
                ) : <div style={{ padding: 24, textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 11 }}>No data</div>}
              </div>
              <div style={{ ...card, flex: 1 }}>
                <h3 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>Breakdown (Latest Week)</h3>
                {service.platforms.map(p => {
                  const val = latest[p.id], prevVal = prev[p.id];
                  const ch = val > 0 && prevVal > 0 ? pct(val, prevVal) : null;
                  return (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                      <span style={{ width: 24, height: 24, borderRadius: 6, background: `${p.color}12`, color: p.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, flexShrink: 0 }}>{p.icon}</span>
                      <div style={{ flex: 1, fontSize: 11, fontWeight: 600, color: "#fff" }}>{p.name}</div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", fontFamily: "'Space Mono', monospace" }}>{fmt(val)}</div>
                        {ch !== null && <span style={{ fontSize: 9, color: ch >= 0 ? "#34D399" : "#F87171", fontWeight: 600 }}>{ch >= 0 ? "+" : ""}{ch.toFixed(0)}%</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═══ TRENDS ═══ */}
        {activeTab === "trends" && (
          <div style={{ display: "grid", gap: 14 }}>
            <div style={card}>
              <h3 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>
                Total Viewers Trend — {service.name}
                {filtered.length > 0 && <span style={{ fontWeight: 500, color: "rgba(255,255,255,0.3)", fontSize: 10, marginLeft: 8 }}>Wk {getWeekNumber(filtered[0].date)}–{getWeekNumber(filtered[filtered.length - 1].date)}</span>}
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={filtered}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} tickFormatter={v => v?.slice(5)} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} tickFormatter={fmt} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} />
                  <Tooltip contentStyle={{ background: "#1a1a30", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 11, color: "#fff" }} formatter={v => [fmt(v), "Total"]} />
                  <Area type="monotone" dataKey="total" stroke={service.color} fill={`${service.color}20`} strokeWidth={2.5} dot />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10 }}>
              {service.platforms.map(p => {
                const has = filtered.some(d => d[p.id] > 0);
                return (
                  <div key={p.id} style={card}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                      <span style={{ color: p.color, fontWeight: 800, fontSize: 13 }}>{p.icon}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{p.name}</span>
                    </div>
                    {has ? (
                      <ResponsiveContainer width="100%" height={110}>
                        <AreaChart data={filtered}>
                          <Area type="monotone" dataKey={p.id} stroke={p.color} fill={`${p.color}15`} strokeWidth={2} dot={false} connectNulls />
                          <Tooltip contentStyle={{ background: "#1a1a30", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 11, color: "#fff" }} formatter={v => [fmt(v), p.name]} />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : <div style={{ height: 110, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.12)", fontSize: 11 }}>No data</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ WEEKLY COMPARISON ═══ */}
        {activeTab === "weekly" && (
          <div style={{ display: "grid", gap: 14 }}>
            <div style={card}>
              <h3 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>
                Week-over-Week — {service.name}
                {filtered.length > 0 && <span style={{ fontWeight: 500, color: "rgba(255,255,255,0.3)", fontSize: 10, marginLeft: 8 }}>Wk {getWeekNumber(filtered[0].date)}–{getWeekNumber(filtered[filtered.length - 1].date)}</span>}
              </h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                      <th style={{ padding: "9px 10px", textAlign: "left", color: "rgba(255,255,255,0.4)", fontWeight: 600, fontSize: 9, textTransform: "uppercase", letterSpacing: 1 }}>Week</th>
                      <th style={{ padding: "9px 6px", textAlign: "center", color: service.color, fontWeight: 600, fontSize: 9, textTransform: "uppercase" }}>Wk #</th>
                      {service.platforms.map(p => (
                        <th key={p.id} style={{ padding: "9px 8px", textAlign: "right", color: p.color, fontWeight: 600, fontSize: 9, textTransform: "uppercase", whiteSpace: "nowrap" }}>{p.name}</th>
                      ))}
                      <th style={{ padding: "9px 10px", textAlign: "right", color: "rgba(255,255,255,0.6)", fontWeight: 700, fontSize: 9, textTransform: "uppercase" }}>Total</th>
                      <th style={{ padding: "9px 10px", textAlign: "right", color: "rgba(255,255,255,0.4)", fontWeight: 600, fontSize: 9, textTransform: "uppercase" }}>WoW</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => {
                      const p2 = i > 0 ? filtered[i - 1] : null;
                      const wow = p2 ? pct(row.total, p2.total) : null;
                      return (
                        <tr key={row.date} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.025)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                          <td style={{ padding: "9px 10px", fontWeight: 500, color: "rgba(255,255,255,0.55)", whiteSpace: "nowrap" }}>{row.date}</td>
                          <td style={{ padding: "9px 6px", textAlign: "center" }}><span style={{ display: "inline-block", minWidth: 22, padding: "2px 5px", borderRadius: 5, background: `${service.color}12`, color: service.color, fontSize: 9, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>{getWeekNumber(row.date)}</span></td>
                          {service.platforms.map(p => (
                            <td key={p.id} style={{ padding: "9px 8px", textAlign: "right", color: "rgba(255,255,255,0.5)", fontFamily: "'Space Mono', monospace", fontSize: 10 }}>{fmt(row[p.id])}</td>
                          ))}
                          <td style={{ padding: "9px 10px", textAlign: "right", fontWeight: 700, color: "#fff", fontFamily: "'Space Mono', monospace" }}>{fmt(row.total)}</td>
                          <td style={{ padding: "9px 10px", textAlign: "right" }}>
                            {wow !== null ? <span style={{ fontSize: 10, fontWeight: 600, color: wow >= 0 ? "#34D399" : "#F87171" }}>{wow >= 0 ? "+" : ""}{wow.toFixed(0)}%</span> : <span style={{ color: "rgba(255,255,255,0.12)" }}>–</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            {months.length > 0 && (
              <div style={card}>
                <h3 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>Monthly Summary</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 8 }}>
                  {months.map(([month, entries]) => {
                    const mTotal = entries.reduce((s, e) => s + (e.total || 0), 0);
                    return (
                      <div key={month} style={{ background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: 14, border: "1px solid rgba(255,255,255,0.04)" }}>
                        <div style={{ fontSize: 10, color: service.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>{month}</div>
                        <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>{fmt(mTotal)}</div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 3 }}>Avg: {fmt(Math.round(mTotal / entries.length))}/wk · {entries.length} wks</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ ALL SERVICES ═══ */}
        {activeTab === "cross" && (
          <div style={{ display: "grid", gap: 14 }}>
            <div style={card}>
              <h3 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>All Services — Monthly Totals</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={crossData} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} tickFormatter={fmt} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} />
                  <Tooltip contentStyle={{ background: "#1a1a30", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 11, color: "#fff" }} formatter={v => [fmt(v), ""]} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  {SERVICES.map(svc => <Bar key={svc.id} dataKey={svc.id} name={svc.short} fill={svc.color} radius={[4, 4, 0, 0]} />)}
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10 }}>
              {SERVICES.map(svc => {
                const d = [...(data[svc.id] || [])].sort((a, b) => a.date.localeCompare(b.date));
                const total = d.reduce((s, e) => s + (e.total || 0), 0);
                const last = d[d.length - 1] || {};
                return (
                  <div key={svc.id} style={{ ...card, borderLeft: `3px solid ${svc.color}` }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: svc.color, marginBottom: 8 }}>{svc.name}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>All-Time</div>
                        <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>{fmt(total)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Latest</div>
                        <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>{fmt(last.total || 0)}</div>
                      </div>
                    </div>
                    <div style={{ marginTop: 8, fontSize: 10, color: "rgba(255,255,255,0.25)" }}>{d.length} weeks · {svc.platforms.length} platforms</div>
                  </div>
                );
              })}
            </div>
            {specialEvents.length > 0 && (
              <div style={card}>
                <h3 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>Special Events</h3>
                {specialEvents.map((evt, i) => (
                  <div key={i} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#F59E0B" }}>{evt.name}</span>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>{evt.dates}</span>
                    </div>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={evt.data}>
                        <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} />
                        <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} tickFormatter={fmt} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} />
                        <Tooltip contentStyle={{ background: "#1a1a30", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 11, color: "#fff" }} formatter={v => [fmt(v), ""]} />
                        <Bar dataKey="total" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ DATA TABLE ═══ */}
        {activeTab === "table" && (
          <div style={card}>
            <h3 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>
              {service.name} — Raw Data ({filtered.length} entries)
              {filtered.length > 0 && <span style={{ fontWeight: 500, color: "rgba(255,255,255,0.3)", fontSize: 10, marginLeft: 8 }}>Wk {getWeekNumber(filtered[0].date)}–{getWeekNumber(filtered[filtered.length - 1].date)}</span>}
            </h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    <th style={{ padding: "9px 10px", textAlign: "left", color: "rgba(255,255,255,0.4)", fontWeight: 600, fontSize: 9, textTransform: "uppercase", letterSpacing: 1, position: "sticky", left: 0, background: "#0c0c1d" }}>Date</th>
                    <th style={{ padding: "9px 6px", textAlign: "center", color: service.color, fontWeight: 600, fontSize: 9, textTransform: "uppercase" }}>Wk #</th>
                    {service.platforms.map(p => (
                      <th key={p.id} style={{ padding: "9px 8px", textAlign: "right", color: p.color, fontWeight: 600, fontSize: 9, textTransform: "uppercase", whiteSpace: "nowrap" }}>{p.name}</th>
                    ))}
                    <th style={{ padding: "9px 10px", textAlign: "right", color: "rgba(255,255,255,0.6)", fontWeight: 700, fontSize: 9, textTransform: "uppercase" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {[...filtered].reverse().map(row => (
                    <tr key={row.date} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                      <td style={{ padding: "9px 10px", fontWeight: 500, color: "rgba(255,255,255,0.55)", position: "sticky", left: 0, background: "#0c0c1d" }}>{row.date}</td>
                      <td style={{ padding: "9px 6px", textAlign: "center" }}><span style={{ display: "inline-block", minWidth: 22, padding: "2px 5px", borderRadius: 5, background: `${service.color}12`, color: service.color, fontSize: 9, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>{getWeekNumber(row.date)}</span></td>
                      {service.platforms.map(p => (
                        <td key={p.id} style={{ padding: "9px 8px", textAlign: "right", color: "rgba(255,255,255,0.45)", fontFamily: "'Space Mono', monospace", fontSize: 10 }}>{fmt(row[p.id])}</td>
                      ))}
                      <td style={{ padding: "9px 10px", textAlign: "right", fontWeight: 700, color: "#fff", fontFamily: "'Space Mono', monospace" }}>{fmt(row.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div style={{ marginTop: 24, padding: "12px 0", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "center", alignItems: "center", gap: 8, fontSize: 9, color: "rgba(255,255,255,0.15)" }}>
          <span>JHB StreamPulse · {SERVICES.reduce((s, svc) => s + (data[svc.id] || []).length, 0)} entries across {SERVICES.length} services</span>
          <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
          <span style={{ display: "flex", alignItems: "center", gap: 3, color: isAdmin ? "#34D399" : "rgba(255,255,255,0.15)" }}>
            {isAdmin ? <><Shield size={8} /> Admin Mode</> : <><Lock size={8} /> View Only</>}
          </span>
        </div>
      </div>

      {showEntry && isAdmin && <EntryModal onClose={() => setShowEntry(false)} onSubmit={addEntry} service={service} />}
      {showAdminLogin && <AdminLoginModal onClose={() => setShowAdminLogin(false)} onSuccess={handleAdminLogin} color={service.color} gradient={service.gradient} />}
      {showUpload && isAdmin && <UploadModal onClose={() => setShowUpload(false)} adminPin={adminPin} onUploadComplete={() => { loadData(); setTimeout(loadInsights, 5000); }} color={service.color} gradient={service.gradient} />}
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
      {showInsights && <InsightsPanel
        insights={insights}
        onClose={() => { setShowInsights(false); setInsightsError(null); }}
        onGenerate={generateInsights}
        isAdmin={isAdmin}
        isLoading={insightsLoading}
        error={insightsError}
      />}
      {loading && <div style={{ position:"fixed", inset:0, background:"rgba(10,10,25,0.95)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", zIndex:300 }}>
        <Database size={40} color="#6366F1" style={{ marginBottom:16, animation:"pulse 1.5s ease-in-out infinite" }} />
        <div style={{ color:"#fff", fontSize:16, fontWeight:600 }}>Loading dashboard...</div>
        <div style={{ color:"rgba(255,255,255,0.3)", fontSize:11, marginTop:6 }}>Connecting to database</div>
        <style>{`@keyframes pulse { 0%,100%{opacity:0.4;transform:scale(0.95)} 50%{opacity:1;transform:scale(1.05)} }`}</style>
      </div>}
      {apiError && !loading && <div style={{ position:"fixed", inset:0, background:"rgba(10,10,25,0.97)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:300 }}>
        <div style={{ background:"#161628", border:"1px solid rgba(255,255,255,0.1)", borderRadius:18, padding:36, maxWidth:460, textAlign:"center" }}>
          <AlertCircle size={40} color="#F87171" style={{ marginBottom:16 }} />
          <div style={{ color:"#fff", fontSize:18, fontWeight:700, marginBottom:8 }}>Cannot Connect to Server</div>
          <div style={{ color:"rgba(255,255,255,0.5)", fontSize:13, marginBottom:20, lineHeight:1.6 }}>
            The dashboard needs the Node.js server running.<br/>
            Make sure you started it correctly:
          </div>
          <div style={{ background:"rgba(0,0,0,0.4)", borderRadius:10, padding:16, textAlign:"left", marginBottom:20 }}>
            <div style={{ color:"rgba(255,255,255,0.3)", fontSize:10, fontWeight:600, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Option 1 — Double-click</div>
            <div style={{ color:"#34D399", fontSize:13, fontFamily:"'Space Mono',monospace" }}>start.command</div>
            <div style={{ color:"rgba(255,255,255,0.3)", fontSize:10, fontWeight:600, textTransform:"uppercase", letterSpacing:1, marginBottom:8, marginTop:16 }}>Option 2 — Terminal</div>
            <div style={{ color:"#34D399", fontSize:13, fontFamily:"'Space Mono',monospace" }}>npm install</div>
            <div style={{ color:"#34D399", fontSize:13, fontFamily:"'Space Mono',monospace" }}>node server.js</div>
            <div style={{ color:"rgba(255,255,255,0.3)", fontSize:10, fontWeight:600, textTransform:"uppercase", letterSpacing:1, marginBottom:8, marginTop:16 }}>Then open</div>
            <div style={{ color:"#6366F1", fontSize:13, fontFamily:"'Space Mono',monospace" }}>http://localhost:8000</div>
          </div>
          <div style={{ color:"rgba(255,255,255,0.25)", fontSize:11, marginBottom:16 }}>Error: {apiError}</div>
          <button onClick={loadData} style={{ background:"linear-gradient(135deg, #6366F1, #8B5CF6)", border:"none", borderRadius:10, padding:"10px 24px", color:"#fff", cursor:"pointer", fontSize:13, fontWeight:600, display:"inline-flex", alignItems:"center", gap:6 }}><RefreshCw size={14}/> Retry Connection</button>
        </div>
      </div>}
    </div>
  );
}
