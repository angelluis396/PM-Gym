import { colors } from "../constants/styles";

/**
 * Displays a single graded section with a progress bar and feedback text.
 * @param {string} label    - Display name of the section
 * @param {number} score    - 50–100
 * @param {string} feedback - AI feedback text
 */
export default function SectionScore({ label, score, feedback }) {
  const pct = ((score - 50) / 50) * 100;
  const color =
    score >= 85 ? colors.green :
    score >= 70 ? colors.blue :
    score >= 60 ? colors.amber :
    colors.red;

  return (
    <div style={{
      marginBottom: 16,
      padding: "14px 16px",
      background: "#1e293b",
      borderRadius: 10,
      borderLeft: `3px solid ${color}`,
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
      }}>
        <span style={{ fontWeight: 700, color: colors.text, fontSize: 14 }}>{label}</span>
        <span style={{ fontWeight: 800, color, fontSize: 15 }}>{score}</span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: colors.border, borderRadius: 2, marginBottom: 8 }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: color,
          borderRadius: 2,
          transition: "width 1s ease",
        }} />
      </div>

      <p style={{ margin: 0, color: colors.slate, fontSize: 13, lineHeight: 1.5 }}>
        {feedback}
      </p>
    </div>
  );
}
