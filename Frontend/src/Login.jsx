import { useState } from "react";
import { supabase } from "./supabaseClient";
import "./App.css";

function getSupabaseErrorMessage(error, isRegistering) {
  const message = error && typeof error === "object" && error.message ? String(error.message) : "";
  const lowered = message.toLowerCase();

  if (isRegistering) {
    if (lowered.includes("already registered"))
      return "Diese E-Mail ist bereits registriert.";

    if (lowered.includes("password"))
      return "Passwort zu schwach (mindestens 6 Zeichen).";

    if (lowered.includes("email") && lowered.includes("invalid"))
      return "Bitte eine gültige E-Mail-Adresse eingeben.";

    return "Registrierung fehlgeschlagen. Bitte erneut versuchen.";
  }

  if (lowered.includes("invalid login credentials"))
    return "Falsche Zugangsdaten.";
  
  if (lowered.includes("email") && lowered.includes("invalid"))
    return "Bitte eine gültige E-Mail-Adresse eingeben.";
  
  if (lowered.includes("email not confirmed")) 
    return "Bitte E-Mail bestätigen.";
  
  return "Login fehlgeschlagen. Bitte erneut versuchen.";
}

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      let authResult;
      if (isRegistering)
        authResult = await supabase.auth.signUp({ email, password });
      else
        authResult = await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authResult?.error)
        throw authResult.error;

      const user = authResult?.data?.user || authResult?.data?.session?.user || null;

      if (isRegistering && !authResult?.data?.session)
        alert("Bitte E-Mail bestaetigen, bevor du dich einloggst.");

      if (user && typeof onLogin === "function")
        onLogin(user);
    } catch (error) {
      alert(getSupabaseErrorMessage(error, isRegistering));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <h1>{isRegistering ? "Registrieren" : "Login"}</h1>
      <form onSubmit={handleSubmit} className="login-form">
        <input
          className="login-input"
          type="email"
          placeholder="E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="login-input"
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="login-btn" disabled={isSubmitting}>
          {isRegistering ? "Registrieren" : "Einloggen"}
        </button>
      </form>
      <button
        className="login-toggle-btn"
        onClick={() => setIsRegistering(!isRegistering)}
        disabled={isSubmitting}
      >
        {isRegistering ? "Zum Login wechseln" : "Registrieren"}
      </button>
    </div>
  );
}

export default Login;
