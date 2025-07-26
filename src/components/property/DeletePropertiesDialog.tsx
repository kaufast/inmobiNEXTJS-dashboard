import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DeletePropertiesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
  propertiesCount: number;
}

export function DeletePropertiesDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
  propertiesCount,
}: DeletePropertiesDialogProps) {
  const { t } = useTranslation(['dashboard', 'common']);

  if (propertiesCount === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            {t("agentProperties.trash.confirmTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("agentProperties.trash.confirmDescription")}
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm text-gray-500">
          {t("agentProperties.trash.countMessage", {
            count: propertiesCount,
            properties: propertiesCount === 1 
              ? t("agentProperties.trash.property") 
              : t("agentProperties.trash.properties")
          })}
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("actions.cancel")}
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            {t("agentProperties.trash.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 