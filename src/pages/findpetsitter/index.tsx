import Navbar from "@/components/navbar/Navbar";
import SearchFilter from "@/components/findpetsitter/SearchFilter";
import { PetSitterList } from "@/components/pet-sitter-list/PetSitterList";
import { PageHeader } from "@/components/page-header/PageHeader";
import { PaginationInfo } from "@/components/pagination/PaginationInfo";
import { Pagination } from "@/components/pagination/Pagination";
import Footer from "@/components/Footer";
import { usePetSitterData } from "@/hooks/usePetSitterData";
import { useViewMode } from "@/hooks/useViewMode";

function FindPetsitter() {
  const {
    sitters,
    loading,
    currentPage,
    pagination,
    handleSearch,
    handleClear,
    handlePageChange
  } = usePetSitterData();

  const {
    viewMode,
    setViewMode,
    switchToList
  } = useViewMode('list');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-1200 py-4 md:py-8">
        <PageHeader 
          title="Search For Pet Sitter"
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Mobile Layout - SearchFilter on top */}
        <div className="block lg:hidden mb-6">
          <SearchFilter onSearch={handleSearch} onClear={handleClear} />
        </div>
        
        {/* Desktop Layout - Side by side */}
        <div className="hidden lg:flex gap-8">
          <div className="w-90 flex-shrink-0 sticky top-4 h-fit">
            <SearchFilter onSearch={handleSearch} onClear={handleClear} />
          </div>
          <div className="flex-1 space-y-4">
            <PetSitterList
              sitters={sitters}
              loading={loading}
              viewMode={viewMode}
              onClear={handleClear}
              onSwitchToList={switchToList}
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
            variant="mobile"
          />
        </div>

        {/* Pagination */}
        {!loading && sitters.length > 0 && viewMode === 'list' && (
          <div className="flex flex-col items-center mt-8 space-y-4">
            <PaginationInfo
              currentCount={sitters.length}
              totalCount={pagination.totalCount}
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
            />
            <Pagination 
              currentPage={currentPage} 
              totalPages={pagination.totalPages} 
              onClick={handlePageChange}
            />
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
export default FindPetsitter;
