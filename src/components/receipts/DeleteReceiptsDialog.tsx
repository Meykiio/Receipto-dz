import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface DeleteReceiptsDialogProps {
  open: boolean;
  isDeleting: boolean;
  title: string;
  description: string;
  cancelLabel: string;
  deleteLabel: string;
  loadingLabel: string;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Delete confirmation dialog shared by single + bulk receipt delete.
 */
export const DeleteReceiptsDialog = ({
  open, isDeleting, title, description,
  cancelLabel, deleteLabel, loadingLabel, onClose, onConfirm,
}: DeleteReceiptsDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} onClick={onClose}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            disabled={isDeleting}
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? loadingLabel : deleteLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteReceiptsDialog;