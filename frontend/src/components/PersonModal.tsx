import { X } from "lucide-react";
import { useRef, useState } from "react";
import ConfirmationButton from "./ConfirmationButton";
import PersonForm from "./PersonForm";
import "./PersonModal.css";

interface PersonModalProps {
  onClose: () => void;
  onSubmit?: (values: Record<string, string>) => void;
  initial?: Record<string, string>;
}

function AddPersonModal({ onClose, onSubmit, initial = {} }: PersonModalProps) {
  const formDataRef = useRef<Record<string, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"save" | "close" | null>(
    null,
  );

  const isEdit = Object.keys(initial).length > 0;

  const handleFormSubmit = (values: Record<string, string>) => {
    formDataRef.current = values;
  };

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
    <div className="personmodal-overlay" onClick={requestClose}>
      <div className="personmodal-content" onClick={(e) => e.stopPropagation()}>
        <button
          className="personmodal-close-button"
          onClick={requestClose}
          aria-label="close"
        >
          <X size={16} />
        </button>
        <h2 className="person-modal-title">
          {isEdit ? "Muokkaa henkilöä" : "Lisää henkilö"}
        </h2>

        <PersonForm onSubmit={handleFormSubmit} initial={initial} />
        <div className="personmodal-actions">
          <button className="confirmation-button" onClick={requestSave}>
            {isEdit ? "Tallenna" : "Lisää"}
          </button>
        </div>

        <ConfirmationButton
          open={confirmOpen}
          title={
            confirmAction === "save"
              ? "Tallenna muutokset?"
              : "Suljetaanko ilman tallennusta?"
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

export default AddPersonModal;
