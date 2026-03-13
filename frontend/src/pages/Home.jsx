import { sharedStyles } from "../constants/styles";

/**
 * Landing page. Explains how the app works and triggers vision generation.
 * @param {function} onStart   - Called when the user clicks "Get My Product Vision"
 * @param {boolean}  loading   - Whether a vision is currently being fetched
 */
export default function Home({ onStart, loading }) {
  const steps = [
    { n: "1", text: <>Get a randomly generated <strong style={{ color: "#e2e8f0" }}>product vision</strong> from AI</> },
    { n: "2", text: <>Fill out your <strong style={{ color: "#e2e8f0" }}>full PM plan</strong> — target group, goals, roadmap, epics & more</> },
    { n: "3", text: <>Receive a <strong style={{ color: "#e2e8f0" }}>detailed AI grade</strong> with section-by-section feedback</> },
  ];

  return (
    <div style={sharedStyles.card}>
      <h2 style={{ margin: "0 0 12px", fontSize: 22, fontWeight: 800 }}>How it works</h2>

      <div style={{ color: "#94a3b8", lineHeight: 1.8, marginBottom: 28 }}>
        {steps.map(({ n, text }) => (
          <div key={n} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            <span style={{
              background: "#6366f1",
              color: "white",
              borderRadius: "50%",
              width: 24, height: 24,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 800, flexShrink: 0,
            }}>
              {n}
            </span>
            <span>{text}</span>
          </div>
        ))}
      </div>

      <button
        style={{ ...sharedStyles.btn, ...sharedStyles.btnPrimary, width: "100%", justifyContent: "center" }}
        onClick={onStart}
        disabled={loading}
      >
        {loading ? "✦ Generating vision..." : "✦ Get My Product Vision"}
      </button>
    </div>
  );
}
