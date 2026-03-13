import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchSessions, computeMetrics } from "../api/sessions";
import { fetchFocusedSessions } from "../api/focusedSessions";
import { EXERCISES } from "../constants/focusedExercises";
import { sharedStyles, colors } from "../constants/styles";

// ─── Section display labels ───────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function gradeColor(letter) {
  return letter === "A" ? colors.green
    : letter === "B" ? colors.blue
    : letter === "C" ? colors.amber
    : letter === "D" ? colors.orange
    : colors.red;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function exerciseLabel(key) {
  return EXERCISES.find((e) => e.key === key)?.label || key;
}

function exerciseEmoji(key) {
  return EXERCISES.find((e) => e.key === key)?.emoji || "🎯";
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }) {
  return (
    <div style={{
      background: "rgba(30,41,59,0.8)",
      border: `1px solid ${colors.border}`,
      borderRadius: 12, padding: "20px 24px",
      flex: 1, minWidth: 140,
    }}>
      <div style={{ fontSize: 13, color: colors.slate, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </div>
      <div style={{ fontSize: 36, fontWeight: 900, color: colors.text, fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>
        {value ?? "—"}
      </div>
      {sub && <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

// ─── Section bar ─────────────────────────────────────────────────────────────

function SectionBar({ label, score }) {
  const pct   = ((score - 50) / 50) * 100;
  const color = score >= 85 ? colors.green : score >= 70 ? colors.blue : score >= 60 ? colors.amber : colors.red;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 13, color: colors.slateLight, fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 13, color, fontWeight: 800 }}>{score}</span>
      </div>
      <div style={{ height: 6, background: "#1e293b", borderRadius: 3 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3, transition: "width 0.8s ease" }} />
      </div>
    </div>
  );
}

// ─── Full PM plan session card ────────────────────────────────────────────────

function SessionCard({ session, onClick }) {
  const color = gradeColor(session.letter_grade);
  return (
    <div
      onClick={onClick}
      style={{
        background: "rgba(30,41,59,0.8)", border: `1px solid ${colors.border}`,
        borderRadius: 12, padding: "20px 24px", cursor: "pointer",
        transition: "border-color 0.2s, transform 0.15s",
        display: "flex", gap: 20, alignItems: "flex-start",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.indigo; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {/* Grade badge */}
      <div style={{
        width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
        border: `3px solid ${color}`, background: `${color}15`,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ fontSize: 20, fontWeight: 900, color, fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>
          {session.letter_grade}
        </div>
        <div style={{ fontSize: 10, color: colors.slate, fontWeight: 600 }}>{session.score}</div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: colors.textMuted, marginBottom: 6 }}>{formatDate(session.created_at)}</div>
        <p style={{
          margin: "0 0 8px", fontSize: 14, color: colors.slateLight, fontStyle: "italic",
          lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        }}>
          "{session.vision}"
        </p>
        <div style={{ fontSize: 13, color: colors.slate, lineHeight: 1.5 }}>
          {session.overall_feedback?.slice(0, 100)}...
        </div>
      </div>
      <div style={{ color: colors.slate, fontSize: 18, flexShrink: 0, alignSelf: "center" }}>→</div>
    </div>
  );
}

// ─── Focused session card ─────────────────────────────────────────────────────

function FocusedSessionCard({ session, onClick }) {
  const color = gradeColor(session.letter_grade);
  return (
    <div
      onClick={onClick}
      style={{
        background: "rgba(30,41,59,0.8)", border: `1px solid ${colors.border}`,
        borderRadius: 12, padding: "20px 24px", cursor: "pointer",
        transition: "border-color 0.2s, transform 0.15s",
        display: "flex", gap: 20, alignItems: "flex-start",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.indigo; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {/* Grade badge */}
      <div style={{
        width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
        border: `3px solid ${color}`, background: `${color}15`,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ fontSize: 20, fontWeight: 900, color, fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>
          {session.letter_grade}
        </div>
        <div style={{ fontSize: 10, color: colors.slate, fontWeight: 600 }}>{session.score}</div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: colors.textMuted }}>{formatDate(session.created_at)}</span>
          {/* Exercise type pill */}
          <span style={{
            fontSize: 11, fontWeight: 700, padding: "2px 8px",
            background: "rgba(99,102,241,0.15)", border: `1px solid rgba(99,102,241,0.3)`,
            borderRadius: 20, color: "#a5b4fc",
          }}>
            {exerciseEmoji(session.exercise_type)} {exerciseLabel(session.exercise_type)}
          </span>
        </div>
        <p style={{
          margin: "0 0 8px", fontSize: 14, color: colors.slateLight, fontStyle: "italic",
          lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        }}>
          "{session.vision}"
        </p>
        <div style={{ fontSize: 13, color: colors.slate, lineHeight: 1.5 }}>
          {session.feedback?.slice(0, 100)}...
        </div>
      </div>
      <div style={{ color: colors.slate, fontSize: 18, flexShrink: 0, alignSelf: "center" }}>→</div>
    </div>
  );
}

// ─── Focused session detail modal ─────────────────────────────────────────────

function FocusedSessionDetail({ session, onClose }) {
  const color = gradeColor(session.letter_grade);
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      background: "rgba(0,0,0,0.7)", display: "flex",
      alignItems: "flex-start", justifyContent: "center",
      padding: "40px 24px", overflowY: "auto",
    }}>
      <div style={{
        background: "#0f172a", border: `1px solid ${colors.border}`,
        borderRadius: 16, width: "100%", maxWidth: 600, padding: 32,
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 4 }}>
              {exerciseEmoji(session.exercise_type)} {exerciseLabel(session.exercise_type)} · {formatDate(session.created_at)}
            </div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Session Review</h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: colors.slate, fontSize: 24, cursor: "pointer", fontFamily: "inherit" }}
          >
            ×
          </button>
        </div>

        {/* Vision */}
        <div style={{ ...sharedStyles.visionBox, marginBottom: 20 }}>
          <div style={sharedStyles.visionLabel}>Product Vision</div>
          <p style={{ ...sharedStyles.visionText, margin: 0 }}>{session.vision}</p>
        </div>

        {/* Extra context */}
        {session.context && (
          <div style={{ ...sharedStyles.visionBox, marginBottom: 20 }}>
            <div style={sharedStyles.visionLabel}>Exercise Context</div>
            <p style={{ ...sharedStyles.visionText, margin: 0, whiteSpace: "pre-wrap" }}>{session.context}</p>
          </div>
        )}

        {/* Grade */}
        <div style={{ ...sharedStyles.card, textAlign: "center", marginBottom: 16 }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%", margin: "0 auto 16px",
            border: `4px solid ${color}`, background: `${color}15`,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ fontSize: 28, fontWeight: 900, color, fontFamily: "'Playfair Display', serif" }}>{session.letter_grade}</div>
            <div style={{ fontSize: 11, color: colors.slate }}>{session.score}/100</div>
          </div>
          <p style={{ color: colors.slate, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{session.feedback}</p>
        </div>

        {/* Your answer */}
        <div style={{ ...sharedStyles.card, marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: colors.slate, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
            Your Answer
          </div>
          <p style={{ margin: 0, fontSize: 14, color: colors.slateLight, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
            {session.answer}
          </p>
        </div>

        {/* Strengths */}
        {session.strengths?.length > 0 && (
          <div style={{ ...sharedStyles.card, borderLeft: `3px solid ${colors.green}`, marginBottom: 16 }}>
            <h3 style={{ margin: "0 0 10px", color: colors.green, fontSize: 15 }}>✓ Strengths</h3>
            {session.strengths.map((s, i) => (
              <div key={i} style={{ color: colors.slate, fontSize: 13, marginBottom: 5, paddingLeft: 10 }}>• {s}</div>
            ))}
          </div>
        )}

        {/* Improvements */}
        {session.improvements?.length > 0 && (
          <div style={{ ...sharedStyles.card, borderLeft: `3px solid ${colors.amber}`, marginBottom: 24 }}>
            <h3 style={{ margin: "0 0 10px", color: colors.amber, fontSize: 15 }}>↑ Areas to Improve</h3>
            {session.improvements.map((s, i) => (
              <div key={i} style={{ color: colors.slate, fontSize: 13, marginBottom: 5, paddingLeft: 10 }}>• {s}</div>
            ))}
          </div>
        )}

        <button onClick={onClose} style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary, width: "100%", justifyContent: "center" }}>
          Close
        </button>
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ emoji, title, message, buttonLabel, onAction }) {
  return (
    <div style={{ ...sharedStyles.card, textAlign: "center", padding: "40px 32px" }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>{emoji}</div>
      <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 800 }}>{title}</h3>
      <p style={{ color: colors.slate, margin: "0 0 20px", fontSize: 14, lineHeight: 1.6 }}>{message}</p>
      <button onClick={onAction} style={{ ...sharedStyles.btn, ...sharedStyles.btnPrimary, fontSize: 13, padding: "10px 20px" }}>
        {buttonLabel}
      </button>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard({ onStartSession, onViewSession, onStartFocused }) {
  const { user } = useAuth();

  const [sessions,        setSessions]        = useState([]);
  const [focusedSessions, setFocusedSessions] = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState("");
  const [focusedDetail,   setFocusedDetail]   = useState(null);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const [full, focused] = await Promise.all([
          fetchSessions(user.id),
          fetchFocusedSessions(user.id),
        ]);
        setSessions(full);
        setFocusedSessions(focused);
      } catch (e) {
        setError("Failed to load sessions. Please refresh.");
      }
      setLoading(false);
    }
    load();
  }, [user]);

  const metrics = computeMetrics(sessions);

  if (loading) {
    return <div style={{ textAlign: "center", padding: "80px 0", color: colors.slate }}>Loading your progress...</div>;
  }

  if (error) {
    return (
      <div style={{ background: "#450a0a", border: `1px solid ${colors.red}`, borderRadius: 8, padding: "12px 16px", color: "#fca5a5", fontSize: 14 }}>
        ⚠️ {error}
      </div>
    );
  }

  const hasFullSessions    = sessions.length > 0;
  const hasFocusedSessions = focusedSessions.length > 0;
  const hasAnySessions     = hasFullSessions || hasFocusedSessions;

  return (
    <div>
      {/* Focused session detail modal */}
      {focusedDetail && (
        <FocusedSessionDetail
          session={focusedDetail}
          onClose={() => setFocusedDetail(null)}
        />
      )}

      {/* Title */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{
          margin: "0 0 4px", fontSize: 28, fontWeight: 900,
          fontFamily: "'Playfair Display', serif",
          background: "linear-gradient(135deg, #e2e8f0, #a5b4fc)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          Your Progress
        </h2>
        <p style={{ color: colors.textMuted, margin: 0, fontSize: 15 }}>
          Track how your PM skills are developing over time.
        </p>
      </div>

      {/* Empty state — nothing at all */}
      {!hasAnySessions && (
        <div style={{ ...sharedStyles.card, textAlign: "center", padding: "60px 32px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏋️</div>
          <h2 style={{ margin: "0 0 12px", fontSize: 20, fontWeight: 800 }}>No sessions yet</h2>
          <p style={{ color: colors.slate, margin: "0 0 28px", fontSize: 15, lineHeight: 1.6 }}>
            Complete your first exercise to start tracking your progress.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={onStartSession} style={{ ...sharedStyles.btn, ...sharedStyles.btnPrimary }}>
              📋 Full PM Plan
            </button>
            <button onClick={onStartFocused} style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary }}>
              🎯 Focused Practice
            </button>
          </div>
        </div>
      )}

      {/* Full PM Plan section */}
      {hasAnySessions && (
        <>
          {/* ── Stats (full sessions only) ── */}
          {hasFullSessions && (
            <>
              <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
                <StatCard label="Average Score"  value={metrics.averageScore} sub="full PM plan sessions" />
                <StatCard label="Personal Best"  value={metrics.personalBest} sub="out of 100" />
                <StatCard label="Sessions"       value={metrics.totalSessions} sub="completed" />
              </div>

              {/* Section averages */}
              {Object.keys(metrics.sectionAverages).length > 0 && (
                <div style={{ ...sharedStyles.card, marginBottom: 28 }}>
                  <h3 style={{ margin: "0 0 20px", fontSize: 17, fontWeight: 800 }}>
                    Average Score by Section
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 32px" }}>
                    {Object.entries(metrics.sectionAverages)
                      .sort((a, b) => a[1] - b[1])
                      .map(([key, avg]) => (
                        <SectionBar key={key} label={SECTION_LABELS[key] || key} score={avg} />
                      ))}
                  </div>
                  <p style={{ color: colors.textMuted, fontSize: 12, margin: "16px 0 0" }}>
                    Sorted weakest to strongest — focus your practice on the lowest scores.
                  </p>
                </div>
              )}
            </>
          )}

          {/* ── Full PM Plan sessions ── */}
          <div style={{ marginBottom: 36 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>📋 Full PM Plan Sessions</h3>
              <button
                onClick={onStartSession}
                style={{ ...sharedStyles.btn, ...sharedStyles.btnPrimary, fontSize: 13, padding: "10px 18px" }}
              >
                ✦ New Session
              </button>
            </div>

            {hasFullSessions ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {sessions.map((session) => (
                  <SessionCard key={session.id} session={session} onClick={() => onViewSession(session)} />
                ))}
              </div>
            ) : (
              <EmptyState
                emoji="📋"
                title="No full PM plan sessions yet"
                message="Complete a full PM plan exercise to see your results here."
                buttonLabel="Start Full PM Plan"
                onAction={onStartSession}
              />
            )}
          </div>

          {/* ── Focused Practice sessions ── */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>🎯 Focused Practice Sessions</h3>
              <button
                onClick={onStartFocused}
                style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary, fontSize: 13, padding: "10px 18px" }}
              >
                ✦ New Exercise
              </button>
            </div>

            {hasFocusedSessions ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {focusedSessions.map((session) => (
                  <FocusedSessionCard
                    key={session.id}
                    session={session}
                    onClick={() => setFocusedDetail(session)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                emoji="🎯"
                title="No focused practice sessions yet"
                message="Pick a specific skill to drill — epics, roadmaps, release plans and more."
                buttonLabel="Start Focused Practice"
                onAction={onStartFocused}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}