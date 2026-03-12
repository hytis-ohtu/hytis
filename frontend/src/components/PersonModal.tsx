import { X } from "lucide-react";
import { useRef } from "react";
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

  const isEdit = Object.keys(initial).length > 0;

  const handleFormSubmit = (values: Record<string, string>) => {
    formDataRef.current = values;
  };

  const handleSave = () => {
    onSubmit?.(formDataRef.current);
    onClose();
  };

  return (
    <div className="personmodal-overlay" onClick={onClose}>
      <div className="personmodal-content" onClick={(e) => e.stopPropagation()}>
        <button
          className="personmodal-close-button"
          onClick={onClose}
          aria-label="close"
        >
          <X size={16} />
        </button>
        <h2 className="person-modal-title">
          {isEdit ? "Muokkaa henkilöä" : "Lisää henkilö"}
        </h2>

        <PersonForm onSubmit={handleFormSubmit} initial={initial} />
        <div className="personmodal-actions">
          <ConfirmationButton onConfirm={handleSave}>
            {isEdit ? "Tallenna" : "Lisää"}
          </ConfirmationButton>
        </div>
      </div>
    </div>
  );
}

export default AddPersonModal;
