import { useWindowWidth } from "../hooks/useWindowWidth";
import GradeCircle  from "../components/GradeCircle";
import SectionScore  from "../components/SectionScore";
import VisionBox     from "../components/VisionBox";
import { sharedStyles, colors } from "../constants/styles";

const SECTION_LABELS = {
  targetGroup:        "Target Group",
  goal:               "Goal",
  needs:              "User Needs",
  value:              "Value Proposition",
  keyFeatures:        "Key Features",
  roadmap:            "Roadmap",
  releasePlan:        "Release Plan",
  themesEpicsStories: "Epics & Stories",
};

export default function Results({ vision, results, onRetry, onEdit }) {
  const width    = useWindowWidth();
  const isMobile = width < 768;

  return (
    <div>
      <VisionBox vision={vision} />

      {/* Grade */}
      <div style={{ ...sharedStyles.card, textAlign: "center" }}>
        <h2 style={{ margin: "0 0 20px", fontSize: isMobile ? 18 : 20, fontWeight: 800 }}>Your Grade</h2>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <GradeCircle score={results.score} letter={results.letterGrade} />
        </div>
        <p style={{ color: colors.slate, lineHeight: 1.7, margin: 0, fontSize: isMobile ? 14 : 15 }}>
          {results.overallFeedback}
        </p>
      </div>

      {/* Strengths */}
      {results.strengths?.length > 0 && (
        <div style={{ ...sharedStyles.card, borderLeft: `3px solid ${colors.green}` }}>
          <h3 style={{ margin: "0 0 10px", color: colors.green, fontSize: 15 }}>✓ Strengths</h3>
          {results.strengths.map((s, i) => <div key={i} style={{ color: colors.slate, fontSize: 13, marginBottom: 5, paddingLeft: 10 }}>• {s}</div>)}
        </div>
      )}

      {/* Improvements */}
      {results.improvements?.length > 0 && (
        <div style={{ ...sharedStyles.card, borderLeft: `3px solid ${colors.amber}` }}>
          <h3 style={{ margin: "0 0 10px", color: colors.amber, fontSize: 15 }}>↑ Areas to Improve</h3>
          {results.improvements.map((s, i) => <div key={i} style={{ color: colors.slate, fontSize: 13, marginBottom: 5, paddingLeft: 10 }}>• {s}</div>)}
        </div>
      )}

      {/* Section breakdown */}
      <div style={sharedStyles.card}>
        <h3 style={{ margin: "0 0 16px", fontSize: isMobile ? 16 : 18, fontWeight: 800 }}>Section Breakdown</h3>
        {Object.entries(SECTION_LABELS).map(([key, label]) =>
          results.sections?.[key] ? (
            <SectionScore key={key} label={label} score={results.sections[key].score} feedback={results.sections[key].feedback} />
          ) : null
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, flexWrap: isMobile ? "wrap" : "nowrap" }}>
        <button style={{ ...sharedStyles.btn, ...sharedStyles.btnPrimary, flex: 1, justifyContent: "center", fontSize: isMobile ? 14 : 15 }} onClick={onRetry}>
          ✦ Try Again
        </button>
        <button style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary, fontSize: isMobile ? 14 : 15 }} onClick={onEdit}>
          ← Edit Plan
        </button>
      </div>
    </div>
  );
}