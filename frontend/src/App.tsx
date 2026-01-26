import { useEffect } from "react";
import "./App.css";
import MainView from "./components/MainView";
import pingServer from "./services/pingService";

function App() {
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

  return <MainView />;
}

export default App;
