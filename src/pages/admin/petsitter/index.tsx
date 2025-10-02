import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { StatusBadge, StatusKey } from '@/components/badges/StatusBadge';
import { PetPawLoading } from '@/components/loading/PetPawLoading';
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
  const [statusFilter, setStatusFilter] = useState('');
  const [sitters, setSitters] = useState<SitterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 8,
    totalCount: 0,
    totalPages: 0
  });

  // ฟังก์ชันดึงข้อมูลจาก API
  const fetchSitters = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      if (searchTerm) {
        params.append('searchTerm', searchTerm);
      }
      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter);
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
  };

  // ดึงข้อมูลเมื่อ component mount หรือ filter เปลี่ยน
  useEffect(() => {
    fetchSitters();
  }, [searchTerm, statusFilter, pagination.page]);

  // ฟังก์ชันสำหรับเปลี่ยนหน้า
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
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

  if (loading) {
    return <PetPawLoading message="Loading Pet Sitters" size="lg" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header and Search/Filter Bar */}
        <div className="flex items-center justify-between mb-6">
          {/* Header */}
          <h1 className="text-2xl font-bold text-gray-900">Pet Sitter</h1>

          {/* Search and Filter */}
          <div className="flex items-center space-x-4">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 h-10 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            {/* Status Select */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 h-10">
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all" className="hover:bg-gray-1">All status</SelectItem>
                <SelectItem value="waiting" className="hover:bg-gray-1">Waiting for approve</SelectItem>
                <SelectItem value="approved" className="hover:bg-gray-1">Approved</SelectItem>
                <SelectItem value="rejected" className="hover:bg-gray-1">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="bg-black text-white">
            <div className="grid grid-cols-4 gap-6 px-8 py-5">
              <div className="font-semibold text-lg">Full Name</div>
              <div className="font-semibold text-lg">Pet Sitter Name</div>
              <div className="font-semibold text-lg">Email</div>
              <div className="font-semibold text-lg">Status</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-100">
            {sitters.length === 0 ? (
              <div className="px-8 py-12 text-center text-gray-500 text-lg">
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
                    className="block px-8 py-6 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                  >
                    <div className="grid grid-cols-4 gap-6 items-center">
                      {/* Full Name with Avatar */}
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                          <span className="text-white font-semibold text-lg">{initials}</span>
                        </div>
                        <span className="text-gray-900 font-medium text-lg">{sitter.user_name || sitter.user_email}</span>
                      </div>

                      {/* Pet Sitter Name */}
                      <div className="text-gray-900 font-medium text-lg">
                        {sitter.name || 'No sitter name'}
                      </div>

                      {/* Email */}
                      <div className="text-gray-600 text-lg">{sitter.user_email}</div>

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
      </div>
    </div>
  );
}

