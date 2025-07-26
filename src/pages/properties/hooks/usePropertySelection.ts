import { useState, useEffect } from 'react';
import { Property } from '@shared/schema';

export function usePropertySelection(properties: Property[]) {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState<number[]>([]);

  // ESC key support to exit selection mode
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isSelectionMode) {
        exitSelectionMode();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSelectionMode]);

  const enterSelectionMode = () => {
    setIsSelectionMode(true);
  };
  
  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedProperties([]);
  };

  const toggleSelectionMode = () => {
    if (isSelectionMode) {
      exitSelectionMode();
    } else {
      enterSelectionMode();
    }
  };

  const selectProperty = (propertyId: number, selected: boolean) => {
    if (selected) {
      setSelectedProperties(prev => [...prev, propertyId]);
    } else {
      setSelectedProperties(prev => prev.filter(id => id !== propertyId));
    }
  };

  const selectAll = () => {
    const allIds = properties.map(p => p.id);
    setSelectedProperties(allIds);
  };

  const deselectAll = () => {
    setSelectedProperties([]);
  };

  const clearSelection = () => {
    exitSelectionMode();
  };

  const isPropertySelected = (propertyId: number) => {
    return selectedProperties.includes(propertyId);
  };

  return {
    // State
    isSelectionMode,
    selectedProperties,
    selectedCount: selectedProperties.length,
    allSelected: selectedProperties.length === properties.length && properties.length > 0,
    
    // Actions
    toggleSelectionMode,
    selectProperty,
    selectAll,
    deselectAll,
    clearSelection,
    isPropertySelected,
  };
}