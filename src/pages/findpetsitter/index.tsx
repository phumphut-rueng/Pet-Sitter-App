import SearchFilter from "@/components/findpetsitter/SearchFilter";
import { PetSitterList } from "@/components/pet-sitter-list/PetSitterList";
import { PageHeader } from "@/components/page-header/PageHeader";
import { PaginationInfo } from "@/components/pagination/PaginationInfo";
import { Pagination } from "@/components/pagination/Pagination";
import Footer from "@/components/Footer";
import { usePetSitterData } from "@/hooks/usePetSitterData";
import { useViewMode } from "@/hooks/useViewMode";
import { useEffect, useState } from "react";
import { SearchFilters } from "@/hooks/useSearchFilter";

function FindPetsitter() {
  const [searchFilters, setSearchFilters] = useState<SearchFilters | undefined>(undefined);
  
  const {
    sitters,
    loading,
    currentPage,
    pagination,
    filters,
    handleSearch,
    handleClear,
    handlePageChange
  } = usePetSitterData(searchFilters);

  const {
    viewMode,
    setViewMode,
    switchToList
  } = useViewMode('list');

  // Read filters from sessionStorage when component mounts
  useEffect(() => {
    const storedFilters = sessionStorage.getItem('searchFilters');
    if (storedFilters) {
      try {
        const parsedFilters = JSON.parse(storedFilters);
        setSearchFilters(parsedFilters);
        // Clear the stored filters after using them
        sessionStorage.removeItem('searchFilters');
        // Scroll to top เมื่อมาจาก landingpage (บนสุดของเว็บไซต์)
        setTimeout(() => {
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }, 100);
      } catch (error) {
        console.error('Error parsing stored filters:', error);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1">
        <div className="container-1200 py-4 md:py-8">
          <PageHeader 
            title="Search For Pet Sitter"
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {/* Mobile Layout - SearchFilter on top */}
          <div className="block lg:hidden mb-6">
            <SearchFilter 
              onSearch={handleSearch} 
              onClear={handleClear}
              initialFilters={searchFilters || filters}
            />
          </div>
          
          {/* Desktop Layout - Side by side */}
          <div className="hidden lg:flex gap-8">
            <div className="w-90 flex-shrink-0 sticky top-4 h-fit">
              <SearchFilter 
                onSearch={handleSearch} 
                onClear={handleClear}
                initialFilters={searchFilters || filters}
              />
            </div>
            <div className="flex-1 space-y-4">
              <PetSitterList
                sitters={sitters}
                loading={loading}
                viewMode={viewMode}
                onClear={handleClear}
                onSwitchToList={switchToList}
                onSitterSelect={(sitter) => {
                  // Optional: Handle sitter selection (e.g., scroll to details, highlight, etc.)
                }}
                variant="desktop"
              />
            </div>
          </div>
          
          {/* Mobile Cards - Full width */}
          <div className="block lg:hidden space-y-4">
            <PetSitterList
              sitters={sitters}
              loading={loading}
              viewMode={viewMode}
              onClear={handleClear}
              onSwitchToList={switchToList}
              onSitterSelect={(sitter) => {
                // Optional: Handle sitter selection (e.g., scroll to details, highlight, etc.)
              }}
              variant="mobile"
            />
          </div>

          {/* Pagination - แสดงทั้งใน list และ map view */}
          {!loading && sitters.length > 0 && (
            <div className="flex flex-col items-center mt-8 space-y-4">
              <PaginationInfo
                currentCount={sitters.length}
                totalCount={pagination.totalCount}
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                limit={pagination.limit}
              />
              <Pagination 
                currentPage={currentPage} 
                totalPages={pagination.totalPages} 
                onClick={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
export default FindPetsitter;
