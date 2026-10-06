import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface RenameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  setTitle: (value: string) => void;
  onSave: () => void;
}

export function RenameDialog({ open, onOpenChange, title, setTitle, onSave }: RenameDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("assistant.renameChat")}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="chat-title" className="mb-2 block">{t("assistant.chatTitle")}</Label>
          <Input
            id="chat-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("assistant.titlePlaceholder")}
            className="w-full"
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
          <Button onClick={onSave} disabled={!title.trim()}>{t("common.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default RenameDialog;