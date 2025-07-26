import { Property } from '@shared/schema';
import PropertyCard from "@/components/property/PropertyCard";
import { PropertyActionMenu } from './PropertyActionMenu';
import { normalizeProperty } from "@/lib/property-utils";
import { useTranslation } from "react-i18next";

interface PropertyGridProps {
  properties: Property[];
  isSelectionMode: boolean;
  selectedProperties: number[];
  onSelectProperty: (id: number, selected: boolean) => void;
  onDeleteProperty: (id: number) => void;
  isDeletingProperty?: (id: number) => boolean;
}

export function PropertyGrid({ 
  properties, 
  isSelectionMode, 
  selectedProperties, 
  onSelectProperty, 
  onDeleteProperty,
  isDeletingProperty = () => false
}: PropertyGridProps) {
  const { t } = useTranslation(['dashboard', 'properties']);

  const DashboardPropertyCard = ({ property: rawProperty }: { property: Property }) => {
    const property = normalizeProperty(rawProperty);
    if (!property) return null;

    const isSelected = selectedProperties.includes(property.id);
    const isDeleting = isDeletingProperty(property.id);

    return (
      <div className="relative group">
        {/* Management Actions - positioned over the card */}
        <div className="absolute top-3 right-3 z-10">
          <PropertyActionMenu 
            propertyId={property.id}
            onDelete={onDeleteProperty}
            isDeleting={isDeleting}
          />
        </div>

        {/* Verification Status Badge - positioned below the listing type badge */}
        <div className="absolute top-12 left-3 z-10">
          <div className={`text-xs px-2 py-1 rounded-full ${
            property.isVerified 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {property.isVerified ? t('agentProperties.status.verified') : t('agentProperties.status.pending')}
          </div>
        </div>

        {/* Property Card */}
        <div 
          onClick={() => {
            if (isSelectionMode) {
              onSelectProperty(property.id, !isSelected);
            }
          }}
          className={`${isSelectionMode ? 'cursor-pointer' : ''}`}
        >
          <PropertyCard
            property={property}
            variant="default"
            showActions={false}
            className={`${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''} ${isDeleting ? 'opacity-50' : ''} ${isSelectionMode ? 'transition-all' : ''}`}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {properties.map((property) => (
        <DashboardPropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}