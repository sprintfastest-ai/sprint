import { useState } from "react";

const FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";
const C = { blue: "#1A6BB5", orange: "#F05A1A", green: "#6DC400", text: "#1A1A1A", grey: "#6B7280", border: "#E0E0E0", surface: "#FFFFFF", bg: "#F8F9FA", orangeLight: "#FEF3EC" };

export function ResetPasswordScreen() {
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focus,       setFocus]       = useState<string | null>(null);

  return (
    <div style={{ padding: "48px 48px 80px", fontFamily: FONT }}>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, letterSpacing: "-0.4px", marginBottom: 4 }}>Reset Password Screen</h1>
        <p style={{ fontSize: 14, color: C.grey }}>iPhone 14 Pro frame — two states: set new password / success confirmation</p>
        <div style={{ height: 1, backgroundColor: C.border, marginTop: 24 }} />
      </div>

      <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>

        {/* ── State 1: Set new password ── */}
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: C.grey, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>Form state</p>
          <PhoneFrame>
            <DynamicIsland />
            <StatusBar />
            <div style={{ flex: 1, overflowY: "auto", paddingBottom: 40 }}>
              {/* Nav bar */}
              <div style={{ height: 52, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", paddingLeft: 20, paddingRight: 20, position: "relative" }}>
                <button style={{ position: "absolute", left: 20, background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center", gap: 4, color: C.blue }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <span style={{ fontSize: 18, fontWeight: 700, color: C.text }}>New Password</span>
              </div>

              <div style={{ padding: "8px 20px 0" }}>
                <p style={{ fontSize: 24, fontWeight: 700, color: C.text, marginBottom: 8, lineHeight: 1.2 }}>Set New Password</p>
                <p style={{ fontSize: 14, color: C.grey, lineHeight: 1.6, marginBottom: 24 }}>
                  Choose a strong password — at least 8 characters with one uppercase letter and one number.
                </p>

                {/* New password */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: focus === "new" ? C.blue : C.grey, display: "block", marginBottom: 6 }}>
                    New Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showNew ? "text" : "password"}
                      placeholder="Min 8 chars, 1 uppercase, 1 number"
                      onFocus={() => setFocus("new")}
                      onBlur={() => setFocus(null)}
                      style={{ width: "100%", height: 48, borderRadius: 12, border: `${focus === "new" ? 2 : 1}px solid ${focus === "new" ? C.blue : C.border}`, paddingLeft: 14, paddingRight: 48, fontSize: 15, color: C.text, backgroundColor: C.surface, outline: "none", boxSizing: "border-box", fontFamily: FONT }}
                    />
                    <button onClick={() => setShowNew(v => !v)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, color: C.grey, display: "flex" }}>
                      {showNew ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: focus === "confirm" ? C.blue : C.grey, display: "block", marginBottom: 6 }}>
                    Confirm Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Re-enter your new password"
                      onFocus={() => setFocus("confirm")}
                      onBlur={() => setFocus(null)}
                      style={{ width: "100%", height: 48, borderRadius: 12, border: `${focus === "confirm" ? 2 : 1}px solid ${focus === "confirm" ? C.blue : C.border}`, paddingLeft: 14, paddingRight: 48, fontSize: 15, color: C.text, backgroundColor: C.surface, outline: "none", boxSizing: "border-box", fontFamily: FONT }}
                    />
                    <button onClick={() => setShowConfirm(v => !v)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, color: C.grey, display: "flex" }}>
                      {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                {/* CTA */}
                <button style={{ width: "100%", height: 48, borderRadius: 10, backgroundColor: C.blue, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#FFFFFF", fontFamily: FONT }}>Set New Password</span>
                </button>

                {/* Back to login */}
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 14, color: C.grey }}>Remember your password?</span>
                  <span style={{ fontSize: 14, color: C.blue, fontWeight: 600, cursor: "pointer" }}>Log In</span>
                </div>
              </div>
            </div>
            <HomeIndicator />
          </PhoneFrame>
        </div>

        {/* ── State 2: Success ── */}
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: C.grey, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>Success state</p>
          <PhoneFrame>
            <DynamicIsland />
            <StatusBar />
            <div style={{ flex: 1, overflowY: "auto", paddingBottom: 40 }}>
              {/* Nav bar — no back on success */}
              <div style={{ height: 52, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: C.text }}>New Password</span>
              </div>

              <div style={{ padding: "32px 20px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
                {/* Success icon */}
                <div style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "#E8F5E9", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6DC400" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>

                <p style={{ fontSize: 24, fontWeight: 700, color: C.text, marginBottom: 12, textAlign: "center" }}>Password Updated</p>
                <p style={{ fontSize: 14, color: C.grey, lineHeight: 1.6, marginBottom: 32, textAlign: "center" }}>
                  Your password has been changed successfully. You can now log in with your new password.
                </p>

                {/* Log In CTA */}
                <button style={{ width: "100%", height: 48, borderRadius: 10, backgroundColor: C.blue, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#FFFFFF", fontFamily: FONT }}>Log In</span>
                </button>
              </div>
            </div>
            <HomeIndicator />
          </PhoneFrame>
        </div>

      </div>
    </div>
  );
}

// ── Shared frame components ───────────────────────────────────

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      width: 393, height: 852, backgroundColor: "#FFFFFF", borderRadius: 50,
      boxShadow: "0 0 0 10px #1A1A1A, 0 0 0 12px #2A2A2A, 0 32px 80px rgba(0,0,0,0.40)",
      overflow: "hidden", display: "flex", flexDirection: "column", flexShrink: 0, position: "relative",
    }}>
      {children}
    </div>
  );
}
function DynamicIsland() {
  return <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", width: 120, height: 34, backgroundColor: "#000", borderRadius: 20, zIndex: 10 }} />;
}
function StatusBar() {
  return (
    <div style={{ height: 59, flexShrink: 0, display: "flex", alignItems: "flex-end", justifyContent: "space-between", paddingLeft: 28, paddingRight: 24, paddingBottom: 8 }}>
      <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>9:41</span>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <SignalIcon /><WifiIcon /><BatteryIcon />
      </div>
    </div>
  );
}
function HomeIndicator() {
  return (
    <div style={{ height: 34, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 134, height: 5, backgroundColor: "#1A1A1A", borderRadius: 3, opacity: 0.2 }} />
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
