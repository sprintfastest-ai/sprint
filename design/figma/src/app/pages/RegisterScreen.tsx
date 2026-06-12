import { useState } from "react";

const FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";
const C = { blue: "#1A6BB5", orange: "#F05A1A", green: "#6DC400", text: "#1A1A1A", grey: "#6B7280", border: "#E0E0E0", surface: "#FFFFFF", bg: "#F8F9FA" };

const ROLES      = ["Athlete", "Parent", "Coach"];
const AGE_GROUPS = ["U11", "U13", "U15", "U17", "U20"];
const EVENTS     = ["60m", "100m", "200m"];

export function RegisterScreen() {
  const [role,         setRole]         = useState(0);
  const [ageGroup,     setAgeGroup]     = useState(2);
  const [event,        setEvent]        = useState(1);
  const [days,         setDays]         = useState(5);
  const [showPass,     setShowPass]     = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [focus,        setFocus]        = useState<string | null>(null);

  return (
    <div style={{ padding: "48px 48px 80px", fontFamily: FONT }}>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, letterSpacing: "-0.4px", marginBottom: 4 }}>Register Screen</h1>
        <p style={{ fontSize: 14, color: C.grey }}>iPhone 14 Pro frame — athlete registration with profile builder</p>
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
            <button style={{ position: "absolute", left: 20, background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center", gap: 4, color: C.blue }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <span style={{ fontSize: 18, fontWeight: 700, color: C.text }}>Create Account</span>
          </div>

          {/* Scrollable content */}
          <div style={{ flex: 1, overflowY: "auto", paddingBottom: 32 }}>
            <div style={{ padding: "16px 20px 0" }}>

              {/* Role selector */}
              <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
                {ROLES.map((r, i) => (
                  <button
                    key={r}
                    onClick={() => setRole(i)}
                    style={{
                      flex: 1,
                      height: 44,
                      borderRadius: 20,
                      border: role === i ? "none" : `1px solid ${C.border}`,
                      backgroundColor: role === i ? C.blue : C.surface,
                      color: role === i ? "#FFFFFF" : C.grey,
                      fontSize: 14,
                      fontWeight: role === i ? 600 : 400,
                      cursor: "pointer",
                      fontFamily: FONT,
                      transition: "all 0.15s",
                    }}
                  >{r}</button>
                ))}
              </div>

              {/* Your Details */}
              <SectionLabel color={C.grey}>Your Details</SectionLabel>

              <Field label="Full Name"       id="name"    type="text"     placeholder="Alex Johnson"      focus={focus} setFocus={setFocus} />
              <Field label="Email"           id="email"   type="email"    placeholder="you@example.com"   focus={focus} setFocus={setFocus} />
              <Field label="Password"        id="pass"    type={showPass    ? "text" : "password"} placeholder="Create a password"  focus={focus} setFocus={setFocus} showToggle onToggle={() => setShowPass(v => !v)} showing={showPass} />
              <Field label="Confirm Password" id="confirm" type={showConfirm ? "text" : "password"} placeholder="Repeat password"    focus={focus} setFocus={setFocus} showToggle onToggle={() => setShowConfirm(v => !v)} showing={showConfirm} last />

              {/* Sprint Profile */}
              <SectionLabel color={C.blue} mt={24}>Sprint Profile</SectionLabel>

              {/* Age group */}
              <p style={{ fontSize: 12, fontWeight: 600, color: C.grey, marginBottom: 8 }}>Age Group</p>
              <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
                {AGE_GROUPS.map((g, i) => (
                  <button
                    key={g}
                    onClick={() => setAgeGroup(i)}
                    style={{
                      height: 36,
                      paddingLeft: 16,
                      paddingRight: 16,
                      borderRadius: 18,
                      border: ageGroup === i ? "none" : `1px solid ${C.border}`,
                      backgroundColor: ageGroup === i ? C.blue : C.surface,
                      color: ageGroup === i ? "#FFFFFF" : C.grey,
                      fontSize: 13,
                      fontWeight: ageGroup === i ? 600 : 400,
                      cursor: "pointer",
                      fontFamily: FONT,
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >{g}</button>
                ))}
              </div>

              {/* Primary event */}
              <p style={{ fontSize: 12, fontWeight: 600, color: C.grey, marginBottom: 8 }}>Primary Event</p>
              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                {EVENTS.map((e, i) => (
                  <button
                    key={e}
                    onClick={() => setEvent(i)}
                    style={{
                      flex: 1,
                      height: 36,
                      borderRadius: 18,
                      border: event === i ? "none" : `1px solid ${C.border}`,
                      backgroundColor: event === i ? C.blue : C.surface,
                      color: event === i ? "#FFFFFF" : C.grey,
                      fontSize: 13,
                      fontWeight: event === i ? 600 : 400,
                      cursor: "pointer",
                      fontFamily: FONT,
                    }}
                  >{e}</button>
                ))}
              </div>

              {/* Training days stepper */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: C.text, lineHeight: 1.2 }}>Training days per week</p>
                  <p style={{ fontSize: 12, color: C.grey, marginTop: 2 }}>Recommended: 4–5 days</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button
                    onClick={() => setDays(d => Math.max(1, d - 1))}
                    style={{ width: 32, height: 32, borderRadius: "50%", border: `1.5px solid ${C.blue}`, backgroundColor: C.surface, color: C.blue, fontSize: 18, fontWeight: 400, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}
                  >−</button>
                  <span style={{ fontSize: 18, fontWeight: 700, color: C.text, minWidth: 16, textAlign: "center" }}>{days}</span>
                  <button
                    onClick={() => setDays(d => Math.min(7, d + 1))}
                    style={{ width: 32, height: 32, borderRadius: "50%", border: "none", backgroundColor: C.blue, color: "#FFFFFF", fontSize: 18, fontWeight: 400, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}
                  >+</button>
                </div>
              </div>

              {/* Info banner */}
              <div style={{
                backgroundColor: "#FEF3EC",
                borderLeft: `4px solid ${C.orange}`,
                borderRadius: "0 10px 10px 0",
                padding: "12px 14px",
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                marginBottom: 24,
              }}>
                <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>⚡</span>
                <p style={{ fontSize: 12, color: C.text, lineHeight: 1.5, fontWeight: 400 }}>
                  Athletes under 13 will need a parent account linked before accessing training plans.
                </p>
              </div>

              {/* Create Account CTA */}
              <button style={{ width: "100%", height: 48, borderRadius: 10, backgroundColor: C.orange, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#FFFFFF", fontFamily: FONT }}>Create Account</span>
              </button>

              {/* Log In link */}
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 14, color: C.grey }}>Already have an account?</span>
                <span style={{ fontSize: 14, color: C.blue, fontWeight: 600, cursor: "pointer" }}>Log In</span>
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

// ── Shared components ─────────────────────────────────────────

function SectionLabel({ children, color, mt = 0 }: { children: React.ReactNode; color: string; mt?: number }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 14, marginTop: mt }}>
      {children}
    </p>
  );
}

function Field({ label, id, type, placeholder, focus, setFocus, showToggle = false, onToggle, showing, last = false }: {
  label: string; id: string; type: string; placeholder: string;
  focus: string | null; setFocus: (v: string | null) => void;
  showToggle?: boolean; onToggle?: () => void; showing?: boolean; last?: boolean;
}) {
  const active = focus === id;
  return (
    <div style={{ marginBottom: last ? 0 : 12 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: active ? C.blue : C.grey, display: "block", marginBottom: 6, fontFamily: FONT }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={type}
          placeholder={placeholder}
          onFocus={() => setFocus(id)}
          onBlur={() => setFocus(null)}
          style={{
            width: "100%",
            height: 48,
            borderRadius: 12,
            border: `${active ? 2 : 1}px solid ${active ? C.blue : C.border}`,
            paddingLeft: 14,
            paddingRight: showToggle ? 48 : 14,
            fontSize: 15,
            color: C.text,
            backgroundColor: C.surface,
            outline: "none",
            boxSizing: "border-box",
            fontFamily: FONT,
          }}
        />
        {showToggle && (
          <button onClick={onToggle} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, color: C.grey, display: "flex" }}>
            {showing ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
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
function EyeIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
}
function EyeOffIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
}
