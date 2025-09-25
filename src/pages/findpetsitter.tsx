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
    } catch (error) {
      console.error("Error fetching sitters:", error);
      setSitter([]);
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
      <Navbar />

      <div className="container-1200 py-8">
        <div className="flex gap-8 border-1 border-red-500">
          <div className="border-1 border-blue-500">
            <SearchFilter onSearch={handleSearch} onClear={handleClear} />
          </div>
          <div className="hidden md:block w-[848px] mx-auto space-y-4">
            {loading
              ? // Show skeleton loading
                [...Array(5)].map((_, index) => (
                  <PetSitterCardSkeletonLarge
                    key={index}
                    className="min-h-[216px]"
                  />
                ))
              : // Show actual data (paginated)
                sitter.map((sitterData) => (
                  <PetSitterCardLarge
                    key={sitterData.id}
                    title={sitterData.name}
                    hostName={sitterData.name}
                    location={`${sitterData.address_province} ${sitterData.address_district} ${sitterData.address_sub_district}`}
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
                ))}
          </div>
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
