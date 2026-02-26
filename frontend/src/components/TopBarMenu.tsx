import { useEffect, useRef } from "react";
import "./TopBarMenu.css";

interface TopBarMenuProps {
  onClose: () => void;
}

function TopBarMenu({ onClose }: TopBarMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

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
      <button
        className="topbar-menu__button"
        onClick={() => {
          /*log out method*/ onClose();
        }}
      >
        Log Out
      </button>
    </div>
  );
}

export default TopBarMenu;
