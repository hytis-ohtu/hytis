import { X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import ConfirmationButton from "./ConfirmationButton";
import PersonForm from "./PersonForm";
import "./PersonModal.css";

interface PersonModalProps {
  onClose: () => void;
  onSubmit?: (values: Record<string, string>) => void;
  initial?: Record<string, string>;
}

function PersonModal({ onClose, onSubmit, initial = {} }: PersonModalProps) {
  const formDataRef = useRef<Record<string, string>>({ ...initial });
  const [isFormValid, setIsFormValid] = useState(() => {
    const REQUIRED_FIELDS = [
      "firstName",
      "lastName",
      "department",
      "jobtitle",
      "supervisors",
      "startDate",
      "endDate",
    ];
    return REQUIRED_FIELDS.every((f) => Boolean(initial[f]?.trim()));
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"save" | "close" | null>(
    null,
  );

  const isEdit = Object.keys(initial).length > 0;

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
    <div className="personmodal-overlay" onClick={requestClose}>
      <div className="personmodal-content" onClick={(e) => e.stopPropagation()}>
        <button
          aria-label="close"
          className="personmodal-close-button"
          onClick={requestClose}
        >
          <X size={16} />
        </button>
        <h2 className="personmodal-title">
          {isEdit ? "Muokkaa henkilöä" : "Lisää henkilö"}
        </h2>

        <PersonForm onChange={handleFormChange} initial={initial} />

        <div className="personmodal-actions">
          <button
            className="personmodal-save-button"
            onClick={requestSave}
            disabled={!isFormValid}
          >
            {isEdit ? "Tallenna" : "Lisää"}
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

export default PersonModal;
