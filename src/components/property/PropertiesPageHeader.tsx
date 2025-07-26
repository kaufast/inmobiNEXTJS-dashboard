import { Button } from "@/components/ui/button";
import { Check, Loader2, Plus, Sparkles, Trash, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";

interface PropertiesPageHeaderProps {
  selectMode: boolean;
  toggleSelectMode: () => void;
  selectAllProperties: () => void;
  selectedPropertiesCount: number;
  filteredPropertiesCount: number;
  onDeleteClick: () => void;
  isDeleting: boolean;
  onAddPropertyClick: () => void;
}

export function PropertiesPageHeader({
  selectMode,
  toggleSelectMode,
  selectAllProperties,
  selectedPropertiesCount,
  filteredPropertiesCount,
  onDeleteClick,
  isDeleting,
  onAddPropertyClick,
}: PropertiesPageHeaderProps) {
  const { t } = useTranslation(['dashboard', 'common']);

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t("agentProperties.title")}</h2>
        <p className="text-muted-foreground">{t("agentProperties.description")}</p>
      </div>
      <div className="flex gap-2">
        {selectMode ? (
          <>
            <Button variant="outline" onClick={toggleSelectMode} className="border-gray-300">
              <X className="mr-2 h-4 w-4" /> {t("agentProperties.cancelSelection")}
            </Button>
            <Button variant="outline" onClick={selectAllProperties} className="border-gray-300">
              <Check className="mr-2 h-4 w-4" />
              {selectedPropertiesCount === filteredPropertiesCount
                ? t("agentProperties.deselectAll")
                : t("agentProperties.selectAll")}
            </Button>
            {selectedPropertiesCount > 0 && (
              <Button variant="destructive" onClick={onDeleteClick} disabled={isDeleting}>
                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash className="mr-2 h-4 w-4" />}
                {t("agentProperties.moveToTrash")} ({selectedPropertiesCount})
              </Button>
            )}
          </>
        ) : (
          <>
            <Button onClick={toggleSelectMode} variant="outline" className="border-gray-300">
              <Check className="mr-2 h-4 w-4" /> {t("agentProperties.selectMultiple")}
            </Button>
            <Button onClick={onAddPropertyClick} className="bg-[#131313]">
              <Plus className="mr-2 h-4 w-4" /> {t("agentProperties.standardForm")}
            </Button>
            <Button asChild className="bg-[#131313]">
              <Link href="/add-property-wizard">
                <Sparkles className="mr-2 h-4 w-4" /> {t("agentProperties.wizardMode")}
              </Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
} 