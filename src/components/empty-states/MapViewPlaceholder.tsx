import { Map } from 'lucide-react';

interface MapViewPlaceholderProps {
  onSwitchToList: () => void;
  variant?: 'desktop' | 'mobile';
  reason?: 'no-data' | 'no-location';
}

export function MapViewPlaceholder({ onSwitchToList, variant = 'desktop', reason = 'no-data' }: MapViewPlaceholderProps) {
  const isMobile = variant === 'mobile';
  
  const getMessage = () => {
    if (reason === 'no-location') {
      return 'Pet sitters found but no location data available. Switch to List view to see all pet sitters.';
    }
    return 'Map view is coming soon. Switch to List view to see pet sitters.';
  };
  
  return (
    <div className={`flex flex-col items-center justify-center text-center ${
      isMobile ? 'py-12' : 'py-16'
    }`}>
      <div className={`${
        isMobile ? 'w-24 h-24' : 'w-32 h-32'
      } bg-gray-1 rounded-full flex items-center justify-center mb-${isMobile ? '4' : '6'}`}>
        <Map className={`${
          isMobile ? 'w-12 h-12' : 'w-16 h-16'
        } text-gray-4`} />
      </div>
      <h3 className={`${
        isMobile ? 'text-lg' : 'text-xl'
      } font-semibold text-gray-9 mb-${isMobile ? '2' : '3'}`}>
        Map View
      </h3>
      <p className={`text-gray-6 mb-${isMobile ? '4' : '6'} ${
        isMobile ? '' : 'max-w-md'
      }`}>
        {getMessage()}
      </p>
      <button
        onClick={onSwitchToList}
        className={`${
          isMobile ? 'px-6 py-2' : 'px-8 py-3'
        } bg-orange-5 text-white rounded-lg font-medium hover:bg-orange-6 transition-colors`}
      >
        Switch to List
      </button>
    </div>
  );
}
