const FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";
const C = { blue: "#1A6BB5", orange: "#F05A1A", green: "#6DC400", text: "#1A1A1A", grey: "#6B7280", border: "#E0E0E0", surface: "#FFFFFF", bg: "#F8F9FA" };

const DRILLS = [
  { name: "Flying 30s",       desc: "Build top-end speed through the maximum velocity zone"       },
  { name: "Wicket Runs",      desc: "Increase stride frequency and length at full speed"           },
  { name: "High Knee Drills", desc: "Develop hip flexor power and stride cycle efficiency"         },
];

export function DiagnosisResults() {
  return (
    <div style={{ padding: "48px 48px 80px", fontFamily: FONT }}>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, letterSpacing: "-0.4px", marginBottom: 4 }}>Diagnosis Results Screen</h1>
        <p style={{ fontSize: 14, color: C.grey }}>iPhone 14 Pro frame — sprint profile & targeted plan</p>
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

          {/* Scrollable content */}
          <div style={{ flex: 1, overflowY: "auto", backgroundColor: C.surface }}>
            <div style={{ padding: "28px 20px 36px" }}>

              {/* Page header */}
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <p style={{ fontSize: 24, fontWeight: 700, color: C.text, letterSpacing: "-0.3px", marginBottom: 8 }}>Your Sprint Profile</p>
                <p style={{ fontSize: 14, color: C.grey, lineHeight: 1.5 }}>Here's what we found based on your answers.</p>
              </div>

              {/* ── Weakness hero badge ── */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
                {/* Glow ring */}
                <div style={{
                  width: 160,
                  height: 160,
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(240,90,26,0.12) 0%, rgba(240,90,26,0.04) 60%, transparent 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                  position: "relative",
                }}>
                  {/* Subtle dashed outer ring */}
                  <svg width="160" height="160" viewBox="0 0 160 160" style={{ position: "absolute", inset: 0 }}>
                    <circle cx="80" cy="80" r="76" fill="none" stroke="rgba(240,90,26,0.18)" strokeWidth="1.5" strokeDasharray="5 6" />
                  </svg>

                  {/* Inner gradient circle */}
                  <div style={{
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    background: "linear-gradient(140deg, #F05A1A 0%, #C44A12 100%)",
                    boxShadow: "0 8px 32px rgba(240,90,26,0.40)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    {/* Lightning bolt 56px */}
                    <svg width="56" height="56" viewBox="0 0 24 24" fill="white">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                  </div>
                </div>

                {/* Label */}
                <p style={{ fontSize: 20, fontWeight: 700, color: C.orange, marginBottom: 4, letterSpacing: "-0.2px" }}>Top Speed Issue</p>
                <p style={{ fontSize: 12, color: C.grey }}>Diagnosed today</p>
              </div>

              {/* ── Explanation card ── */}
              <div style={{ backgroundColor: C.surface, borderRadius: 12, borderLeft: `4px solid ${C.blue}`, boxShadow: "0 2px 8px rgba(0,0,0,0.07)", padding: "16px 16px", marginBottom: 24 }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: C.blue, marginBottom: 10 }}>What this means</p>
                <p style={{ fontSize: 14, color: C.text, lineHeight: 1.65 }}>
                  You're generating good speed off the start but struggling to reach and maintain maximum velocity. This is very common and highly trainable with the right drills.
                </p>
              </div>

              {/* ── Targeted drills header ── */}
              <p style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 12 }}>Your Targeted Drills</p>

              {/* ── Drill cards ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                {DRILLS.map((d) => (
                  <div key={d.name} style={{ backgroundColor: C.surface, borderRadius: 12, borderLeft: `4px solid ${C.orange}`, boxShadow: "0 2px 8px rgba(0,0,0,0.07)", padding: "14px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <p style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{d.name}</p>
                      <span style={{ fontSize: 11, fontWeight: 600, color: C.orange, backgroundColor: "#FEF3EC", borderRadius: 20, paddingLeft: 10, paddingRight: 10, paddingTop: 4, paddingBottom: 4, whiteSpace: "nowrap" }}>
                        3× per week
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: C.grey, lineHeight: 1.45 }}>{d.desc}</p>
                  </div>
                ))}
              </div>

              {/* ── Buttons ── */}
              <button style={{ width: "100%", height: 48, borderRadius: 10, backgroundColor: C.orange, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, boxShadow: "0 2px 10px rgba(240,90,26,0.28)" }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#FFFFFF", fontFamily: FONT }}>Update My Training Plan</span>
              </button>

              <button style={{ width: "100%", height: 48, borderRadius: 10, backgroundColor: C.surface, border: `1.5px solid ${C.blue}`, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: C.blue, fontFamily: FONT }}>Retake Diagnosis</span>
                <span style={{ fontSize: 11, color: C.grey, fontWeight: 400 }}>Premium · retake after 28 days</span>
              </button>

            </div>
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
