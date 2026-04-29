import ConfirmationDialog from "@components/ConfirmationDialog/ConfirmationDialog";
import { X } from "lucide-react";
import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import PersonForm from "./PersonForm/PersonForm";
import "./PersonModal.css";

interface PersonModalProps {
  onSave: (values: Record<string, string>) => Promise<void>;
  onClose: () => void;
  initial?: Record<string, string>;
}

function PersonModal({ onSave, onClose, initial = {} }: PersonModalProps) {
  const formDataRef = useRef<Record<string, string>>({ ...initial });
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isFormValid, setIsFormValid] = useState(() => {
    const REQUIRED_FIELDS = ["firstName", "lastName"];
    return REQUIRED_FIELDS.every((f) => Boolean(initial[f]?.trim()));
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"save" | "close" | null>(
    null,
  );
  const titleId = useId();

  const isEdit = Object.keys(initial).length > 0;

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const handleEscape = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (e.key !== "Escape") return;
    e.preventDefault();
    e.stopPropagation();
    requestClose();
  };

  const handleFormChange = useCallback(
    (values: Record<string, string>, isValid: boolean) => {
      formDataRef.current = values;
      setIsFormValid(isValid);
    },
    [],
  );

  const handleSave = async () => {
    await onSave(formDataRef.current);
  };

  const handleClose = () => {
    dialogRef.current?.close();
    onClose();
  };

  const handleClick = (e: React.PointerEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) {
      requestClose();
    }
  };

  const requestSave = () => {
    setConfirmAction("save");
    setConfirmOpen(true);
  };
  const requestClose = () => {
    setConfirmAction("close");
    setConfirmOpen(true);
  };

  const handleConfirmConfirm = async () => {
    setConfirmOpen(false);
    if (confirmAction === "save") {
      try {
        await handleSave();
        handleClose();
      } catch (error) {
        console.error("Failed to save person:", error);
      }
    }
    if (confirmAction === "close") handleClose();
    setConfirmAction(null);
  };
  const handleConfirmClose = () => {
    setConfirmOpen(false);
    setConfirmAction(null);
  };

  return (
    <dialog
      ref={dialogRef}
      className="person-modal"
      aria-labelledby={titleId}
      onKeyDown={handleEscape}
      onClick={handleClick}
    >
      <div className="person-modal-content">
        <header>
          <h2 id={titleId}>{isEdit ? "Muokkaa henkilöä" : "Lisää henkilö"}</h2>
          <button
            className="button icon"
            aria-label={
              isEdit ? "Sulje henkilön muokkaus" : "Sulje henkilön lisäys"
            }
            onClick={requestClose}
          >
            <X size={20} />
          </button>
        </header>

        <PersonForm onChange={handleFormChange} initial={initial} />

        <div className="person-modal-actions">
          <button
            className="button"
            onClick={requestSave}
            disabled={!isFormValid}
          >
            {isEdit ? "Tallenna" : "Lisää"}
          </button>
          <button className="button" onClick={requestClose}>
            Peruuta
          </button>
        </div>
      </div>

      {confirmOpen && (
        <ConfirmationDialog
          title={
            confirmAction === "save"
              ? "Tallenna muutokset?"
              : "Sulje ilman tallennusta?"
          }
          confirmText={confirmAction === "save" ? "Tallenna" : "Kyllä"}
          cancelText="Peruuta"
          onConfirm={() => void handleConfirmConfirm()}
          onClose={handleConfirmClose}
        />
      )}
    </dialog>
  );
}

export default PersonModal;
