const FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";

const BADGES = [
  { id: 1,  name: "First Session",          condition: "Complete your first training session",  gradient: ["#1A6BB5","#154F8A"], icon: <RunnerIcon />             },
  { id: 2,  name: "First PB",               condition: "Set your first personal best",          gradient: ["#F5A623","#F05A1A"], icon: <TrophyIcon />             },
  { id: 3,  name: "3-Day Streak",           condition: "Train 3 days in a row",                 gradient: ["#F05A1A","#C44A12"], icon: <FlameIcon size="sm" />    },
  { id: 4,  name: "7-Day Streak",           condition: "Train 7 days in a row",                 gradient: ["#F05A1A","#C44A12"], icon: <FlameIcon size="md" />    },
  { id: 5,  name: "14-Day Streak",          condition: "Train 14 days in a row",                gradient: ["#C44A12","#8B2E08"], icon: <FlameIcon size="lg" />    },
  { id: 6,  name: "30-Day Streak",          condition: "Train 30 days in a row",                gradient: ["#8B2E08","#5C1A02"], icon: <FlameIcon size="xl" />, glow: true },
  { id: 7,  name: "Speed Demon",            condition: "Break an age-group benchmark time",     gradient: ["#1A6BB5","#6B21A8"], icon: <LightningIcon />          },
  { id: 8,  name: "Consistency Champion",   condition: "Complete a full week's goal",           gradient: ["#6DC400","#559900"], icon: <CalendarTickIcon />       },
  { id: 9,  name: "Diagnosis Complete",     condition: "Complete your sprint diagnosis",        gradient: ["#1A6BB5","#154F8A"], icon: <MagnifyIcon />            },
  { id: 10, name: "Comeback Kid",           condition: "Return after 7+ days away",             gradient: ["#F05A1A","#6DC400"], icon: <RisingArrowIcon />       },
  { id: 11, name: "Century",               condition: "Complete 100 training sessions",        gradient: ["#F5A623","#F05A1A"], icon: <CenturyIcon />            },
  { id: 12, name: "AI Coach",              condition: "First AI coaching chat",                gradient: ["#1A6BB5","#154F8A"], icon: <AICoachIcon />            },
];

const ROWS = [BADGES.slice(0,4), BADGES.slice(4,8), BADGES.slice(8,12)];

export function BadgeGallery() {
  return (
    <div style={{ padding: "48px 48px 80px", fontFamily: FONT }}>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1A1A1A", letterSpacing: "-0.4px", marginBottom: 4 }}>Badge Gallery</h1>
        <p style={{ fontSize: 14, color: "#6B7280" }}>12 achievement badges — unlocked and locked states</p>
        <div style={{ height: 1, backgroundColor: "#E0E0E0", marginTop: 24 }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
        {ROWS.map((row, ri) => (
          <div key={ri} style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
            {row.map(badge => <BadgeColumn key={badge.id} badge={badge} />)}
          </div>
        ))}
      </div>

      <div style={{ height: 1, backgroundColor: "#E0E0E0", margin: "48px 0 24px" }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 32 }}>
        <LegendItem label="Unlocked" dot={{ background: "linear-gradient(135deg,#1A6BB5,#154F8A)" }} />
        <LegendItem label="Locked"   dot={{ backgroundColor: "#D1D5DB", opacity: 0.6 }} />
      </div>
    </div>
  );
}

function BadgeColumn({ badge }: { badge: typeof BADGES[number] }) {
  const [g0, g1] = badge.gradient;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      <BadgeCircle badge={badge} g0={g0} g1={g1} locked={false} />
      <BadgeCircle badge={badge} g0={g0} g1={g1} locked={true}  />
    </div>
  );
}

function BadgeCircle({ badge, g0, g1, locked }: { badge: typeof BADGES[number]; g0: string; g1: string; locked: boolean }) {
  const gradId = `g${badge.id}${locked ? "l" : ""}`;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: locked ? "#9CA3AF" : "#6B7280", marginBottom: 10 }}>
        {locked ? "Locked" : "Unlocked"}
      </p>
      <div style={{ position: "relative", marginBottom: 12 }}>
        {badge.glow && !locked && (
          <div style={{ position: "absolute", inset: -8, borderRadius: "50%", background: "radial-gradient(circle,rgba(140,46,8,0.35) 0%,transparent 70%)", pointerEvents: "none" }} />
        )}
        <svg width="72" height="72" viewBox="0 0 72 72" style={{ filter: locked ? "grayscale(1)" : "none", opacity: locked ? 0.5 : 1, display: "block" }}>
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor={g0} />
              <stop offset="100%" stopColor={g1} />
            </linearGradient>
          </defs>
          <circle cx="36" cy="37" r="34" fill="rgba(0,0,0,0.10)" />
          <circle cx="36" cy="36" r="34" fill={`url(#${gradId})`} />
          <g transform="translate(36,36)">{badge.icon}</g>
        </svg>
        {locked && (
          <div style={{ position: "absolute", bottom: -2, right: -2, width: 22, height: 22, borderRadius: "50%", backgroundColor: "#4B5563", border: "2px solid #FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          </div>
        )}
      </div>
      <p style={{ fontSize: 12, fontWeight: 700, color: locked ? "#9CA3AF" : "#1A1A1A", textAlign: "center", lineHeight: 1.3, marginBottom: 4 }}>{badge.name}</p>
      <p style={{ fontSize: 11, color: "#6B7280", textAlign: "center", lineHeight: 1.4, maxWidth: 140 }}>{badge.condition}</p>
    </div>
  );
}

function LegendItem({ label, dot }: { label: string; dot: React.CSSProperties }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 16, height: 16, borderRadius: "50%", ...dot }} />
      <span style={{ fontSize: 12, color: "#6B7280" }}>{label}</span>
    </div>
  );
}

// ── Badge icons (SVG rendered inside <g translate(36,36)>) ────

function RunnerIcon() {
  return <g fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="0" cy="-12" r="3" fill="white" stroke="none"/><line x1="0" y1="-9" x2="0" y2="-1"/><line x1="-6" y1="-6" x2="6" y2="-4"/><line x1="0" y1="-1" x2="-5" y2="8"/><line x1="0" y1="-1" x2="5" y2="8"/><line x1="-11" y1="-3" x2="-8" y2="-3" strokeOpacity="0.6"/><line x1="-12" y1="1" x2="-9" y2="1" strokeOpacity="0.4"/></g>;
}
function TrophyIcon() {
  return <g fill="white"><path d="M-8,-13 L8,-13 L7,0 Q0,6 -7,0 Z"/><rect x="-2" y="0" width="4" height="6"/><rect x="-7" y="6" width="14" height="3" rx="1.5"/><path d="M8,-11 Q13,-11 13,-6 Q13,-1 8,-1" fill="none" stroke="white" strokeWidth="2"/><path d="M-8,-11 Q-13,-11 -13,-6 Q-13,-1 -8,-1" fill="none" stroke="white" strokeWidth="2"/><polygon points="0,-10 1.5,-7 4.5,-7 2,-5 3,-2 0,-4 -3,-2 -2,-5 -4.5,-7 -1.5,-7" fill="#F5A623"/></g>;
}
function FlameIcon({ size = "md" }: { size?: "sm"|"md"|"lg"|"xl" }) {
  const s = size === "sm" ? 0.7 : size === "md" ? 0.9 : size === "lg" ? 1.1 : 1.35;
  const inner = size === "xl" ? "#F5A623" : "rgba(255,255,255,0.5)";
  return <g transform={`scale(${s})`} fill="white"><path d="M0,-14 C0,-14 -10,0 -10,8 C-10,14 -5.5,18 0,18 C5.5,18 10,14 10,8 C10,0 0,-14 0,-14 Z"/><path d="M0,-4 C0,-4 -5,4 -5,8 C-5,11 -2.5,13 0,13 C2.5,13 5,11 5,8 C5,4 0,-4 0,-4 Z" fill={inner}/></g>;
}
function LightningIcon() {
  return <g fill="white"><polygon points="4,-14 -4,1 2,1 -4,14 8,-3 1,-3 8,-14"/></g>;
}
function CalendarTickIcon() {
  return <g fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="-10" y="-11" width="20" height="20" rx="3"/><line x1="-5" y1="-14" x2="-5" y2="-8"/><line x1="5" y1="-14" x2="5" y2="-8"/><line x1="-10" y1="-5" x2="10" y2="-5"/><polyline points="-5,1 -1,5 6,-1" strokeWidth="2.5"/></g>;
}
function MagnifyIcon() {
  return <g fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round"><circle cx="-3" cy="-3" r="9"/><line x1="4" y1="4" x2="11" y2="11"/></g>;
}
function RisingArrowIcon() {
  return <g fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="-12,8 -4,0 4,-6 12,-12"/><polyline points="6,-14 12,-12 10,-6"/></g>;
}
function CenturyIcon() {
  return <text x="0" y="0" textAnchor="middle" dominantBaseline="central" fill="white" fontSize="18" fontWeight="800" fontFamily="'Inter',sans-serif" letterSpacing="-1">100</text>;
}
function AICoachIcon() {
  return <g fill="none"><rect x="-11" y="-13" width="22" height="16" rx="5" fill="white"/><polygon points="-4,3 -7,9 0,3" fill="white"/><rect x="-7" y="-9" width="4" height="4" rx="1" fill="#1A6BB5"/><rect x="3" y="-9" width="4" height="4" rx="1" fill="#1A6BB5"/><line x1="-5" y1="-2" x2="5" y2="-2" stroke="#1A6BB5" strokeWidth="1.5" strokeLinecap="round"/></g>;
}
