import { useState, useEffect } from "react";
import { supabase, SUPABASE_ENABLED } from "./supabase.js";

export function useAuth() {
  const [session, setSession]   = useState(null);
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(SUPABASE_ENABLED); // false immediately if no Supabase

  useEffect(() => {
    if (!SUPABASE_ENABLED) return; // skip all Supabase calls

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else { setProfile(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from("profiles").select("*").eq("id", userId).single();
    if (!error) setProfile(data);
    setLoading(false);
  };

  // ── Supabase auth methods ─────────────────────────────────────────────────
  const signIn = async (email, password) => {
    if (!SUPABASE_ENABLED) return { error: { message: "Supabase not configured" } };
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (email, password, fullName, role = "consultant") => {
    if (!SUPABASE_ENABLED) return { error: { message: "Supabase not configured" } };
    return supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, role } },
    });
  };

  const signOut = async () => {
    if (SUPABASE_ENABLED) await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
  };

  // ── Local-only login (no Supabase) ────────────────────────────────────────
  const localLogin = (role) => {
    const mockProfile = { id: "local", email: "local@dev", full_name: "Local User", role };
    const mockSession = { user: { id: "local", email: "local@dev" } };
    setProfile(mockProfile);
    setSession(mockSession);
  };

  return { session, profile, loading, signIn, signUp, signOut, localLogin };
}
