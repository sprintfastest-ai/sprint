import { useState } from "react";

const FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";
const C = { blue: "#1A6BB5", orange: "#F05A1A", green: "#6DC400", text: "#1A1A1A", grey: "#6B7280", border: "#E0E0E0", surface: "#FFFFFF" };

export function LoginScreen() {
  const [showPass, setShowPass] = useState(false);
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [focus,    setFocus]    = useState<string | null>(null);

  return (
    <div style={{ padding: "48px 48px 80px", fontFamily: FONT }}>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1A1A1A", letterSpacing: "-0.4px", marginBottom: 4 }}>Login Screen</h1>
        <p style={{ fontSize: 14, color: "#6B7280" }}>iPhone 14 Pro frame — interactive form with focus states</p>
        <div style={{ height: 1, backgroundColor: "#E0E0E0", marginTop: 24 }} />
      </div>

      {/* Centred phone frame */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{
          width: 393,
          height: 852,
          backgroundColor: C.surface,
          borderRadius: 50,
          boxShadow: "0 0 0 10px #1A1A1A, 0 0 0 12px #2A2A2A, 0 32px 80px rgba(0,0,0,0.40)",
          overflow: "hidden",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
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

          {/* Content */}
          <div style={{ flex: 1, overflowY: "auto", paddingBottom: 40 }}>

            {/* Branding — top 25% of screen (~213px) */}
            <div style={{ height: 213, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
                {/* Lightning bolt — energy orange */}
                <svg width="28" height="34" viewBox="0 0 22 28" fill="none">
                  <path d="M14 2L2 16h8l-3 10L20 12h-8L14 2z" fill={C.orange} />
                </svg>
                <span style={{ fontSize: 36, fontWeight: 800, color: C.blue, letterSpacing: "-0.8px", fontFamily: FONT }}>SprintFastest</span>
              </div>
              {/* Subtle orange underline beneath wordmark */}
              <div style={{ width: 220, height: 2, background: `linear-gradient(90deg, transparent, ${C.orange}80, ${C.orange}, ${C.orange}80, transparent)`, borderRadius: 2, marginBottom: 12 }} />
              <p style={{ fontSize: 14, color: C.grey, fontWeight: 400 }}>Your AI Sprint Coach</p>
            </div>

            {/* Form */}
            <div style={{ padding: "40px 20px 0" }}>
              <p style={{ fontSize: 24, fontWeight: 700, color: C.text, marginBottom: 24, lineHeight: 1.2 }}>Welcome back</p>

              {/* Email */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: focus === "email" ? C.blue : C.grey, display: "block", marginBottom: 6 }}>Email address</label>
                <input
                  type="email"
                  value={email}
                  placeholder="you@example.com"
                  onFocus={() => setFocus("email")}
                  onBlur={() => setFocus(null)}
                  onChange={e => setEmail(e.target.value)}
                  style={{ width: "100%", height: 48, borderRadius: 12, border: `${focus === "email" ? 2 : 1}px solid ${focus === "email" ? C.blue : C.border}`, paddingLeft: 14, paddingRight: 14, fontSize: 15, color: C.text, backgroundColor: C.surface, outline: "none", boxSizing: "border-box", fontFamily: FONT }}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: focus === "pass" ? C.blue : C.grey, display: "block", marginBottom: 6 }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    placeholder="••••••••"
                    onFocus={() => setFocus("pass")}
                    onBlur={() => setFocus(null)}
                    onChange={e => setPassword(e.target.value)}
                    style={{ width: "100%", height: 48, borderRadius: 12, border: `${focus === "pass" ? 2 : 1}px solid ${focus === "pass" ? C.blue : C.border}`, paddingLeft: 14, paddingRight: 48, fontSize: 15, color: C.text, backgroundColor: C.surface, outline: "none", boxSizing: "border-box", fontFamily: FONT }}
                  />
                  <button onClick={() => setShowPass(v => !v)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, color: C.grey, display: "flex" }}>
                    {showPass ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
                <span style={{ fontSize: 13, color: C.blue, fontWeight: 500, cursor: "pointer" }}>Forgot password?</span>
              </div>

              {/* Log In */}
              <button style={{ width: "100%", height: 48, borderRadius: 10, backgroundColor: C.blue, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#FFFFFF", fontFamily: FONT }}>Log In</span>
              </button>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1, height: 1, backgroundColor: C.border }} />
                <span style={{ fontSize: 13, color: C.grey, whiteSpace: "nowrap" }}>Or continue with</span>
                <div style={{ flex: 1, height: 1, backgroundColor: C.border }} />
              </div>

              {/* Google */}
              <button style={{ width: "100%", height: 48, borderRadius: 10, backgroundColor: C.surface, border: `1px solid ${C.border}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxSizing: "border-box" }}>
                <GoogleIcon />
                <span style={{ fontSize: 15, fontWeight: 600, color: C.text, fontFamily: FONT }}>Continue with Google</span>
              </button>
            </div>

            {/* Register */}
            <div style={{ marginTop: 40, display: "flex", justifyContent: "center", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 14, color: C.grey }}>Don't have an account?</span>
              <span style={{ fontSize: 14, color: C.orange, fontWeight: 700, cursor: "pointer" }}>Register</span>
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

// ── Icons ─────────────────────────────────────────────────────

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
function GoogleIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>;
}
