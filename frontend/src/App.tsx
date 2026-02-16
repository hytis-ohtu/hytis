import { useEffect } from "react";
import "./App.css";
import MainView from "./components/MainView";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import pingServer from "./services/pingService";

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { isLoading, needsLogin, login } = useAuth();
  const { isLoading, needsLogin, login } = useAuth();

  useEffect(() => {
    async function ping() {
      try {
        const result = await pingServer();
        console.log("✅ Server responded successfully:", result);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("❌ Failed to ping server:", error.message);
        }
      }
    }

    ping();
  }, []);

  useEffect(() => {
    if (needsLogin) {
      const timer = setTimeout(() => {
        login();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [needsLogin, login]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (needsLogin) {
    return <div className="wrapper">Redirecting to login page...</div>;
  }

  return <MainView />;
}

export default App;
