import { Search } from 'lucide-react';

interface NoResultsFoundProps {
  onClear: () => void;
  variant?: 'desktop' | 'mobile';
}

export function NoResultsFound({ onClear, variant = 'desktop' }: NoResultsFoundProps) {
  const isMobile = variant === 'mobile';
  
  return (
    <div className={`flex flex-col items-center justify-center text-center ${
      isMobile ? 'py-12' : 'py-16'
    }`}>
      <div className={`${
        isMobile ? 'w-24 h-24' : 'w-32 h-32'
      } bg-gray-1 rounded-full flex items-center justify-center mb-${isMobile ? '4' : '6'}`}>
        <Search className={`${
          isMobile ? 'w-12 h-12' : 'w-16 h-16'
        } text-gray-4`} />
      </div>
      <h3 className={`${
        isMobile ? 'text-lg' : 'text-xl'
      } font-semibold text-gray-9 mb-${isMobile ? '2' : '3'}`}>
        No Results Found
      </h3>
      <p className={`text-gray-6 mb-${isMobile ? '4' : '6'} ${
        isMobile ? '' : 'max-w-md'
      }`}>
        Try adjusting your search filters or search with different keywords
      </p>
      <button
        onClick={onClear}
        className={`${
          isMobile ? 'px-6 py-2' : 'px-8 py-3'
        } bg-orange-5 text-white rounded-lg font-medium hover:bg-orange-6 transition-colors`}
      >
        Clear Filters
      </button>
    </div>
  );
}
