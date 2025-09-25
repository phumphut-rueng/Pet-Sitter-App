import Navbar from "@/components/navbar/Navbar";
import SearchFilter from "@/components/findpetsitter/SearchFilter";
import { PetSitterCardLarge } from "@/components/cards/PetSitterCard";
import { PetSitterCardSkeletonLarge } from "@/components/cards/PetSitterCardSkeleton";
import { Sitter } from "@/types/sitter.types";
import axios from "axios";
import { useEffect, useState } from "react";
import { Pagination } from "@/components/pagination/Pagination";
import Footer from "@/components/Footer";

function FindPetsitter() {
  const [sitter, setSitter] = useState<Sitter[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 5;

  useEffect(() => {
    getSitter();
  }, []);

  const getSitter = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/sitter/get-sitter");
      setSitter(response.data);
      setCurrentPage(1); // Reset to first page when new data loads
    } catch (error) {
      console.error("Error fetching sitters:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(sitter.length / cardsPerPage);
  const startIndex = (currentPage - 1) * cardsPerPage;
  const endIndex = startIndex + cardsPerPage;
  const currentSitters = sitter.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="container-1200 py-8">
        <div className="flex gap-8 border-1 border-red-500">
          <div className="border-1 border-blue-500">
            <SearchFilter onSearch={() => {}} onClear={() => {}} />
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
                currentSitters.map((sitterData) => (
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
              Showing {startIndex + 1}-{Math.min(endIndex, sitter.length)} of {sitter.length} sitters
            </div>
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
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
