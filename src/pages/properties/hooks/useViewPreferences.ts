import { useState } from 'react';

type ViewType = 'grid' | 'list';

export function useViewPreferences() {
  const [viewType, setViewTypeState] = useState<ViewType>(() => {
    const saved = localStorage.getItem('dashboard-properties-view-type');
    return (saved as ViewType) || 'list';
  });

  const setViewType = (newViewType: ViewType) => {
    setViewTypeState(newViewType);
    localStorage.setItem('dashboard-properties-view-type', newViewType);
  };

  return {
    viewType,
    setViewType,
  };
}