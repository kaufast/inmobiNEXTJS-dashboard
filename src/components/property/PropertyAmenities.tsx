import { cn } from '@/lib/utils';

interface PropertyAmenitiesProps {
  features: string[];
  title?: string;
  maxItems?: number;
  variant?: 'compact' | 'detailed';
  className?: string;
}

export function PropertyAmenities({ 
  features, 
  title = "Amenities",
  maxItems,
  variant = 'compact',
  className 
}: PropertyAmenitiesProps) {
  // Convert feature keys to readable text
  const formatFeatureName = (feature: string) => {
    return feature
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/_/g, ' ') // Replace underscores with spaces
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .trim();
  };

  if (!features || features.length === 0) {
    return (
      <div className={cn("bg-white rounded-xl p-6", className)}>
        <h3 className="font-heading text-xl font-bold mb-4">{title}</h3>
        <p className="text-gray-500">No amenities listed</p>
      </div>
    );
  }

  const displayFeatures = maxItems ? features.slice(0, maxItems) : features;

  return (
    <div className={cn("bg-white rounded-xl p-6", className)}>
      <h3 className="font-heading text-xl font-bold mb-4">{title}</h3>
      
      {variant === 'compact' ? (
        // Compact version: 2 columns with arrow icons
        <div className="grid grid-cols-2 gap-y-4">
          {displayFeatures.map((feature, index) => (
            <div key={index} className="flex items-start">
              <i className="fas fa-arrow-right text-neutral-700 mt-1 mr-2 flex-shrink-0"></i>
              <span className="text-neutral-700">{formatFeatureName(feature)}</span>
            </div>
          ))}
        </div>
      ) : (
        // Detailed version: 3 columns with check icons
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {displayFeatures.map((feature, index) => (
            <div key={index} className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center mr-3">
                <i className="fas fa-check text-[#131313]"></i>
              </div>
              <span>{formatFeatureName(feature)}</span>
            </div>
          ))}
        </div>
      )}
      
      {maxItems && features.length > maxItems && (
        <p className="text-sm text-gray-500 mt-4">
          And {features.length - maxItems} more amenities...
        </p>
      )}
    </div>
  );
}