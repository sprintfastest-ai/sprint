import { useState } from "react";

const FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";
const C = { blue: "#1A6BB5", orange: "#F05A1A", green: "#6DC400", danger: "#C0392B", bg: "#F8F9FA", surface: "#FFFFFF", text: "#1A1A1A", grey: "#6B7280", border: "#E0E0E0", blueLight: "#EBF5FB" };

const shimmerCSS = `
@keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
@keyframes spin    { from { transform: rotate(0deg); }       to   { transform: rotate(360deg); } }
.shimmer { background: linear-gradient(90deg,#F0F0F0 25%,#E0E0E0 50%,#F0F0F0 75%); background-size: 800px 100%; animation: shimmer 1.4s infinite linear; }
`;

export function ComponentLibrary() {
  const [showPass, setShowPass] = useState(false);
  const [focus, setFocus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  return (
    <>
      <style>{shimmerCSS}</style>
      <div style={{ padding: "48px 48px 80px", fontFamily: FONT }}>
        <PageHeader title="Component Library" sub="Buttons, inputs, cards, badges, tab bar & loading states" />

        {/* Buttons */}
        <Section title="Buttons">
          <SubLabel>Filled</SubLabel>
          <Row gap={12}>
            <Btn bg={C.blue}    label="Generate Plan"    />
            <Btn bg={C.orange}  label="Start Session"    />
            <Btn bg={C.green}   label="Session Complete" />
            <Btn bg={C.border}  label="Loading..."       color={C.grey} />
          </Row>
          <SubLabel mt={20}>Ghost / Outline / Danger</SubLabel>
          <Row gap={12}>
            <Btn outline label="View History" />
            <Btn bg={C.danger} label="Delete Account" />
          </Row>
        </Section>

        <Hr />

        {/* Inputs */}
        <Section title="Input Fields">
          <Row gap={20} wrap>
            <InputField variant="default"  focus={focus} setFocus={setFocus} />
            <InputField variant="focused"  focus={focus} setFocus={setFocus} />
            <InputField variant="error"    focus={focus} setFocus={setFocus} />
            <InputField variant="password" focus={focus} setFocus={setFocus} showPass={showPass} setShowPass={setShowPass} />
          </Row>
        </Section>

        <Hr />

        {/* Cards */}
        <Section title="Cards">
          <Row gap={16} wrap>
            <CardStandard />
            <CardAccent color={C.orange} label="Streak Card"       sub="Keep going — you're on a 7-day streak!" icon={<FlameIcon />} />
            <CardAccent color={C.green}  label="Session Complete"  sub="5km run — Personal Best achieved"       icon={<CheckIcon />} />
            <CardInfo />
          </Row>
        </Section>

        <Hr />

        {/* Badges */}
        <Section title="Badges & Pills">
          <Row gap={10} wrap>
            <Badge bg={C.orange} label="PREMIUM"               icon={<CrownIcon />} />
            <Badge bg="#E67E22"  label="BETA"                   />
            <Badge bg={C.blue}   label="U15"                    />
            <Badge bg={C.orange} label="Acceleration Issue"     />
            <Badge bg={C.blue}   label="Top Speed Issue"        />
            <Badge bg={C.green}  label="Speed Endurance Issue"  />
            <Badge bg={C.orange} label="7" icon={<FlameIconSm />} />
          </Row>
        </Section>

        <Hr />

        {/* Tab bar */}
        <Section title="Bottom Tab Bar">
          <TabBar active={activeTab} setActive={setActiveTab} />
        </Section>

        <Hr />

        {/* Status */}
        <Section title="Status Indicators">
          <Row gap={24}>
            <StatusDot color={C.green}  label="Active"   />
            <StatusDot color={C.orange} label="Warning"  />
            <StatusDot color={C.border} label="Inactive" />
          </Row>
        </Section>

        <Hr />

        {/* Loading */}
        <Section title="Loading States">
          <Row gap={20} wrap>
            <SkeletonCard />
            <SpinnerCard />
            <EmptyState />
          </Row>
        </Section>
      </div>
    </>
  );
}

// ── Layout helpers ────────────────────────────────────────────

function PageHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1A1A1A", letterSpacing: "-0.4px", marginBottom: 4 }}>{title}</h1>
      <p style={{ fontSize: 14, color: "#6B7280" }}>{sub}</p>
      <div style={{ height: 1, backgroundColor: "#E0E0E0", marginTop: 24 }} />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.10em", color: C.grey, textTransform: "uppercase", marginBottom: 20 }}>{title}</p>
      {children}
    </div>
  );
}

function SubLabel({ children, mt = 0 }: { children: React.ReactNode; mt?: number }) {
  return <p style={{ fontSize: 11, color: C.grey, fontWeight: 500, marginBottom: 10, marginTop: mt }}>{children}</p>;
}

function Row({ children, gap = 12, wrap = false }: { children: React.ReactNode; gap?: number; wrap?: boolean }) {
  return <div style={{ display: "flex", flexWrap: wrap ? "wrap" : "nowrap", gap, alignItems: "flex-start" }}>{children}</div>;
}

function Hr() {
  return <div style={{ height: 1, backgroundColor: C.border, margin: "36px 0" }} />;
}

// ── Buttons ───────────────────────────────────────────────────

function Btn({ bg, label, color = "#FFFFFF", outline = false }: { bg?: string; label: string; color?: string; outline?: boolean }) {
  return (
    <div style={{ height: 48, borderRadius: 10, backgroundColor: outline ? C.surface : bg, border: outline ? `1.5px solid ${C.blue}` : "none", display: "flex", alignItems: "center", justifyContent: "center", paddingLeft: 20, paddingRight: 20, cursor: "pointer" }}>
      <span style={{ fontSize: 15, fontWeight: 600, color: outline ? C.blue : color, fontFamily: FONT, whiteSpace: "nowrap" }}>{label}</span>
    </div>
  );
}

// ── Inputs ────────────────────────────────────────────────────

function InputField({ variant, focus, setFocus, showPass, setShowPass }: {
  variant: "default" | "focused" | "error" | "password";
  focus: string | null;
  setFocus: (v: string | null) => void;
  showPass?: boolean;
  setShowPass?: (v: (p: boolean) => boolean) => void;
}) {
  const isFocused  = variant === "focused" || focus === variant;
  const isError    = variant === "error";
  const isPassword = variant === "password";
  const variantLabel = { default: "Default", focused: "Focused", error: "Error", password: "Password" }[variant];

  return (
    <div style={{ width: 200 }}>
      <p style={{ fontSize: 11, color: C.grey, fontWeight: 500, marginBottom: 8 }}>{variantLabel}</p>
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: isFocused ? C.blue : C.grey, display: "block", marginBottom: 6, fontFamily: FONT }}>
          {isPassword ? "Password" : "Email Address"}
        </label>
        <div style={{ position: "relative" }}>
          <div style={{ height: 48, borderRadius: 12, backgroundColor: C.surface, border: `${isFocused ? 2 : 1}px solid ${isFocused ? C.blue : isError ? C.danger : C.border}`, display: "flex", alignItems: "center", paddingLeft: 14, paddingRight: isPassword ? 48 : 14, boxSizing: "border-box" }}>
            <span style={{ fontSize: 15, color: "#B0B8C1", fontFamily: FONT }}>{isPassword ? "••••••••" : isError ? "not-valid@" : "you@example.com"}</span>
          </div>
          {isPassword && (
            <button onClick={() => setShowPass?.(v => !v)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, color: C.grey, display: "flex" }}>
              {showPass ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          )}
        </div>
        {isError && <p style={{ fontSize: 12, color: C.danger, marginTop: 5 }}>Please enter a valid email address</p>}
      </div>
    </div>
  );
}

// ── Cards ─────────────────────────────────────────────────────

function CardStandard() {
  return (
    <div style={{ width: 200, backgroundColor: C.surface, borderRadius: 12, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
      <p style={{ fontSize: 11, color: C.grey, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Standard Card</p>
      <p style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>60m Sprint</p>
      <p style={{ fontSize: 13, color: C.grey, lineHeight: 1.4 }}>Next session · Today at 4:00 PM</p>
      <div style={{ marginTop: 14, height: 36, borderRadius: 8, backgroundColor: C.blue, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>View Details</span>
      </div>
    </div>
  );
}

function CardAccent({ color, label, sub, icon }: { color: string; label: string; sub: string; icon?: React.ReactNode }) {
  return (
    <div style={{ width: 200, backgroundColor: C.surface, borderRadius: 12, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", borderLeft: `4px solid ${color}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <span style={{ color }}>{icon}</span>
        <p style={{ fontSize: 11, color: C.grey, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</p>
      </div>
      <p style={{ fontSize: 13, color: C.text, lineHeight: 1.4 }}>{sub}</p>
    </div>
  );
}

function CardInfo() {
  return (
    <div style={{ width: 200, backgroundColor: C.blueLight, borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p style={{ fontSize: 11, color: C.blue, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>AI Coach Tip</p>
      </div>
      <p style={{ fontSize: 13, color: C.text, lineHeight: 1.4 }}>Focus on arm drive during the first 20m to improve your acceleration phase.</p>
    </div>
  );
}

// ── Badges ────────────────────────────────────────────────────

function Badge({ bg, label, icon }: { bg: string; label: string; icon?: React.ReactNode }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 5, backgroundColor: bg, borderRadius: 999, paddingLeft: 10, paddingRight: 10, paddingTop: 6, paddingBottom: 6 }}>
      {icon && <span style={{ display: "flex", alignItems: "center" }}>{icon}</span>}
      <span style={{ fontSize: 11, fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{label}</span>
    </div>
  );
}

// ── Tab bar ───────────────────────────────────────────────────

const TABS = [
  { label: "Home",     Icon: HomeIcon     },
  { label: "Training", Icon: CalendarIcon },
  { label: "Chat",     Icon: ChatIcon     },
  { label: "Progress", Icon: ChartIcon    },
  { label: "Profile",  Icon: PersonIcon   },
];

function TabBar({ active, setActive }: { active: number; setActive: (i: number) => void }) {
  return (
    <div style={{ height: 64, backgroundColor: C.surface, borderTop: `1px solid ${C.border}`, borderRadius: 12, boxShadow: "0 -2px 12px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "space-around" }}>
      {TABS.map((t, i) => {
        const on = i === active;
        return (
          <button key={t.label} onClick={() => setActive(i)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", padding: "0 8px", minWidth: 44, minHeight: 44, justifyContent: "center" }}>
            <span style={{ color: on ? C.blue : C.grey, display: "flex" }}><t.Icon filled={on} /></span>
            <span style={{ fontSize: 11, fontWeight: on ? 600 : 400, color: on ? C.blue : C.grey }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Status ────────────────────────────────────────────────────

function StatusDot({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: color }} />
      <span style={{ fontSize: 11, color: C.grey }}>{label}</span>
    </div>
  );
}

// ── Loading ───────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div style={{ width: 220, backgroundColor: C.surface, borderRadius: 12, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
      <p style={{ fontSize: 11, color: C.grey, fontWeight: 500, marginBottom: 12 }}>Skeleton Card</p>
      <div className="shimmer" style={{ height: 12, borderRadius: 6, marginBottom: 10 }} />
      <div className="shimmer" style={{ height: 12, borderRadius: 6, width: "75%", marginBottom: 10 }} />
      <div className="shimmer" style={{ height: 12, borderRadius: 6, width: "55%", marginBottom: 18 }} />
      <div className="shimmer" style={{ height: 36, borderRadius: 8 }} />
    </div>
  );
}

function SpinnerCard() {
  return (
    <div style={{ width: 220, backgroundColor: C.surface, borderRadius: 12, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", alignItems: "center", minHeight: 120, gap: 12 }}>
      <p style={{ fontSize: 11, color: C.grey, fontWeight: 500, alignSelf: "flex-start", marginBottom: 4 }}>Spinner</p>
      <svg style={{ animation: "spin 0.9s linear infinite" }} width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="13" stroke={C.border} strokeWidth="3" />
        <path d="M16 3 A13 13 0 0 1 29 16" stroke={C.blue} strokeWidth="3" strokeLinecap="round" />
      </svg>
      <p style={{ fontSize: 13, color: C.grey }}>Generating your plan...</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ width: 220, backgroundColor: C.surface, borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
      <p style={{ fontSize: 11, color: C.grey, fontWeight: 500, alignSelf: "flex-start", marginBottom: 12 }}>Empty State</p>
      <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: C.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.grey} strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      </div>
      <p style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>No sessions yet</p>
      <p style={{ fontSize: 12, color: C.grey, lineHeight: 1.4, marginBottom: 16 }}>Add your first training session to get started</p>
      <div style={{ height: 36, borderRadius: 8, backgroundColor: C.orange, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Add Session</span>
      </div>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────

function FlameIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill={C.orange}><path d="M12 2c0 0-6 6-6 12a6 6 0 0012 0c0-3-2-6-2-6s-1 3-3 3c-1 0-2-1-2-2 0-2 1-4 1-7z"/></svg>;
}
function FlameIconSm() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12 2c0 0-6 6-6 12a6 6 0 0012 0c0-3-2-6-2-6s-1 3-3 3c-1 0-2-1-2-2 0-2 1-4 1-7z"/></svg>;
}
function CheckIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function CrownIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M2 19l2-10 5 5 3-9 3 9 5-5 2 10H2z"/></svg>;
}
function EyeIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
}
function EyeOffIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
}
function HomeIcon({ filled = false }: { filled?: boolean }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><polyline points="9 21 9 12 15 12 15 21"/></svg>;
}
function CalendarIcon({ filled = false }: { filled?: boolean }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" fill={filled ? "currentColor" : "none"} fillOpacity={filled ? 0.15 : 0}/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function ChatIcon({ filled = false }: { filled?: boolean }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
}
function ChartIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {filled ? <><rect x="2" y="14" width="4" height="8" fill="currentColor" rx="1"/><rect x="9" y="9" width="4" height="13" fill="currentColor" rx="1"/><rect x="16" y="4" width="4" height="18" fill="currentColor" rx="1"/></> : <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>}
    </svg>
  );
}
function PersonIcon({ filled = false }: { filled?: boolean }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
