import { X } from "lucide-react";
import "./AddPersonModal.css";

interface AddPersonModalProps {
  onClose: () => void;
}

function AddPersonModal({ onClose }: AddPersonModalProps) {
  return (
    <div className="addperson-overlay" onClick={onClose}>
      <div className="addperson-modal" onClick={(e) => e.stopPropagation()}>
        <button
          className="addperson-modal-close-button"
          onClick={onClose}
          aria-label="close"
        >
          <X size={16} />
        </button>
        <h2
          data-testid="addpesron-modal-title"
          className="addperson-modal-title"
        >
          Lisää henkilö
        </h2>
        <div className="addperson-modal-row"></div>
      </div>
    </div>
  );
}

export default AddPersonModal;
