import { useEffect } from "react";
import "./App.css";
import AuthProvider from "./components/AuthProvider";
import MainView from "./components/MainView";
import TopBar from "./components/TopBar";
import { useAuth } from "./contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { isLoading, needsLogin, login } = useAuth();

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

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <TopBar title="HYTiS" />
      <MainView />
    </div>
  );
}

export default App;
