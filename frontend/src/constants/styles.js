// ─── Shared design tokens ─────────────────────────────────────────────────────

export const colors = {
  bg: "#0f172a",
  bgCard: "rgba(30,41,59,0.8)",
  border: "#334155",
  indigo: "#6366f1",
  purple: "#8b5cf6",
  slate: "#94a3b8",
  slateLight: "#cbd5e1",
  text: "#e2e8f0",
  textMuted: "#64748b",
  green: "#22c55e",
  blue: "#3b82f6",
  amber: "#f59e0b",
  orange: "#f97316",
  red: "#ef4444",
};

// ─── Shared component styles ──────────────────────────────────────────────────

export const sharedStyles = {
  card: {
    background: colors.bgCard,
    borderRadius: 16,
    padding: 32,
    border: `1px solid ${colors.border}`,
    backdropFilter: "blur(10px)",
    marginBottom: 24,
  },
  btn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "14px 28px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 15,
    transition: "all 0.2s",
    fontFamily: "inherit",
  },
  btnPrimary: {
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "white",
    boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
  },
  btnSecondary: {
    background: "#1e293b",
    color: colors.slate,
    border: `1px solid ${colors.border}`,
  },
  visionBox: {
    background: "linear-gradient(135deg, #1e1b4b, #312e81)",
    border: "1px solid #4f46e5",
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
  },
  visionLabel: {
    fontSize: 11,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "#818cf8",
    fontWeight: 700,
    marginBottom: 10,
  },
  visionText: {
    fontSize: 17,
    lineHeight: 1.7,
    color: "#c7d2fe",
    margin: 0,
    fontStyle: "italic",
  },
};
