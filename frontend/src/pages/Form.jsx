import { useWindowWidth } from "../hooks/useWindowWidth";
import FormField from "../components/FormField";
import VisionBox from "../components/VisionBox";
import { sharedStyles } from "../constants/styles";

const FIELDS = [
  { key: "targetGroup",        label: "Target Group",                   rows: 3, placeholder: "Who is this product for?" },
  { key: "goal",               label: "Goal",                           rows: 3, placeholder: "What is the primary goal?" },
  { key: "needs",              label: "User Needs",                     rows: 3, placeholder: "What problems does this address?" },
  { key: "value",              label: "Value Proposition",              rows: 3, placeholder: "What value does it deliver?" },
  { key: "keyFeatures",        label: "Key Features",                   rows: 4, placeholder: "List the main features..." },
  { key: "roadmap",            label: "Product Roadmap",                rows: 5, placeholder: "Outline a quarterly roadmap (Q1, Q2, Q3, Q4...)" },
  { key: "releasePlan",        label: "Release Plan",                   rows: 6, placeholder: "Describe Release 1, Release 2, Release 3..." },
  { key: "themesEpicsStories", label: "Themes / Features / Epics / Stories", rows: 6, placeholder: "Epic: As a [user], I need to [action]...\nStories: As a [user]..." },
];

export default function Form({ vision, form, onChange, onSubmit, onBack }) {
  const width    = useWindowWidth();
  const isMobile = width < 768;

  return (
    <>
      <VisionBox vision={vision} />
      <div style={sharedStyles.card}>
        <h2 style={{ margin: "0 0 4px", fontSize: isMobile ? 18 : 20, fontWeight: 800 }}>Your PM Plan</h2>
        <p style={{ color: "#64748b", margin: "0 0 24px", fontSize: 13 }}>Fill in each section based on the product vision above.</p>
        {FIELDS.map(({ key, label, rows, placeholder }) => (
          <FormField key={key} label={label} rows={rows} placeholder={placeholder} value={form[key]} onChange={val => onChange(key, val)} />
        ))}
        <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: isMobile ? "wrap" : "nowrap" }}>
          <button style={{ ...sharedStyles.btn, ...sharedStyles.btnPrimary, flex: 1, justifyContent: "center", fontSize: isMobile ? 14 : 15 }} onClick={onSubmit}>
            Submit for Grading →
          </button>
          <button style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary, fontSize: isMobile ? 14 : 15 }} onClick={onBack}>
            ← Back
          </button>
        </div>
      </div>
    </>
  );
}