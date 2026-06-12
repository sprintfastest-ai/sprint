import { useState } from "react";

const FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";
const C = { blue: "#1A6BB5", orange: "#F05A1A", green: "#6DC400", text: "#1A1A1A", grey: "#6B7280", border: "#E0E0E0", surface: "#FFFFFF", bg: "#F8F9FA" };

type PBEntry = { mm: string; ss: string; ms: string };
const INITIAL: Record<string, PBEntry> = {
  "20m":  { mm: "", ss: "", ms: "" },
  "30m":  { mm: "", ss: "", ms: "" },
  "60m":  { mm: "", ss: "", ms: "" },
  "100m": { mm: "13", ss: "2", ms: "40" },
  "200m": { mm: "", ss: "", ms: "" },
};

export function PersonalBests() {
  const [times, setTimes] = useState<Record<string, PBEntry>>(INITIAL);
  const [focus, setFocus] = useState<string | null>(null);

  function update(dist: string, field: keyof PBEntry, val: string) {
    setTimes(prev => ({ ...prev, [dist]: { ...prev[dist], [field]: val } }));
  }

  function hasValue(entry: PBEntry) {
    return entry.mm !== "" || entry.ss !== "" || entry.ms !== "";
  }

  return (
    <div style={{ padding: "48px 48px 80px", fontFamily: FONT }}>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, letterSpacing: "-0.4px", marginBottom: 4 }}>Personal Bests Screen</h1>
        <p style={{ fontSize: 14, color: C.grey }}>iPhone 14 Pro frame — onboarding step 3 of 4</p>
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

          {/* Scrollable content */}
          <div style={{ flex: 1, overflowY: "auto", paddingBottom: 32 }}>
            <div style={{ padding: "24px 20px 0" }}>

              {/* Progress indicator */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  {/* Step dots */}
                  <div style={{ display: "flex", gap: 8 }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        backgroundColor: i <= 3 ? C.blue : C.border,
                        transition: "background-color 0.2s",
                      }} />
                    ))}
                  </div>
                  {/* Step caption */}
                  <span style={{ fontSize: 12, color: C.grey, fontWeight: 400 }}>Step 3 of 4</span>
                </div>

                {/* Progress bar */}
                <div style={{ height: 3, backgroundColor: C.border, borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: "75%", height: "100%", backgroundColor: C.blue, borderRadius: 2 }} />
                </div>
              </div>

              {/* 24px gap */}
              <div style={{ height: 24 }} />

              {/* Heading */}
              <p style={{ fontSize: 24, fontWeight: 700, color: C.text, marginBottom: 8, lineHeight: 1.2 }}>Your Personal Bests</p>
              <p style={{ fontSize: 14, color: C.grey, lineHeight: 1.5, marginBottom: 24 }}>
                Enter your current best times — leave blank for distances you haven't raced.
              </p>

              {/* Column header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 8, marginBottom: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: C.grey, letterSpacing: "0.06em", textTransform: "uppercase" }}>Distance</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.grey, letterSpacing: "0.06em", textTransform: "uppercase", width: 44, textAlign: "center" }}>MM</span>
                  <span style={{ fontSize: 11, color: C.border, fontWeight: 400 }}>:</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.grey, letterSpacing: "0.06em", textTransform: "uppercase", width: 44, textAlign: "center" }}>SS</span>
                  <span style={{ fontSize: 11, color: C.border, fontWeight: 400 }}>.</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.grey, letterSpacing: "0.06em", textTransform: "uppercase", width: 44, textAlign: "center" }}>ms</span>
                  <div style={{ width: 20 }} />
                </div>
              </div>

              {/* Distance rows */}
              {Object.entries(times).map(([dist, entry]) => {
                const filled = hasValue(entry);
                const focusKey = `${dist}-`;
                const isRowFocused = focus?.startsWith(focusKey);
                return (
                  <div
                    key={dist}
                    style={{
                      height: 56,
                      borderBottom: `1px solid ${C.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    {/* Distance label */}
                    <span style={{ fontSize: 16, fontWeight: 700, color: C.text, minWidth: 48 }}>{dist}</span>

                    {/* Time inputs */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {(["mm", "ss", "ms"] as const).map((field, fi) => (
                        <div key={field} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={2}
                            placeholder="–"
                            value={entry[field]}
                            onFocus={() => setFocus(`${dist}-${field}`)}
                            onBlur={() => setFocus(null)}
                            onChange={e => update(dist, field, e.target.value.replace(/\D/g, ""))}
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 8,
                              border: `1px solid ${focus === `${dist}-${field}` ? C.blue : C.border}`,
                              backgroundColor: entry[field] !== "" ? C.surface : C.bg,
                              textAlign: "center",
                              fontSize: 16,
                              fontWeight: entry[field] !== "" ? 700 : 400,
                              color: entry[field] !== "" ? C.text : "#C0C8D0",
                              outline: "none",
                              fontFamily: FONT,
                              boxSizing: "border-box",
                              caretColor: C.blue,
                            }}
                          />
                          {fi < 2 && (
                            <span style={{ fontSize: 16, fontWeight: 600, color: C.grey, lineHeight: 1 }}>
                              {fi === 0 ? ":" : "."}
                            </span>
                          )}
                        </div>
                      ))}

                      {/* Tick / spacer */}
                      <div style={{ width: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {filled ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" fill={C.green} />
                            <polyline points="8 12 11 15 16 9" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Skip link */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                <span style={{ fontSize: 14, color: C.grey, fontWeight: 400, cursor: "pointer" }}>Skip this step</span>
              </div>

            </div>

            {/* Spacer pushes button down */}
            <div style={{ flex: 1, minHeight: 32 }} />

            {/* Continue button */}
            <div style={{ padding: "0 20px" }}>
              <button style={{
                width: "100%",
                height: 48,
                borderRadius: 10,
                backgroundColor: C.blue,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#FFFFFF", fontFamily: FONT }}>Continue</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
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
