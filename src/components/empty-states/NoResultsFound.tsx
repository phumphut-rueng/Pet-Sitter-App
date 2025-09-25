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
      } bg-gray-100 rounded-full flex items-center justify-center mb-${isMobile ? '4' : '6'}`}>
        <Search className={`${
          isMobile ? 'w-12 h-12' : 'w-16 h-16'
        } text-gray-400`} />
      </div>
      <h3 className={`${
        isMobile ? 'text-lg' : 'text-xl'
      } font-semibold text-gray-900 mb-${isMobile ? '2' : '3'}`}>
        No Results Found
      </h3>
      <p className={`text-gray-600 mb-${isMobile ? '4' : '6'} ${
        isMobile ? '' : 'max-w-md'
      }`}>
        Try adjusting your search filters or search with different keywords
      </p>
      <button
        onClick={onClear}
        className={`${
          isMobile ? 'px-6 py-2' : 'px-8 py-3'
        } bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors`}
      >
        Clear Filters
      </button>
    </div>
  );
}
