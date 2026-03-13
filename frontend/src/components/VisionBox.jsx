import { sharedStyles } from "../constants/styles";

/**
 * Displays the current product vision in a styled indigo box.
 * Used on the Vision, Form, and Results pages.
 * @param {string} vision - The product vision text
 * @param {string} label  - Optional override for the label (default: "Product Vision")
 */
export default function VisionBox({ vision, label = "Product Vision" }) {
  return (
    <div style={sharedStyles.visionBox}>
      <div style={sharedStyles.visionLabel}>{label}</div>
      <p style={sharedStyles.visionText}>{vision}</p>
    </div>
  );
}
