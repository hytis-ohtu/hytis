import { LogOut, Settings, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import SettingsModal from "./SettingsModal";
import "./TopBarMenu.css";

interface TopBarMenuProps {
  onClose: () => void;
  fontSize: number;
  setFontSize: (size: number) => void;
}

function TopBarMenu({ onClose, fontSize, setFontSize }: TopBarMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.closest(".topbar-profile")) {
        return;
      }
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div className="topbar-menu" ref={ref}>
      <button
        data-testid="profile-menu-close-button"
        className="topbar-menu-close-button"
        onClick={onClose}
      >
        <X size={16} />
      </button>
      {user && <div className="topbar-menu-user">{user.name}</div>}
      <button
        data-testid="topbar-settings-button"
        className="topbar-menu-button"
        onClick={() => setSettingsOpen(true)}
      >
        <Settings size={16} />
        Asetukset
      </button>
      {settingsOpen && (
        <SettingsModal
          onClose={() => setSettingsOpen(false)}
          fontSize={fontSize}
          setFontSize={setFontSize}
        />
      )}
      <button className="topbar-menu-button" onClick={() => void logout()}>
        <LogOut size={16} />
        Log Out
      </button>
    </div>
  );
}

export default TopBarMenu;
