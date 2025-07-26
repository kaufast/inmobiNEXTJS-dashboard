import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Plus, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageItem {
  url?: string;
  src?: string;
  id?: string;
  [key: string]: any;
}

interface PropertyImageCarouselProps {
  images: (string | ImageItem)[];
  onImagesChange: (images: (string | ImageItem)[]) => void;
  onAddImage: () => void;
  maxImages?: number;
  className?: string;
}

export function PropertyImageCarousel({
  images,
  onImagesChange,
  onAddImage,
  maxImages = 10,
  className
}: PropertyImageCarouselProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Helper to get URL from image item
  const getImageUrl = (img: string | ImageItem): string => {
    if (typeof img === 'string') return img;
    return img.url || img.src || '';
  };

  // Delete image at specific index
  const handleDeleteImage = (indexToDelete: number) => {
    const newImages = images.filter((_, index) => index !== indexToDelete);
    onImagesChange(newImages);
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    
    // Remove from old position
    newImages.splice(draggedIndex, 1);
    
    // Insert at new position
    newImages.splice(dropIndex, 0, draggedImage);
    
    onImagesChange(newImages);
    setDraggedIndex(null);
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Image count info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{images.length} of {maxImages} images</span>
        {images.length > 0 && <span>Drag to reorder</span>}
      </div>

      {/* Image carousel */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {images.map((image, index) => {
          const imageUrl = getImageUrl(image);
          return (
            <div
              key={`${imageUrl}-${index}`}
              className={cn(
                "relative flex-shrink-0 w-32 h-32 bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-300 transition-all cursor-move",
                draggedIndex === index && "opacity-50 border-blue-500"
              )}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
            >
              {/* Image */}
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={`Property image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}

              {/* Delete button */}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 w-6 h-6 rounded-full"
                onClick={() => handleDeleteImage(index)}
              >
                <X className="w-3 h-3" />
              </Button>

              {/* Image number badge */}
              <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                {index + 1}
              </div>
            </div>
          );
        })}

        {/* Add new image button */}
        {canAddMore && (
          <Button
            type="button"
            variant="outline"
            className="flex-shrink-0 w-32 h-32 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all"
            onClick={onAddImage}
          >
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <Plus className="w-6 h-6" />
              <span className="text-xs">Add Image</span>
            </div>
          </Button>
        )}
      </div>

      {/* Helper text */}
      {images.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No images uploaded yet</p>
          <p className="text-sm">Click "Add Image" to get started</p>
        </div>
      )}
    </div>
  );
}