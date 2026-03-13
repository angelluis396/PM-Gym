import FormField from "../components/FormField";
import VisionBox from "../components/VisionBox";
import { sharedStyles } from "../constants/styles";

const FIELDS = [
  { key: "targetGroup",        label: "Target Group",                   rows: 3, placeholder: "Who is this product for? Be specific about the user segment." },
  { key: "goal",               label: "Goal",                           rows: 3, placeholder: "What is the primary goal this product achieves for users?" },
  { key: "needs",              label: "User Needs",                     rows: 3, placeholder: "What problems or needs does this product address?" },
  { key: "value",              label: "Value Proposition",              rows: 3, placeholder: "What value does the product deliver to users and the business?" },
  { key: "keyFeatures",        label: "Key Features",                   rows: 4, placeholder: "List the main features (e.g., Feature A, Feature B, Feature C...)" },
  { key: "roadmap",            label: "Product Roadmap",                rows: 5, placeholder: "Outline a quarterly roadmap (Q1, Q2, Q3, Q4 / Next Year)" },
  { key: "releasePlan",        label: "Release Plan",                   rows: 6, placeholder: "Describe Release 1, Release 2, Release 3 with specific user stories for each." },
  { key: "themesEpicsStories", label: "Themes / Features / Epics / Stories", rows: 6,
    placeholder: "Example:\nEpic: As a [user], I need to [action], so I can [outcome].\nStories: As a [user], I need to [specific action]..." },
];

/**
 * The main PM planning form.
 * @param {string}   vision     - The product vision (shown at top)
 * @param {object}   form       - Current form values
 * @param {function} onChange   - Called with (fieldKey, newValue)
 * @param {function} onSubmit   - Submit for grading
 * @param {function} onBack     - Go back to vision screen
 */
export default function Form({ vision, form, onChange, onSubmit, onBack }) {
  return (
    <>
      <VisionBox vision={vision} />

      <div style={sharedStyles.card}>
        <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 800 }}>Your PM Plan</h2>
        <p style={{ color: "#64748b", margin: "0 0 28px", fontSize: 14 }}>
          Fill in each section based on the product vision above.
        </p>

        {FIELDS.map(({ key, label, rows, placeholder }) => (
          <FormField
            key={key}
            label={label}
            rows={rows}
            placeholder={placeholder}
            value={form[key]}
            onChange={(val) => onChange(key, val)}
          />
        ))}

        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <button
            style={{ ...sharedStyles.btn, ...sharedStyles.btnPrimary, flex: 1, justifyContent: "center" }}
            onClick={onSubmit}
          >
            Submit for Grading →
          </button>
          <button
            style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary }}
            onClick={onBack}
          >
            ← Back
          </button>
        </div>
      </div>
    </>
  );
}
