import { X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import "./SettingsModal.css";

const ROOM_LABEL_FONT_SIZE_DEFAULT = 24;
const ROOM_LABEL_FONT_SIZE_MIN = 10;
const ROOM_LABEL_FONT_SIZE_MAX = 32;

function getStoredFontSize() {
  try {
    const storedValue = localStorage.getItem("font-size-map");
    if (!storedValue) {
      return ROOM_LABEL_FONT_SIZE_DEFAULT;
    }

    const parsedValue = Number(storedValue);
    if (Number.isNaN(parsedValue)) {
      return ROOM_LABEL_FONT_SIZE_DEFAULT;
    }

    return parsedValue;
  } catch {
    return ROOM_LABEL_FONT_SIZE_DEFAULT;
  }
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [fontSize, setFontSize] = useState(getStoredFontSize);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  // Toggle dialog
  useEffect(() => {
    const dialogElement = dialogRef.current;
    if (!dialogElement) {
      return;
    }

    if (isOpen && !dialogElement.open) {
      dialogElement.showModal();
    }

    if (!isOpen && dialogElement.open) {
      dialogElement.close();
    }
  }, [isOpen]);

  // Update font size
  useEffect(() => {
    localStorage.setItem("font-size-map", String(fontSize));
    document.documentElement.style.setProperty(
      "--font-size-map",
      `${fontSize}px`,
    );
  }, [fontSize]);

  return (
    <dialog
      ref={dialogRef}
      className="settings-modal"
      onClose={onClose}
      aria-labelledby={titleId}
    >
      <header>
        <h2 id={titleId}>Asetukset</h2>
        <button
          className="button icon settings-modal-close-button"
          aria-label="Sulje asetukset"
          onClick={onClose}
        >
          <X size={16} />
        </button>
      </header>
      <div className="settings-entry">
        <label htmlFor="font-size-input">
          Kartan tekstin fonttikoko: {fontSize}px
        </label>
        <input
          id="font-size-input"
          type="range"
          min={ROOM_LABEL_FONT_SIZE_MIN}
          max={ROOM_LABEL_FONT_SIZE_MAX}
          value={fontSize}
          onChange={(e) => {
            const size = Number(e.target.value);
            setFontSize(size);
          }}
        />
      </div>
    </dialog>
  );
}

export default SettingsModal;
