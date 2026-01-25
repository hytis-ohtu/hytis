import { useEffect } from "react";
import "./App.css";
import Exactum2 from "./assets/exactum-2.svg?react";
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

  return (
    <div className="wrapper">
      <Exactum2 className="floor-image" />
    </div>
  );
}

export default App;
