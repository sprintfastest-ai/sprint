const INTER = "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";

const BRAND_COLORS = [
  { label: "Primary",  hex: "#1A6BB5", usage: "Nav, headings, primary buttons" },
  { label: "Energy",   hex: "#F05A1A", usage: "Streaks, achievements, CTAs"    },
  { label: "Success",  hex: "#6DC400", usage: "PBs, completion, success"        },
];
const DARK_COLORS = [
  { label: "Primary Dark", hex: "#154F8A" },
  { label: "Energy Dark",  hex: "#C44A12" },
  { label: "Success Dark", hex: "#559900" },
];
const NEUTRAL_COLORS = [
  { label: "Background",     hex: "#F8F9FA", border: true  },
  { label: "Surface",        hex: "#FFFFFF", border: true  },
  { label: "Text Primary",   hex: "#1A1A1A", border: false },
  { label: "Text Secondary", hex: "#6B7280", border: false },
  { label: "Border",         hex: "#E0E0E0", border: true  },
];
const TYPE_SCALE = [
  { label: "Heading 1", size: 28, weight: 700, meta: "28px Bold",     sample: "Sprint Faster, Train Smarter" },
  { label: "Heading 2", size: 22, weight: 700, meta: "22px Bold",     sample: "Today's Training Plan" },
  { label: "Heading 3", size: 18, weight: 600, meta: "18px SemiBold", sample: "Acceleration Focus" },
  { label: "Body",      size: 16, weight: 400, meta: "16px Regular",  sample: "Complete your session and log your times below" },
  { label: "Caption",   size: 13, weight: 400, meta: "13px Regular",  sample: "Updated today · 3 sessions this week" },
];
const LEGEND = [
  { dot: "#1A6BB5", label: "Blue",   meaning: "Structure & Navigation" },
  { dot: "#F05A1A", label: "Orange", meaning: "Energy & Achievement"   },
  { dot: "#6DC400", label: "Green",  meaning: "Success & Progress"     },
];

export function DesignSystem() {
  return (
    <div style={{ padding: "48px 48px 80px", fontFamily: INTER }}>
      <PageHeader title="Design System" sub="Colour palette, typography scale & brand tokens" />

      {/* Palette */}
      <Section title="Colour Palette">
        <RowLabel>Brand Colours</RowLabel>
        <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
          {BRAND_COLORS.map(c => (
            <div key={c.label} style={{ flex: 1 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#1A1A1A", marginBottom: 8 }}>{c.label}</p>
              <div style={{ height: 80, borderRadius: 12, backgroundColor: c.hex, boxShadow: "0 2px 8px rgba(0,0,0,0.10)", marginBottom: 8 }} />
              <p style={{ fontSize: 12, fontWeight: 600, color: "#1A1A1A", fontFamily: "monospace", marginBottom: 4 }}>{c.hex}</p>
              <p style={{ fontSize: 11, color: "#6B7280" }}>{c.usage}</p>
            </div>
          ))}
        </div>

        <RowLabel>Dark / Pressed States</RowLabel>
        <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
          {DARK_COLORS.map(c => (
            <div key={c.label} style={{ flex: 1 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#1A1A1A", marginBottom: 8 }}>{c.label}</p>
              <div style={{ height: 80, borderRadius: 12, backgroundColor: c.hex, boxShadow: "0 2px 8px rgba(0,0,0,0.10)", marginBottom: 8 }} />
              <p style={{ fontSize: 12, fontWeight: 600, color: "#1A1A1A", fontFamily: "monospace" }}>{c.hex}</p>
            </div>
          ))}
        </div>

        <RowLabel>Neutrals</RowLabel>
        <div style={{ display: "flex", gap: 14 }}>
          {NEUTRAL_COLORS.map(c => (
            <div key={c.label} style={{ flex: 1 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#1A1A1A", marginBottom: 8 }}>{c.label}</p>
              <div style={{ height: 80, borderRadius: 12, backgroundColor: c.hex, border: c.border ? "1.5px solid #E0E0E0" : "none", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 8 }} />
              <p style={{ fontSize: 11, fontWeight: 600, color: "#1A1A1A", fontFamily: "monospace" }}>{c.hex}</p>
            </div>
          ))}
        </div>
      </Section>

      <Hr />

      {/* Typography */}
      <Section title="Typography Scale · Inter / SF Pro">
        <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #E0E0E0" }}>
          {TYPE_SCALE.map((t, i) => (
            <div key={t.label} style={{ display: "grid", gridTemplateColumns: "148px 1fr", alignItems: "center", gap: 24, padding: "18px 20px", backgroundColor: i % 2 === 0 ? "#FFFFFF" : "#FAFAFA", borderBottom: i < TYPE_SCALE.length - 1 ? "1px solid #F0F0F0" : "none" }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#1A1A1A", marginBottom: 3, lineHeight: 1 }}>{t.label}</p>
                <p style={{ fontSize: 11, color: "#6B7280" }}>{t.meta}</p>
              </div>
              <p style={{ fontSize: t.size, fontWeight: t.weight, color: "#1A1A1A", fontFamily: INTER, margin: 0, lineHeight: 1.3 }}>{t.sample}</p>
            </div>
          ))}
        </div>
      </Section>

      <Hr />

      {/* Legend */}
      <Section title="Colour Meaning Legend">
        <div style={{ display: "flex", gap: 16 }}>
          {LEGEND.map(l => (
            <div key={l.label} style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderRadius: 12, backgroundColor: "#F8F9FA", border: "1px solid #E0E0E0" }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", backgroundColor: l.dot, flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#1A1A1A", marginBottom: 2, lineHeight: 1 }}>{l.label}</p>
                <p style={{ fontSize: 11, color: "#6B7280" }}>{l.meaning}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Hr />
      <p style={{ fontSize: 11, color: "#6B7280", textAlign: "center" }}>
        Screen padding 20px · Card radius 12px · Button radius 10px · Card shadow 0 2px 8px rgba(0,0,0,0.08) · Tab bar 64px · Min tap target 44px
      </p>
    </div>
  );
}

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
    <div style={{ marginTop: 36, marginBottom: 8 }}>
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.10em", color: "#6B7280", textTransform: "uppercase", marginBottom: 20 }}>{title}</p>
      {children}
    </div>
  );
}

function RowLabel({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 11, fontWeight: 500, color: "#6B7280", marginBottom: 10 }}>{children}</p>;
}

function Hr() {
  return <div style={{ height: 1, backgroundColor: "#E0E0E0", margin: "36px 0" }} />;
}
