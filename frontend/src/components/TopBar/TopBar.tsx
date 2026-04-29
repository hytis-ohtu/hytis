import PersonSearch from "@components/PersonSearch/PersonSearch";
import { Settings, User } from "lucide-react";
import { useState } from "react";
import SettingsModal from "./SettingsModal/SettingsModal";
import "./TopBar.css";
import UserMenu from "./UserMenu/UserMenu";

function TopBar() {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <header className="topbar">
      <h1>HYTiS</h1>
      <PersonSearch />
      <div className="topbar-buttons">
        <button
          className="button square-icon"
          aria-label="Asetukset"
          onClick={() => {
            setSettingsOpen((v) => !v);
          }}
        >
          <Settings strokeWidth={1.7} />
        </button>
        <button
          className="button square-icon"
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
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </header>
  );
}

export default TopBar;
