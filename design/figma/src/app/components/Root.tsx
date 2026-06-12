import { NavLink, Outlet } from "react-router";

const FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";
const C = { blue: "#1A6BB5", blueDark: "#154F8A", orange: "#F05A1A", green: "#6DC400", text: "#1A1A1A", grey: "#6B7280", border: "#E0E0E0", bg: "#F8F9FA" };

const NAV_ITEMS = [
  { to: "/",           label: "Design System",   icon: "palette"   },
  { to: "/components", label: "Components",      icon: "component" },
  { to: "/badges",     label: "Badge Gallery",   icon: "badge"     },
  { to: "/login",      label: "Login Screen",    icon: "phone"     },
  { to: "/register",       label: "Register Screen",  icon: "userplus" },
  { to: "/personal-bests", label: "Personal Bests",   icon: "stopwatch" },
  { to: "/home-screen",    label: "Home Screen",      icon: "home"      },
  { to: "/training-plan",  label: "Training Plan",    icon: "calendar"  },
  { to: "/diagnosis-quiz",    label: "Diagnosis Quiz",    icon: "zap"      },
  { to: "/diagnosis-results", label: "Diagnosis Results", icon: "target"   },
  { to: "/chat-coach",        label: "Chat Coach",        icon: "chat"     },
  { to: "/progress-tracker",  label: "Progress Tracker",  icon: "chart"    },
  { to: "/log-time",          label: "Log Time",          icon: "stopwatch" },
  { to: "/achievements",      label: "Achievements",      icon: "badge"     },
];

export function Root() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: C.bg, fontFamily: FONT }}>

      {/* Sidebar */}
      <aside style={{ width: 240, flexShrink: 0, backgroundColor: "#FFFFFF", borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh" }}>

        {/* Logo */}
        <div style={{ padding: "28px 20px 24px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(140deg, ${C.blue} 0%, ${C.blueDark} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
                <path d="M5 16L10.5 7l3.5 5 3-5" stroke={C.orange} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="13.5" cy="5.5" r="1.5" fill={C.green} />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: C.text, letterSpacing: "-0.3px", lineHeight: 1 }}>SprintFastest</p>
              <p style={{ fontSize: 10, color: C.grey, fontWeight: 400, marginTop: 2 }}>Design Showcase</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: "16px 12px", flex: 1 }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: C.grey, letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 8, paddingLeft: 8 }}>Pages</p>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 10px",
                borderRadius: 8,
                marginBottom: 2,
                textDecoration: "none",
                backgroundColor: isActive ? "#EBF5FB" : "transparent",
                color: isActive ? C.blue : C.grey,
                fontWeight: isActive ? 600 : 400,
                fontSize: 14,
                transition: "background-color 0.12s",
              })}
            >
              {({ isActive }) => (
                <>
                  <span style={{ color: isActive ? C.blue : C.grey, display: "flex", flexShrink: 0 }}>
                    <NavIcon type={item.icon} />
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: "16px 20px", borderTop: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 11, color: C.grey, fontWeight: 400 }}>Basic App Library · v1.0</p>
          <p style={{ fontSize: 11, color: C.grey, fontWeight: 400, marginTop: 2 }}>June 2026</p>
        </div>
      </aside>

      {/* Page content */}
      <main style={{ flex: 1, minWidth: 0, overflowY: "auto" }}>
        <Outlet />
      </main>
    </div>
  );
}

function NavIcon({ type }: { type: string }) {
  const s = { width: 16, height: 16, fill: "none" as const, stroke: "currentColor" as const, strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (type) {
    case "palette":
      return <svg {...s} viewBox="0 0 24 24"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12a10 10 0 0010 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>;
    case "component":
      return <svg {...s} viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>;
    case "badge":
      return <svg {...s} viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>;
    case "chat":
      return <svg {...s} viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
    case "phone":
      return <svg {...s} viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>;
    case "userplus":
      return <svg {...s} viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>;
    case "stopwatch":
      return <svg {...s} viewBox="0 0 24 24"><circle cx="12" cy="13" r="8"/><polyline points="12 9 12 13 15 13"/><line x1="9" y1="2" x2="15" y2="2"/><line x1="12" y1="2" x2="12" y2="5"/></svg>;
    case "home":
      return <svg {...s} viewBox="0 0 24 24"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><polyline points="9 21 9 12 15 12 15 21"/></svg>;
    case "calendar":
      return <svg {...s} viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
    case "zap":
      return <svg {...s} viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
    case "target":
      return <svg {...s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
    default:
      return null;
  }
}
