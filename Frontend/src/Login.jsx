import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "./firebase";
import "./App.css";

function getFirebaseErrorMessage(error, isRegistering) {
  const code = error && typeof error === "object" ? error.code : "";

  if (isRegistering) {
    switch (code) {
      case "auth/email-already-in-use":
        return "Diese E-Mail ist bereits registriert.";
      case "auth/invalid-email":
        return "Bitte eine gueltige E-Mail-Adresse eingeben.";
      case "auth/weak-password":
        return "Passwort zu schwach (mindestens 6 Zeichen).";
      default:
        return "Registrierung fehlgeschlagen. Bitte erneut versuchen.";
    }
  }

  switch (code) {
    case "auth/invalid-credential":
      return "Falsche Zugangsdaten.";
    case "auth/user-not-found":
      return "Nutzer nicht gefunden.";
    case "auth/wrong-password":
      return "Falsches Passwort.";
    case "auth/invalid-email":
      return "Bitte eine gueltige E-Mail-Adresse eingeben.";
    default:
      return "Login fehlgeschlagen. Bitte erneut versuchen.";
  }
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
      let userCredential;
      if (isRegistering) {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
      } else {
        userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
      }

      if (typeof onLogin === "function") {
        onLogin(userCredential.user);
      }
    } catch (error) {
      alert(getFirebaseErrorMessage(error, isRegistering));
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
