import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import * as authService from "../services/authService";
import type { AuthContextType, UserData } from "../types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
/* eslint-disable react-refresh/only-export-components */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
