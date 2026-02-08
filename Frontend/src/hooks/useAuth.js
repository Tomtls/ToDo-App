import { useState } from "react";

export function useAuth() {
  const [currentUser, setCurrentUser] = useState(() => {
    const raw = localStorage.getItem("currentUser");
    return raw ? JSON.parse(raw) : null;
  });

  const logout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
  };

  return { currentUser, setCurrentUser, logout };
}
