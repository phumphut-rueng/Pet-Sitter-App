interface PaginationInfoProps {
  currentCount: number;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  className?: string;
}

export function PaginationInfo({ 
  currentCount, 
  totalCount, 
  currentPage, 
  totalPages,
  className = '' 
}: PaginationInfoProps) {
  return (
    <div className={`text-sm text-gray-6 ${className}`}>
      Showing {currentCount} of {totalCount} sitters (Page {currentPage} of {totalPages})
    </div>
  );
}
