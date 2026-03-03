import { User } from "lucide-react";
import { useState } from "react";
import "./TopBar.css";
import TopBarMenu from "./TopBarMenu";

export interface TopBarAction {
  id: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface TopBarProps {
  title?: string;
}

function TopBar({ title = "HYTis" }: TopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="topbar">
      <span className="topbar-title">{title}</span>
      <div className="topbar-actions">
        <button
          className="topbar-button topbar-profile"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((v) => !v);
          }}
        >
          <User className="size-6" />
        </button>
        {menuOpen && <TopBarMenu onClose={() => setMenuOpen(false)} />}
      </div>
    </header>
  );
}

export default TopBar;
