import { useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import "./TopBarMenu.css";

interface TopBarMenuProps {
  onClose: () => void;
}

function TopBarMenu({ onClose }: TopBarMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.closest(".topbar__profile")) {
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
      {user && <div className="topbar-menu__user">{user.name}</div>}
      <button className="topbar-menu__button" onClick={() => void logout()}>
        Log Out
      </button>
    </div>
  );
}

export default TopBarMenu;
