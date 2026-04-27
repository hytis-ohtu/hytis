import { useAuth } from "@hooks/useAuth";
import { LogOut, X } from "lucide-react";
import { useEffect, useRef } from "react";
import "./UserMenu.css";

interface UserMenuProps {
  onClose: () => void;
}

function UserMenu({ onClose }: UserMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <section className="user-menu" role="menu" ref={ref}>
      <header>
        <h2>{user ? user.name : "Ei käyttäjää"}</h2>
        <button
          className="button-icon button-close"
          aria-label="Sulje käyttäjävalikko"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </header>
      <button className="button-logout" onClick={() => void logout()}>
        <LogOut size={20} />
        Kirjaudu ulos
      </button>
    </section>
  );
}

export default UserMenu;
