import {
  applyMapFontSize,
  getMapFontSize,
  setMapFontSize,
} from "@utils/mapFontSize";
import { X } from "lucide-react";
import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import "./SettingsModal.css";

const ROOM_LABEL_FONT_SIZE_MIN = 10;
const ROOM_LABEL_FONT_SIZE_MAX = 32;

interface SettingsModalProps {
  onClose: () => void;
}

function SettingsModal({ onClose }: SettingsModalProps) {
  const [fontSize, setFontSize] = useState(getMapFontSize);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const handleEscape = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (e.key !== "Escape") return;
    e.preventDefault();
    e.stopPropagation();
    handleClose();
  };

  const handleClose = () => {
    dialogRef.current?.close();
    onClose();
  };

  useEffect(() => {
    setMapFontSize(fontSize);
    applyMapFontSize(fontSize);
  }, [fontSize]);

  return (
    <dialog
      ref={dialogRef}
      className="settings-modal"
      aria-labelledby={titleId}
      onKeyDown={handleEscape}
    >
      <header>
        <h2 id={titleId}>Asetukset</h2>
        <button
          className="button icon settings-modal-close-button"
          aria-label="Sulje asetukset"
          onClick={handleClose}
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
