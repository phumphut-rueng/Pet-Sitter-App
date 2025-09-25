import { List, Map } from 'lucide-react';

interface ViewToggleProps {
  viewMode: 'list' | 'map';
  onViewModeChange: (mode: 'list' | 'map') => void;
  className?: string;
}

export function ViewToggle({ viewMode, onViewModeChange, className = '' }: ViewToggleProps) {
  return (
    <div className={`flex gap-2 w-fit ${className}`}>
      <button
        onClick={() => onViewModeChange('list')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 border-2 cursor-pointer ${
          viewMode === 'list'
            ? 'bg-orange-50 border-orange-500 text-orange-600 shadow-sm'
            : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-600 hover:bg-gray-50'
        }`}
      >
        <List className="w-4 h-4" />
        List
      </button>
      <button
        onClick={() => onViewModeChange('map')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 border-2 cursor-pointer ${
          viewMode === 'map'
            ? 'bg-orange-50 border-orange-500 text-orange-600 shadow-sm'
            : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-600 hover:bg-gray-50'
        }`}
      >
        <Map className="w-4 h-4" />
        Map
      </button>
    </div>
  );
}
