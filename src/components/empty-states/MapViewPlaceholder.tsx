import { Map } from 'lucide-react';

interface MapViewPlaceholderProps {
  onSwitchToList: () => void;
  variant?: 'desktop' | 'mobile';
}

export function MapViewPlaceholder({ onSwitchToList, variant = 'desktop' }: MapViewPlaceholderProps) {
  const isMobile = variant === 'mobile';
  
  return (
    <div className={`flex flex-col items-center justify-center text-center ${
      isMobile ? 'py-12' : 'py-16'
    }`}>
      <div className={`${
        isMobile ? 'w-24 h-24' : 'w-32 h-32'
      } bg-gray-100 rounded-full flex items-center justify-center mb-${isMobile ? '4' : '6'}`}>
        <Map className={`${
          isMobile ? 'w-12 h-12' : 'w-16 h-16'
        } text-gray-400`} />
      </div>
      <h3 className={`${
        isMobile ? 'text-lg' : 'text-xl'
      } font-semibold text-gray-900 mb-${isMobile ? '2' : '3'}`}>
        Map View
      </h3>
      <p className={`text-gray-600 mb-${isMobile ? '4' : '6'} ${
        isMobile ? '' : 'max-w-md'
      }`}>
        Map view is coming soon. Switch to List view to see pet sitters.
      </p>
      <button
        onClick={onSwitchToList}
        className={`${
          isMobile ? 'px-6 py-2' : 'px-8 py-3'
        } bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors`}
      >
        Switch to List
      </button>
    </div>
  );
}
