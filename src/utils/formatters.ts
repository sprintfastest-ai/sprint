export function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(2)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(2);
  return `${mins}:${secs.padStart(5, '0')}`;
}

// ── Locale-safe date formatting ──────────────────────────────────────────
//
// Hermes's Intl/ICU support isn't guaranteed to be present on every device —
// it's a property of how the engine was bundled into the APK, not the
// Android version, so it can fail identically on old and brand-new devices.
// A crash here (JavascriptException, seen in production on both an Android
// 11 and an Android 16 device) takes down the whole screen since it runs
// directly in render. formatDate/safeLocaleDate fall back to manual
// formatting rather than letting toLocaleDateString/Intl.DateTimeFormat
// throw.

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Formats a Date using toLocaleDateString, falling back to manual
 * formatting (no Intl/locale involved) if that throws. Only supports the
 * option shapes this app actually uses: weekday/day/month/year.
 */
export function safeLocaleDate(
  date: Date,
  options: { weekday?: 'short' | 'long'; day?: 'numeric'; month?: 'short' | 'long'; year?: 'numeric' },
): string {
  try {
    return date.toLocaleDateString('en-GB', options);
  } catch {
    const parts: string[] = [];
    if (options.weekday) {
      parts.push(`${(options.weekday === 'long' ? WEEKDAYS_LONG : WEEKDAYS_SHORT)[date.getDay()]},`);
    }
    if (options.day) parts.push(String(date.getDate()));
    if (options.month) parts.push((options.month === 'long' ? MONTHS_LONG : MONTHS_SHORT)[date.getMonth()]);
    if (options.year) parts.push(String(date.getFullYear()));
    return parts.join(' ');
  }
}

export function formatDate(dateString: string): string {
  return safeLocaleDate(new Date(dateString), { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Short relative time ("2m ago", "3h ago", "5d ago"), falling back to a plain date past a week. */
export function timeAgo(dateString: string): string {
  const then = new Date(dateString).getTime();
  if (Number.isNaN(then)) return '';
  const diffMs = Date.now() - then;
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateString);
}

export function getWeekStartDate(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0] as string;
}

export function formatDistance(meters: number): string {
  return `${meters}m`;
}

/** "acceleration_focus" / "acceleration-focus" -> "Acceleration Focus" */
export function formatSessionType(sessionType: string): string {
  if (!sessionType) return '';
  return sessionType
    .replace(/[_-]+/g, ' ')
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
