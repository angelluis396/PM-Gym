import { VISION_SYSTEM_PROMPT, buildGradingPrompt } from "../constants/prompts";

// Point this at your backend once deployed.
// During local dev: http://localhost:3001
// In production: https://your-backend.onrender.com
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

/**
 * Ask the backend to generate a random product vision.
 * @returns {Promise<string>} The vision text
 */
export async function generateVision() {
  const res = await fetch(`${API_BASE}/api/generate-vision`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to generate vision");
  }

  const data = await res.json();
  return data.vision;
}

/**
 * Submit the user's PM plan to the backend for grading.
 * @param {string} vision - The product vision the user was given
 * @param {object} form   - The user's filled-in PM plan
 * @returns {Promise<object>} Grading results
 */
export async function gradeSubmission(vision, form) {
  const res = await fetch(`${API_BASE}/api/grade`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vision, form }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to grade submission");
  }

  return res.json();
}
