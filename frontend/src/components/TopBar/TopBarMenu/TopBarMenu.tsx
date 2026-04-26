import { useAuth } from "@hooks/useAuth";
import { LogOut, X } from "lucide-react";
import { useEffect, useRef } from "react";
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

      if (target.closest(".topbar-profile-button")) {
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
      <button className="topbar-menu-button" onClick={() => void logout()}>
        <LogOut size={16} />
        Log Out
      </button>
    </div>
  );
}

export default TopBarMenu;
