import { useState } from "react";

const FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";
const C = { blue: "#1A6BB5", orange: "#F05A1A", green: "#6DC400", text: "#1A1A1A", grey: "#6B7280", border: "#E0E0E0", surface: "#FFFFFF", bg: "#F8F9FA", orangeLight: "#FEF3EC" };

const DAYS = [
  { abbr: "Mon", date: 2,  state: "active"    },
  { abbr: "Tue", date: 3,  state: "completed" },
  { abbr: "Wed", date: 4,  state: "upcoming"  },
  { abbr: "Thu", date: 5,  state: "upcoming"  },
  { abbr: "Fri", date: 6,  state: "upcoming"  },
  { abbr: "Sat", date: 7,  state: "upcoming"  },
  { abbr: "Sun", date: 8,  state: "upcoming"  },
];

const DRILLS = [
  { name: "A-Skip",       detail: "4 sets × 20m",   cue: "Drive your knees high"              },
  { name: "Wall Drives",  detail: "3 sets × 10 reps",cue: "Stay at 45 degrees"                },
  { name: "Block Starts", detail: "5 runs × 30m",   cue: "Explosive first 3 steps"            },
  { name: "Flying 30s",   detail: "4 runs × 30m",   cue: "Reach top speed before the cone"   },
];

const TABS = [
  { label: "Home",     icon: "home"     },
  { label: "Training", icon: "calendar" },
  { label: "Chat",     icon: "chat"     },
  { label: "Progress", icon: "chart"    },
  { label: "Profile",  icon: "person"   },
];

export function TrainingPlan() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);

  return (
    <div style={{ padding: "48px 48px 80px", fontFamily: FONT }}>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, letterSpacing: "-0.4px", marginBottom: 4 }}>Training Plan Screen</h1>
        <p style={{ fontSize: 14, color: C.grey }}>iPhone 14 Pro frame — weekly plan · Marcus · U15 · 100m</p>
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

          {/* Header */}
          <div style={{ backgroundColor: C.surface, padding: "16px 20px 0" }}>
            <p style={{ fontSize: 20, fontWeight: 700, color: C.text, letterSpacing: "-0.3px", marginBottom: 2 }}>Training Plan</p>
            <p style={{ fontSize: 13, color: C.grey, marginBottom: 16 }}>Week of 2 Jun</p>

            {/* Day strip */}
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 16, marginLeft: -20, marginRight: -20, paddingLeft: 20, paddingRight: 20 }}>
              {DAYS.map((d, i) => {
                const isActive    = d.state === "active";
                const isCompleted = d.state === "completed";
                const isSelected  = i === selectedDay;
                return (
                  <button
                    key={d.abbr}
                    onClick={() => setSelectedDay(i)}
                    style={{
                      flexShrink: 0,
                      width: 52,
                      height: 60,
                      borderRadius: 10,
                      border: isActive
                        ? "none"
                        : isCompleted
                          ? `1.5px solid ${C.green}`
                          : `1px solid ${C.border}`,
                      backgroundColor: isActive ? C.blue : C.surface,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4,
                      cursor: "pointer",
                      padding: 0,
                      boxShadow: isActive ? "0 2px 8px rgba(26,107,181,0.30)" : "none",
                    }}
                  >
                    <span style={{ fontSize: 11, fontWeight: 600, color: isActive ? "#FFFFFF" : isCompleted ? C.green : C.grey, letterSpacing: "0.04em" }}>
                      {d.abbr}
                    </span>
                    {isCompleted ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="9" fill={C.green} />
                        <polyline points="8 12 11 15 16 9" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <span style={{ fontSize: 16, fontWeight: 700, color: isActive ? "#FFFFFF" : C.grey, lineHeight: 1 }}>
                        {d.date}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scrollable content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px 20px" }}>

            {/* Session card */}
            <div style={{ backgroundColor: C.surface, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", borderLeft: `4px solid ${C.orange}`, overflow: "hidden" }}>

              {/* Card header */}
              <div style={{ padding: "16px 16px 12px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 18, fontWeight: 700, color: C.text, letterSpacing: "-0.2px" }}>Acceleration Focus</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: C.grey, backgroundColor: C.bg, borderRadius: 20, paddingLeft: 10, paddingRight: 10, paddingTop: 4, paddingBottom: 4, border: `1px solid ${C.border}` }}>45 min</span>
                </div>
                <p style={{ fontSize: 13, color: C.grey }}>Drive phase mechanics · 4 drills</p>
              </div>

              <div style={{ height: 1, backgroundColor: C.border, marginLeft: 16, marginRight: 16 }} />

              {/* Drill list */}
              <div>
                {DRILLS.map((drill, i) => {
                  const isExpanded = expanded === i;
                  return (
                    <div key={drill.name}>
                      <button
                        onClick={() => setExpanded(isExpanded ? null : i)}
                        style={{ width: "100%", background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}
                      >
                        <div style={{ height: 64, display: "flex", alignItems: "center", gap: 12, paddingLeft: 16, paddingRight: 14, borderBottom: i < DRILLS.length - 1 || isExpanded ? `1px solid ${C.border}` : "none" }}>
                          {/* Number circle */}
                          <div style={{ width: 30, height: 30, borderRadius: "50%", backgroundColor: C.blue, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF" }}>{i + 1}</span>
                          </div>

                          {/* Drill info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 15, fontWeight: 600, color: C.text, lineHeight: 1.2, marginBottom: 2 }}>{drill.name}</p>
                            <p style={{ fontSize: 13, color: C.grey }}>{drill.detail}</p>
                          </div>

                          {/* Chevron */}
                          <svg
                            width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.grey} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            style={{ flexShrink: 0, transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.18s" }}
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </div>
                      </button>

                      {/* Expanded cue */}
                      {isExpanded && (
                        <div style={{ backgroundColor: "#F5F9FF", padding: "10px 16px 10px 58px", borderBottom: i < DRILLS.length - 1 ? `1px solid ${C.border}` : "none" }}>
                          <p style={{ fontSize: 13, color: C.blue, fontStyle: "italic", lineHeight: 1.45 }}>💡 {drill.cue}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Coaching cue banner */}
              <div style={{ margin: "0 16px 16px", marginTop: 14, backgroundColor: C.orangeLight, borderLeft: `4px solid ${C.orange}`, borderRadius: "0 8px 8px 0", padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: 10 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.orange} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                  <path d="M3 11l19-9-9 19-2-8-8-2z"/>
                </svg>
                <p style={{ fontSize: 13, color: C.text, lineHeight: 1.5, fontStyle: "italic" }}>
                  <span style={{ fontStyle: "normal", fontWeight: 600, color: C.orange }}>Coach's Cue: </span>
                  Keep your hips tall throughout the acceleration phase. Don't rush the transition to upright running.
                </p>
              </div>

              {/* Complete session button */}
              <div style={{ padding: "0 16px 16px" }}>
                <button style={{ width: "100%", height: 48, borderRadius: 10, backgroundColor: C.green, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: `0 2px 10px rgba(109,196,0,0.30)` }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#FFFFFF", fontFamily: FONT }}>Complete Session</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom tab bar */}
          <div style={{ height: 64, flexShrink: 0, backgroundColor: C.surface, borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-around" }}>
            {TABS.map((t, i) => {
              const active = i === 1;
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
