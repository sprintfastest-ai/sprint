import { useState } from "react";

const FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";
const C = { blue: "#1A6BB5", orange: "#F05A1A", green: "#6DC400", text: "#1A1A1A", grey: "#6B7280", border: "#E0E0E0", surface: "#FFFFFF", bg: "#F8F9FA" };

// Sparkline data — downward trend (times improving = lower = better)
const SPARK = [13.8, 13.6, 13.5, 13.4, 13.3, 13.2];
const SPARK_W = 220;
const SPARK_H = 40;
const SPARK_PAD = 4;
const minV = Math.min(...SPARK);
const maxV = Math.max(...SPARK);
const sparkPoints = SPARK.map((v, i) => {
  const x = SPARK_PAD + (i / (SPARK.length - 1)) * (SPARK_W - SPARK_PAD * 2);
  const y = SPARK_PAD + ((v - minV) / (maxV - minV)) * (SPARK_H - SPARK_PAD * 2);
  return `${x},${y}`;
}).join(" ");
const sparkFill = `${sparkPoints} ${SPARK_W - SPARK_PAD},${SPARK_H} ${SPARK_PAD},${SPARK_H}`;

const TABS_SUB = ["PBs", "Log Time", "History"];
const TABS_BAR = [
  { label: "Home",     icon: "home"     },
  { label: "Training", icon: "calendar" },
  { label: "Chat",     icon: "chat"     },
  { label: "Progress", icon: "chart"    },
  { label: "Profile",  icon: "person"   },
];

export function ProgressTracker() {
  const [subTab, setSubTab] = useState(0);

  return (
    <div style={{ padding: "48px 48px 80px", fontFamily: FONT }}>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, letterSpacing: "-0.4px", marginBottom: 4 }}>Progress Tracker · Personal Bests</h1>
        <p style={{ fontSize: 14, color: C.grey }}>iPhone 14 Pro frame — PB grid with sparkline · Marcus · U15</p>
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

          {/* Screen heading */}
          <div style={{ backgroundColor: C.surface, paddingTop: 14, paddingLeft: 20, paddingRight: 20, paddingBottom: 0 }}>
            <p style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 14, letterSpacing: "-0.2px" }}>Progress</p>

            {/* Sub-tabs */}
            <div style={{ display: "flex" }}>
              {TABS_SUB.map((t, i) => (
                <button
                  key={t}
                  onClick={() => setSubTab(i)}
                  style={{
                    flex: 1,
                    background: "none",
                    border: "none",
                    borderBottom: subTab === i ? `2px solid ${C.blue}` : "2px solid transparent",
                    paddingBottom: 10,
                    fontSize: 13,
                    fontWeight: subTab === i ? 600 : 400,
                    color: subTab === i ? C.blue : C.grey,
                    cursor: "pointer",
                    fontFamily: FONT,
                    textAlign: "center",
                  }}
                >{t}</button>
              ))}
            </div>
            <div style={{ height: 1, backgroundColor: C.border, marginLeft: -20, marginRight: -20 }} />
          </div>

          {/* Scrollable content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 20px" }}>

            {/* 2-col grid — 5 cards in 3 rows */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              {/* 20m */}
              <PBCard dist="20m" time="2.8s" date="15 May" />
              {/* 30m */}
              <PBCard dist="30m" time="4.1s" date="20 May" />
              {/* 60m */}
              <PBCard dist="60m" time="8.0s" date="12 May" />
              {/* 100m — hero card spanning full width */}
              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{
                  backgroundColor: C.surface,
                  borderRadius: 12,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  borderLeft: `4px solid ${C.green}`,
                  overflow: "hidden",
                  position: "relative",
                }}>
                  <div style={{ padding: "14px 14px 10px" }}>
                    {/* Header row */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, color: C.grey, fontWeight: 500 }}>100m</span>
                      {/* Trophy icon — most recent PB */}
                      <svg width="18" height="18" viewBox="0 0 24 24" fill={C.orange} stroke="none">
                        <path d="M8 2h8l1 5c0 3.3-2 6-5 7V17h2v2H10v-2h2v-3c-3-1-5-3.7-5-7L8 2z"/>
                        <path d="M5 4H3v2c0 1.8 1 3.3 2.5 4.1" fill="none" stroke={C.orange} strokeWidth="2" strokeLinecap="round"/>
                        <path d="M19 4h2v2c0 1.8-1 3.3-2.5 4.1" fill="none" stroke={C.orange} strokeWidth="2" strokeLinecap="round"/>
                        <rect x="7" y="19" width="10" height="2.5" rx="1" fill={C.orange}/>
                      </svg>
                    </div>
                    {/* Time + trend */}
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 2 }}>
                      <span style={{ fontSize: 28, fontWeight: 800, color: C.text, letterSpacing: "-0.5px", lineHeight: 1 }}>13.2s</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: C.green }}>↓ 0.3s in 4 weeks</span>
                    </div>
                    <span style={{ fontSize: 12, color: C.grey }}>Set 28 May</span>
                  </div>

                  {/* Sparkline */}
                  <div style={{ paddingLeft: 14, paddingRight: 14, paddingBottom: 12 }}>
                    <svg width="100%" height={SPARK_H} viewBox={`0 0 ${SPARK_W} ${SPARK_H}`} preserveAspectRatio="none">
                      {/* Fill */}
                      <polygon points={sparkFill} fill={`${C.green}18`} />
                      {/* Line */}
                      <polyline points={sparkPoints} fill="none" stroke={C.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      {/* Latest dot */}
                      {(() => {
                        const last = sparkPoints.split(" ").pop()!;
                        const [lx, ly] = last.split(",");
                        return <circle cx={lx} cy={ly} r="3.5" fill={C.green} />;
                      })()}
                    </svg>
                  </div>
                </div>
              </div>
              {/* 200m */}
              <PBCard dist="200m" time="28.4s" date="5 May" />
              {/* spacer — empty half if odd count */}
              <div />
            </div>

            {/* Full-width 400m card — no time */}
            <div style={{
              backgroundColor: C.surface,
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              padding: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div>
                <span style={{ fontSize: 13, color: C.grey, fontWeight: 500, display: "block", marginBottom: 4 }}>400m</span>
                <span style={{ fontSize: 28, fontWeight: 800, color: C.border, letterSpacing: "-0.5px", lineHeight: 1, display: "block", marginBottom: 6 }}>--</span>
                <span style={{ fontSize: 13, color: C.orange, fontWeight: 600, cursor: "pointer" }}>Tap to log your first time</span>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: "50%", border: `1.5px solid ${C.blue}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </div>
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

// ── Standard PB card ─────────────────────────────────────────

function PBCard({ dist, time, date }: { dist: string; time: string; date: string }) {
  return (
    <div style={{ backgroundColor: C.surface, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", padding: "14px 14px", minHeight: 90 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: C.grey, fontWeight: 500 }}>{dist}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.grey} strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>
          <line x1="9" y1="2" x2="15" y2="2"/><line x1="12" y1="2" x2="12" y2="4"/>
        </svg>
      </div>
      <span style={{ fontSize: 28, fontWeight: 800, color: C.text, letterSpacing: "-0.5px", lineHeight: 1, display: "block", marginBottom: 6 }}>{time}</span>
      <span style={{ fontSize: 12, color: C.grey }}>Set {date}</span>
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
