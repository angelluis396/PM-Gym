import { colors } from "../constants/styles";

function IconDashboard({ active }) {
  const stroke = active ? "white" : colors.slate;
  const fill   = active ? "white" : "none";
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke={stroke} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" fill={fill} />
      <rect x="14" y="3" width="7" height="7" rx="1" fill={fill} />
      <rect x="3" y="14" width="7" height="7" rx="1" fill={fill} />
      <rect x="14" y="14" width="7" height="7" rx="1" fill={fill} />
    </svg>
  );
}

function IconPractice({ active }) {
  const stroke = active ? "white" : colors.slate;
  const fill   = active ? "white" : "none";
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill={fill} />
    </svg>
  );
}

function IconGlossary({ active }) {
  const stroke = active ? "white" : colors.slate;
  const fill   = active ? "white" : "none";
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" fill={fill} />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill={fill} />
    </svg>
  );
}

function IconProfile({ active }) {
  const stroke = active ? "white" : colors.slate;
  const fill   = active ? "white" : "none";
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill={fill} />
      <circle cx="12" cy="7" r="4" fill={fill} />
    </svg>
  );
}

const TABS = [
  { key: "dashboard", label: "Dashboard", Icon: IconDashboard },
  { key: "practice",  label: "Practice",  Icon: IconPractice  },
  { key: "glossary",  label: "Glossary",  Icon: IconGlossary  },
  { key: "profile",   label: "Profile",   Icon: IconProfile   },
];

export default function BottomTabBar({ activeView, onNavigate }) {
  return (
    <div style={{
      position:      "fixed",
      bottom:        0,
      left:          0,
      right:         0,
      zIndex:        100,
      padding:       "10px 16px",
      paddingBottom: "calc(10px + env(safe-area-inset-bottom, 0px))",
      background:    "linear-gradient(to top, rgba(15,23,42,1) 60%, rgba(15,23,42,0))",
    }}>
      <div style={{
        background:     "rgba(30,41,59,0.95)",
        backdropFilter: "blur(16px)",
        border:         "1px solid #334155",
        borderRadius:   20,
        display:        "flex",
        alignItems:     "stretch",
        padding:        "4px",
        gap:            "2px",
      }}>
        {TABS.map(({ key, label, Icon }) => {
          const active =
            key === "dashboard" ? (activeView === "dashboard" || activeView === "session") :
            key === "practice"  ? activeView === "practice" :
            key === "glossary"  ? activeView === "glossary" :
            activeView === "profile";

          return (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              style={{
                flex:           1,
                display:        "flex",
                flexDirection:  "column",
                alignItems:     "center",
                justifyContent: "center",
                gap:            3,
                padding:        "10px 4px",
                background:     active ? "rgba(99,102,241,0.2)" : "transparent",
                border:         "none",
                borderRadius:   16,
                cursor:         "pointer",
                fontFamily:     "inherit",
                transition:     "background 0.2s",
              }}
            >
              <Icon active={active} />
              <span style={{
                fontSize:      10,
                fontWeight:    active ? 700 : 400,
                color:         active ? "white" : colors.slate,
                letterSpacing: "0.02em",
              }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}