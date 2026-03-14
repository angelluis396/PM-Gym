import { colors } from "../constants/styles";

/**
 * Displays current streak, longest streak, and a
 * 7-day activity strip showing which days were active.
 */
export default function StreakCard({ streak, isMobile }) {
  const { current_streak, longest_streak, last_activity_date } = streak;

  const today     = new Date().toISOString().split("T")[0];
  const isActive  = last_activity_date === today;

  // Build last 7 days as YYYY-MM-DD strings
  const last7 = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  // Which of the last 7 days had activity
  // We infer from last_activity_date + current_streak
  function wasActive(dateStr) {
    if (!last_activity_date) return false;
    const last  = new Date(last_activity_date);
    const check = new Date(dateStr);
    const diffDays = Math.round((last - check) / (1000 * 60 * 60 * 24));
    // Active if within the current streak window and not in the future
    return diffDays >= 0 && diffDays < current_streak && check <= last;
  }

  const flameColor = current_streak >= 7 ? "#f97316"
    : current_streak >= 3 ? "#f59e0b"
    : colors.slate;

  return (
    <div style={{
      background: "rgba(30,41,59,0.8)",
      border: `1px solid ${isActive ? flameColor + "60" : colors.border}`,
      borderRadius: 12,
      padding: isMobile ? "16px" : "18px 20px",
      marginBottom: isMobile ? 20 : 28,
      display: "flex",
      alignItems: "center",
      gap: isMobile ? 12 : 20,
      flexWrap: "wrap",
    }}>

      {/* Flame + current streak */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <span style={{
          fontSize: isMobile ? 28 : 32,
          filter: current_streak === 0 ? "grayscale(1) opacity(0.4)" : "none",
          transition: "filter 0.3s",
        }}>
          🔥
        </span>
        <div>
          <div style={{
            fontSize: isMobile ? 28 : 32,
            fontWeight: 900,
            fontFamily: "'Playfair Display', serif",
            color: current_streak > 0 ? flameColor : colors.slate,
            lineHeight: 1,
          }}>
            {current_streak}
          </div>
          <div style={{ fontSize: 11, color: colors.textMuted, fontWeight: 600, marginTop: 2 }}>
            day streak
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 36, background: colors.border, flexShrink: 0 }} />

      {/* 7-day strip */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: colors.textMuted, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Last 7 days
        </div>
        <div style={{ display: "flex", gap: isMobile ? 4 : 6 }}>
          {last7.map((date, i) => {
            const active  = wasActive(date);
            const isToday = date === today;
            return (
              <div
                key={i}
                title={date}
                style={{
                  flex: 1,
                  height: isMobile ? 20 : 24,
                  borderRadius: 4,
                  background: active
                    ? `linear-gradient(135deg, ${flameColor}, ${flameColor}99)`
                    : "rgba(30,41,59,0.6)",
                  border: isToday
                    ? `1px solid ${flameColor}80`
                    : "1px solid rgba(255,255,255,0.05)",
                  transition: "background 0.2s",
                }}
              />
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ fontSize: 10, color: colors.textMuted }}>6d ago</span>
          <span style={{ fontSize: 10, color: colors.textMuted }}>Today</span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 36, background: colors.border, flexShrink: 0 }} />

      {/* Longest streak */}
      <div style={{ flexShrink: 0, textAlign: "center" }}>
        <div style={{
          fontSize: isMobile ? 20 : 24,
          fontWeight: 900,
          fontFamily: "'Playfair Display', serif",
          color: colors.text,
          lineHeight: 1,
        }}>
          {longest_streak}
        </div>
        <div style={{ fontSize: 11, color: colors.textMuted, fontWeight: 600, marginTop: 2 }}>
          best streak
        </div>
      </div>

      {/* Today badge */}
      {isActive && (
        <div style={{
          position: "absolute",
          // shown inline on mobile, absolute positioning not needed here
        }} />
      )}

    </div>
  );
}
