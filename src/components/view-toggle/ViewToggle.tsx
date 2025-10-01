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
            ? 'bg-orange-1 border-orange-5 text-orange-6 shadow-sm'
            : 'bg-white border-gray-2 text-gray-6 hover:border-gray-4 hover:text-gray-7 hover:bg-gray-1'
        }`}
      >
        <List className="w-4 h-4" />
        List
      </button>
      <button
        onClick={() => onViewModeChange('map')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 border-2 cursor-pointer ${
          viewMode === 'map'
            ? 'bg-orange-1 border-orange-5 text-orange-6 shadow-sm'
            : 'bg-white border-gray-2 text-gray-6 hover:border-gray-4 hover:text-gray-7 hover:bg-gray-1'
        }`}
      >
        <Map className="w-4 h-4" />
        Map
      </button>
    </div>
  );
}
