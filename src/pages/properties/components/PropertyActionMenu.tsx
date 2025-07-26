import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Eye, Edit, Trash, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

interface PropertyActionMenuProps {
  propertyId: number;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
}

export function PropertyActionMenu({ propertyId, onDelete, isDeleting = false }: PropertyActionMenuProps) {
  const { t } = useTranslation(['dashboard', 'properties']);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full w-8 h-8 bg-white/90 backdrop-blur-sm hover:bg-white/100 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem asChild>
          <Link href={`/property/${propertyId}`} className="flex items-center">
            <Eye className="mr-2 h-4 w-4" />
            View Property
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/properties/edit/${propertyId}`} className="flex items-center">
            <Edit className="mr-2 h-4 w-4" />
            {t('agentProperties.actions.edit')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDelete(propertyId)}
          disabled={isDeleting}
          className="flex items-center text-destructive focus:text-destructive"
        >
          {isDeleting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Trash className="mr-2 h-4 w-4" />
          )}
          {t('agentProperties.actions.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}