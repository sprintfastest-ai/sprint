import { useState } from "react";

const FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";
const C = { blue: "#1A6BB5", orange: "#F05A1A", green: "#6DC400", danger: "#C0392B", text: "#1A1A1A", grey: "#6B7280", border: "#E0E0E0", surface: "#FFFFFF", bg: "#F8F9FA" };

const DISTANCES = ["20m", "30m", "60m", "100m", "200m"];
const TABS_SUB  = ["PBs", "Log Time", "History"];
const TABS_BAR  = [
  { label: "Home",     icon: "home"     },
  { label: "Training", icon: "calendar" },
  { label: "Chat",     icon: "chat"     },
  { label: "Progress", icon: "chart"    },
  { label: "Profile",  icon: "person"   },
];

const RECENT = [
  { dist: "100m", time: "13.2s", date: "28 May", faster: true  },
  { dist: "100m", time: "13.5s", date: "14 May", faster: false },
  { dist: "60m",  time: "8.0s",  date: "12 May", faster: true  },
];

export function LogTime() {
  const [distIdx, setDistIdx] = useState(3); // 100m selected
  const [sec,   setSec]   = useState("13");
  const [cents, setCents] = useState("2");
  const [ms,    setMs]    = useState("40");
  const [focus, setFocus] = useState<string | null>(null);
  const [logged, setLogged] = useState<"pb" | "nopb" | null>(null);
  const [subTab, setSubTab] = useState(1);

  function handleLog() {
    setLogged("pb");
  }

  return (
    <div style={{ padding: "48px 48px 80px", fontFamily: FONT }}>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, letterSpacing: "-0.4px", marginBottom: 4 }}>Log Time Screen</h1>
        <p style={{ fontSize: 14, color: C.grey }}>iPhone 14 Pro frame — Progress › Log Time tab</p>
        <div style={{ height: 1, backgroundColor: C.border, marginTop: 24 }} />
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{
          width: 393,
          height: 852,
          backgroundColor: C.bg,
          borderRadius: 50,
          boxShadow: "0 0 0 10px #1A1A1A, 0 0 0 12px #2A2A2A, 0 32px 80px rgba(0,0,0,0.40)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          position: "relative",
        }}>
          {/* Dynamic Island */}
          <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", width: 120, height: 34, backgroundColor: "#000", borderRadius: 20, zIndex: 10 }} />

          {/* Status bar */}
          <div style={{ height: 59, flexShrink: 0, backgroundColor: C.surface, display: "flex", alignItems: "flex-end", justifyContent: "space-between", paddingLeft: 28, paddingRight: 24, paddingBottom: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>9:41</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <SignalIcon /><WifiIcon /><BatteryIcon />
            </div>
          </div>

          {/* Screen heading + sub-tabs */}
          <div style={{ backgroundColor: C.surface, paddingTop: 14, paddingLeft: 20, paddingRight: 20, paddingBottom: 0 }}>
            <p style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 14, letterSpacing: "-0.2px" }}>Progress</p>
            <div style={{ display: "flex" }}>
              {TABS_SUB.map((t, i) => (
                <button key={t} onClick={() => setSubTab(i)} style={{ flex: 1, background: "none", border: "none", borderBottom: subTab === i ? `2px solid ${C.blue}` : "2px solid transparent", paddingBottom: 10, fontSize: 13, fontWeight: subTab === i ? 600 : 400, color: subTab === i ? C.blue : C.grey, cursor: "pointer", fontFamily: FONT, textAlign: "center" }}>{t}</button>
              ))}
            </div>
            <div style={{ height: 1, backgroundColor: C.border, marginLeft: -20, marginRight: -20 }} />
          </div>

          {/* Scrollable content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 24px" }}>

            {/* ── Distance selector ── */}
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              {DISTANCES.map((d, i) => (
                <button key={d} onClick={() => setDistIdx(i)} style={{
                  flex: 1,
                  height: 36,
                  borderRadius: 10,
                  border: distIdx === i ? "none" : `1px solid ${C.border}`,
                  backgroundColor: distIdx === i ? C.blue : C.surface,
                  color: distIdx === i ? "#FFFFFF" : C.grey,
                  fontSize: 13,
                  fontWeight: distIdx === i ? 700 : 400,
                  cursor: "pointer",
                  fontFamily: FONT,
                  boxShadow: distIdx === i ? "0 2px 8px rgba(26,107,181,0.28)" : "none",
                  transition: "all 0.15s",
                }}>{d}</button>
              ))}
            </div>

            <p style={{ fontSize: 13, color: C.grey, textAlign: "center", marginBottom: 24 }}>
              {DISTANCES[distIdx]} — Current PB: {distIdx === 3 ? "13.2s" : "—"}
            </p>

            {/* ── Time input hero ── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 6 }}>

              {/* Seconds */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <input
                  inputMode="numeric"
                  maxLength={2}
                  value={sec}
                  onFocus={() => setFocus("sec")}
                  onBlur={() => setFocus(null)}
                  onChange={e => setSec(e.target.value.replace(/\D/g,""))}
                  style={{ width: 80, height: 72, borderRadius: 12, border: `2px solid ${focus === "sec" ? C.blue : C.border}`, backgroundColor: C.surface, textAlign: "center", fontSize: 32, fontWeight: 700, color: C.text, outline: "none", fontFamily: FONT, boxSizing: "border-box" }}
                />
                <span style={{ fontSize: 11, color: C.grey, marginTop: 5 }}>sec</span>
              </div>

              {/* Colon separator */}
              <span style={{ fontSize: 28, fontWeight: 700, color: C.grey, margin: "0 4px", paddingBottom: 18 }}>:</span>

              {/* Centiseconds */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <input
                  inputMode="numeric"
                  maxLength={2}
                  value={cents}
                  onFocus={() => setFocus("cents")}
                  onBlur={() => setFocus(null)}
                  onChange={e => setCents(e.target.value.replace(/\D/g,""))}
                  style={{ width: 80, height: 72, borderRadius: 12, border: `2px solid ${focus === "cents" ? C.blue : C.border}`, backgroundColor: C.surface, textAlign: "center", fontSize: 32, fontWeight: 700, color: C.text, outline: "none", fontFamily: FONT, boxSizing: "border-box" }}
                />
                <span style={{ fontSize: 11, color: C.grey, marginTop: 5 }}>&nbsp;</span>
              </div>

              {/* Dot separator */}
              <span style={{ fontSize: 28, fontWeight: 700, color: C.grey, margin: "0 4px", paddingBottom: 18 }}>.</span>

              {/* Milliseconds */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <input
                  inputMode="numeric"
                  maxLength={2}
                  value={ms}
                  onFocus={() => setFocus("ms")}
                  onBlur={() => setFocus(null)}
                  onChange={e => setMs(e.target.value.replace(/\D/g,""))}
                  style={{ width: 80, height: 72, borderRadius: 12, border: `2px solid ${focus === "ms" ? C.blue : C.border}`, backgroundColor: C.surface, textAlign: "center", fontSize: 32, fontWeight: 700, color: C.text, outline: "none", fontFamily: FONT, boxSizing: "border-box" }}
                />
                <span style={{ fontSize: 11, color: C.grey, marginTop: 5 }}>ms</span>
              </div>
            </div>

            {/* Caption */}
            <p style={{ fontSize: 12, color: C.grey, textAlign: "center", marginBottom: 24 }}>
              seconds : tenths . hundredths
            </p>

            {/* Log button */}
            <button
              onClick={handleLog}
              style={{ width: "100%", height: 48, borderRadius: 10, backgroundColor: C.orange, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 14, boxShadow: "0 2px 10px rgba(240,90,26,0.28)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#FFFFFF", fontFamily: FONT }}>Log This Time</span>
            </button>

            {/* Result banner */}
            {logged === "pb" && (
              <div style={{ backgroundColor: C.green, borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, marginBottom: 20, boxShadow: "0 2px 10px rgba(109,196,0,0.30)" }}>
                <span style={{ fontSize: 20 }}>🏆</span>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#FFFFFF", lineHeight: 1.4 }}>
                  New PB! Down from 13.5s — that's 0.3s faster!
                </p>
              </div>
            )}
            {logged === "nopb" && (
              <div style={{ backgroundColor: C.bg, borderRadius: 12, padding: "12px 16px", marginBottom: 20, border: `1px solid ${C.border}` }}>
                <p style={{ fontSize: 13, color: C.text, lineHeight: 1.4 }}>
                  Logged — your PB is still 13.2s. Keep training!
                </p>
              </div>
            )}

            {/* Demo: show "not PB" button */}
            {!logged && (
              <button onClick={() => setLogged("nopb")} style={{ width: "100%", background: "none", border: "none", cursor: "pointer", marginBottom: 20 }}>
                <span style={{ fontSize: 12, color: C.grey }}>Preview "not PB" result →</span>
              </button>
            )}

            {/* ── Recent entries ── */}
            <p style={{ fontSize: 13, fontWeight: 600, color: C.grey, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>Recent</p>

            <div style={{ backgroundColor: C.surface, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.07)", overflow: "hidden" }}>
              {RECENT.map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", borderBottom: i < RECENT.length - 1 ? `1px solid ${C.border}` : "none" }}>
                  {/* Distance pill */}
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.blue, backgroundColor: "#EBF5FB", borderRadius: 20, paddingLeft: 10, paddingRight: 10, paddingTop: 4, paddingBottom: 4, flexShrink: 0 }}>{r.dist}</span>

                  {/* Time */}
                  <span style={{ fontSize: 16, fontWeight: 700, color: C.text, flex: 1 }}>{r.time}</span>

                  {/* Date */}
                  <span style={{ fontSize: 12, color: C.grey }}>{r.date}</span>

                  {/* Trend arrow */}
                  <div style={{ width: 24, height: 24, borderRadius: "50%", backgroundColor: r.faster ? `${C.green}18` : `rgba(192,57,43,0.10)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={r.faster ? C.green : "#C0392B"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      {r.faster
                        ? <><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></>
                        : <><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></>
                      }
                    </svg>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Bottom tab bar */}
          <div style={{ height: 64, flexShrink: 0, backgroundColor: C.surface, borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-around" }}>
            {TABS_BAR.map((t, i) => {
              const active = i === 3;
              return (
                <button key={t.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", padding: "0 8px", minWidth: 44, minHeight: 44, justifyContent: "center" }}>
                  <span style={{ color: active ? C.blue : C.grey, display: "flex" }}><TabIcon type={t.icon} filled={active} /></span>
                  <span style={{ fontSize: 11, fontWeight: active ? 600 : 400, color: active ? C.blue : C.grey }}>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Home indicator */}
          <div style={{ height: 34, flexShrink: 0, backgroundColor: C.surface, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 134, height: 5, backgroundColor: "#1A1A1A", borderRadius: 3, opacity: 0.2 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab icons ─────────────────────────────────────────────────

function TabIcon({ type, filled }: { type: string; filled: boolean }) {
  const s = { width: 22, height: 22, fill: "none" as const, stroke: "currentColor" as const, strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (type) {
    case "home":
      return <svg {...s} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"}><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><polyline points="9 21 9 12 15 12 15 21"/></svg>;
    case "calendar":
      return <svg {...s} viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" fill={filled ? "currentColor" : "none"} fillOpacity={filled ? 0.18 : 0}/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
    case "chat":
      return <svg {...s} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
    case "chart":
      return <svg {...s} viewBox="0 0 24 24">
        {filled
          ? <><rect x="2" y="14" width="4" height="8" fill="currentColor" rx="1"/><rect x="9" y="9" width="4" height="13" fill="currentColor" rx="1"/><rect x="16" y="4" width="4" height="18" fill="currentColor" rx="1"/></>
          : <><rect x="2" y="14" width="4" height="8" rx="1"/><rect x="9" y="9" width="4" height="13" rx="1"/><rect x="16" y="4" width="4" height="18" rx="1"/></>}
      </svg>;
    case "person":
      return <svg {...s} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
    default: return null;
  }
}

// ── Status bar icons ──────────────────────────────────────────

function SignalIcon() {
  return <svg width="17" height="12" viewBox="0 0 17 12" fill={C.text}><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="4.5" y="5" width="3" height="7" rx="1"/><rect x="9" y="2" width="3" height="10" rx="1"/><rect x="13.5" y="0" width="3" height="12" rx="1"/></svg>;
}
function WifiIcon() {
  return <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke={C.text} strokeWidth="1.6" strokeLinecap="round"><path d="M1 4C3.8 1.5 12.2 1.5 15 4"/><path d="M3.2 6.5C5 4.8 11 4.8 12.8 6.5"/><path d="M5.5 9C6.5 8 9.5 8 10.5 9"/><circle cx="8" cy="11" r="1" fill={C.text} stroke="none"/></svg>;
}
function BatteryIcon() {
  return <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke={C.text} strokeOpacity="0.35"/><rect x="2" y="2" width="17" height="8" rx="2" fill={C.text}/><path d="M23 4v4a2 2 0 000-4z" fill={C.text} fillOpacity="0.4"/></svg>;
}
