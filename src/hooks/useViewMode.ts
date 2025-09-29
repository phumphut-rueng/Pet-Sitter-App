import { useState, useCallback } from 'react';

type ViewMode = 'list' | 'map';

export function useViewMode(initialMode: ViewMode = 'list') {
  const [viewMode, setViewMode] = useState<ViewMode>(initialMode);

  const switchToList = useCallback(() => {
    setViewMode('list');
  }, []);

  const switchToMap = useCallback(() => {
    setViewMode('map');
  }, []);

  return {
    viewMode,
    setViewMode,
    switchToList,
    switchToMap,
    isListView: viewMode === 'list',
    isMapView: viewMode === 'map'
  };
}
