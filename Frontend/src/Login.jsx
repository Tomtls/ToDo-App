import { useState } from "react";
import "./App.css"; // gleiche CSS-Datei wie App

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegistering) {
      // Registrierung
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      if (users.find(u => u.username === username)) {
        alert("Benutzername bereits vergeben");
        return;
      }
      users.push({ username, password });
      localStorage.setItem("users", JSON.stringify(users));
      alert("Registrierung erfolgreich! Bitte einloggen.");
      setIsRegistering(false);
    } else {
      // Login
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user));
        onLogin(user);
      } else {
        alert("Falsche Anmeldedaten");
      }
    }
  };

  return (
    <div className="login-container">
      <h1>{isRegistering ? "Registrieren" : "Login"}</h1>
      <form onSubmit={handleSubmit} className="login-form">
        <input
          className="login-input"
          type="text"
          placeholder="Benutzername"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
        <button type="submit" className="login-btn">
          {isRegistering ? "Registrieren" : "Einloggen"}
        </button>
      </form>
      <button
        className="login-toggle-btn"
        onClick={() => setIsRegistering(!isRegistering)}
      >
        {isRegistering ? "Zum Login wechseln" : "Registrieren"}
      </button>
    </div>
  );
}

export default Login;
