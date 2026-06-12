import { useState, useRef, useEffect } from "react";

const FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";
const C = { blue: "#1A6BB5", orange: "#F05A1A", green: "#6DC400", text: "#1A1A1A", grey: "#6B7280", border: "#E0E0E0", surface: "#FFFFFF", bg: "#F8F9FA" };

const streamingCSS = `
@keyframes pulse-dot {
  0%, 80%, 100% { opacity: 0.25; transform: scale(0.8); }
  40%           { opacity: 1;    transform: scale(1);   }
}
.dot1 { animation: pulse-dot 1.2s ease-in-out infinite; animation-delay: 0s;    }
.dot2 { animation: pulse-dot 1.2s ease-in-out infinite; animation-delay: 0.2s;  }
.dot3 { animation: pulse-dot 1.2s ease-in-out infinite; animation-delay: 0.4s;  }
`;

const TABS = [
  { label: "Home",     icon: "home"     },
  { label: "Training", icon: "calendar" },
  { label: "Chat",     icon: "chat"     },
  { label: "Progress", icon: "chart"    },
  { label: "Profile",  icon: "person"   },
];

export function ChatCoach() {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  return (
    <>
      <style>{streamingCSS}</style>
      <div style={{ padding: "48px 48px 80px", fontFamily: FONT }}>
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, letterSpacing: "-0.4px", marginBottom: 4 }}>AI Chat Coach Screen</h1>
          <p style={{ fontSize: 14, color: C.grey }}>iPhone 14 Pro frame — live coaching conversation</p>
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

            {/* ── Header ── */}
            <div style={{ height: 56, flexShrink: 0, backgroundColor: C.surface, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", paddingLeft: 16, paddingRight: 16, gap: 0, position: "relative" }}>
              {/* Back arrow */}
              <button style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 8px 4px 0", display: "flex", alignItems: "center", color: C.blue }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>

              {/* Centred title */}
              <div style={{ position: "absolute", left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, pointerEvents: "none" }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: C.text }}>AI Coach</span>
                {/* Robot icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="8" width="18" height="12" rx="3"/>
                  <path d="M9 8V6a3 3 0 016 0v2"/>
                  <circle cx="9" cy="14" r="1.5" fill={C.blue} stroke="none"/>
                  <circle cx="15" cy="14" r="1.5" fill={C.blue} stroke="none"/>
                  <line x1="9.5" y1="17.5" x2="14.5" y2="17.5" strokeWidth="1.5"/>
                </svg>
              </div>

              {/* Premium badge */}
              <div style={{ marginLeft: "auto", backgroundColor: C.orange, borderRadius: 20, paddingLeft: 10, paddingRight: 10, paddingTop: 4, paddingBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.06em" }}>PREMIUM</span>
              </div>
            </div>

            {/* ── Chat area ── */}
            <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Date divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, height: 1, backgroundColor: C.border }} />
                <span style={{ fontSize: 11, color: C.grey, fontWeight: 500 }}>Today</span>
                <div style={{ flex: 1, height: 1, backgroundColor: C.border }} />
              </div>

              {/* USER: acceleration drills question */}
              <UserBubble text="What drills should I do to improve my acceleration?" time="2:34 PM" />

              {/* AI: drill list response */}
              <AIBubble
                time="2:34 PM"
                streaming={false}
              >
                <p style={{ margin: 0, fontSize: 14, color: C.text, lineHeight: 1.6 }}>
                  Great question! For acceleration focus on:
                </p>
                <ol style={{ margin: "8px 0 8px 16px", padding: 0, fontSize: 14, color: C.text, lineHeight: 1.7 }}>
                  <li><strong>Wall Drives</strong> — 3×10 each leg. Drive through 45°.</li>
                  <li style={{ marginTop: 4 }}><strong>A-Skips</strong> — 4×20m. Knee height and arm drive.</li>
                  <li style={{ marginTop: 4 }}><strong>Block Starts into 30m</strong> — 5 runs, full recovery.</li>
                </ol>
                <p style={{ margin: 0, fontSize: 14, color: C.text, lineHeight: 1.6 }}>
                  How does your start feel currently?
                </p>
              </AIBubble>

              {/* USER: slow start reply */}
              <UserBubble text="My start feels slow. I struggle to stay low." time="2:35 PM" />

              {/* AI: streaming response */}
              <AIBubble time="2:35 PM" streaming={true}>
                <p style={{ margin: 0, fontSize: 14, color: C.text, lineHeight: 1.6 }}>
                  That's really common — staying low in the drive phase is a skill. Here's what I'd suggest...
                </p>
                {/* Animated dots */}
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 10 }}>
                  {["dot1","dot2","dot3"].map(cls => (
                    <div key={cls} className={cls} style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: C.blue }} />
                  ))}
                </div>
              </AIBubble>

            </div>

            {/* ── Input bar ── */}
            <div style={{ flexShrink: 0, backgroundColor: C.surface, borderTop: `1px solid ${C.border}`, padding: "10px 14px 10px", display: "flex", alignItems: "center", gap: 10 }}>
              {/* Mic — stubbed */}
              <button style={{ background: "none", border: "none", padding: 6, display: "flex", cursor: "not-allowed", opacity: 0.4 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.grey} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="2" width="6" height="11" rx="3"/>
                  <path d="M5 10a7 7 0 0014 0"/>
                  <line x1="12" y1="20" x2="12" y2="24"/>
                  <line x1="8" y1="24" x2="16" y2="24"/>
                </svg>
              </button>

              {/* Text input */}
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask your coach..."
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 22,
                  border: `1px solid ${C.border}`,
                  backgroundColor: C.bg,
                  paddingLeft: 16,
                  paddingRight: 16,
                  fontSize: 14,
                  color: C.text,
                  outline: "none",
                  fontFamily: FONT,
                }}
              />

              {/* Send button */}
              <button style={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: C.blue, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>

            {/* ── Bottom tab bar ── */}
            <div style={{ height: 64, flexShrink: 0, backgroundColor: C.surface, borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-around" }}>
              {TABS.map((t, i) => {
                const active = i === 2;
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
    </>
  );
}

// ── Chat bubble components ────────────────────────────────────

function UserBubble({ text, time }: { text: string; time: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <div style={{ maxWidth: "78%" }}>
        <div style={{
          backgroundColor: C.blue,
          borderRadius: "16px 16px 4px 16px",
          padding: "11px 14px",
          marginBottom: 4,
          boxShadow: "0 2px 6px rgba(26,107,181,0.22)",
        }}>
          <p style={{ fontSize: 14, color: "#FFFFFF", lineHeight: 1.5, margin: 0 }}>{text}</p>
        </div>
        <p style={{ fontSize: 11, color: C.grey, textAlign: "right", margin: 0 }}>{time}</p>
      </div>
    </div>
  );
}

function AIBubble({ children, time, streaming }: { children: React.ReactNode; time: string; streaming: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
      {/* Avatar */}
      <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: C.blue, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginBottom: 18 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.02em" }}>AI</span>
      </div>

      <div style={{ maxWidth: "78%" }}>
        <div style={{
          backgroundColor: C.surface,
          borderRadius: "16px 16px 16px 4px",
          border: streaming ? `1.5px solid ${C.blue}` : `1px solid ${C.border}`,
          padding: "12px 14px",
          marginBottom: 4,
          boxShadow: streaming
            ? `0 2px 12px rgba(26,107,181,0.14)`
            : "0 1px 4px rgba(0,0,0,0.07)",
        }}>
          {children}
        </div>
        <p style={{ fontSize: 11, color: C.grey, margin: 0 }}>{time}</p>
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
