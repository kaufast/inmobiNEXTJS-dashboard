import { Button } from "@/components/ui/button";
import { Trash, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface BulkActionBarProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onClearSelection: () => void;
  isDeleting?: boolean;
}

export function BulkActionBar({ 
  selectedCount, 
  onBulkDelete, 
  onClearSelection, 
  isDeleting = false 
}: BulkActionBarProps) {
  const { t } = useTranslation(['dashboard', 'common']);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-blue-900">
          {t('selectedItems', { count: selectedCount })}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onClearSelection}
          disabled={isDeleting}
        >
          Clear Selection
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={onBulkDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <Trash className="mr-2 h-4 w-4" />
              {t('common:deleteSelected')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}