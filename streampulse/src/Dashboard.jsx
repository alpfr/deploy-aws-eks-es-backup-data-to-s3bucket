import { useState, useEffect, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import {
  Search, Bell, TrendingUp, TrendingDown, Upload, Plus, X, Eye, Calendar,
  AlertCircle, CheckCircle, Filter, BarChart3, Layers, Lock, Unlock, LogOut, Shield,
  Download, FileText, RefreshCw, Database, UploadCloud, Check, Loader, HelpCircle, Info,
  ChevronRight, Monitor, Sparkles, Zap, Star, MessageSquare, Copy
} from "lucide-react";

import { API_BASE } from "./utils/config";
import { fmt, pct, fmtDateNice, getWeekNumber } from "./utils/helpers";
import { StatCard } from "./components/UI/StatCard";
import { NotifPanel } from "./components/UI/NotifPanel";
import { EntryModal } from "./components/Modals/EntryModal";
import { UploadModal } from "./components/Modals/UploadModal";
import { InsightsPanel } from "./components/Modals/InsightsPanel";
import { AboutModal } from "./components/Modals/AboutModal";

/* ═══════════════════════════════════════════════════════════════════════
   MAIN DASHBOARD
   ═══════════════════════════════════════════════════════════════════════ */

export default function StreamPulse() {
  const [data, setData] = useState({});
  const [specialEvents, setSpecialEvents] = useState([]);
  const [config, setConfig] = useState([]);
  const [activeService, setActiveService] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [showNotif, setShowNotif] = useState(false);
  const [showEntry, setShowEntry] = useState(false);
  const [chartType, setChartType] = useState("area");
  const [notifications, setNotifications] = useState([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [user, setUser] = useState({ email: "anonymous", role: "viewer" });
  const [showUpload, setShowUpload] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState(null);
  const [showInsights, setShowInsights] = useState(false);
  const [aiConfigured, setAiConfigured] = useState(false);
  const [copiedBriefing, setCopiedBriefing] = useState(false);

  const copyBriefing = () => {
    if (!insights) return;
    const text = `JHB StreamPulse - AI Weekly Briefing
Generated: ${new Date(insights.generated_at + "Z").toLocaleString()}

EXECUTIVE SUMMARY
${insights.summary}

KEY HIGHLIGHTS
${(insights.highlights || []).map(h => `• ${h.title}: ${h.detail}`).join('\n')}

PLATFORM ANALYSIS
${insights.platform_insight || "N/A"}

ALERTS & OBSERVATIONS
${(insights.alerts || []).map(a => `• [${a.severity.toUpperCase()}] ${a.message}`).join('\n')}

RECOMMENDATION
${insights.recommendation || "N/A"}`;

    navigator.clipboard.writeText(text);
    setCopiedBriefing(true);
    setTimeout(() => setCopiedBriefing(false), 2000);
  };

  // Load data from API
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/data`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json.data || {});
      setSpecialEvents(json.events || []);
      const newConfig = json.config || [];
      setConfig(newConfig);
      if (newConfig.length > 0 && !activeService) setActiveService(newConfig[0].id);
      setApiError(null);
    } catch (err) {
      setApiError(err.message);
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`);
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
    }
  };

  useEffect(() => { checkAuth(); loadData(); loadInsights(); }, []);

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
        headers: { "Content-Type": "application/json" },
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

  const service = activeService ? config.find(s => s.id === activeService) : null;
  const svcData = activeService ? (data[activeService] || []) : [];
  const sorted = useMemo(() => [...svcData].sort((a, b) => a.date.localeCompare(b.date)), [svcData]);

  const filtered = useMemo(() => {
    let result = sorted;
    if (dateFrom) result = result.filter(r => r.date >= dateFrom);
    if (dateTo) result = result.filter(r => r.date <= dateTo);
    if (search && service) {
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
    config.forEach(svc => {
      const d = [...(data[svc.id] || [])].sort((a, b) => a.date.localeCompare(b.date));
      if (d.length < 2) return;
      const latest = d[d.length - 1], prev = d[d.length - 2];
      const ch = pct(latest.total, prev.total);
      if (Math.abs(ch) > 10) notes.push({ type: ch > 0 ? "success" : "warning", message: `${svc.short} total ${ch > 0 ? "up" : "down"} ${Math.abs(ch).toFixed(0)}% (${fmt(latest.total)} vs ${fmt(prev.total)})`, service: svc.short, time: latest.date, read: false });
      svc.platforms.forEach(p => {
        const lv = latest.platforms?.[p.id] || 0, pv = prev.platforms?.[p.id] || 0;
        if (lv > 0 && pv > 0) {
          const pc = pct(lv, pv);
          if (pc > 30) notes.push({ type: "success", message: `${p.name} on ${svc.short}: +${pc.toFixed(0)}% to ${fmt(lv)}`, service: svc.short, time: latest.date, read: false });
          if (pc < -30) notes.push({ type: "warning", message: `${p.name} on ${svc.short}: ${pc.toFixed(0)}% to ${fmt(lv)}`, service: svc.short, time: latest.date, read: false });
        }
      });
    });
    setNotifications(notes);
  }, [data, config]);

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
    config.forEach(svc => (data[svc.id] || []).forEach(e => allMonths.add(e.month)));
    return [...allMonths].sort().map(month => {
      const entry = { month };
      config.forEach(svc => { entry[svc.id] = (data[svc.id] || []).filter(e => e.month === month).reduce((s, e) => s + (e.total || 0), 0); });
      return entry;
    });
  }, [data, config]);

  const grandTotal = config.reduce((s, svc) => s + (data[svc.id] || []).reduce((ss, e) => ss + (e.total || 0), 0), 0);

  const totalFiltered = filtered.reduce((s, d) => s + (d.total || 0), 0);
  const avgWeekly = filtered.length > 0 ? Math.round(totalFiltered / filtered.length) : 0;

  const monthlyTotals = {};
  const quarterlyTotals = {};
  filtered.forEach(d => {
    monthlyTotals[d.month] = (monthlyTotals[d.month] || 0) + (d.total || 0);
    const [yyyy, mm] = d.month.split('-');
    const q = Math.ceil(parseInt(mm, 10) / 3);
    const qKey = `${yyyy}-Q${q}`;
    quarterlyTotals[qKey] = (quarterlyTotals[qKey] || 0) + (d.total || 0);
  });

  const numMonths = Object.keys(monthlyTotals).length;
  const avgMonthly = numMonths > 0 ? Math.round(totalFiltered / numMonths) : 0;

  const numQuarters = Object.keys(quarterlyTotals).length;
  const avgQuarterly = numQuarters > 0 ? Math.round(totalFiltered / numQuarters) : 0;

  const addEntry = async (entry) => {
    try {
      const res = await fetch(`${API_BASE}/data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  const pie = service ? service.platforms.map(p => ({ name: p.name, value: latest.platforms?.[p.id] || 0, color: p.color })).filter(d => d.value > 0) : [];

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
          {service && service.platforms.map(p => (
            <D key={p.id} type="monotone" dataKey={row => row.platforms?.[p.id] || 0} name={p.name} stroke={p.color}
              fill={chartType === "area" ? `${p.color}20` : p.color} strokeWidth={2}
              dot={chartData.length < 12} fillOpacity={chartType === "area" ? 0.3 : 0.85}
              radius={chartType === "bar" ? [3, 3, 0, 0] : undefined} connectNulls />
          ))}
        </C>
      </ResponsiveContainer>
    );
  };

  const C = chartType === "bar" ? BarChart : chartType === "line" ? LineChart : AreaChart;
  const D = chartType === "bar" ? Bar : chartType === "line" ? Line : Area;

  return (
    <div style={{ minHeight: "100vh", background: "#0c0c1d", color: "#fff", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />

      {/* HEADER */}
      <header style={{ padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(12,12,29,0.95)", backdropFilter: "blur(16px)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(135deg, ${service?.gradient[0] || "#F59E0B"}, ${service?.gradient[1] || "#D97706"})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, transition: "all 0.3s" }}>SP</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 15, fontWeight: 700, letterSpacing: -0.3 }}>StreamPulse Analytics</h1>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>Online Streaming Viewers Dashboard</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {service && (
            <button onClick={() => setShowDateFilter(!showDateFilter)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 8, border: `1px solid ${(dateFrom || dateTo) ? service.color + "50" : "rgba(255,255,255,0.08)"}`, background: (dateFrom || dateTo) ? `${service.color}12` : "rgba(255,255,255,0.04)", color: (dateFrom || dateTo) ? service.color : "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>
              <Calendar size={13} />
              {dateRangeLabel}
            </button>
          )}
          <div style={{ position: "relative" }}>
            <Search size={13} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.25)" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search platforms..."
              style={{ padding: "7px 10px 7px 28px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#fff", fontSize: 11, outline: "none", width: 140 }} />
          </div>
          {["admin", "editor"].includes(user.role) ? (
            <>
              {service && (
                <button onClick={() => setShowEntry(true)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "7px 12px", borderRadius: 8, border: "none", background: `linear-gradient(135deg, ${service.gradient[0]}, ${service.gradient[1]})`, color: "#fff", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                  <Plus size={12} /> Add Data
                </button>
              )}
              <button onClick={() => setShowUpload(true)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "7px 12px", borderRadius: 8, border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.08)", color: "#A5B4FC", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                <UploadCloud size={12} /> Upload CSV
              </button>
              <button onClick={() => window.open(`${API_BASE}/export`, '_blank')} style={{ display: "flex", alignItems: "center", gap: 4, padding: "7px 12px", borderRadius: 8, border: "1px solid rgba(52,211,153,0.2)", background: "rgba(52,211,153,0.06)", color: "#34D399", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                <Download size={12} /> Export
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 7, background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)" }}>
                <Shield size={11} color="#34D399" />
                <span style={{ fontSize: 10, fontWeight: 600, color: "#34D399", textTransform: "capitalize" }}>{user.role}</span>
              </div>
            </>
          ) : (
            <>
              <button onClick={() => window.open(`${API_BASE}/export`, '_blank')} style={{ display: "flex", alignItems: "center", gap: 4, padding: "7px 12px", borderRadius: 8, border: "1px solid rgba(52,211,153,0.15)", background: "rgba(52,211,153,0.04)", color: "rgba(52,211,153,0.6)", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                <Download size={12} /> Export
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 7, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <Lock size={11} color="rgba(255,255,255,0.5)" />
                <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "capitalize" }}>{user.role}</span>
              </div>
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
                    border: `1px solid ${isActive ? (service?.color || "#6366F1") + "50" : "rgba(255,255,255,0.08)"}`,
                    background: isActive ? `${service?.color || "#6366F1"}15` : "rgba(255,255,255,0.03)",
                    color: isActive ? (service?.color || "#6366F1") : "rgba(255,255,255,0.45)",
                    transition: "all 0.15s"
                  }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = `${service?.color || "#6366F1"}30`; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; } }}
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
              onFocus={e => { e.target.style.borderColor = `${service?.color || "#6366F1"}60`; }}
              onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }} />

            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>To:</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              style={{
                padding: "6px 10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 7, color: "#fff", fontSize: 11, outline: "none", fontFamily: "'DM Sans', sans-serif",
                colorScheme: "dark"
              }}
              onFocus={e => { e.target.style.borderColor = `${service?.color || "#6366F1"}60`; }}
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
          {config.map(svc => {
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
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>{d.length} weeks</div>
              </button>
            );
          })}
        </div>

        {/* WEEK DISPLAY BANNER */}
        {filtered.length > 0 && service && (
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
        {service && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 10, marginBottom: 18 }}>
            <StatCard label="Latest Total" value={fmt(latest.total || 0)} change={totalChange} color={service.color} sub={`Week of ${latest.date || "–"}`} />
            <StatCard label="Peak Viewers" value={fmt(Math.max(...filtered.map(d => d.total || 0), 0))} change={null} color="#F59E0B" sub="Best in range" />
            <StatCard label="Top Platform" value={service.platforms.reduce((best, p) => ((latest.platforms?.[p.id] || 0) > (latest.platforms?.[best.id] || 0) ? p : best), service.platforms[0])?.name || "–"} change={null} color="#EC4899" sub={`${fmt(Math.max(...service.platforms.map(p => latest.platforms?.[p.id] || 0), 0))} viewers`} />
            <StatCard label="Grand Total (All)" value={fmt(grandTotal)} change={null} color="#6366F1" sub="All services" />
            <StatCard label="Weekly Avg" value={fmt(avgWeekly)} change={null} color="#10B981" sub="Over range" />
            <StatCard label="Monthly Avg" value={fmt(avgMonthly)} change={null} color="#3B82F6" sub="Over range" />
            <StatCard label="Quarterly Avg" value={fmt(avgQuarterly)} change={null} color="#8B5CF6" sub="Over range" />
          </div>
        )}

        {/* AI INSIGHTS REMOVED FROM HERE, MOVED TO OVERVIEW TAB */}

        {/* TABS + CHART CONTROLS */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", gap: 2, background: "rgba(255,255,255,0.02)", borderRadius: 9, padding: 3 }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 13px", borderRadius: 7, border: "none", background: activeTab === tab.id ? `${service?.color || "#6366F1"}18` : "transparent", color: activeTab === tab.id ? "#fff" : "rgba(255,255,255,0.35)", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
          {["overview", "trends"].includes(activeTab) && (
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              {["area", "line", "bar"].map(t => (
                <button key={t} onClick={() => setChartType(t)}
                  style={{ padding: "4px 9px", borderRadius: 6, border: `1px solid ${chartType === t ? (service?.color || "#6366F1") + "40" : "rgba(255,255,255,0.06)"}`, background: chartType === t ? `${service?.color || "#6366F1"}12` : "transparent", color: chartType === t ? (service?.color || "#6366F1") : "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 10, fontWeight: 600, textTransform: "capitalize" }}>
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ═══ OVERVIEW ═══ */}
        {activeTab === "overview" && (
          <>
            {/* CLAUDE WEEKLY BRIEFING */}
            {insights?.available && insights?.summary && (
              <div style={{ ...card, padding: 0, overflow: "hidden", marginBottom: 14, background: "linear-gradient(135deg, rgba(139,92,246,0.06), rgba(99,102,241,0.03))", border: "1px solid rgba(139,92,246,0.2)" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(139,92,246,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #8B5CF6, #6366F1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Sparkles size={14} color="#fff" />
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", letterSpacing: 0.5 }}>Claude Weekly Briefing</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={copyBriefing} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "6px 12px", color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, transition: "all 0.2s" }}>
                      {copiedBriefing ? <Check size={12} color="#34D399" /> : <Copy size={12} />} {copiedBriefing ? "Copied" : "Copy"}
                    </button>
                    <button onClick={() => setShowInsights(true)} style={{ background: "rgba(139,92,246,0.15)", border: "none", borderRadius: 6, padding: "6px 12px", color: "#A78BFA", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                      Full Report <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
                <div style={{ padding: "18px 20px" }}>
                  <div style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(255,255,255,0.85)", marginBottom: 18 }}>
                    {insights.summary}
                  </div>
                  {insights.highlights && insights.highlights.length > 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      {insights.highlights.slice(0, 2).map((h, i) => (
                        <div key={i} style={{ padding: "12px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)" }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>{h.title}</div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{h.detail}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {service ? (
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
                      const val = latest.platforms?.[p.id] || 0, prevVal = prev.platforms?.[p.id] || 0;
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
            ) : (
              <div style={{ padding: 60, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
                {loading ? <Loader size={24} className="spin" /> : "No data available. Please select a service or upload a CSV."}
              </div>
            )}
          </>
        )}

        {/* ═══ TRENDS ═══ */}
        {activeTab === "trends" && service && (
          <div style={{ display: "grid", gap: 14 }}>
            <div style={card}>
              <h3 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>
                Total Viewers Trend — {service.name}
                {filtered.length > 0 && <span style={{ fontWeight: 500, color: "rgba(255,255,255,0.3)", fontSize: 10, marginLeft: 8 }}>Wk {getWeekNumber(filtered[0].date)}–{getWeekNumber(filtered[filtered.length - 1].date)}</span>}
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <C data={filtered} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} tickFormatter={v => v?.slice(5)} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} tickFormatter={fmt} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} />
                  <Tooltip contentStyle={{ background: "#1a1a30", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 11, color: "#fff" }} formatter={v => [fmt(v), "Total"]} />
                  <D type="monotone" dataKey="total" stroke={service.color} fill={chartType === "area" ? `${service.color}20` : service.color} strokeWidth={2.5} dot={chartType !== "bar"} radius={chartType === "bar" ? [3, 3, 0, 0] : undefined} connectNulls />
                </C>
              </ResponsiveContainer>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10 }}>
              {service.platforms.map(p => {
                const has = filtered.some(d => (d.platforms?.[p.id] || 0) > 0);
                return (
                  <div key={p.id} style={card}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                      <span style={{ color: p.color, fontWeight: 800, fontSize: 13 }}>{p.icon}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{p.name}</span>
                    </div>
                    {has ? (
                      <ResponsiveContainer width="100%" height={110}>
                        <C data={filtered} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                          <D type="monotone" dataKey={row => row.platforms?.[p.id] || 0} stroke={p.color} fill={chartType === "area" ? `${p.color}15` : p.color} strokeWidth={2} dot={false} radius={chartType === "bar" ? [2, 2, 0, 0] : undefined} connectNulls />
                          <Tooltip contentStyle={{ background: "#1a1a30", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 11, color: "#fff" }} formatter={v => [fmt(v), p.name]} />
                        </C>
                      </ResponsiveContainer>
                    ) : <div style={{ height: 110, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.12)", fontSize: 11 }}>No data</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ WEEKLY COMPARISON ═══ */}
        {activeTab === "weekly" && service && (
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
                            <td key={p.id} style={{ padding: "9px 8px", textAlign: "right", color: "rgba(255,255,255,0.5)", fontFamily: "'Space Mono', monospace", fontSize: 10 }}>{fmt(row.platforms?.[p.id] || 0)}</td>
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
                  {config.map(svc => <Bar key={svc.id} dataKey={svc.id} name={svc.short} fill={`${svc.color}D0`} stroke={svc.color} strokeWidth={1} radius={[2, 2, 0, 0]} />)}
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10 }}>
              {config.map(svc => {
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
                    <div style={{ marginTop: 8, fontSize: 10, color: "rgba(255,255,255,0.25)" }}>{d.length} weeks</div>
                  </div>
                );
              })}
            </div>
            {specialEvents.length > 0 && (
              <div style={card}>
                <h3 style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>Special Events</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
                  {specialEvents.map((evt, i) => (
                    <div key={i} style={{ padding: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#F59E0B" }}>{evt.name}</span>
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>{evt.dates}</span>
                      </div>
                      <ResponsiveContainer width="100%" height={120}>
                        <BarChart data={evt.data}>
                          <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} />
                          <Tooltip contentStyle={{ background: "#1a1a30", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 11, color: "#fff" }} cursor={{ fill: 'rgba(255,255,255,0.04)' }} formatter={v => [fmt(v), "Total"]} />
                          <Bar dataKey="total" fill="#F59E0B" fillOpacity={0.85} radius={[3, 3, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ DATA TABLE ═══ */}
        {activeTab === "table" && service && (
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
                        <td key={p.id} style={{ padding: "9px 8px", textAlign: "right", color: "rgba(255,255,255,0.45)", fontFamily: "'Space Mono', monospace", fontSize: 10 }}>{fmt(row.platforms?.[p.id] || 0)}</td>
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
          <span>StreamPulse Analytics · {config.reduce((s, svc) => s + (data[svc.id] || []).length, 0)} entries across {config.length} services</span>
          <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
          <span style={{ display: "flex", alignItems: "center", gap: 3, color: ["admin", "editor"].includes(user.role) ? "#34D399" : "rgba(255,255,255,0.15)" }}>
            {["admin", "editor"].includes(user.role) ? <><Shield size={8} /> <span style={{ textTransform: "capitalize" }}>{user.role} Mode</span></> : <><Lock size={8} /> View Only</>}
          </span>
        </div>
      </div>

      {showEntry && ["admin", "editor"].includes(user.role) && service && <EntryModal onClose={() => setShowEntry(false)} onSubmit={addEntry} service={service} />}
      {showUpload && ["admin", "editor"].includes(user.role) && <UploadModal onClose={() => setShowUpload(false)} onUploadComplete={() => { loadData(); setTimeout(loadInsights, 5000); }} color={service?.color || "#6366F1"} gradient={service?.gradient || ["#6366F1", "#4F46E5"]} />}
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} config={config} />}
      {showInsights && <InsightsPanel
        insights={insights}
        onClose={() => { setShowInsights(false); setInsightsError(null); }}
        onGenerate={generateInsights}
        isAdmin={["admin", "editor"].includes(user.role)}
        isLoading={insightsLoading}
        error={insightsError}
      />}
      {loading && <div style={{ position: "fixed", inset: 0, background: "rgba(10,10,25,0.95)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 300 }}>
        <Database size={40} color="#6366F1" style={{ marginBottom: 16, animation: "pulse 1.5s ease-in-out infinite" }} />
        <div style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>Loading dashboard...</div>
        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 6 }}>Connecting to database</div>
        <style>{`@keyframes pulse { 0%,100%{opacity:0.4;transform:scale(0.95)} 50%{opacity:1;transform:scale(1.05)} }`}</style>
      </div>}
      {apiError && !loading && <div style={{ position: "fixed", inset: 0, background: "rgba(10,10,25,0.97)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}>
        <div style={{ background: "#161628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: 36, maxWidth: 460, textAlign: "center" }}>
          <AlertCircle size={40} color="#F87171" style={{ marginBottom: 16 }} />
          <div style={{ color: "#fff", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Cannot Connect to Server</div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
            The dashboard needs the Node.js server running.<br />
            Make sure you started it correctly:
          </div>
          <div style={{ background: "rgba(0,0,0,0.4)", borderRadius: 10, padding: 16, textAlign: "left", marginBottom: 20 }}>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Option 1 — Double-click</div>
            <div style={{ color: "#34D399", fontSize: 13, fontFamily: "'Space Mono',monospace" }}>start.command</div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, marginTop: 16 }}>Option 2 — Terminal</div>
            <div style={{ color: "#34D399", fontSize: 13, fontFamily: "'Space Mono',monospace" }}>npm install</div>
            <div style={{ color: "#34D399", fontSize: 13, fontFamily: "'Space Mono',monospace" }}>node server.js</div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, marginTop: 16 }}>Then open</div>
            <div style={{ color: "#6366F1", fontSize: 13, fontFamily: "'Space Mono',monospace" }}>http://localhost:8000</div>
          </div>
          <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, marginBottom: 16 }}>Error: {apiError}</div>
          <button onClick={loadData} style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)", border: "none", borderRadius: 10, padding: "10px 24px", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}><RefreshCw size={14} /> Retry Connection</button>
        </div>
      </div>}
    </div>
  );
}
