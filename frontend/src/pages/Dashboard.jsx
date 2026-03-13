import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchSessions, computeMetrics } from "../api/sessions";
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

// ─── Helper: grade color ──────────────────────────────────────────────────────

function gradeColor(letter) {
  return letter === "A" ? colors.green
    : letter === "B" ? colors.blue
    : letter === "C" ? colors.amber
    : letter === "D" ? colors.orange
    : colors.red;
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }) {
  return (
    <div style={{
      background: "rgba(30,41,59,0.8)",
      border: `1px solid ${colors.border}`,
      borderRadius: 12,
      padding: "20px 24px",
      flex: 1,
      minWidth: 140,
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
        <div style={{
          height: "100%", width: `${pct}%`, background: color,
          borderRadius: 3, transition: "width 0.8s ease",
        }} />
      </div>
    </div>
  );
}

// ─── Session card ─────────────────────────────────────────────────────────────

function SessionCard({ session, onClick }) {
  const color = gradeColor(session.letter_grade);
  const date  = new Date(session.created_at).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <div
      onClick={onClick}
      style={{
        background: "rgba(30,41,59,0.8)",
        border: `1px solid ${colors.border}`,
        borderRadius: 12,
        padding: "20px 24px",
        cursor: "pointer",
        transition: "border-color 0.2s, transform 0.15s",
        display: "flex",
        gap: 20,
        alignItems: "flex-start",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = colors.indigo;
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = colors.border;
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Grade badge */}
      <div style={{
        width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
        border: `3px solid ${color}`, background: `${color}15`,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ fontSize: 20, fontWeight: 900, color, fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>
          {session.letter_grade}
        </div>
        <div style={{ fontSize: 10, color: colors.slate, fontWeight: 600 }}>{session.score}</div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: colors.textMuted, marginBottom: 6 }}>{date}</div>
        <p style={{
          margin: "0 0 8px", fontSize: 14, color: colors.slateLight,
          fontStyle: "italic", lineHeight: 1.5,
          overflow: "hidden", textOverflow: "ellipsis",
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

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onStart }) {
  return (
    <div style={{
      ...sharedStyles.card,
      textAlign: "center", padding: "60px 32px",
    }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🏋️</div>
      <h2 style={{ margin: "0 0 12px", fontSize: 20, fontWeight: 800 }}>No sessions yet</h2>
      <p style={{ color: colors.slate, margin: "0 0 28px", fontSize: 15, lineHeight: 1.6 }}>
        Complete your first PM plan exercise to start tracking your progress.
      </p>
      <button
        onClick={onStart}
        style={{ ...sharedStyles.btn, ...sharedStyles.btnPrimary }}
      >
        ✦ Start First Session
      </button>
    </div>
  );
}

// ─── Dashboard page ───────────────────────────────────────────────────────────

export default function Dashboard({ onStartSession, onViewSession }) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const data = await fetchSessions(user.id);
        setSessions(data);
      } catch (e) {
        setError("Failed to load sessions. Please refresh.");
      }
      setLoading(false);
    }
    load();
  }, [user]);

  const metrics = computeMetrics(sessions);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0", color: colors.slate }}>
        Loading your progress...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: "#450a0a", border: `1px solid ${colors.red}`,
        borderRadius: 8, padding: "12px 16px", color: "#fca5a5", fontSize: 14,
      }}>
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div>

      {/* Page title */}
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

      {sessions.length === 0 ? (
        <EmptyState onStart={onStartSession} />
      ) : (
        <>
          {/* ── Stat cards ── */}
          <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
            <StatCard
              label="Average Score"
              value={metrics.averageScore}
              sub="across all sessions"
            />
            <StatCard
              label="Personal Best"
              value={metrics.personalBest}
              sub={`out of 100`}
            />
            <StatCard
              label="Sessions"
              value={metrics.totalSessions}
              sub="completed"
            />
          </div>

          {/* ── Section averages ── */}
          {Object.keys(metrics.sectionAverages).length > 0 && (
            <div style={{ ...sharedStyles.card, marginBottom: 28 }}>
              <h3 style={{ margin: "0 0 20px", fontSize: 17, fontWeight: 800 }}>
                Average Score by Section
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 32px" }}>
                {Object.entries(metrics.sectionAverages)
                  .sort((a, b) => a[1] - b[1]) // weakest first
                  .map(([key, avg]) => (
                    <SectionBar
                      key={key}
                      label={SECTION_LABELS[key] || key}
                      score={avg}
                    />
                  ))}
              </div>
              <p style={{ color: colors.textMuted, fontSize: 12, margin: "16px 0 0" }}>
                Sections are sorted weakest to strongest — focus your practice on the lowest scores.
              </p>
            </div>
          )}

          {/* ── Session cards ── */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Recent Sessions</h3>
              <button
                onClick={onStartSession}
                style={{ ...sharedStyles.btn, ...sharedStyles.btnPrimary, fontSize: 13, padding: "10px 18px" }}
              >
                ✦ New Session
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onClick={() => onViewSession(session)}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
