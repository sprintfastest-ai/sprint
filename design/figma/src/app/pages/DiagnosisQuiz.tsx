import { useState } from "react";

const FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";
const C = { blue: "#1A6BB5", orange: "#F05A1A", green: "#6DC400", text: "#1A1A1A", grey: "#6B7280", border: "#E0E0E0", surface: "#FFFFFF", bg: "#F8F9FA", orangeLight: "#FEF3EC" };

const ANSWERS = [
  { letter: "A", text: "Strong and in control"  },
  { letter: "B", text: "Starting to tighten up" },
  { letter: "C", text: "Already fading"         },
  { letter: "D", text: "Depends on the race"    },
];

export function DiagnosisQuiz() {
  const [selected, setSelected] = useState<string>("C");

  return (
    <div style={{ padding: "48px 48px 80px", fontFamily: FONT }}>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, letterSpacing: "-0.4px", marginBottom: 4 }}>Sprint Diagnosis Quiz</h1>
        <p style={{ fontSize: 14, color: C.grey }}>iPhone 14 Pro frame — question 3 of 7</p>
        <div style={{ height: 1, backgroundColor: C.border, marginTop: 24 }} />
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{
          width: 393,
          height: 852,
          backgroundColor: C.surface,
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
          <div style={{ height: 59, flexShrink: 0, display: "flex", alignItems: "flex-end", justifyContent: "space-between", paddingLeft: 28, paddingRight: 24, paddingBottom: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>9:41</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <SignalIcon /><WifiIcon /><BatteryIcon />
            </div>
          </div>

          {/* Nav bar */}
          <div style={{ height: 52, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", paddingLeft: 20, paddingRight: 20, position: "relative" }}>
            <button style={{ position: "absolute", left: 20, background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center", color: C.blue }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <span style={{ fontSize: 18, fontWeight: 700, color: C.text }}>Sprint Diagnosis</span>
          </div>

          {/* Scrollable content */}
          <div style={{ flex: 1, overflowY: "auto", paddingBottom: 40 }}>
            <div style={{ padding: "20px 20px 0" }}>

              {/* Progress bar */}
              <div style={{ height: 6, backgroundColor: C.border, borderRadius: 8, overflow: "hidden", marginBottom: 8 }}>
                <div style={{ width: "43%", height: "100%", backgroundColor: C.orange, borderRadius: 8 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <span style={{ fontSize: 12, color: C.grey }}>Question 3 of 7</span>
              </div>

              {/* 32px gap */}
              <div style={{ height: 32 }} />

              {/* Question */}
              <div style={{ textAlign: "center", paddingLeft: 4, paddingRight: 4, marginBottom: 32 }}>
                <p style={{ fontSize: 22, fontWeight: 700, color: C.text, lineHeight: 1.3, marginBottom: 10, letterSpacing: "-0.3px" }}>
                  How does your body feel at 60 metres?
                </p>
                <p style={{ fontSize: 14, color: C.grey, lineHeight: 1.5 }}>
                  Think about your last race or time trial.
                </p>
              </div>

              {/* Answer cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
                {ANSWERS.map((a) => {
                  const isSelected = selected === a.letter;
                  return (
                    <button
                      key={a.letter}
                      onClick={() => setSelected(a.letter)}
                      style={{
                        minHeight: 64,
                        borderRadius: 12,
                        backgroundColor: isSelected ? C.orangeLight : C.surface,
                        border: isSelected ? `1px solid ${C.orange}` : `1px solid ${C.border}`,
                        borderLeft: isSelected ? `4px solid ${C.orange}` : `1px solid ${C.border}`,
                        display: "flex",
                        alignItems: "center",
                        padding: "12px 14px",
                        gap: 14,
                        cursor: "pointer",
                        textAlign: "left",
                        width: "100%",
                        transition: "all 0.15s",
                      }}
                    >
                      {/* Letter badge */}
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        backgroundColor: isSelected ? C.orange : C.border,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: isSelected ? "#FFFFFF" : C.grey }}>{a.letter}</span>
                      </div>

                      {/* Answer text */}
                      <span style={{ flex: 1, fontSize: 16, fontWeight: isSelected ? 600 : 400, color: C.text, lineHeight: 1.35 }}>
                        {a.text}
                      </span>

                      {/* Radio / tick */}
                      {isSelected ? (
                        <div style={{ width: 24, height: 24, borderRadius: "50%", backgroundColor: C.orange, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </div>
                      ) : (
                        <div style={{ width: 24, height: 24, borderRadius: "50%", border: `1.5px solid ${C.border}`, flexShrink: 0 }} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Next button */}
              <button style={{ width: "100%", height: 48, borderRadius: 10, backgroundColor: C.blue, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#FFFFFF", fontFamily: FONT }}>Next Question</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>

              {/* Back link */}
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: C.grey }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.grey} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                  <span style={{ fontSize: 14, color: C.grey, fontFamily: FONT }}>Back</span>
                </button>
              </div>

            </div>
          </div>

          {/* Home indicator */}
          <div style={{ height: 34, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
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
