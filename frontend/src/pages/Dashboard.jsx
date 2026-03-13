import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchSessions, computeMetrics } from "../api/sessions";
import { fetchFocusedSessions } from "../api/focusedSessions";
import { fetchScenarioSessions } from "../api/scenarioSessions";
import { EXERCISES } from "../constants/focusedExercises";
import { SCENARIO_CATEGORIES } from "../constants/scenarioCategories";
import GradeCircle from "../components/GradeCircle";
import { sharedStyles, colors } from "../constants/styles";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SECTION_LABELS = {
  targetGroup: "Target Group", goal: "Goal", needs: "User Needs",
  value: "Value Proposition", keyFeatures: "Key Features",
  roadmap: "Roadmap", releasePlan: "Release Plan",
  themesEpicsStories: "Epics & Stories",
};

function gradeColor(letter) {
  return letter === "A" ? colors.green : letter === "B" ? colors.blue
    : letter === "C" ? colors.amber : letter === "D" ? colors.orange : colors.red;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function exerciseLabel(key) { return EXERCISES.find((e) => e.key === key)?.label || key; }
function exerciseEmoji(key) { return EXERCISES.find((e) => e.key === key)?.emoji || "🎯"; }
function categoryLabel(key) { return SCENARIO_CATEGORIES.find((c) => c.key === key)?.label || key; }
function categoryEmoji(key) { return SCENARIO_CATEGORIES.find((c) => c.key === key)?.emoji || "⚡"; }

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }) {
  return (
    <div style={{ background: "rgba(30,41,59,0.8)", border: `1px solid ${colors.border}`, borderRadius: 12, padding: "20px 24px", flex: 1, minWidth: 140 }}>
      <div style={{ fontSize: 13, color: colors.slate, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
      <div style={{ fontSize: 36, fontWeight: 900, color: colors.text, fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>{value ?? "—"}</div>
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

// ─── Grade badge (shared by all three card types) ─────────────────────────────

function GradeBadge({ letter, score }) {
  const color = gradeColor(letter);
  return (
    <div style={{
      width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
      border: `3px solid ${color}`, background: `${color}15`,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ fontSize: 20, fontWeight: 900, color, fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>{letter}</div>
      <div style={{ fontSize: 10, color: colors.slate, fontWeight: 600 }}>{score}</div>
    </div>
  );
}

// ─── Session cards ────────────────────────────────────────────────────────────

function cardHoverStyle(hovered) {
  return {
    background: "rgba(30,41,59,0.8)",
    border: `1px solid ${hovered ? colors.indigo : colors.border}`,
    borderRadius: 12, padding: "20px 24px", cursor: "pointer",
    transition: "border-color 0.2s, transform 0.15s",
    display: "flex", gap: 20, alignItems: "flex-start",
    transform: hovered ? "translateY(-2px)" : "none",
  };
}

function SessionCard({ session, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onClick={onClick} style={cardHoverStyle(hovered)}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <GradeBadge letter={session.letter_grade} score={session.score} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: colors.textMuted, marginBottom: 6 }}>{formatDate(session.created_at)}</div>
        <p style={{ margin: "0 0 8px", fontSize: 14, color: colors.slateLight, fontStyle: "italic", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          "{session.vision}"
        </p>
        <div style={{ fontSize: 13, color: colors.slate }}>{session.overall_feedback?.slice(0, 100)}...</div>
      </div>
      <div style={{ color: colors.slate, fontSize: 18, flexShrink: 0, alignSelf: "center" }}>→</div>
    </div>
  );
}

function FocusedSessionCard({ session, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onClick={onClick} style={cardHoverStyle(hovered)}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <GradeBadge letter={session.letter_grade} score={session.score} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: colors.textMuted }}>{formatDate(session.created_at)}</span>
          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 20, color: "#a5b4fc" }}>
            {exerciseEmoji(session.exercise_type)} {exerciseLabel(session.exercise_type)}
          </span>
        </div>
        <p style={{ margin: "0 0 8px", fontSize: 14, color: colors.slateLight, fontStyle: "italic", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          "{session.vision}"
        </p>
        <div style={{ fontSize: 13, color: colors.slate }}>{session.feedback?.slice(0, 100)}...</div>
      </div>
      <div style={{ color: colors.slate, fontSize: 18, flexShrink: 0, alignSelf: "center" }}>→</div>
    </div>
  );
}

function ScenarioCard({ session, onClick }) {
  const [hovered, setHovered] = useState(false);
  const catColor = SCENARIO_CATEGORIES.find((c) => c.key === session.category)?.color || colors.indigo;
  return (
    <div onClick={onClick} style={cardHoverStyle(hovered)}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <GradeBadge letter={session.letter_grade} score={session.score} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: colors.textMuted }}>{formatDate(session.created_at)}</span>
          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", background: `${catColor}18`, border: `1px solid ${catColor}40`, borderRadius: 20, color: catColor }}>
            {categoryEmoji(session.category)} {categoryLabel(session.category)}
          </span>
        </div>
        <p style={{ margin: "0 0 8px", fontSize: 14, color: colors.slateLight, lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {session.scenario}
        </p>
        <div style={{ fontSize: 13, color: colors.slate }}>{session.feedback?.slice(0, 100)}...</div>
      </div>
      <div style={{ color: colors.slate, fontSize: 18, flexShrink: 0, alignSelf: "center" }}>→</div>
    </div>
  );
}

// ─── Modals ───────────────────────────────────────────────────────────────────

function ModalShell({ onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 24px", overflowY: "auto" }}>
      <div style={{ background: "#0f172a", border: `1px solid ${colors.border}`, borderRadius: 16, width: "100%", maxWidth: 600, padding: 32 }}>
        {children}
        <button onClick={onClose} style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary, width: "100%", justifyContent: "center", marginTop: 8 }}>Close</button>
      </div>
    </div>
  );
}

function FocusedSessionDetail({ session, onClose }) {
  return (
    <ModalShell onClose={onClose}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 4 }}>{exerciseEmoji(session.exercise_type)} {exerciseLabel(session.exercise_type)} · {formatDate(session.created_at)}</div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Session Review</h2>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: colors.slate, fontSize: 24, cursor: "pointer" }}>×</button>
      </div>
      <div style={{ ...sharedStyles.visionBox, marginBottom: 16 }}>
        <div style={sharedStyles.visionLabel}>Product Vision</div>
        <p style={{ ...sharedStyles.visionText, margin: 0 }}>{session.vision}</p>
      </div>
      <div style={{ ...sharedStyles.card, textAlign: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <GradeCircle score={session.score} letter={session.letter_grade} />
        </div>
        <p style={{ color: colors.slate, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{session.feedback}</p>
      </div>
      <div style={{ ...sharedStyles.card, marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: colors.slate, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Your Answer</div>
        <p style={{ margin: 0, fontSize: 14, color: colors.slateLight, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{session.answer}</p>
      </div>
      {session.strengths?.length > 0 && (
        <div style={{ ...sharedStyles.card, borderLeft: `3px solid ${colors.green}`, marginBottom: 12 }}>
          <h3 style={{ margin: "0 0 10px", color: colors.green, fontSize: 15 }}>✓ Strengths</h3>
          {session.strengths.map((s, i) => <div key={i} style={{ color: colors.slate, fontSize: 13, marginBottom: 4, paddingLeft: 10 }}>• {s}</div>)}
        </div>
      )}
      {session.improvements?.length > 0 && (
        <div style={{ ...sharedStyles.card, borderLeft: `3px solid ${colors.amber}`, marginBottom: 16 }}>
          <h3 style={{ margin: "0 0 10px", color: colors.amber, fontSize: 15 }}>↑ Areas to Improve</h3>
          {session.improvements.map((s, i) => <div key={i} style={{ color: colors.slate, fontSize: 13, marginBottom: 4, paddingLeft: 10 }}>• {s}</div>)}
        </div>
      )}
    </ModalShell>
  );
}

function ScenarioSessionDetail({ session, onClose }) {
  const [showModel, setShowModel] = useState(false);
  const cat = SCENARIO_CATEGORIES.find((c) => c.key === session.category);

  return (
    <ModalShell onClose={onClose}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 4 }}>{cat?.emoji} {cat?.label} · {formatDate(session.created_at)}</div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Scenario Review</h2>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: colors.slate, fontSize: 24, cursor: "pointer" }}>×</button>
      </div>
      <div style={{ background: `${cat?.color}12`, border: `1px solid ${cat?.color}40`, borderRadius: 12, padding: 20, marginBottom: 12 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: cat?.color, fontWeight: 700, marginBottom: 8 }}>{cat?.emoji} Scenario</div>
        <p style={{ margin: 0, fontSize: 14, color: colors.text, lineHeight: 1.7 }}>{session.scenario}</p>
      </div>
      <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: colors.red, fontWeight: 700, marginBottom: 6 }}>⚡ Challenge</div>
        <p style={{ margin: 0, fontSize: 14, color: "#fca5a5", fontWeight: 600, lineHeight: 1.6 }}>{session.challenge}</p>
      </div>
      <div style={{ ...sharedStyles.card, textAlign: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <GradeCircle score={session.score} letter={session.letter_grade} />
        </div>
        <p style={{ color: colors.slate, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{session.feedback}</p>
      </div>
      <div style={{ ...sharedStyles.card, marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: colors.slate, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Your Answer</div>
        <p style={{ margin: 0, fontSize: 14, color: colors.slateLight, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{session.answer}</p>
      </div>
      <div style={{ ...sharedStyles.card, marginBottom: 16 }}>
        <button onClick={() => setShowModel(!showModel)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: 0, fontFamily: "inherit" }}>
          <span style={{ fontWeight: 800, fontSize: 15, color: colors.text }}>💡 Model Answer</span>
          <span style={{ color: colors.slate, fontSize: 18, display: "inline-block", transform: showModel ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>↓</span>
        </button>
        {showModel && (
          <div style={{ marginTop: 14, padding: 14, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 8 }}>
            <p style={{ margin: 0, fontSize: 14, color: "#c7d2fe", lineHeight: 1.8 }}>{session.model_answer}</p>
          </div>
        )}
      </div>
    </ModalShell>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ emoji, title, message, buttonLabel, onAction }) {
  return (
    <div style={{ ...sharedStyles.card, textAlign: "center", padding: "40px 32px" }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>{emoji}</div>
      <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 800 }}>{title}</h3>
      <p style={{ color: colors.slate, margin: "0 0 20px", fontSize: 14, lineHeight: 1.6 }}>{message}</p>
      <button onClick={onAction} style={{ ...sharedStyles.btn, ...sharedStyles.btnPrimary, fontSize: 13, padding: "10px 20px" }}>{buttonLabel}</button>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard({ onStartSession, onStartFocused, onStartScenario, onViewSession }) {
  const { user } = useAuth();

  const [sessions,         setSessions]         = useState([]);
  const [focusedSessions,  setFocusedSessions]  = useState([]);
  const [scenarioSessions, setScenarioSessions] = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState("");
  const [focusedDetail,    setFocusedDetail]    = useState(null);
  const [scenarioDetail,   setScenarioDetail]   = useState(null);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const [full, focused, scenario] = await Promise.all([
          fetchSessions(user.id),
          fetchFocusedSessions(user.id),
          fetchScenarioSessions(user.id),
        ]);
        setSessions(full);
        setFocusedSessions(focused);
        setScenarioSessions(scenario);
      } catch (e) {
        setError("Failed to load sessions. Please refresh.");
      }
      setLoading(false);
    }
    load();
  }, [user]);

  const metrics         = computeMetrics(sessions);
  const hasAny          = sessions.length > 0 || focusedSessions.length > 0 || scenarioSessions.length > 0;
  const hasFullSessions = sessions.length > 0;

  if (loading) return <div style={{ textAlign: "center", padding: "80px 0", color: colors.slate }}>Loading your progress...</div>;
  if (error)   return <div style={{ background: "#450a0a", border: `1px solid ${colors.red}`, borderRadius: 8, padding: "12px 16px", color: "#fca5a5", fontSize: 14 }}>⚠️ {error}</div>;

  return (
    <div>
      {focusedDetail  && <FocusedSessionDetail  session={focusedDetail}  onClose={() => setFocusedDetail(null)} />}
      {scenarioDetail && <ScenarioSessionDetail session={scenarioDetail} onClose={() => setScenarioDetail(null)} />}

      <div style={{ marginBottom: 32 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 900, fontFamily: "'Playfair Display', serif", background: "linear-gradient(135deg, #e2e8f0, #a5b4fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Your Progress
        </h2>
        <p style={{ color: colors.textMuted, margin: 0, fontSize: 15 }}>Track how your PM skills are developing over time.</p>
      </div>

      {/* All empty */}
      {!hasAny && (
        <div style={{ ...sharedStyles.card, textAlign: "center", padding: "60px 32px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏋️</div>
          <h2 style={{ margin: "0 0 12px", fontSize: 20, fontWeight: 800 }}>No sessions yet</h2>
          <p style={{ color: colors.slate, margin: "0 0 28px", fontSize: 15, lineHeight: 1.6 }}>Complete your first exercise to start tracking your progress.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={onStartSession}  style={{ ...sharedStyles.btn, ...sharedStyles.btnPrimary }}>📋 Full PM Plan</button>
            <button onClick={onStartFocused}  style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary }}>🎯 Focused Practice</button>
            <button onClick={onStartScenario} style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary }}>⚡ Scenario Runs</button>
          </div>
        </div>
      )}

      {hasAny && (
        <>
          {/* Stats — full PM plan only */}
          {hasFullSessions && (
            <>
              <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
                <StatCard label="Average Score" value={metrics.averageScore} sub="full PM plan sessions" />
                <StatCard label="Personal Best"  value={metrics.personalBest}  sub="out of 100" />
                <StatCard label="Sessions"        value={metrics.totalSessions} sub="completed" />
              </div>
              {Object.keys(metrics.sectionAverages).length > 0 && (
                <div style={{ ...sharedStyles.card, marginBottom: 28 }}>
                  <h3 style={{ margin: "0 0 20px", fontSize: 17, fontWeight: 800 }}>Average Score by Section</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 32px" }}>
                    {Object.entries(metrics.sectionAverages).sort((a, b) => a[1] - b[1]).map(([key, avg]) => (
                      <SectionBar key={key} label={SECTION_LABELS[key] || key} score={avg} />
                    ))}
                  </div>
                  <p style={{ color: colors.textMuted, fontSize: 12, margin: "16px 0 0" }}>Sorted weakest to strongest.</p>
                </div>
              )}
            </>
          )}

          {/* Full PM plan sessions */}
          <div style={{ marginBottom: 36 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>📋 Full PM Plan Sessions</h3>
              <button onClick={onStartSession} style={{ ...sharedStyles.btn, ...sharedStyles.btnPrimary, fontSize: 13, padding: "10px 18px" }}>✦ New</button>
            </div>
            {sessions.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {sessions.map((s) => <SessionCard key={s.id} session={s} onClick={() => onViewSession(s)} />)}
              </div>
            ) : (
              <EmptyState emoji="📋" title="No full PM plan sessions yet" message="Complete a full PM plan exercise to see results here." buttonLabel="Start" onAction={onStartSession} />
            )}
          </div>

          {/* Focused practice sessions */}
          <div style={{ marginBottom: 36 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>🎯 Focused Practice Sessions</h3>
              <button onClick={onStartFocused} style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary, fontSize: 13, padding: "10px 18px" }}>✦ New</button>
            </div>
            {focusedSessions.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {focusedSessions.map((s) => <FocusedSessionCard key={s.id} session={s} onClick={() => setFocusedDetail(s)} />)}
              </div>
            ) : (
              <EmptyState emoji="🎯" title="No focused practice sessions yet" message="Pick a specific skill to drill — epics, roadmaps, release plans and more." buttonLabel="Start" onAction={onStartFocused} />
            )}
          </div>

          {/* Scenario sessions */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>⚡ Scenario Runs</h3>
              <button onClick={onStartScenario} style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary, fontSize: 13, padding: "10px 18px" }}>✦ New</button>
            </div>
            {scenarioSessions.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {scenarioSessions.map((s) => <ScenarioCard key={s.id} session={s} onClick={() => setScenarioDetail(s)} />)}
              </div>
            ) : (
              <EmptyState emoji="⚡" title="No scenario runs yet" message="Respond to realistic PM challenges across 8 categories." buttonLabel="Start" onAction={onStartScenario} />
            )}
          </div>
        </>
      )}
    </div>
  );
}