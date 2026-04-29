import PersonSearch from "@components/PersonSearch/PersonSearch";
import { Settings, User } from "lucide-react";
import { useEffect, useState } from "react";
import SettingsModal from "./SettingsModal/SettingsModal";
import "./TopBar.css";
import UserMenu from "./UserMenu/UserMenu";

const ROOM_LABEL_FONT_SIZE = 24;

function TopBar() {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fontSize, setFontSize] = useState(
    Number(localStorage.getItem("font-size-map")) || ROOM_LABEL_FONT_SIZE,
  );

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--font-size-map",
      `${fontSize}px`,
    );
  }, [fontSize]);

  return (
    <header className="topbar">
      <h1>HYTiS</h1>
      <PersonSearch />
      <div className="topbar-buttons">
        <button
          aria-label="Asetukset"
          onClick={() => {
            setSettingsOpen((v) => !v);
          }}
        >
          <Settings strokeWidth={1.7} />
        </button>
        <button
          aria-label="Käyttäjä"
          onMouseDown={(event) => {
            event.stopPropagation();
          }}
          onClick={() => {
            setUserMenuOpen((v) => !v);
          }}
        >
          <User strokeWidth={1.7} />
        </button>
        {userMenuOpen && <UserMenu onClose={() => setUserMenuOpen(false)} />}
      </div>
      {settingsOpen && (
        <SettingsModal
          onClose={() => setSettingsOpen(false)}
          fontSize={fontSize}
          setFontSize={setFontSize}
        />
      )}
    </header>
  );
}

export default TopBar;
