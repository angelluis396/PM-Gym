/**
 * PMGymLogo — renders the PM Gym app icon / logo.
 *
 * Props:
 *   size      — pixel size of the square (default 40)
 *   showLabel — show "PM Gym" wordmark below the icon (default false)
 *   variant   — "icon" | "full" (full includes wordmark, default "icon")
 */
export default function PMGymLogo({ size = 40, showLabel = false, variant = "icon" }) {
  const s = size;

  // Icon-only square with rounded corners
  const icon = (
    <svg
      width={s}
      height={s}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background square */}
      <rect width="100" height="100" rx="22" fill="#1e1b4b" />

      {/* Dumbbell bar */}
      <rect x="28" y="46" width="44" height="8" rx="4" fill="#6366f1" />

      {/* Left weight plate — outer */}
      <rect x="16" y="34" width="16" height="32" rx="7" fill="#818cf8" />
      {/* Left weight plate — inner highlight */}
      <rect x="19" y="38" width="10" height="24" rx="4" fill="#a5b4fc" />

      {/* Right weight plate — outer */}
      <rect x="68" y="34" width="16" height="32" rx="7" fill="#818cf8" />
      {/* Right weight plate — inner highlight */}
      <rect x="71" y="38" width="10" height="24" rx="4" fill="#a5b4fc" />

      {/* PM Gym text inside icon */}
      <text
        x="50"
        y="76"
        textAnchor="middle"
        fontFamily="Georgia, 'Playfair Display', serif"
        fontWeight="900"
        fontSize="14"
        fill="#e2e8f0"
        letterSpacing="0.5"
      >
        PM Gym
      </text>
    </svg>
  );

  if (variant === "icon" && !showLabel) return icon;

  // Full lockup — icon + wordmark side by side
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {icon}
      {(variant === "full" || showLabel) && (
        <span style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontWeight: 900,
          fontSize:   Math.round(s * 0.55),
          background: "linear-gradient(135deg, #e2e8f0, #a5b4fc)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor:  "transparent",
          lineHeight: 1,
        }}>
          PM Gym
        </span>
      )}
    </div>
  );
}
