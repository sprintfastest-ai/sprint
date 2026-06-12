import { useState } from "react";

const FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";
const C = { blue: "#1A6BB5", orange: "#F05A1A", green: "#6DC400", text: "#1A1A1A", grey: "#6B7280", border: "#E0E0E0", surface: "#FFFFFF", bg: "#F8F9FA", orangeLight: "#FEF3EC" };

export function ForgotPasswordScreen() {
  const [email,  setEmail]  = useState("");
  const [focus,  setFocus]  = useState<string | null>(null);
  const [sent,   setSent]   = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  const handleSubmit = () => {
    if (!email.trim() || !email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    setSent(true);
  };

  return (
    <div style={{ padding: "48px 48px 80px", fontFamily: FONT }}>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, letterSpacing: "-0.4px", marginBottom: 4 }}>Forgot Password Screen</h1>
        <p style={{ fontSize: 14, color: C.grey }}>iPhone 14 Pro frame — two states: form / email sent confirmation</p>
        <div style={{ height: 1, backgroundColor: C.border, marginTop: 24 }} />
      </div>

      <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>

        {/* ── State 1: Form ── */}
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: C.grey, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>Form state</p>
          <PhoneFrame>
            {/* Dynamic Island */}
            <DynamicIsland />
            {/* Status bar */}
            <StatusBar />
            {/* Content */}
            <div style={{ flex: 1, overflowY: "auto", paddingBottom: 40 }}>
              {/* Branding block — same height as Login (213px) */}
              <div style={{ height: 213, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
                  <LightningBolt />
                  <span style={{ fontSize: 36, fontWeight: 800, color: C.blue, letterSpacing: "-0.8px", fontFamily: FONT }}>SprintFastest</span>
                </div>
                {/* Gradient underline */}
                <div style={{ width: 220, height: 2, background: `linear-gradient(90deg, transparent, ${C.orange}80, ${C.orange}, ${C.orange}80, transparent)`, borderRadius: 2, marginBottom: 12 }} />
                <p style={{ fontSize: 14, color: C.grey, fontWeight: 400 }}>Your AI Sprint Coach</p>
              </div>

              {/* Form */}
              <div style={{ padding: "0 20px" }}>
                <p style={{ fontSize: 24, fontWeight: 700, color: C.text, marginBottom: 8, lineHeight: 1.2 }}>Reset Password</p>
                <p style={{ fontSize: 14, color: C.grey, lineHeight: 1.6, marginBottom: 24 }}>
                  Enter your email address and we'll send you a link to reset your password.
                </p>

                {/* Email */}
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: focus === "email" ? C.blue : C.grey, display: "block", marginBottom: 6 }}>
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    placeholder="you@example.com"
                    onFocus={() => { setFocus("email"); setError(null); }}
                    onBlur={() => setFocus(null)}
                    onChange={e => setEmail(e.target.value)}
                    style={{ width: "100%", height: 48, borderRadius: 12, border: `${focus === "email" ? 2 : 1}px solid ${error ? "#C0392B" : focus === "email" ? C.blue : C.border}`, paddingLeft: 14, paddingRight: 14, fontSize: 15, color: C.text, backgroundColor: C.surface, outline: "none", boxSizing: "border-box", fontFamily: FONT }}
                  />
                  {error && <p style={{ fontSize: 12, color: "#C0392B", marginTop: 5, marginBottom: 0 }}>{error}</p>}
                </div>

                {/* CTA */}
                <button
                  onClick={handleSubmit}
                  style={{ width: "100%", height: 48, borderRadius: 10, backgroundColor: C.blue, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 20, marginBottom: 20 }}
                >
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#FFFFFF", fontFamily: FONT }}>Send Reset Link</span>
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

        {/* ── State 2: Email sent ── */}
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: C.grey, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>Email sent state</p>
          <PhoneFrame>
            <DynamicIsland />
            <StatusBar />
            <div style={{ flex: 1, overflowY: "auto", paddingBottom: 40 }}>
              {/* Same branding block */}
              <div style={{ height: 213, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
                  <LightningBolt />
                  <span style={{ fontSize: 36, fontWeight: 800, color: C.blue, letterSpacing: "-0.8px", fontFamily: FONT }}>SprintFastest</span>
                </div>
                <div style={{ width: 220, height: 2, background: `linear-gradient(90deg, transparent, ${C.orange}80, ${C.orange}, ${C.orange}80, transparent)`, borderRadius: 2, marginBottom: 12 }} />
                <p style={{ fontSize: 14, color: C.grey, fontWeight: 400 }}>Your AI Sprint Coach</p>
              </div>

              <div style={{ padding: "0 20px" }}>
                {/* Success banner */}
                <div style={{ backgroundColor: C.orangeLight, borderLeft: `4px solid ${C.orange}`, borderRadius: "0 12px 12px 0", padding: "16px 16px", display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 28 }}>
                  <span style={{ fontSize: 24, flexShrink: 0, lineHeight: 1 }}>✉️</span>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>Check your email</p>
                    <p style={{ fontSize: 13, color: C.grey, lineHeight: 1.5 }}>
                      We sent a reset link to <span style={{ fontWeight: 600, color: C.text }}>alex@example.com</span>. It expires in 30 minutes.
                    </p>
                  </div>
                </div>

                {/* Hint */}
                <p style={{ fontSize: 13, color: C.grey, textAlign: "center", lineHeight: 1.6, marginBottom: 28 }}>
                  Didn't receive it? Check your spam folder or tap below to resend.
                </p>

                {/* Resend */}
                <button style={{ width: "100%", height: 48, borderRadius: 10, backgroundColor: C.surface, border: `1.5px solid ${C.blue}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, boxSizing: "border-box" }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: C.blue, fontFamily: FONT }}>Resend Email</span>
                </button>

                {/* Back */}
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 14, color: C.grey }}>Remember your password?</span>
                  <span style={{ fontSize: 14, color: C.blue, fontWeight: 600, cursor: "pointer" }}>Log In</span>
                </div>
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
function LightningBolt() {
  return (
    <svg width="28" height="34" viewBox="0 0 22 28" fill="none">
      <path d="M14 2L2 16h8l-3 10L20 12h-8L14 2z" fill={C.orange} />
    </svg>
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
