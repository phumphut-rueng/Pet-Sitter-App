import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import AdminSidebar from "@/components/layout/AdminSidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { PetPawLoading } from "@/components/loading/PetPawLoading";
import { Pagination } from "@/components/pagination/Pagination";
import SittersTable from "@/components/admin/sitters/SittersTable";
import axios from "axios";

function PageHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <h1 className="h3 text-ink tracking-normal">{title}</h1>
      {children}
    </div>
  );
}

interface SitterData {
  id: number;
  name: string;
  phone: string;
  experience: string;
  introduction: string;
  location_description: string;
  service_description: string;
  address_detail: string;
  address_province: string;
  address_district: string;
  address_sub_district: string;
  address_post_code: string;
  approval_status_id: number;
  approval_status: string;
  status_description: string;
  average_rating: number;
  user_name: string;
  user_email: string;
  user_dob: string;
  user_profile_image: string;
  sitter_image: Array<{
    id: number;
    image_url: string;
  }>;
  sitter_pet_type: Array<{
    pet_type: {
      pet_type_name: string;
    };
  }>;
  created_at: string;
  status_updated_at: string;
}

interface ApiResponse {
  data: SitterData[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export default function AdminPetSitterPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("newest"); // newest หรือ oldest
  const [sitters, setSitters] = useState<SitterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
  });

  // Auto-complete states
  const [suggestions, setSuggestions] = useState<
    Array<{
      sitterName: string;
      userName: string;
      type: string;
    }>
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string>("");

  // ฟังก์ชันดึงข้อมูล suggestions
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await axios.get(
        `/api/admin/petsitter/search-suggestions?query=${encodeURIComponent(query)}`
      );
      setSuggestions(response.data.suggestions || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, []);

  // ฟังก์ชันดึงข้อมูลจาก API
  const fetchSitters = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (debouncedSearchTerm) {
        params.append("searchTerm", debouncedSearchTerm);
      }
      if (statusFilter && statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (sortOrder) {
        params.append("sortOrder", sortOrder);
      }

      const response = await axios.get(
        `/api/admin/petsitter/get-sitter?${params.toString()}`
      );
      const data: ApiResponse = response.data;

      setSitters(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching sitters:", error);
      setSitters([]);
    } finally {
      setLoading(false);
    }
  }, [
    debouncedSearchTerm,
    statusFilter,
    sortOrder,
    pagination.page,
    pagination.limit,
  ]);

  // Debounce search term - หน่วงเวลา 500ms ก่อนเรียก API
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch suggestions เมื่อ searchTerm เปลี่ยน
  useEffect(() => {
    if (searchTerm && !selectedSuggestion) {
      const timer = setTimeout(() => {
        fetchSuggestions(searchTerm);
      }, 300); // หน่วงเวลาน้อยกว่า debounce เพื่อให้ suggestions แสดงก่อน

      return () => clearTimeout(timer);
    } else if (!searchTerm) {
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedSuggestion("");
    }
  }, [searchTerm, fetchSuggestions, selectedSuggestion]);

  // Reset pagination เมื่อ search term หรือ sort order เปลี่ยน
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm || sortOrder) {
      setPagination((prev) => ({ ...prev, page: 1 }));
    }
  }, [debouncedSearchTerm, searchTerm, sortOrder]);

  // ดึงข้อมูลเมื่อ component mount หรือ filter เปลี่ยน
  useEffect(() => {
    fetchSitters();
  }, [fetchSitters]);

  // ปิด suggestions เมื่อคลิกข้างนอก
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".search-container")) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ฟังก์ชันสำหรับเปลี่ยนหน้า
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  // ฟังก์ชันสำหรับจัดการ suggestions
  const handleSuggestionClick = (suggestion: {
    sitterName: string;
    userName: string;
    type: string;
  }) => {
    const selectedName =
      suggestion.type === "sitter"
        ? suggestion.sitterName
        : suggestion.userName;
    setSearchTerm(selectedName);
    setSelectedSuggestion(selectedName);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSelectedSuggestion("");
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedSuggestion(""); // รีเซ็ตเมื่อพิมพ์ใหม่
  };


  return (
    <>
      <Head>
        <title>Admin • Pet Sitter</title>
      </Head>

      <div className="flex min-h-screen w-full">
        <aside className="hidden shrink-0 md:block md:w-[240px]">
          <AdminSidebar sticky />
        </aside>

        <main className="flex-1 px-6 py-6 lg:px-8">
            <PageHeader title="Pet Sitter">
              <div className="flex items-center space-x-4">
                {/* Search Input with Auto-complete */}
                <div className="relative search-container">
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={handleInputChange}
                    className="w-64 h-10 px-3 py-2 text-sm border border-border rounded-md bg-white placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent pr-10"
                  />
                  {searchTerm && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-8 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-text hover:text-ink flex items-center justify-center"
                    >
                      ×
                    </button>
                  )}
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-text" />

                  {/* Suggestions Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                      {suggestions.map((suggestion, index) => {
                        const displayName =
                          suggestion.type === "sitter"
                            ? suggestion.sitterName
                            : suggestion.userName;
                        const typeLabel =
                          suggestion.type === "sitter"
                            ? "Pet Sitter"
                            : "Full Name";

                        return (
                          <div
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="px-3 py-2 text-sm cursor-pointer hover:bg-muted border-b border-border last:border-b-0"
                          >
                            <div className="font-medium text-ink">
                              {displayName}
                            </div>
                            <div className="text-xs text-muted-text">
                              {typeLabel}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Sort Order Select */}
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="w-32 h-10">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="newest" className="hover:bg-muted">
                      Newest
                    </SelectItem>
                    <SelectItem value="oldest" className="hover:bg-muted">
                      Oldest
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Status Select */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 h-10">
                    <SelectValue placeholder="All status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all" className="hover:bg-muted">
                      All status
                    </SelectItem>
                    <SelectItem value="waiting" className="hover:bg-muted">
                      Waiting for approve
                    </SelectItem>
                    <SelectItem value="approved" className="hover:bg-muted">
                      Approved
                    </SelectItem>
                    <SelectItem value="rejected" className="hover:bg-muted">
                      Rejected
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </PageHeader>

            <div className="relative min-h-[400px] rounded-2xl border border-gray-2 bg-white p-4 shadow-sm md:p-5">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <PetPawLoading message="Loading Pet Sitters..." size="md" />
                </div>
              ) : (
                <SittersTable rows={sitters} />
              )}

            {!loading && sitters.length > 0 && (
              <div className="mt-6 grid grid-cols-3 items-center">
                <div className="text-xs2-regular text-muted">
                  Showing {sitters.length === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1}–
                  {(pagination.page - 1) * pagination.limit + sitters.length} of {pagination.totalCount}
                </div>

                <div className="flex justify-center">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onClick={handlePageChange}
                  />
                </div>

                <div />
              </div>
            )}

            </div>
        </main>
      </div>
    </>
  );
}
