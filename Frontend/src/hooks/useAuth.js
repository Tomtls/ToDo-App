import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export function useAuth() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let canceled = false;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (canceled) return;
        setCurrentUser(data?.session?.user ?? null);
        setAuthReady(true);
      })
      .catch(() => {
        if (!canceled) setAuthReady(true);
      });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (canceled) return;
        setCurrentUser(session?.user ?? null);
        setAuthReady(true);
      }
    );

    return () => {
      canceled = true;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return { currentUser, setCurrentUser, logout, authReady };
}
