import { X, Monitor, Layers, BarChart3, Eye, TrendingUp, Calendar, FileText, Filter, Search, Bell, Shield, Plus, UploadCloud, Download, Sparkles, Zap, Info, Database, CheckCircle } from "lucide-react";

export function AboutModal({ onClose, config = [] }) {
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
                                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#fff" }}>StreamPulse Analytics</h2>
                                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>v3.0 — Generic Streaming Analytics Dashboard</div>
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
                        StreamPulse tracks online streaming viewers across multiple platforms
                        and services. It provides weekly analytics, trend analysis, and special event tracking to help
                        leadership understand audience engagement and growth patterns.
                    </p>

                    <div style={divider} />

                    {/* Services */}
                    <div style={sectionTitle}><Layers size={15} color="#EC4899" /> Services Tracked</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 4 }}>
                        {config.map(svc => (
                            <div key={svc.id} style={featureCard}>
                                <div style={featureTitle}><span style={{ width: 8, height: 8, borderRadius: "50%", background: svc.color || "#6366F1" }}></span> {svc.name}</div>
                                <div style={featureText}>{svc.platforms.map(p => p.name).join(", ")}</div>
                            </div>
                        ))}
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
                        <div style={featureText}>Cross-service comparison on one chart — compare all your configured services side by side. Special Events are also displayed at the bottom of this tab.</div>
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
                        </div>
                    </div>
                    <div style={featureCard}>
                        <div style={featureTitle}><Download size={13} color="#34D399" /> Export CSV</div>
                        <div style={featureText}>Download all data as a CSV file. Available to all users (no admin required). Includes all services, dates, and platform columns.</div>
                    </div>

                    <div style={divider} />

                    {/* Zero-Config, Private Data */}
                    <div style={sectionTitle}><Database size={15} color="#10B981" /> Zero-Config, Private Data</div>
                    <p style={text}>
                        StreamPulse is designed for maximum privacy and minimal setup.
                    </p>
                    <div style={featureCard}>
                        <div style={featureTitle}><Shield size={13} color="#10B981" /> 100% Local Storage</div>
                        <div style={featureText}>
                            All viewer data is stored in a fast, lightweight SQLite database (<span style={kbd}>data.db</span>).
                            No cloud accounts, subscriptions, or external servers are required to store your organization's analytics.
                        </div>
                    </div>
                    <div style={featureCard}>
                        <div style={featureTitle}><Database size={13} color="#34D399" /> Portable & Secure</div>
                        <div style={featureText}>
                            Because everything is in one local file, backups are as simple as copying <span style={kbd}>data.db</span>.
                            Your data never leaves your network unless you choose to send it to Claude for AI Insights.
                        </div>
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

                    <div style={divider} />

                    {/* Quick Tips */}
                    <div style={sectionTitle}><CheckCircle size={15} color="#6366F1" /> Quick Tips</div>
                    <div style={{ ...text, lineHeight: 2 }}>
                        <span style={{ color: "rgba(255,255,255,0.65)" }}>•</span> Switch between services using the colored tabs below the header<br />
                        <span style={{ color: "rgba(255,255,255,0.65)" }}>•</span> Hover over any chart element to see detailed tooltip data<br />
                        <span style={{ color: "rgba(255,255,255,0.65)" }}>•</span> Upload new CSV data anytime — Merge mode keeps existing data safe
                    </div>

                    {/* Footer */}
                    <div style={{ marginTop: 20, padding: "14px 0 0", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>StreamPulse Analytics © 2026</div>
                        <button onClick={onClose} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #6366F1, #4F46E5)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                            Got it!
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
