import { useEffect, useState, type ReactNode } from "react";
import * as authService from "../services/authService";
import { AuthContext } from "../contexts/AuthContext";
import type { AuthContextType, UserData } from "../types/auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsLogin, setNeedsLogin] = useState(false);

  useEffect(() => {
    async function checkSession() {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        setNeedsLogin(false);
      } catch {
        setNeedsLogin(true);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    checkSession();
  }, []);

  const login = () => {
    authService.login();
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setNeedsLogin(true);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, needsLogin, logout, login }}
    >
      {children}
    </AuthContext.Provider>
  );
}
