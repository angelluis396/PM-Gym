import { useState, useEffect } from "react";
import { colors } from "../constants/styles";

const STORAGE_KEY = "pm_gym_beta_dismissed";

export default function BetaBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  function handleDismiss() {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div style={{
      position:   "fixed",
      bottom:     96, // sits above the floating bottom nav
      left:       "50%",
      transform:  "translateX(-50%)",
      width:      "calc(100% - 32px)",
      maxWidth:   680,
      zIndex:     150,
      background: "rgba(30,41,59,0.98)",
      border:     "1px solid rgba(99,102,241,0.4)",
      borderRadius: 16,
      padding:    "16px 18px",
      backdropFilter: "blur(16px)",
      boxShadow:  "0 8px 32px rgba(0,0,0,0.4)",
    }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        {/* Beta badge */}
        <div style={{
          flexShrink:   0,
          padding:      "3px 8px",
          background:   "rgba(99,102,241,0.2)",
          border:       "1px solid rgba(99,102,241,0.4)",
          borderRadius: 6,
          fontSize:     11,
          fontWeight:   800,
          color:        "#a5b4fc",
          letterSpacing: "0.08em",
          marginTop:    2,
        }}>
          BETA
        </div>

        {/* Message */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: colors.text, marginBottom: 4 }}>
            Welcome to PM Gym — currently in beta
          </div>
          <div style={{ fontSize: 13, color: colors.slate, lineHeight: 1.6 }}>
            Free accounts can complete <strong style={{ color: "#a5b4fc" }}>Free accounts can complete 1 AI exercise every 72 hours.</strong>. The Glossary Quiz and Glossary are always free.
          </div>
        </div>

        {/* Dismiss */}
        <button
          onClick={handleDismiss}
          style={{
            flexShrink:  0,
            background:  "none",
            border:      "none",
            color:       colors.slate,
            fontSize:    20,
            lineHeight:  1,
            cursor:      "pointer",
            padding:     "0 0 0 8px",
            fontFamily:  "inherit",
            marginTop:   -2,
          }}
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>

      {/* Got it button */}
      <button
        onClick={handleDismiss}
        style={{
          marginTop:    12,
          width:        "100%",
          padding:      "10px",
          background:   "linear-gradient(135deg, #6366f1, #8b5cf6)",
          border:       "none",
          borderRadius: 10,
          color:        "white",
          fontWeight:   700,
          fontSize:     14,
          cursor:       "pointer",
          fontFamily:   "inherit",
        }}
      >
        Got it
      </button>
    </div>
  );
}
