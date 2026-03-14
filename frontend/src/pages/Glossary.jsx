import { useState, useRef } from "react";
import { GLOSSARY } from "../constants/glossaryContent";
import { sharedStyles, colors } from "../constants/styles";

// ─── Term card ────────────────────────────────────────────────────────────────

function TermCard({ term }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      background: "rgba(15,23,42,0.6)",
      border: `1px solid ${expanded ? colors.indigo : colors.border}`,
      borderRadius: 10, overflow: "hidden",
      transition: "border-color 0.2s", marginBottom: 8,
    }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: "100%", background: "none", border: "none",
          padding: "14px 18px", cursor: "pointer", fontFamily: "inherit",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 15, color: colors.text, textAlign: "left" }}>
          {term.name}
        </span>
        <span style={{
          color: colors.slate, fontSize: 18, flexShrink: 0,
          display: "inline-block",
          transform: expanded ? "rotate(180deg)" : "none",
          transition: "transform 0.2s",
        }}>
          ↓
        </span>
      </button>

      {expanded && (
        <div style={{ padding: "0 18px 18px", borderTop: `1px solid ${colors.border}` }}>
          <div style={{ marginTop: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: colors.slate, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
              Definition
            </div>
            <p style={{ margin: 0, fontSize: 14, color: colors.slateLight, lineHeight: 1.8 }}>
              {term.definition}
            </p>
          </div>
          <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 8, padding: "12px 14px", marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
              📌 Example
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "#c7d2fe", lineHeight: 1.7 }}>{term.example}</p>
          </div>
          {term.tip && (
            <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: colors.green, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                💡 PM Tip
              </div>
              <p style={{ margin: 0, fontSize: 13, color: "#86efac", lineHeight: 1.7 }}>{term.tip}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Category section — now collapsible ──────────────────────────────────────

function CategorySection({ category, innerRef, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div ref={innerRef} style={{ marginBottom: 16 }}>
      {/* Category header — click to collapse/expand */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", background: open ? "rgba(99,102,241,0.08)" : "rgba(30,41,59,0.8)",
          border: `1px solid ${open ? colors.indigo : colors.border}`,
          borderRadius: open ? "12px 12px 0 0" : 12,
          padding: "16px 20px", cursor: "pointer", fontFamily: "inherit",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          transition: "all 0.2s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>{category.emoji}</span>
          <span style={{
            fontSize: 18, fontWeight: 900,
            fontFamily: "'Playfair Display', serif",
            background: "linear-gradient(135deg, #e2e8f0, #a5b4fc)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            {category.label}
          </span>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: "2px 8px",
            background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: 20, color: "#a5b4fc",
          }}>
            {category.terms.length} terms
          </span>
        </div>
        <span style={{
          color: colors.slate, fontSize: 18, flexShrink: 0,
          display: "inline-block",
          transform: open ? "rotate(180deg)" : "none",
          transition: "transform 0.2s",
        }}>
          ↓
        </span>
      </button>

      {/* Terms — shown when category is open */}
      {open && (
        <div style={{
          border: `1px solid ${colors.indigo}`,
          borderTop: "none",
          borderRadius: "0 0 12px 12px",
          padding: "16px 16px 8px",
          background: "rgba(15,23,42,0.4)",
          marginBottom: 16,
        }}>
          {category.terms.map((term) => (
            <TermCard key={term.name} term={term} />
          ))}
        </div>
      )}

      {/* Collapsed state bottom margin */}
      {!open && <div style={{ marginBottom: 8 }} />}
    </div>
  );
}

// ─── Jump link bar ────────────────────────────────────────────────────────────

function JumpLinks({ categories, activeKey, onJump }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>
      {categories.map((cat) => (
        <button
          key={cat.key}
          onClick={() => onJump(cat.key)}
          style={{
            padding: "8px 14px", borderRadius: 20,
            cursor: "pointer", fontWeight: 700, fontSize: 13,
            fontFamily: "inherit", transition: "all 0.2s",
            background: activeKey === cat.key
              ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
              : "rgba(30,41,59,0.8)",
            color: activeKey === cat.key ? "white" : colors.slate,
            boxShadow: activeKey === cat.key ? "0 2px 8px rgba(99,102,241,0.4)" : "none",
            border: activeKey === cat.key ? "1px solid transparent" : `1px solid ${colors.border}`,
          }}
        >
          {cat.emoji} {cat.label}
        </button>
      ))}
    </div>
  );
}

// ─── Search bar ───────────────────────────────────────────────────────────────

function SearchBar({ value, onChange }) {
  return (
    <div style={{ position: "relative", marginBottom: 28 }}>
      <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: colors.slate, fontSize: 16, pointerEvents: "none" }}>
        🔍
      </span>
      <input
        type="text"
        placeholder="Search terms..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%", padding: "12px 14px 12px 40px",
          background: "rgba(30,41,59,0.8)",
          border: `1px solid ${colors.border}`,
          borderRadius: 10, color: colors.text, fontSize: 15,
          outline: "none", fontFamily: "inherit", boxSizing: "border-box",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => e.target.style.borderColor = colors.indigo}
        onBlur={(e)  => e.target.style.borderColor = colors.border}
      />
    </div>
  );
}

// ─── Main Glossary page ───────────────────────────────────────────────────────

export default function Glossary() {
  const [search,    setSearch]    = useState("");
  const [activeKey, setActiveKey] = useState(GLOSSARY[0].key);
  const sectionRefs = useRef({});

  function handleJump(key) {
    setActiveKey(key);
    setSearch("");
    const el = sectionRefs.current[key];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const filtered = search.trim()
    ? GLOSSARY.map((cat) => ({
        ...cat,
        terms: cat.terms.filter(
          (t) =>
            t.name.toLowerCase().includes(search.toLowerCase()) ||
            t.definition.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter((cat) => cat.terms.length > 0)
    : GLOSSARY;

  const totalTerms    = GLOSSARY.reduce((acc, cat) => acc + cat.terms.length, 0);
  const filteredCount = filtered.reduce((acc, cat) => acc + cat.terms.length, 0);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{
          margin: "0 0 4px", fontSize: 28, fontWeight: 900,
          fontFamily: "'Playfair Display', serif",
          background: "linear-gradient(135deg, #e2e8f0, #a5b4fc)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          PM Glossary
        </h2>
        <p style={{ color: colors.textMuted, margin: 0, fontSize: 15 }}>
          {totalTerms} essential PM terms — each with a definition, real example, and actionable tip.
        </p>
      </div>

      <SearchBar value={search} onChange={setSearch} />

      {/* Jump links — hidden when searching */}
      {!search && (
        <JumpLinks categories={GLOSSARY} activeKey={activeKey} onJump={handleJump} />
      )}

      {/* Search results count */}
      {search && (
        <p style={{ color: colors.textMuted, fontSize: 14, marginBottom: 20 }}>
          {filteredCount} result{filteredCount !== 1 ? "s" : ""} for "{search}"
        </p>
      )}

      {/* No results */}
      {filtered.length === 0 && (
        <div style={{ ...sharedStyles.card, textAlign: "center", padding: "40px 32px" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
          <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 800 }}>No terms found</h3>
          <p style={{ color: colors.slate, margin: 0, fontSize: 14 }}>Try a different search term.</p>
        </div>
      )}

      {/* Category sections */}
      {filtered.map((cat, index) => (
        <CategorySection
          key={cat.key}
          category={cat}
          defaultOpen={index === 0}
          innerRef={(el) => { sectionRefs.current[cat.key] = el; }}
        />
      ))}
    </div>
  );
}