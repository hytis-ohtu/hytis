import PersonSearch from "@components/PersonSearch/PersonSearch";
import { Settings, User } from "lucide-react";
import { useEffect, useState } from "react";
import SettingsModal from "./SettingsModal/SettingsModal";
import "./TopBar.css";
import TopBarMenu from "./TopBarMenu/TopBarMenu";

const ROOM_LABEL_FONT_SIZE = 24;

export interface TopBarAction {
  id: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface TopBarProps {
  title?: string;
}

function TopBar({ title = "HYTiS" }: TopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fontSize, setFontSize] = useState(
    Number(localStorage.getItem("map-font-size")) || ROOM_LABEL_FONT_SIZE,
  );

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--map-font-size",
      `${fontSize}px`,
    );
  }, [fontSize]);

  return (
    <header className="topbar">
      <span className="topbar-title">{title}</span>
      <div className="topbar-search">
        <PersonSearch />
      </div>
      <div className="topbar-actions">
        <button
          data-testid="topbar-settings-button"
          className="topbar-button"
          aria-label="Settings"
          onClick={(e) => {
            e.stopPropagation();
            setSettingsOpen(true);
          }}
        >
          <Settings size={24} strokeWidth={1.7} />
        </button>
        <button
          data-testid="topbar-profile-button"
          className="topbar-button topbar-profile-button"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((v) => !v);
          }}
        >
          <User size={24} strokeWidth={1.7} />
        </button>
        {settingsOpen && (
          <SettingsModal
            onClose={() => setSettingsOpen(false)}
            fontSize={fontSize}
            setFontSize={setFontSize}
          />
        )}
        {menuOpen && <TopBarMenu onClose={() => setMenuOpen(false)} />}
      </div>
    </header>
  );
}

export default TopBar;
