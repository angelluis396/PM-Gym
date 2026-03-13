import GradeCircle from "../components/GradeCircle";
import SectionScore from "../components/SectionScore";
import VisionBox from "../components/VisionBox";
import { sharedStyles, colors } from "../constants/styles";

const SECTION_LABELS = [
  ["Target Group",          "targetGroup"],
  ["Goal",                  "goal"],
  ["User Needs",            "needs"],
  ["Value Proposition",     "value"],
  ["Key Features",          "keyFeatures"],
  ["Product Roadmap",       "roadmap"],
  ["Release Plan",          "releasePlan"],
  ["Themes/Epics/Stories",  "themesEpicsStories"],
];

/**
 * Displays the full AI grading results.
 * @param {string}   vision      - The original product vision
 * @param {object}   results     - Grading data returned from the backend
 * @param {function} onRetry     - Start over with a new vision
 * @param {function} onEdit      - Go back to the form to revise
 */
export default function Results({ vision, results, onRetry, onEdit }) {
  return (
    <>
      <VisionBox vision={vision} />

      {/* Overall grade */}
      <div style={{ ...sharedStyles.card, textAlign: "center" }}>
        <h2 style={{ margin: "0 0 24px", fontSize: 20, fontWeight: 800 }}>Your Grade</h2>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <GradeCircle score={results.score} letter={results.letterGrade} />
        </div>
        <p style={{ color: colors.slate, lineHeight: 1.7, margin: 0, fontSize: 15 }}>
          {results.overallFeedback}
        </p>
      </div>

      {/* Strengths */}
      {results.strengths?.length > 0 && (
        <div style={{ ...sharedStyles.card, borderLeft: `3px solid ${colors.green}` }}>
          <h3 style={{ margin: "0 0 12px", color: colors.green, fontSize: 16 }}>✓ Strengths</h3>
          {results.strengths.map((s, i) => (
            <div key={i} style={{ color: colors.slate, fontSize: 14, marginBottom: 6, paddingLeft: 12 }}>
              • {s}
            </div>
          ))}
        </div>
      )}

      {/* Improvements */}
      {results.improvements?.length > 0 && (
        <div style={{ ...sharedStyles.card, borderLeft: `3px solid ${colors.amber}` }}>
          <h3 style={{ margin: "0 0 12px", color: colors.amber, fontSize: 16 }}>↑ Areas to Improve</h3>
          {results.improvements.map((s, i) => (
            <div key={i} style={{ color: colors.slate, fontSize: 14, marginBottom: 6, paddingLeft: 12 }}>
              • {s}
            </div>
          ))}
        </div>
      )}

      {/* Section breakdown */}
      <div style={sharedStyles.card}>
        <h3 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 800 }}>Section Breakdown</h3>
        {SECTION_LABELS.map(([label, key]) =>
          results.sections?.[key] ? (
            <SectionScore
              key={key}
              label={label}
              score={results.sections[key].score}
              feedback={results.sections[key].feedback}
            />
          ) : null
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 12 }}>
        <button
          style={{ ...sharedStyles.btn, ...sharedStyles.btnPrimary, flex: 1, justifyContent: "center" }}
          onClick={onRetry}
        >
          ✦ Try Again with New Vision
        </button>
        <button
          style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary }}
          onClick={onEdit}
        >
          ← Edit My Plan
        </button>
      </div>
    </>
  );
}
