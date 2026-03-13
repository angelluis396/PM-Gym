import { colors } from "../constants/styles";

/**
 * A labelled textarea for the PM plan form.
 * @param {string}   label       - Section label (displayed in caps)
 * @param {string}   value       - Current value
 * @param {function} onChange    - Called with new string value
 * @param {string}   placeholder - Placeholder hint text
 * @param {number}   rows        - Number of visible rows (default 3)
 */
export default function FormField({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{
        display: "block",
        fontWeight: 700,
        color: colors.slateLight,
        fontSize: 13,
        marginBottom: 6,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
      }}>
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{
          width: "100%",
          padding: "12px 14px",
          background: "#1e293b",
          border: `1px solid ${colors.border}`,
          borderRadius: 8,
          color: colors.text,
          fontSize: 14,
          lineHeight: 1.6,
          resize: "vertical",
          outline: "none",
          fontFamily: "inherit",
          boxSizing: "border-box",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => (e.target.style.borderColor = colors.indigo)}
        onBlur={(e) => (e.target.style.borderColor = colors.border)}
      />
    </div>
  );
}
