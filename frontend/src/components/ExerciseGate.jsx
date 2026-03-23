import { colors } from "../constants/styles";

/**
 * Wraps any exercise entry point.
 * If the user can exercise, renders children normally.
 * If blocked, renders a disabled state with hours remaining.
 *
 * Props:
 *   canExercise — bool from useAccessControl
 *   hoursLeft   — number from useAccessControl
 *   loading     — bool from useAccessControl
 *   children    — the normal start button / content
 */
export default function ExerciseGate({ canExercise, hoursLeft, loading, children }) {
  if (loading) return children;
  if (canExercise) return children;

  const days  = Math.floor(hoursLeft / 24);
  const hours = hoursLeft % 24;
  const timeStr = days > 0
    ? `${days}d ${hours}h`
    : `${hoursLeft}h`;

  return (
    <div style={{
      background:   "rgba(30,41,59,0.8)",
      border:       `1px solid ${colors.border}`,
      borderRadius: 12,
      padding:      "20px 20px",
      display:      "flex",
      alignItems:   "center",
      justifyContent: "space-between",
      gap:          16,
      flexWrap:     "wrap",
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: colors.text, marginBottom: 4 }}>
          Free tier — 1 exercise every 72 hours
        </div>
        <div style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.5 }}>
          Your next exercise unlocks in <strong style={{ color: colors.amber }}>{timeStr}</strong>.
          You can still browse the glossary and review past sessions.
        </div>
      </div>
      <div style={{
        padding:      "8px 16px",
        borderRadius: 8,
        background:   "rgba(99,102,241,0.08)",
        border:       `1px solid ${colors.border}`,
        fontSize:     13,
        fontWeight:   700,
        color:        colors.slate,
        flexShrink:   0,
        cursor:       "not-allowed",
      }}>
        🔒 Locked
      </div>
    </div>
  );
}
