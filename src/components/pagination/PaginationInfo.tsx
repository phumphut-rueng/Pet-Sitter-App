interface PaginationInfoProps {
  currentCount: number;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  limit: number;
  className?: string;
}

export function PaginationInfo({ 
  currentCount, 
  totalCount, 
  currentPage, 
  totalPages,
  limit,
  className = '' 
}: PaginationInfoProps) {
  // คำนวณ range ที่แสดงจริงในหน้าปัจจุบัน
  const startItem = totalCount > 0 ? ((currentPage - 1) * limit) + 1 : 0;
  const endItem = Math.min(startItem + currentCount - 1, totalCount);
  
  return (
    <div className={`text-sm text-gray-6 ${className}`}>
      Showing {startItem}-{endItem} of {totalCount} sitters (Page {currentPage} of {totalPages})
    </div>
  );
}
