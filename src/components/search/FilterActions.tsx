interface FilterActionsProps {
  onSearch: () => void;
  onClear: () => void;
  className?: string;
  layout?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
}

export function FilterActions({ 
  onSearch, 
  onClear, 
  className = '', 
  layout = 'horizontal',
  size = 'md' 
}: FilterActionsProps) {
  const sizeClasses = {
    sm: 'px-6 py-2 text-sm h-10',
    md: 'px-8 py-3 text-sm h-12',
    lg: 'px-10 py-4 text-base h-14'
  };

  const layoutClasses = {
    horizontal: 'flex gap-3',
    vertical: 'flex flex-col gap-3'
  };

  return (
    <div className={`${layoutClasses[layout]} ${className}`}>
      <button
        onClick={onClear}
        className={`${sizeClasses[size]} bg-orange-100 text-orange-600 rounded-lg font-medium hover:bg-orange-200 transition-colors ${
          layout === 'vertical' ? 'w-full' : ''
        }`}
      >
        Clear
      </button>
      <button
        onClick={onSearch}
        className={`${sizeClasses[size]} bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors ${
          layout === 'vertical' ? 'w-full' : ''
        }`}
      >
        Search
      </button>
    </div>
  );
}
