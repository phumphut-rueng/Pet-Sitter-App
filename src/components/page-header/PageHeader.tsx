import { ViewToggle } from '@/components/view-toggle/ViewToggle';

interface PageHeaderProps {
  title: string;
  viewMode: 'list' | 'map';
  onViewModeChange: (mode: 'list' | 'map') => void;
  className?: string;
}

export function PageHeader({ title, viewMode, onViewModeChange, className = '' }: PageHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12 mt-6 ${className}`}>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-6 mb-4 sm:mb-0">
        {title}
      </h1>
      <ViewToggle 
        viewMode={viewMode} 
        onViewModeChange={onViewModeChange} 
      />
    </div>
  );
}
