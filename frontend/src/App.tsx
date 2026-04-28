import { useEffect } from "react";
import AuthProvider from "./components/AuthProvider/AuthProvider";
import MapView from "./components/MapView/MapView";
import { RoomSelectionProvider } from "./components/RoomSelectionProvider/RoomSelectionProvider";
import TopBar from "./components/TopBar/TopBar";
import { useAuth } from "./hooks/useAuth";
import { findRoomById } from "./services/roomsService";

function AppContent() {
  const { isLoading, needsLogin, login } = useAuth();

  useEffect(() => {
    if (needsLogin) {
      const timer = setTimeout(() => {
        login();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [needsLogin, login]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (needsLogin) {
    return <p>Redirecting to login page...</p>;
  }

  return (
    <>
      <TopBar />
      <MapView />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <RoomSelectionProvider findRoomById={findRoomById}>
        <AppContent />
      </RoomSelectionProvider>
    </AuthProvider>
  );
}

export default App;
