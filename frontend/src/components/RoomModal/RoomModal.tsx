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
import RoomForm from "./RoomForm/RoomForm";
import "./RoomModal.css";

interface RoomModalProps {
  onSave: (values: Record<string, string>) => Promise<void>;
  onClose: () => void;
  initial: Record<string, string>;
}

function RoomModal({ onSave, onClose, initial }: RoomModalProps) {
  const formDataRef = useRef<Record<string, string>>({ ...initial });
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [isValid, setIsValid] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"save" | "close" | null>(
    null,
  );

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
    (values: Record<string, string>, valid: boolean) => {
      formDataRef.current = values;
      setIsValid(valid);
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

  // Open confirm dialog
  const requestSave = () => {
    setConfirmAction("save");
    setConfirmOpen(true);
  };
  const requestClose = () => {
    setConfirmAction("close");
    setConfirmOpen(true);
  };

  // Handle confirm dialog
  const handleConfirmConfirm = async () => {
    setConfirmOpen(false);
    if (confirmAction === "save") {
      try {
        await handleSave();
        handleClose();
      } catch (error) {
        console.error("Failed to save room:", error);
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
      className="room-modal"
      aria-labelledby={titleId}
      onKeyDown={handleEscape}
      onClick={handleClick}
    >
      <div className="room-modal-content">
        <button
          className="room-modal-close-button"
          aria-label="Sulje huoneen tietojen muokkaus"
          onClick={requestClose}
        >
          <X size={16} />
        </button>
        <h2 id={titleId} className="room-modal-title">
          Muokkaa huonetta
        </h2>

        <RoomForm onChange={handleFormChange} initial={initial} />

        <div className="room-modal-actions">
          <button
            className="room-modal-save-button"
            onClick={requestSave}
            disabled={!isValid}
          >
            Tallenna
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

export default RoomModal;
