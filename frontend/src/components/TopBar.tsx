import React from "react";
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
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <header className="topbar">
      <span className="topbar__title">{title}</span>
      <div className="topbar__actions">
        <button
          className="topbar__button topbar__profile"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((v) => !v);
          }}
        >
          👤
        </button>
        {menuOpen && <TopBarMenu onClose={() => setMenuOpen(false)} />}
      </div>
    </header>
  );
}

export default TopBar;
