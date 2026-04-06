import { X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import ConfirmationButton from "./ConfirmationButton";
import RoomForm from "./RoomForm";
import "./RoomModal.css";

interface RoomModalProps {
  onClose: () => void;
  onSubmit?: (values: Record<string, string>) => void;
  initial: Record<string, string>;
}

function RoomModal({ onClose, onSubmit, initial }: RoomModalProps) {
  const formDataRef = useRef<Record<string, string>>({ ...initial });
  const [isFormValid, setIsFormValid] = useState(() => {
    const REQUIRED_FIELDS = ["area", "capacity", "roomType"];
    return REQUIRED_FIELDS.every((f) => Boolean(initial[f]?.trim()));
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"save" | "close" | null>(
    null,
  );

  const handleFormChange = useCallback(
    (values: Record<string, string>, isValid: boolean) => {
      formDataRef.current = values;
      setIsFormValid(isValid);
    },
    [],
  );

  const handleSave = () => {
    onSubmit?.(formDataRef.current);
    onClose();
  };

  const requestSave = () => {
    setConfirmAction("save");
    setConfirmOpen(true);
  };
  const requestClose = () => {
    setConfirmAction("close");
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    setConfirmOpen(false);
    if (confirmAction === "save") handleSave();
    if (confirmAction === "close") onClose();
    setConfirmAction(null);
  };
  const handleCancel = () => {
    setConfirmOpen(false);
    setConfirmAction(null);
  };

  return (
    <div className="roommodal-overlay" onClick={requestClose}>
      <div className="roommodal-content" onClick={(e) => e.stopPropagation()}>
        <button
          aria-label="close"
          className="roommodal-close-button"
          onClick={requestClose}
        >
          <X size={16} />
        </button>
        <h2 className="roommodal-title">Muokkaa huonetta</h2>

        <RoomForm onChange={handleFormChange} initial={initial} />

        <div className="roommodal-actions">
          <button
            className="roommodal-save-button"
            onClick={requestSave}
            disabled={!isFormValid}
          >
            Tallenna
          </button>
        </div>

        <ConfirmationButton
          open={confirmOpen}
          title={
            confirmAction === "save"
              ? "Tallenna muutokset?"
              : "Sulje ilman tallennusta?"
          }
          confirmText={confirmAction === "save" ? "Tallenna" : "Kyllä"}
          cancelText="Peruuta"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}

export default RoomModal;
