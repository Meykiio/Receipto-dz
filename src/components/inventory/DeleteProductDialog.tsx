import { useTranslation } from "react-i18next";
import { DeleteReceiptsDialog } from "@/components/receipts/DeleteReceiptsDialog";

interface DeleteProductDialogProps {
  open: boolean;
  productName: string;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Delete-product confirmation, reusing the shared delete dialog shell.
 */
export const DeleteProductDialog = ({ open, productName, isDeleting, onClose, onConfirm }: DeleteProductDialogProps) => {
  const { t } = useTranslation();
  return (
    <DeleteReceiptsDialog
      open={open}
      isDeleting={isDeleting}
      title={t("inventory.deleteProductTitle")}
      description={t("inventory.deleteProductDesc", { name: productName })}
      cancelLabel={t("common.cancel")}
      deleteLabel={t("common.delete")}
      loadingLabel={t("common.loading")}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
};

export default DeleteProductDialog;