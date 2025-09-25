import Navbar from "@/components/navbar/Navbar";
import SearchFilter from "@/components/findpetsitter/SearchFilter";
import { PetSitterCardLarge } from "@/components/cards/PetSitterCard";
import { PetSitterCardSkeletonLarge } from "@/components/cards/PetSitterCardSkeleton";
import { Sitter } from "@/types/sitter.types";
import axios from "axios";
import { useEffect, useState } from "react";
import { Pagination } from "@/components/pagination/Pagination";
import Footer from "@/components/Footer";

interface SearchFilters {
  searchTerm: string;
  petTypes: string[];
  rating: number;
  experience: string;
}

interface PaginationData {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

function FindPetsitter() {
  const [sitter, setSitter] = useState<Sitter[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: "",
    petTypes: [],
    rating: 0,
    experience: "all"
  });
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 5,
    totalCount: 0,
    totalPages: 0
  });
  const cardsPerPage = 5;

  useEffect(() => {
    getSitter();
  }, [currentPage, filters]);

  const getSitter = async () => {
    try {
      setLoading(true);
      
      // สร้าง query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: cardsPerPage.toString()
      });

      // เพิ่ม filters
      if (filters.searchTerm) {
        params.append('searchTerm', filters.searchTerm);
      }
      if (filters.petTypes.length > 0) {
        filters.petTypes.forEach(type => params.append('petTypes', type));
      }
      if (filters.rating > 0) {
        params.append('rating', filters.rating.toString());
      }
      if (filters.experience !== "all") {
        params.append('experience', filters.experience);
      }

      const response = await axios.get(`/api/sitter/get-sitter?${params.toString()}`);
      
      if (response.data.data) {
        setSitter(response.data.data);
        setPagination(response.data.pagination);
      } else {
        // Handle old API format for backward compatibility
        setSitter(response.data);
        setPagination({
          page: 1,
          limit: response.data.length,
          totalCount: response.data.length,
          totalPages: 1
        });
      }
    } catch (error: any) {
      console.error("Error fetching sitters:", error);
      
      // Handle different types of errors
      if (error.response?.status === 404) {
        // No results found - this is normal, not an error
        setSitter([]);
        setPagination({
          page: 1,
          limit: cardsPerPage,
          totalCount: 0,
          totalPages: 0
        });
      } else if (error.response?.status === 500) {
        // Server error
        console.error("Server error:", error.response.data);
        setSitter([]);
        setPagination({
          page: 1,
          limit: cardsPerPage,
          totalCount: 0,
          totalPages: 0
        });
      } else {
        // Other errors (network, etc.)
        console.error("Network or other error:", error.message);
        setSitter([]);
        setPagination({
          page: 1,
          limit: cardsPerPage,
          totalCount: 0,
          totalPages: 0
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleClear = () => {
    setFilters({
      searchTerm: "",
      petTypes: [],
      rating: 0,
      experience: "all"
    });
    setCurrentPage(1); // Reset to first page when clearing
  };

  return (
    <div className="min-h-screen bg-white">
      

      <div className="container-1200 py-4 md:py-8 border-1 border-red-500">
        {/* Mobile Layout - SearchFilter on top */}
        <div className="block lg:hidden mb-6">
          <SearchFilter onSearch={handleSearch} onClear={handleClear} />
        </div>
        
        {/* Desktop Layout - Side by side */}
        <div className="hidden lg:flex gap-8 border-1 border-blue-500">
          <div className="w-90 flex-shrink-0 sticky top-4 h-fit">
            <SearchFilter onSearch={handleSearch} onClear={handleClear} />
          </div>
          <div className="flex-1 space-y-4">
            {loading
              ? // Show skeleton loading
                [...Array(5)].map((_, index) => (
                  <PetSitterCardSkeletonLarge
                    key={index}
                    className="min-h-[216px]"
                  />
                ))
              : sitter.length > 0
              ? // Show actual data (paginated)
                sitter.map((sitterData) => (
                  <PetSitterCardLarge
                    key={sitterData.id}
                    title={sitterData.location_description}
                    hostName={sitterData.name}
                    location={`${sitterData.address_district}, ${sitterData.address_province}`}
                    coverUrl={
                      sitterData.sitter_image[0]?.image_url ||
                      "https://via.placeholder.com/150"
                    }
                    rating={sitterData.averageRating || 0}
                    className="min-h-[216px] cursor-pointer"
                    tags={sitterData.sitter_pet_type.map(
                      (petType) => petType.pet_type.pet_type_name
                    )}
                  />
                ))
              : // No results found
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">No Results Found</h3>
                  <p className="text-gray-600 mb-6 max-w-md">Try adjusting your search filters or search with different keywords</p>
                  <button
                    onClick={handleClear}
                    className="px-8 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>}
          </div>
        </div>
        
        {/* Mobile Cards - Full width */}
        <div className="block lg:hidden space-y-4">
          {loading
            ? // Show skeleton loading
              [...Array(5)].map((_, index) => (
                <PetSitterCardSkeletonLarge
                  key={index}
                  className="min-h-[216px]"
                />
              ))
            : sitter.length > 0
            ? // Show actual data (paginated)
              sitter.map((sitterData) => (
                <PetSitterCardLarge
                  key={sitterData.id}
                  title={sitterData.location_description}
                  hostName={sitterData.name}
                  location={`${sitterData.address_district}, ${sitterData.address_province}`}
                  coverUrl={
                    sitterData.sitter_image[0]?.image_url ||
                    "https://via.placeholder.com/150"
                  }
                  rating={sitterData.averageRating || 0}
                  className="min-h-[216px] cursor-pointer"
                  tags={sitterData.sitter_pet_type.map(
                    (petType) => petType.pet_type.pet_type_name
                  )}
                />
              ))
            : // No results found
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search filters or search with different keywords</p>
                <button
                  onClick={handleClear}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                >
                  Clear Filters
                </button>
              </div>}
        </div>
        {!loading && sitter.length > 0 && (
          <div className="flex flex-col items-center mt-8 space-y-4">
            <div className="text-sm text-gray-600">
              Showing {sitter.length} of {pagination.totalCount} sitters (Page {pagination.page} of {pagination.totalPages})
            </div>
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
