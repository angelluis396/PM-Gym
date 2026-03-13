import VisionBox from "../components/VisionBox";
import { sharedStyles } from "../constants/styles";

/**
 * Shows the generated vision and lets the user start planning or regenerate.
 * @param {string}   vision       - The generated product vision
 * @param {function} onStartPlan  - Navigate to the form
 * @param {function} onRegenerate - Request a new vision
 * @param {boolean}  loading      - Whether a new vision is being fetched
 */
export default function Vision({ vision, onStartPlan, onRegenerate, loading }) {
  return (
    <>
      <VisionBox vision={vision} label="Your Product Vision" />

      <div style={sharedStyles.card}>
        <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800 }}>Ready to plan?</h2>
        <p style={{ color: "#64748b", margin: "0 0 24px" }}>
          Read the vision carefully, then build your full PM document below.
        </p>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            style={{ ...sharedStyles.btn, ...sharedStyles.btnPrimary }}
            onClick={onStartPlan}
          >
            Start Planning →
          </button>
          <button
            style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary }}
            onClick={onRegenerate}
            disabled={loading}
          >
            {loading ? "..." : "New Vision"}
          </button>
        </div>
      </div>
    </>
  );
}
