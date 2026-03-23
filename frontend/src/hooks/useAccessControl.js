import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const FREE_INTERVAL_HOURS = 72;

/**
 * Returns the user's access level and whether they can take a new AI exercise.
 *
 * isAdmin    — true if role = 'admin' (unlimited)
 * canExercise — true if the user is allowed to start a new AI exercise
 * hoursLeft  — how many hours until the next exercise is available (0 if ready)
 * loading    — true while fetching
 * refetch    — call after completing an exercise to re-check
 */
export function useAccessControl(userId) {
  const [role,       setRole]       = useState(null);
  const [canExercise,setCanExercise]= useState(false);
  const [hoursLeft,  setHoursLeft]  = useState(0);
  const [loading,    setLoading]    = useState(true);

  async function check() {
    if (!userId) return;
    setLoading(true);

    // Fetch role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    const userRole = profile?.role || "free";
    setRole(userRole);

    if (userRole === "admin" || userRole === "pro") {
      setCanExercise(true);
      setHoursLeft(0);
      setLoading(false);
      return;
    }

    // Find the most recent AI exercise across all session tables
    const [sessions, focused, scenarios, quiz, interview] = await Promise.all([
      supabase.from("sessions").select("created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(1),
      supabase.from("focused_sessions").select("created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(1),
      supabase.from("scenario_sessions").select("created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(1),
      supabase.from("quiz_sessions").select("created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(1),
      supabase.from("interview_sessions").select("created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(1),
    ]);

    const timestamps = [
      sessions.data?.[0]?.created_at,
      focused.data?.[0]?.created_at,
      scenarios.data?.[0]?.created_at,
      quiz.data?.[0]?.created_at,
      interview.data?.[0]?.created_at,
    ].filter(Boolean).map(t => new Date(t));

    if (timestamps.length === 0) {
      // No exercises ever — allow
      setCanExercise(true);
      setHoursLeft(0);
      setLoading(false);
      return;
    }

    const mostRecent  = new Date(Math.max(...timestamps));
    const now         = new Date();
    const diffHours   = (now - mostRecent) / (1000 * 60 * 60);
    const remaining   = FREE_INTERVAL_HOURS - diffHours;

    if (remaining <= 0) {
      setCanExercise(true);
      setHoursLeft(0);
    } else {
      setCanExercise(false);
      setHoursLeft(Math.ceil(remaining));
    }

    setLoading(false);
  }

  useEffect(() => { check(); }, [userId]);

  return { role, isAdmin: role === "admin" || role === "pro", canExercise, hoursLeft, loading, refetch: check };
}
