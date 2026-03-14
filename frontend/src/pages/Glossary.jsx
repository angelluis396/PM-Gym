import { useState, useRef } from "react";
import { useWindowWidth } from "../hooks/useWindowWidth";
import { GLOSSARY } from "../constants/glossaryContent";
import { sharedStyles, colors } from "../constants/styles";

function TermCard({ term }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ background: "rgba(15,23,42,0.6)", border: `1px solid ${expanded ? colors.indigo : colors.border}`, borderRadius: 10, overflow: "hidden", transition: "border-color 0.2s", marginBottom: 8 }}>
      <button onClick={() => setExpanded(!expanded)} style={{ width: "100%", background: "none", border: "none", padding: "12px 16px", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: colors.text, textAlign: "left" }}>{term.name}</span>
        <span style={{ color: colors.slate, fontSize: 18, flexShrink: 0, display: "inline-block", transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>↓</span>
      </button>
      {expanded && (
        <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${colors.border}` }}>
          <div style={{ marginTop: 12, marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: colors.slate, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Definition</div>
            <p style={{ margin: 0, fontSize: 14, color: colors.slateLight, lineHeight: 1.8 }}>{term.definition}</p>
          </div>
          <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 8, padding: "12px 14px", marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>📌 Example</div>
            <p style={{ margin: 0, fontSize: 13, color: "#c7d2fe", lineHeight: 1.7 }}>{term.example}</p>
          </div>
          {term.tip && (
            <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: colors.green, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>💡 PM Tip</div>
              <p style={{ margin: 0, fontSize: 13, color: "#86efac", lineHeight: 1.7 }}>{term.tip}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CategorySection({ category, innerRef, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div ref={innerRef} style={{ marginBottom: 12 }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", background: open ? "rgba(99,102,241,0.08)" : "rgba(30,41,59,0.8)", border: `1px solid ${open ? colors.indigo : colors.border}`, borderRadius: open ? "12px 12px 0 0" : 12, padding: "14px 18px", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.2s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>{category.emoji}</span>
          <span style={{ fontSize: 16, fontWeight: 900, fontFamily: "'Playfair Display', serif", background: "linear-gradient(135deg, #e2e8f0, #a5b4fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{category.label}</span>
          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 7px", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 20, color: "#a5b4fc" }}>{category.terms.length}</span>
        </div>
        <span style={{ color: colors.slate, fontSize: 18, flexShrink: 0, display: "inline-block", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>↓</span>
      </button>
      {open && (
        <div style={{ border: `1px solid ${colors.indigo}`, borderTop: "none", borderRadius: "0 0 12px 12px", padding: "14px 14px 8px", background: "rgba(15,23,42,0.4)", marginBottom: 8 }}>
          {category.terms.map(term => <TermCard key={term.name} term={term} />)}
        </div>
      )}
      {!open && <div style={{ marginBottom: 4 }} />}
    </div>
  );
}

export default function Glossary() {
  const width    = useWindowWidth();
  const isMobile = width < 768;
  const [search,    setSearch]    = useState("");
  const [activeKey, setActiveKey] = useState(GLOSSARY[0].key);
  const sectionRefs = useRef({});

  function handleJump(key) {
    setActiveKey(key); setSearch("");
    const el = sectionRefs.current[key];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const filtered = search.trim()
    ? GLOSSARY.map(cat => ({ ...cat, terms: cat.terms.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.definition.toLowerCase().includes(search.toLowerCase())) })).filter(cat => cat.terms.length > 0)
    : GLOSSARY;

  const totalTerms    = GLOSSARY.reduce((acc, cat) => acc + cat.terms.length, 0);
  const filteredCount = filtered.reduce((acc, cat) => acc + cat.terms.length, 0);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: isMobile ? 22 : 28, fontWeight: 900, fontFamily: "'Playfair Display', serif", background: "linear-gradient(135deg, #e2e8f0, #a5b4fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>PM Glossary</h2>
        <p style={{ color: colors.textMuted, margin: 0, fontSize: 14 }}>{totalTerms} essential PM terms with definitions, examples, and tips.</p>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 20 }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: colors.slate, fontSize: 15, pointerEvents: "none" }}>🔍</span>
        <input type="text" placeholder="Search terms..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%", padding: "11px 12px 11px 36px", background: "rgba(30,41,59,0.8)", border: `1px solid ${colors.border}`, borderRadius: 10, color: colors.text, fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} onFocus={e => e.target.style.borderColor = colors.indigo} onBlur={e => e.target.style.borderColor = colors.border} />
      </div>

      {/* Jump links */}
      {!search && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
          {GLOSSARY.map(cat => (
            <button key={cat.key} onClick={() => handleJump(cat.key)} style={{ padding: isMobile ? "6px 10px" : "8px 14px", borderRadius: 20, cursor: "pointer", fontWeight: 700, fontSize: isMobile ? 12 : 13, fontFamily: "inherit", transition: "all 0.2s", background: activeKey === cat.key ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "rgba(30,41,59,0.8)", color: activeKey === cat.key ? "white" : colors.slate, boxShadow: activeKey === cat.key ? "0 2px 8px rgba(99,102,241,0.4)" : "none", border: activeKey === cat.key ? "1px solid transparent" : `1px solid ${colors.border}` }}>
              {cat.emoji} {isMobile ? "" : cat.label}
            </button>
          ))}
        </div>
      )}

      {search && <p style={{ color: colors.textMuted, fontSize: 13, marginBottom: 16 }}>{filteredCount} result{filteredCount !== 1 ? "s" : ""} for "{search}"</p>}

      {filtered.length === 0 && (
        <div style={{ ...sharedStyles.card, textAlign: "center", padding: "32px 20px" }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
          <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 800 }}>No terms found</h3>
          <p style={{ color: colors.slate, margin: 0, fontSize: 14 }}>Try a different search term.</p>
        </div>
      )}

      {filtered.map((cat, index) => (
        <CategorySection key={cat.key} category={cat} defaultOpen={index === 0} innerRef={el => { sectionRefs.current[cat.key] = el; }} />
      ))}
    </div>
  );
}