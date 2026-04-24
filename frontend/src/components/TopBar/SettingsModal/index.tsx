import { X } from "lucide-react";
import "./style.css";

const ROOM_LABEL_FONT_SIZE_MIN = 10;
const ROOM_LABEL_FONT_SIZE_MAX = 32;

interface SettingsModalProps {
  onClose: () => void;
  fontSize: number;
  setFontSize: (size: number) => void;
}

function SettingsModal({ onClose, fontSize, setFontSize }: SettingsModalProps) {
  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <button
          className="settings-modal-close-button"
          onClick={onClose}
          aria-label="close"
        >
          <X size={16} />
        </button>
        <h2 data-testid="settings-modal-title" className="settings-modal-title">
          Asetukset
        </h2>
        <div className="settings-modal-row">
          <label>Kartan tekstin fonttikoko: {fontSize}px</label>
          <input
            type="range"
            min={ROOM_LABEL_FONT_SIZE_MIN}
            max={ROOM_LABEL_FONT_SIZE_MAX}
            value={fontSize}
            onChange={(e) => {
              const size = Number(e.target.value);
              setFontSize(size);
              localStorage.setItem("map-font-size", String(size));
              document.documentElement.style.setProperty(
                "--map-font-size",
                `${size}px`,
              );
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
