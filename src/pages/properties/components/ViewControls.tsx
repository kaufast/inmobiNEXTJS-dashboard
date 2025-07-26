import { Button } from "@/components/ui/button";
import { Grid, List } from "lucide-react";
import { useTranslation } from "react-i18next";

type ViewType = 'grid' | 'list';

interface ViewControlsProps {
  viewType: ViewType;
  onViewChange: (viewType: ViewType) => void;
  isSelectionMode: boolean;
  onToggleSelection: () => void;
  onSelectAll: () => void;
  selectedCount: number;
  totalCount: number;
  allSelected: boolean;
}

export function ViewControls({ 
  viewType, 
  onViewChange, 
  isSelectionMode, 
  onToggleSelection, 
  onSelectAll,
  selectedCount,
  totalCount,
  allSelected
}: ViewControlsProps) {
  const { t } = useTranslation(['dashboard', 'common']);

  return (
    <div className="flex items-center justify-between">
      {/* Selection Mode Controls */}
      {isSelectionMode ? (
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onSelectAll}
            className="h-8"
          >
            {allSelected ? 'Deselect All' : t('common:selectAll')}
          </Button>
          <span className="text-sm text-muted-foreground">
            {selectedCount > 0 
              ? `${selectedCount} selected`
              : `Click to select properties`
            }
          </span>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">
          {totalCount} {totalCount === 1 ? 'property' : 'properties'}
        </div>
      )}
      
      <div className="flex items-center gap-2">
        {/* Selection Mode Toggle */}
        <Button
          variant={isSelectionMode ? 'default' : 'outline'}
          size="sm"
          onClick={onToggleSelection}
          className={`${isSelectionMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
        >
          {isSelectionMode ? 'Cancel Selection' : 'Select'}
        </Button>
        
        {/* View Type Toggle */}
        <div className="border rounded-lg p-1">
          <Button
            variant={viewType === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('grid')}
            className="w-8 h-8 p-0"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewType === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('list')}
            className="w-8 h-8 p-0"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}