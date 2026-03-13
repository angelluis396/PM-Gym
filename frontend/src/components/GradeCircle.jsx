import { colors } from "../constants/styles";

/**
 * Displays a circular badge showing the letter grade and numeric score.
 * @param {string} letter - A, B, C, D, or F
 * @param {number} score  - 50–100
 */
export default function GradeCircle({ letter, score }) {
  const color =
    letter === "A" ? colors.green :
    letter === "B" ? colors.blue :
    letter === "C" ? colors.amber :
    letter === "D" ? colors.orange :
    colors.red;

  return (
    <div style={{
      width: 120,
      height: 120,
      borderRadius: "50%",
      border: `6px solid ${color}`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: `${color}15`,
      boxShadow: `0 0 30px ${color}40`,
    }}>
      <div style={{
        fontSize: 36,
        fontWeight: 900,
        color,
        fontFamily: "'Playfair Display', serif",
      }}>
        {letter}
      </div>
      <div style={{ fontSize: 13, color: colors.slate, fontWeight: 600 }}>
        {score}/100
      </div>
    </div>
  );
}
