import { useState } from "react";

const FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";
const C = { blue: "#1A6BB5", orange: "#F05A1A", green: "#6DC400", text: "#1A1A1A", grey: "#6B7280", border: "#E0E0E0", surface: "#FFFFFF", bg: "#F8F9FA" };

const UNLOCKED = [
  { name: "First Session", date: "2 May",  grad: ["#1A6BB5","#154F8A"], icon: <RunnerIcon />    },
  { name: "First PB",      date: "15 May", grad: ["#F5A623","#F05A1A"], icon: <TrophyIcon />    },
  { name: "3-Day Streak",  date: "18 May", grad: ["#F05A1A","#C44A12"], icon: <FlameIcon s={0.7}/> },
  { name: "7-Day Streak",  date: "28 May", grad: ["#F05A1A","#C44A12"], icon: <FlameIcon s={0.95}/> },
  { name: "Diagnosis",     date: "10 May", grad: ["#1A6BB5","#154F8A"], icon: <MagnifyIcon />   },
  { name: "AI Coach",      date: "12 May", grad: ["#1A6BB5","#154F8A"], icon: <RobotIcon />     },
];

const LOCKED = [
  { name: "14-Day Streak",         req: "Train 14 days in a row",        grad: ["#C44A12","#8B2E08"] },
  { name: "Speed Demon",           req: "Break an age-group benchmark",   grad: ["#1A6BB5","#6B21A8"] },
  { name: "Consistency Champion",  req: "Complete a full week's target",  grad: ["#6DC400","#559900"] },
  { name: "Comeback Kid",          req: "Return after 7+ days away",      grad: ["#F05A1A","#6DC400"] },
  { name: "Century",               req: "Complete 100 sessions",          grad: ["#F5A623","#F05A1A"] },
  { name: "30-Day Streak",         req: "Train 30 days in a row",         grad: ["#8B2E08","#5C1A02"] },
];

export function Achievements() {
  const [toast, setToast] = useState(true);

  return (
    <div style={{ padding: "48px 48px 80px", fontFamily: FONT }}>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, letterSpacing: "-0.4px", marginBottom: 4 }}>Achievements Screen</h1>
        <p style={{ fontSize: 14, color: C.grey }}>iPhone 14 Pro frame — badge gallery with unlock toast</p>
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
          <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", width: 120, height: 34, backgroundColor: "#000", borderRadius: 20, zIndex: 20 }} />

          {/* Status bar */}
          <div style={{ height: 59, flexShrink: 0, backgroundColor: C.surface, display: "flex", alignItems: "flex-end", justifyContent: "space-between", paddingLeft: 28, paddingRight: 24, paddingBottom: 8, position: "relative", zIndex: 5 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>9:41</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <SignalIcon2 /><WifiIcon /><BatteryIcon />
            </div>
          </div>

          {/* Nav bar */}
          <div style={{ height: 52, flexShrink: 0, backgroundColor: C.surface, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", paddingLeft: 16, paddingRight: 16, position: "relative", zIndex: 5 }}>
            <button style={{ position: "absolute", left: 16, background: "none", border: "none", cursor: "pointer", padding: 4, color: C.blue, display: "flex" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span style={{ fontSize: 20, fontWeight: 700, color: C.text }}>Achievements</span>
          </div>

          {/* Toast overlay */}
          {toast && (
            <div style={{ position: "absolute", top: 118, left: 16, right: 16, zIndex: 30 }}>
              {/* Glow */}
              <div style={{ position: "absolute", inset: -10, borderRadius: 22, background: "radial-gradient(ellipse, rgba(240,90,26,0.22) 0%, transparent 70%)", pointerEvents: "none" }} />
              {/* Card */}
              <div style={{ backgroundColor: C.surface, borderRadius: 12, borderLeft: `4px solid ${C.orange}`, boxShadow: "0 6px 24px rgba(0,0,0,0.16)", display: "flex", alignItems: "center", gap: 12, padding: "12px 12px 12px 14px", position: "relative" }}>
                {/* Flame circle */}
                <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: C.orange, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M12 2c0 0-6 6-6 12a6 6 0 0012 0c0-3-2-6-2-6s-1 3-3 3c-1 0-2-1-2-2 0-2 1-4 1-7z"/></svg>
                </div>
                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 2 }}>Achievement Unlocked! 🔥</p>
                  <p style={{ fontSize: 12, color: C.grey, lineHeight: 1.4 }}>7-Day Streak — You trained 7 days in a row!</p>
                </div>
                {/* Dismiss */}
                <button onClick={() => setToast(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: C.grey, flexShrink: 0, display: "flex" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
          )}

          {/* Scrollable content */}
          <div style={{ flex: 1, overflowY: "auto", backgroundColor: C.surface }}>
            <div style={{ padding: "16px 20px 32px" }}>

              {/* Stats summary row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 24, paddingTop: toast ? 72 : 0, transition: "padding-top 0.25s" }}>
                <div style={{ textAlign: "center", flex: 1 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: C.green }}>6 Unlocked</span>
                </div>
                <div style={{ width: 1, height: 28, backgroundColor: C.border }} />
                <div style={{ textAlign: "center", flex: 1 }}>
                  <span style={{ fontSize: 16, fontWeight: 400, color: C.grey }}>6 Locked</span>
                </div>
              </div>

              {/* ── Unlocked section ── */}
              <p style={{ fontSize: 11, fontWeight: 700, color: C.green, letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 16 }}>Unlocked (6)</p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
                {UNLOCKED.map((b) => (
                  <BadgeCell key={b.name} name={b.name} sub={b.date} grad={b.grad} locked={false}>
                    {b.icon}
                  </BadgeCell>
                ))}
              </div>

              {/* ── Locked section ── */}
              <p style={{ fontSize: 11, fontWeight: 700, color: C.grey, letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 16 }}>Locked (6)</p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                {LOCKED.map((b) => (
                  <BadgeCell key={b.name} name={b.name} sub={b.req} grad={b.grad} locked={true}>
                    {null}
                  </BadgeCell>
                ))}
              </div>

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

// ── Badge cell ────────────────────────────────────────────────

function BadgeCell({ name, sub, grad, locked, children }: { name: string; sub: string; grad: string[]; locked: boolean; children: React.ReactNode }) {
  const gradId = `ag-${name.replace(/\s/g,"")}`;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      {/* Circle */}
      <div style={{ position: "relative" }}>
        <svg width="60" height="60" viewBox="0 0 60 60" style={{ filter: locked ? "grayscale(1)" : "none", opacity: locked ? 0.4 : 1, display: "block" }}>
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor={grad[0]} />
              <stop offset="100%" stopColor={grad[1]} />
            </linearGradient>
          </defs>
          <circle cx="30" cy="31" r="28" fill="rgba(0,0,0,0.10)" />
          <circle cx="30" cy="30" r="28" fill={`url(#${gradId})`} />
          <g transform="translate(30,30)">{children}</g>
        </svg>
        {/* Padlock */}
        {locked && (
          <div style={{ position: "absolute", bottom: -2, right: -2, width: 18, height: 18, borderRadius: "50%", backgroundColor: "#4B5563", border: "2px solid #FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          </div>
        )}
      </div>
      {/* Name */}
      <p style={{ fontSize: 11, fontWeight: 700, color: locked ? C.grey : C.text, textAlign: "center", lineHeight: 1.3 }}>{name}</p>
      {/* Date or requirement */}
      <p style={{ fontSize: 11, color: C.grey, textAlign: "center", lineHeight: 1.3, maxWidth: 80 }}>{sub}</p>
    </div>
  );
}

// ── Badge icons (rendered inside SVG <g translate(30,30)>) ────

function RunnerIcon() {
  return <g fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="0" cy="-10" r="2.5" fill="white" stroke="none"/>
    <line x1="0" y1="-7.5" x2="0" y2="-1"/><line x1="-5" y1="-5" x2="5" y2="-3.5"/>
    <line x1="0" y1="-1" x2="-4" y2="6.5"/><line x1="0" y1="-1" x2="4" y2="6.5"/>
    <line x1="-9" y1="-2.5" x2="-7" y2="-2.5" strokeOpacity="0.55"/>
  </g>;
}
function TrophyIcon() {
  return <g fill="white">
    <path d="M-6,-10 L6,-10 L5.5,0 Q0,5 -5.5,0 Z"/>
    <rect x="-1.5" y="0" width="3" height="5"/><rect x="-5.5" y="5" width="11" height="2.5" rx="1.2"/>
    <path d="M6,-8.5 Q10,-8.5 10,-4.5 Q10,-0.5 6,-0.5" fill="none" stroke="white" strokeWidth="1.6"/>
    <path d="M-6,-8.5 Q-10,-8.5 -10,-4.5 Q-10,-0.5 -6,-0.5" fill="none" stroke="white" strokeWidth="1.6"/>
    <polygon points="0,-8 1.2,-5.5 3.5,-5.5 1.5,-4 2.5,-1.5 0,-3 -2.5,-1.5 -1.5,-4 -3.5,-5.5 -1.2,-5.5" fill="#F5A623"/>
  </g>;
}
function FlameIcon({ s = 1 }: { s?: number }) {
  return <g transform={`scale(${s})`} fill="white">
    <path d="M0,-12 C0,-12 -8,0 -8,6.5 C-8,11 -4.5,14 0,14 C4.5,14 8,11 8,6.5 C8,0 0,-12 0,-12 Z"/>
    <path d="M0,-3 C0,-3 -4,3 -4,6.5 C-4,9 -2,10 0,10 C2,10 4,9 4,6.5 C4,3 0,-3 0,-3 Z" fill="rgba(255,255,255,0.45)"/>
  </g>;
}
function MagnifyIcon() {
  return <g fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
    <circle cx="-2.5" cy="-2.5" r="7.5"/><line x1="3" y1="3" x2="9" y2="9"/>
  </g>;
}
function RobotIcon() {
  return <g fill="none">
    <rect x="-9" y="-10" width="18" height="13" rx="4" fill="white"/>
    <polygon points="-3,3 -5.5,7.5 0,3" fill="white"/>
    <rect x="-5.5" y="-7" width="3.5" height="3.5" rx="1" fill="#1A6BB5"/>
    <rect x="2" y="-7" width="3.5" height="3.5" rx="1" fill="#1A6BB5"/>
    <line x1="-4" y1="-1" x2="4" y2="-1" stroke="#1A6BB5" strokeWidth="1.4" strokeLinecap="round"/>
  </g>;
}

// ── Status bar icons ──────────────────────────────────────────

function SignalIcon2() {
  return <svg width="17" height="12" viewBox="0 0 17 12" fill={C.text}><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="4.5" y="5" width="3" height="7" rx="1"/><rect x="9" y="2" width="3" height="10" rx="1"/><rect x="13.5" y="0" width="3" height="12" rx="1"/></svg>;
}
function WifiIcon() {
  return <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke={C.text} strokeWidth="1.6" strokeLinecap="round"><path d="M1 4C3.8 1.5 12.2 1.5 15 4"/><path d="M3.2 6.5C5 4.8 11 4.8 12.8 6.5"/><path d="M5.5 9C6.5 8 9.5 8 10.5 9"/><circle cx="8" cy="11" r="1" fill={C.text} stroke="none"/></svg>;
}
function BatteryIcon() {
  return <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke={C.text} strokeOpacity="0.35"/><rect x="2" y="2" width="17" height="8" rx="2" fill={C.text}/><path d="M23 4v4a2 2 0 000-4z" fill={C.text} fillOpacity="0.4"/></svg>;
}
