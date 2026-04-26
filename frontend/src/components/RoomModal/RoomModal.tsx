import ConfirmationDialog from "@components/ConfirmationDialog/ConfirmationDialog";
import { X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import RoomForm from "./RoomForm/RoomForm";
import "./RoomModal.css";

interface RoomModalProps {
  onClose: () => void;
  onSubmit?: (values: Record<string, string>) => void;
  initial: Record<string, string>;
}

function RoomModal({ onClose, onSubmit, initial }: RoomModalProps) {
  const formDataRef = useRef<Record<string, string>>({ ...initial });
  const [isValid, setIsValid] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"save" | "close" | null>(
    null,
  );

  const handleFormChange = useCallback(
    (values: Record<string, string>, valid: boolean) => {
      formDataRef.current = values;
      setIsValid(valid);
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
          className="roommodal-close-button"
          aria-label="Sulje"
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
            disabled={!isValid}
          >
            Tallenna
          </button>
        </div>

        <ConfirmationDialog
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
