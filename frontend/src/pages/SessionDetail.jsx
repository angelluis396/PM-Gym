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

const FORM_LABELS = {
  targetGroup:        "Target Group",
  goal:               "Goal",
  needs:              "User Needs",
  value:              "Value Proposition",
  keyFeatures:        "Key Features",
  roadmap:            "Product Roadmap",
  releasePlan:        "Release Plan",
  themesEpicsStories: "Themes / Epics / Stories",
};

/**
 * Full breakdown of a past session.
 * @param {object}   session    - Session row from Supabase
 * @param {function} onBack     - Navigate back to dashboard
 */
export default function SessionDetail({ session, onBack }) {
  const date = new Date(session.created_at).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div>

      {/* Back button + date */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <button
          onClick={onBack}
          style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary, fontSize: 14 }}
        >
          ← Back to Dashboard
        </button>
        <span style={{ color: colors.textMuted, fontSize: 13 }}>{date}</span>
      </div>

      {/* Vision */}
      <VisionBox vision={session.vision} />

      {/* Overall grade */}
      <div style={{ ...sharedStyles.card, textAlign: "center" }}>
        <h2 style={{ margin: "0 0 24px", fontSize: 20, fontWeight: 800 }}>Grade</h2>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <GradeCircle score={session.score} letter={session.letter_grade} />
        </div>
        <p style={{ color: colors.slate, lineHeight: 1.7, margin: 0, fontSize: 15 }}>
          {session.overall_feedback}
        </p>
      </div>

      {/* Strengths */}
      {session.strengths?.length > 0 && (
        <div style={{ ...sharedStyles.card, borderLeft: `3px solid ${colors.green}` }}>
          <h3 style={{ margin: "0 0 12px", color: colors.green, fontSize: 16 }}>✓ Strengths</h3>
          {session.strengths.map((s, i) => (
            <div key={i} style={{ color: colors.slate, fontSize: 14, marginBottom: 6, paddingLeft: 12 }}>
              • {s}
            </div>
          ))}
        </div>
      )}

      {/* Improvements */}
      {session.improvements?.length > 0 && (
        <div style={{ ...sharedStyles.card, borderLeft: `3px solid ${colors.amber}` }}>
          <h3 style={{ margin: "0 0 12px", color: colors.amber, fontSize: 16 }}>↑ Areas to Improve</h3>
          {session.improvements.map((s, i) => (
            <div key={i} style={{ color: colors.slate, fontSize: 14, marginBottom: 6, paddingLeft: 12 }}>
              • {s}
            </div>
          ))}
        </div>
      )}

      {/* Section breakdown */}
      <div style={sharedStyles.card}>
        <h3 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 800 }}>Section Breakdown</h3>
        {Object.entries(SECTION_LABELS).map(([key, label]) =>
          session.sections?.[key] ? (
            <SectionScore
              key={key}
              label={label}
              score={session.sections[key].score}
              feedback={session.sections[key].feedback}
            />
          ) : null
        )}
      </div>

      {/* Original answers */}
      {session.form && (
        <div style={sharedStyles.card}>
          <h3 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 800 }}>Your Answers</h3>
          {Object.entries(FORM_LABELS).map(([key, label]) =>
            session.form[key] ? (
              <div key={key} style={{ marginBottom: 20 }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: colors.slate,
                  textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6,
                }}>
                  {label}
                </div>
                <div style={{
                  background: "#1e293b", borderRadius: 8, padding: "12px 14px",
                  fontSize: 14, color: colors.slateLight, lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                }}>
                  {session.form[key]}
                </div>
              </div>
            ) : null
          )}
        </div>
      )}

    </div>
  );
}
