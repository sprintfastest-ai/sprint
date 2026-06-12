const FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";
const C = { blue: "#1A6BB5", orange: "#F05A1A", green: "#6DC400", text: "#1A1A1A", grey: "#6B7280", border: "#E0E0E0", surface: "#FFFFFF", bg: "#F8F9FA", blueLight: "#EBF5FB" };

const TABS = [
  { label: "Home",     icon: "home"     },
  { label: "Training", icon: "calendar" },
  { label: "Chat",     icon: "chat"     },
  { label: "Progress", icon: "chart"    },
  { label: "Profile",  icon: "person"   },
];

export function HomeScreen() {
  return (
    <div style={{ padding: "48px 48px 80px", fontFamily: FONT }}>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, letterSpacing: "-0.4px", marginBottom: 4 }}>Home Screen</h1>
        <p style={{ fontSize: 14, color: C.grey }}>iPhone 14 Pro frame — athlete dashboard · Marcus · U15 · 100m</p>
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

          {/* Scrollable body */}
          <div style={{ flex: 1, overflowY: "auto" }}>

            {/* Header */}
            <div style={{ backgroundColor: C.surface, padding: "16px 20px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: C.text, letterSpacing: "-0.3px" }}>Good morning, Marcus 👋</span>
                <button style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 01-3.46 0"/>
                  </svg>
                </button>
              </div>
              <span style={{ fontSize: 13, color: C.grey }}>Monday, 2 June 2026</span>
            </div>

            {/* Content padding */}
            <div style={{ padding: "16px 20px 20px", display: "flex", flexDirection: "column", gap: 12 }}>

              {/* ── Streak card ── */}
              <div style={{
                borderRadius: 12,
                overflow: "hidden",
                height: 100,
                position: "relative",
                background: "linear-gradient(135deg, #F05A1A 0%, #C44A12 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 20px",
              }}>
                {/* Speed-line texture */}
                <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.05 }} viewBox="0 0 353 100" preserveAspectRatio="none">
                  {[0,1,2,3,4,5,6,7,8].map(i => (
                    <line key={i} x1={i * 50 - 20} y1="0" x2={i * 50 + 60} y2="100" stroke="white" strokeWidth="18" />
                  ))}
                </svg>

                {/* Left — flame + streak count */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
                  {/* Radial glow behind flame */}
                  <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ position: "absolute", width: 72, height: 72, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,200,100,0.30) 0%, transparent 70%)", pointerEvents: "none" }} />
                    <svg width="48" height="58" viewBox="0 0 24 30" fill="white" style={{ position: "relative" }}>
                      <path d="M12 1C12 1 3 10 3 17a9 9 0 0018 0c0-4.5-3-9-3-9s-1.5 4.5-4.5 4.5c-1.5 0-3-1.5-3-3 0-3 1.5-6 1.5-9.5z"/>
                      <path d="M12 9C12 9 8 15 8 18a4 4 0 008 0c0-2.5-1.5-4.5-1.5-4.5s-.5 2-2.5 2c-.8 0-1.5-.7-1.5-1.5 0-1.5.5-3 .5-5z" fill="rgba(255,220,120,0.65)"/>
                    </svg>
                  </div>
                  <div>
                    <span style={{ fontSize: 40, fontWeight: 800, color: "#FFFFFF", lineHeight: 1, letterSpacing: "-1.5px", display: "block" }}>7</span>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>Day Streak</span>
                  </div>
                </div>

                {/* Right — best */}
                <div style={{ textAlign: "right", position: "relative" }}>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.90)", fontWeight: 500 }}>🏆 Best: 12 days</span>
                </div>
              </div>

              {/* ── Today's session card ── */}
              <div style={{ backgroundColor: C.surface, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", overflow: "hidden", borderLeft: `4px solid ${C.orange}` }}>
                <div style={{ padding: "16px" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.grey, letterSpacing: "0.08em", textTransform: "uppercase" }}>Today's Session</span>
                  <p style={{ fontSize: 18, fontWeight: 700, color: C.text, margin: "6px 0 10px", lineHeight: 1.2 }}>Acceleration Focus</p>

                  {/* Drill pills */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                    {["A-Skip", "Wall Drives", "Block Starts", "Flying 30s"].map(d => (
                      <span key={d} style={{ fontSize: 12, fontWeight: 500, color: C.grey, backgroundColor: C.bg, borderRadius: 20, paddingLeft: 10, paddingRight: 10, paddingTop: 4, paddingBottom: 4, border: `1px solid ${C.border}` }}>{d}</span>
                    ))}
                  </div>

                  {/* Footer row */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.grey} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      <span style={{ fontSize: 13, color: C.grey }}>Est. 45 min</span>
                    </div>
                    <div style={{ height: 34, borderRadius: 8, backgroundColor: C.orange, display: "flex", alignItems: "center", justifyContent: "center", paddingLeft: 14, paddingRight: 14, cursor: "pointer", boxShadow: "0 1px 6px rgba(240,90,26,0.28)" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF" }}>Start Session →</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Stats row ── */}
              <div style={{ display: "flex", gap: 12 }}>

                {/* Weekly goal */}
                <div style={{ flex: 1, backgroundColor: C.surface, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", padding: "16px 12px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <RingProgress value={3} max={5} color={C.green} size={72} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.grey, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 10 }}>Weekly Goal</span>
                </div>

                {/* Current PB */}
                <div style={{ flex: 1, backgroundColor: C.surface, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", padding: "16px 14px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.grey, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>100m PB</span>
                  <span style={{ fontSize: 28, fontWeight: 800, color: C.text, letterSpacing: "-0.5px", lineHeight: 1, marginBottom: 8 }}>13.2s</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" fill={C.green} />
                      <polyline points="8 12 11 15 16 9" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{ fontSize: 12, fontWeight: 600, color: C.green }}>Personal Best</span>
                  </div>
                </div>
              </div>

              {/* ── AI insight card ── */}
              <div style={{ backgroundColor: C.blueLight, borderRadius: "0 12px 12px 0", borderLeft: `4px solid ${C.blue}`, padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                  {/* Robot icon */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="8" width="18" height="12" rx="3"/>
                    <path d="M9 8V6a3 3 0 016 0v2"/>
                    <circle cx="9" cy="14" r="1.5" fill={C.blue} stroke="none"/>
                    <circle cx="15" cy="14" r="1.5" fill={C.blue} stroke="none"/>
                    <line x1="9.5" y1="17.5" x2="14.5" y2="17.5" strokeWidth="1.5"/>
                  </svg>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.blue }}>Your Coach's Take</span>
                </div>
                <p style={{ fontSize: 14, color: C.text, lineHeight: 1.55, marginBottom: 10 }}>
                  Your consistency has been excellent this week. Focus on explosive drive phase work today.
                </p>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <span style={{ fontSize: 12, color: C.grey }}>Updated today</span>
                </div>
              </div>

            </div>
          </div>

          {/* ── Bottom tab bar ── */}
          <div style={{ height: 64, flexShrink: 0, backgroundColor: C.surface, borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-around" }}>
            {TABS.map((t, i) => {
              const active = i === 0;
              return (
                <button key={t.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", padding: "0 8px", minWidth: 44, minHeight: 44, justifyContent: "center" }}>
                  <span style={{ color: active ? C.blue : C.grey, display: "flex" }}>
                    <TabIcon type={t.icon} filled={active} />
                  </span>
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

// ── Ring progress component ───────────────────────────────────

function RingProgress({ value, max, color, size }: { value: number; max: number; color: string; size: number }) {
  const strokeW = 9;
  const r = (size - strokeW * 2) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (value / max) * circ;
  const complete = value >= max;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.border} strokeWidth={strokeW} />
        {/* Filled arc */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circ}`}
          style={{ filter: `drop-shadow(0 0 4px ${color}88)` }}
        />
      </svg>
      {/* Centre label */}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {complete ? (
          /* Checkmark when complete */
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <polyline points="4 12 9 17 20 6" stroke={color} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <>
            <span style={{ fontSize: 17, fontWeight: 700, color: C.text, lineHeight: 1 }}>{value}/{max}</span>
            <span style={{ fontSize: 11, color: C.grey, marginTop: 2 }}>sessions</span>
          </>
        )}
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
      return <svg {...s} viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" fill={filled ? "currentColor" : "none"} fillOpacity={filled ? 0.15 : 0}/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
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
    default:
      return null;
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
