import { useState } from "react";
import { X, Sparkles, RefreshCw, Loader, AlertCircle, MessageSquare, TrendingUp, TrendingDown, Star, Zap, BarChart3, CheckCircle, Info, Copy, Check } from "lucide-react";

const INSIGHT_ICONS = {
    trending_up: TrendingUp,
    trending_down: TrendingDown,
    star: Star,
    alert: AlertCircle,
    zap: Zap,
};

const SEVERITY_STYLES = {
    info: { bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.2)", color: "#818CF8", icon: Info },
    warning: { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", color: "#F59E0B", icon: AlertCircle },
    success: { bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.2)", color: "#34D399", icon: CheckCircle },
};

const SERVICE_COLORS = { jhb: "#6366F1", insights: "#F59E0B", charlotte: "#EC4899", biblestudy: "#10B981", all: "#818CF8" };

export function InsightsPanel({ insights, onClose, onGenerate, isAdmin, isLoading, error }) {
    const overlay = { position: "fixed", inset: 0, background: "rgba(5,5,15,0.85)", backdropFilter: "blur(8px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 };
    const modal = { background: "#12122a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, width: "100%", maxWidth: 680, maxHeight: "85vh", overflow: "auto", position: "relative" };

    const hasData = insights && insights.available;
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
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
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

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
                        <div style={{ display: "flex", gap: 10 }}>
                            {hasData && (
                                <button onClick={handleCopy} style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
                                    {copied ? <Check size={14} color="#34D399" /> : <Copy size={14} />} {copied ? "Copied!" : "Copy Report"}
                                </button>
                            )}
                            <button onClick={onClose} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #8B5CF6, #6366F1)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
