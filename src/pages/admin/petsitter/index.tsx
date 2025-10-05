import { useState, useEffect, useCallback } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { StatusBadge, StatusKey } from '@/components/badges/StatusBadge';
import { PetPawLoadingSmall } from '@/components/loading/PetPawLoadingSmall';
import { Pagination } from '@/components/pagination/Pagination';
import Link from 'next/link';
import axios from 'axios';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // newest หรือ oldest
  const [sitters, setSitters] = useState<SitterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 8,
    totalCount: 0,
    totalPages: 0
  });

  // Auto-complete states
  const [suggestions, setSuggestions] = useState<Array<{
    sitterName: string;
    userName: string;
    type: string;
  }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string>('');

  // ฟังก์ชันดึงข้อมูล suggestions
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await axios.get(`/api/admin/search-suggestions?query=${encodeURIComponent(query)}`);
      setSuggestions(response.data.suggestions || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
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
        limit: pagination.limit.toString()
      });

      if (debouncedSearchTerm) {
        params.append('searchTerm', debouncedSearchTerm);
      }
      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (sortOrder) {
        params.append('sortOrder', sortOrder);
      }

      const response = await axios.get(`/api/admin/get-sitter?${params.toString()}`);
      const data: ApiResponse = response.data;
      
      setSitters(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching sitters:', error);
      setSitters([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, statusFilter, sortOrder, pagination.page, pagination.limit]);

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
      setSelectedSuggestion('');
    }
  }, [searchTerm, fetchSuggestions, selectedSuggestion]);

  // Reset pagination เมื่อ search term หรือ sort order เปลี่ยน
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm || sortOrder) {
      setPagination(prev => ({ ...prev, page: 1 }));
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
      if (!target.closest('.search-container')) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ฟังก์ชันสำหรับเปลี่ยนหน้า
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  // ฟังก์ชันสำหรับจัดการ suggestions
  const handleSuggestionClick = (suggestion: { sitterName: string; userName: string; type: string }) => {
    const selectedName = suggestion.type === 'sitter' ? suggestion.sitterName : suggestion.userName;
    setSearchTerm(selectedName);
    setSelectedSuggestion(selectedName);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSelectedSuggestion('');
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedSuggestion(''); // รีเซ็ตเมื่อพิมพ์ใหม่
  };

  // ฟังก์ชันสำหรับแปลงสถานะเป็น StatusKey
  const getStatusKey = (status: string): StatusKey => {
    switch (status) {
      case 'Waiting for approve':
        return 'waitingApprove';
      case 'Approved':
        return 'approved';
      case 'Rejected':
        return 'rejected';
      default:
        return 'waitingApprove'; // fallback เป็น waitingApprove
    }
  };

  return (
    <div className="min-h-screen bg-muted">
      <div className="container mx-auto p-6">
        {/* Header and Search/Filter Bar */}
        <div className="flex items-center justify-between mb-6">
          {/* Header */}
          <h1 className="text-2xl font-bold text-ink">Pet Sitter</h1>

          {/* Search and Filter */}
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
                    const displayName = suggestion.type === 'sitter' ? suggestion.sitterName : suggestion.userName;
                    const typeLabel = suggestion.type === 'sitter' ? 'Pet Sitter' : 'Full Name';
                    
                    return (
                      <div
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-3 py-2 text-sm cursor-pointer hover:bg-muted border-b border-border last:border-b-0"
                      >
                        <div className="font-medium text-ink">{displayName}</div>
                        <div className="text-xs text-muted-text">{typeLabel}</div>
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
                <SelectItem value="newest" className="hover:bg-muted">Newest</SelectItem>
                <SelectItem value="oldest" className="hover:bg-muted">Oldest</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Select */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 h-10">
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all" className="hover:bg-muted">All status</SelectItem>
                <SelectItem value="waiting" className="hover:bg-muted">Waiting for approve</SelectItem>
                <SelectItem value="approved" className="hover:bg-muted">Approved</SelectItem>
                <SelectItem value="rejected" className="hover:bg-muted">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg border border-border overflow-hidden">
          {/* Table Header */}
          <div className="bg-ink text-white">
            <div className="grid grid-cols-4 gap-6 px-8 py-5">
              <div className="font-semibold text-lg">Full Name</div>
              <div className="font-semibold text-lg">Pet Sitter Name</div>
              <div className="font-semibold text-lg">Email</div>
              <div className="font-semibold text-lg">Status</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-border">
            {loading ? (
              <div className="flex justify-center py-12">
                <PetPawLoadingSmall message="Loading Pet Sitters" />
              </div>
            ) : sitters.length === 0 ? (
              <div className="px-8 py-12 text-center text-muted-text text-lg">
                ไม่พบข้อมูล Pet Sitter
              </div>
            ) : (
              sitters.map((sitter) => {
                const statusKey = getStatusKey(sitter.approval_status);
                const initials = sitter.user_name
                  ? sitter.user_name
                      .split(' ')
                      .map(name => name.charAt(0))
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)
                  : sitter.user_email.charAt(0).toUpperCase();

                return (
                  <Link 
                    key={sitter.id} 
                    href={`/admin/petsitter/${sitter.id}`}
                    className="block px-8 py-6 hover:bg-muted transition-colors duration-200 cursor-pointer"
                  >
                    <div className="grid grid-cols-4 gap-6 items-center">
                      {/* Full Name with Avatar */}
                      <div className="flex items-center gap-4">
                        {sitter.user_profile_image ? (
                          <div className="w-12 h-12 rounded-full overflow-hidden shadow-md">
                            <img
                              src={sitter.user_profile_image}
                              alt={sitter.user_name || sitter.user_email}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                            <span className="text-white font-semibold text-lg">{initials}</span>
                          </div>
                        )}
                        <span className="text-ink font-medium text-lg">{sitter.user_name || sitter.user_email}</span>
                      </div>

                      {/* Pet Sitter Name */}
                      <div className="text-ink font-medium text-lg line-clamp-2 overflow-hidden">
                        {sitter.name || 'No sitter name'}
                      </div>

                      {/* Email */}
                      <div className="text-muted-text text-lg">{sitter.user_email}</div>

                      {/* Status */}
                      <div className="flex items-center">
                        <StatusBadge status={statusKey} className="text-lg" />
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Pagination */}
        {!loading && sitters.length > 0 && (
          <div className="mt-6 flex justify-center">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onClick={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}

