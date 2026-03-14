import { supabase } from "../lib/supabase";

/**
 * Call this after any completed exercise to update the user's streak.
 * Handles first-time setup, same-day activity (no double count),
 * consecutive days (increment), and broken streaks (reset to 1).
 */
export async function updateStreak(userId) {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  // Fetch existing streak row
  const { data: existing } = await supabase
    .from("streaks")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!existing) {
    // First ever activity — create streak row
    await supabase.from("streaks").insert({
      user_id:           userId,
      current_streak:    1,
      longest_streak:    1,
      last_activity_date: today,
      updated_at:        new Date().toISOString(),
    });
    return;
  }

  const last = existing.last_activity_date;

  // Already logged activity today — no change needed
  if (last === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  let newCurrent;
  if (last === yesterdayStr) {
    // Consecutive day — extend streak
    newCurrent = existing.current_streak + 1;
  } else {
    // Streak broken — reset to 1
    newCurrent = 1;
  }

  const newLongest = Math.max(newCurrent, existing.longest_streak);

  await supabase.from("streaks").update({
    current_streak:    newCurrent,
    longest_streak:    newLongest,
    last_activity_date: today,
    updated_at:        new Date().toISOString(),
  }).eq("user_id", userId);
}

/**
 * Fetch the current user's streak data.
 */
export async function fetchStreak(userId) {
  const { data } = await supabase
    .from("streaks")
    .select("current_streak, longest_streak, last_activity_date")
    .eq("user_id", userId)
    .maybeSingle();

  return data || { current_streak: 0, longest_streak: 0, last_activity_date: null };
}
