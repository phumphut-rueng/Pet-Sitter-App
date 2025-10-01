import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { StatusBadge, StatusKey } from '@/components/badges/StatusBadge';
import axios from 'axios';

interface SitterDetail {
  id: number;
  name: string;
  user_name: string;
  user_email: string;
  approval_status: string;
  approval_status_id: number;
  status_updated_at: string;
  created_at: string;
  introduction: string;
  phone: string;
  address_detail: string;
  address_province: string;
  address_district: string;
  address_sub_district: string;
  address_post_code: string;
  base_price: string;
  experience: number;
  service_description: string;
  admin_note: string;
  averageRating: number;
  sitter_image: Array<{
    id: number;
    image_url: string;
  }>;
  sitter_pet_type: Array<{
    pet_type: {
      pet_type_name: string;
    };
  }>;
}

export default function PetSitterDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [sitter, setSitter] = useState<SitterDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchSitterDetail();
    }
  }, [id]);

  const fetchSitterDetail = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/admin/get-sitter-by-id?id=${id}`);
      setSitter(response.data);
    } catch (error) {
      console.error('Error fetching sitter detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusKey = (status: string): StatusKey => {
    switch (status) {
      case 'Waiting for approve':
        return 'waitingApprove';
      case 'Approved':
        return 'approved';
      case 'Rejected':
        return 'rejected';
      default:
        return 'waitingApprove';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!sitter) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Pet Sitter Not Found</h1>
          <Link 
            href="/admin/petsitter"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Pet Sitters
          </Link>
        </div>
      </div>
    );
  }

  const initials = sitter.user_name
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const statusKey = getStatusKey(sitter.approval_status);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/admin/petsitter"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Pet Sitters
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Pet Sitter Details</h1>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-lg text-gray-900">{sitter.user_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Pet Sitter Name</label>
                  <p className="text-lg text-gray-900">{sitter.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-lg text-gray-900">{sitter.user_email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-lg text-gray-900">{sitter.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Experience</label>
                  <p className="text-lg text-gray-900">{sitter.experience || 0} years</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Base Price</label>
                  <p className="text-lg text-gray-900">฿{sitter.base_price || 'Not set'}</p>
                </div>
              </div>
            </div>

            {/* Address Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Address</h2>
              <div className="space-y-2">
                <p className="text-lg text-gray-900">{sitter.address_detail}</p>
                <p className="text-lg text-gray-900">
                  {sitter.address_sub_district && `${sitter.address_sub_district}, `}
                  {sitter.address_district && `${sitter.address_district}, `}
                  {sitter.address_province}
                </p>
                {sitter.address_post_code && (
                  <p className="text-lg text-gray-900">{sitter.address_post_code}</p>
                )}
              </div>
            </div>

            {/* Service Description */}
            {sitter.service_description && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Description</h2>
                <p className="text-lg text-gray-900 whitespace-pre-wrap">{sitter.service_description}</p>
              </div>
            )}

            {/* Introduction */}
            {sitter.introduction && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Introduction</h2>
                <p className="text-lg text-gray-900 whitespace-pre-wrap">{sitter.introduction}</p>
              </div>
            )}
          </div>

          {/* Right Column - Status & Actions */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Status</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Current Status</label>
                  <div className="mt-2">
                    <StatusBadge status={statusKey} className="text-lg" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status Updated</label>
                  <p className="text-lg text-gray-900">
                    {sitter.status_updated_at ? new Date(sitter.status_updated_at).toLocaleDateString('th-TH') : 'Never'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="text-lg text-gray-900">
                    {new Date(sitter.created_at).toLocaleDateString('th-TH')}
                  </p>
                </div>
              </div>
            </div>

            {/* Pet Types */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Pet Types</h2>
              <div className="flex flex-wrap gap-2">
                {sitter.sitter_pet_type.map((petType, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {petType.pet_type.pet_type_name}
                  </span>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Rating</h2>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900">{sitter.averageRating}</span>
                <span className="text-lg text-gray-600">/ 5.0</span>
              </div>
            </div>

            {/* Admin Note */}
            {sitter.admin_note && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Admin Note</h2>
                <p className="text-lg text-gray-900 whitespace-pre-wrap">{sitter.admin_note}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
