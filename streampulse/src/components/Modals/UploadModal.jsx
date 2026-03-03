import { useState } from "react";
import { X, UploadCloud, FileText, Upload, Check, AlertCircle, Loader2 } from "lucide-react";
import { API_BASE } from "../../utils/config";

export function UploadModal({ onClose, adminToken, onUploadComplete, color, gradient }) {
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
                headers: { "Authorization": `Bearer ${adminToken}` },
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
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }} onClick={onClose}>
            <div onClick={e => e.stopPropagation()} style={{ background: "#161628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: 28, width: 440, maxHeight: "85vh", overflowY: "auto", animation: "fadeIn 0.2s ease-out" }}>
                <style>{`@keyframes fadeIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}`}</style>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <UploadCloud size={20} color="#fff" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#fff" }}>Upload CSV</h3>
                            <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Import viewer data from spreadsheet</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: 4 }}><X size={18} /></button>
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
                    <input id="csv-file-input" type="file" accept=".csv" onChange={handleFileSelect} style={{ display: "none" }} />
                    {file ? (
                        <div style={{ display: "flex", alignItems: "center", justifycontent: "center", gap: 10 }}>
                            <FileText size={20} color={color} />
                            <div>
                                <div style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{file.name}</div>
                                <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10 }}>{(file.size / 1024).toFixed(1)} KB</div>
                            </div>
                            <button onClick={e => { e.stopPropagation(); setFile(null); setResult(null); }}
                                style={{ background: "rgba(248,113,113,0.1)", border: "none", borderRadius: 6, padding: 4, cursor: "pointer", color: "#F87171" }}>
                                <X size={14} />
                            </button>
                        </div>
                    ) : (
                        <>
                            <Upload size={28} color="rgba(255,255,255,0.15)" style={{ marginBottom: 8 }} />
                            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 500 }}>Drop CSV file here or click to browse</div>
                            <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, marginTop: 4 }}>Supports the JHB multi-service format</div>
                        </>
                    )}
                </div>

                {/* Mode selector */}
                <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>Import Mode</div>
                    <div style={{ display: "flex", gap: 8 }}>
                        {[
                            { id: "merge", label: "Merge / Append", desc: "Add new weeks, update existing" },
                            { id: "replace", label: "Replace All", desc: "Clear all data, import fresh" },
                        ].map(m => (
                            <button key={m.id} onClick={() => setMode(m.id)}
                                style={{
                                    flex: 1, padding: "10px 12px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                                    background: mode === m.id ? `${color}12` : "rgba(255,255,255,0.02)",
                                    border: `1.5px solid ${mode === m.id ? `${color}40` : "rgba(255,255,255,0.06)"}`,
                                    transition: "all 0.2s",
                                }}>
                                <div style={{ color: mode === m.id ? "#fff" : "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{m.label}</div>
                                <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 10 }}>{m.desc}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Result */}
                {result && (
                    <div style={{ padding: 14, borderRadius: 10, background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)", marginBottom: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                            <Check size={14} color="#34D399" />
                            <span style={{ color: "#34D399", fontSize: 12, fontWeight: 600 }}>Upload Successful</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "'Space Mono',monospace" }}>{result.rows}</div>
                                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>Total Rows</div>
                            </div>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 18, fontWeight: 700, color: "#34D399", fontFamily: "'Space Mono',monospace" }}>{result.added}</div>
                                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>New</div>
                            </div>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 18, fontWeight: 700, color: "#F59E0B", fontFamily: "'Space Mono',monospace" }}>{result.updated}</div>
                                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>Updated</div>
                            </div>
                        </div>
                        {result.stats && (
                            <div style={{ marginTop: 10, padding: "8px 10px", background: "rgba(255,255,255,0.03)", borderRadius: 8 }}>
                                {Object.entries(result.stats).map(([svc, s]) => (
                                    <div key={svc} style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(255,255,255,0.4)", padding: "2px 0" }}>
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
                    <div style={{ padding: 12, borderRadius: 10, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                        <AlertCircle size={14} color="#F87171" />
                        <span style={{ color: "#F87171", fontSize: 11 }}>{error}</span>
                    </div>
                )}

                {/* Actions */}
                <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={onClose} style={{ flex: 1, padding: 11, borderRadius: 9, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                        {result ? "Done" : "Cancel"}
                    </button>
                    {!result && (
                        <button onClick={handleUpload} disabled={!file || uploading}
                            style={{
                                flex: 1, padding: 11, borderRadius: 9, border: "none",
                                background: file && !uploading ? `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})` : "rgba(255,255,255,0.06)",
                                color: file && !uploading ? "#fff" : "rgba(255,255,255,0.2)",
                                cursor: file && !uploading ? "pointer" : "not-allowed",
                                fontSize: 12, fontWeight: 600, transition: "all 0.2s",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                            }}>
                            {uploading ? <><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Uploading...</> : <><UploadCloud size={13} /> Upload &amp; Import</>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
