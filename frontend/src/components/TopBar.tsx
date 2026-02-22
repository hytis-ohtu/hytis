import React from "react";
import "./TopBar.css";

export interface TopBarAction {
  id: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface TopBarProps {
  title?: string;
  actions?: TopBarAction[];
}

const TopBar: React.FC<TopBarProps> = ({ title = "HYTis", actions = [] }) => {
  return (
    <header className="topbar">
      <span className="topbar__title">{title}</span>
      <div className="topbar__actions">
        {actions.map((action) => (
          <button
            key={action.id}
            className="topbar__button"
            onClick={action.onClick}
            title={action.id}
          >
            {action.icon}
          </button>
        ))}
      </div>
    </header>
  );
};

export default TopBar;
