import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Sitter } from '@/types/sitter.types';
import Footer from '@/components/Footer';
import Navbar from '@/components/navbar/Navbar';
import axios from 'axios';

export default function PetsitterSlug() {
  const router = useRouter();
  const { id } = router.query;
  const [sitter, setSitter] = useState<Sitter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSitter = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching sitter with ID:', id);
        const response = await axios.get(`/api/sitter/get-sitter-by-id?id=${id}`);
        
        console.log('API Response:', response.data);
        
        if (response.status === 200) {
          setSitter(response.data.data);
        } else {
          setError(response.data.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
        }
      } catch (err: any) {
        console.error('Axios error:', err);
        
        if (err.response) {
          // Server responded with error status
          setError(err.response.data.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
        } else if (err.request) {
          // Request was made but no response received
          setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
        } else {
          // Something else happened
          setError('เกิดข้อผิดพลาดที่ไม่คาดคิด');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSitter();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1">
          <div className="container-1200 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1">
          <div className="container-1200 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Occurred</h1>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => router.back()}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!sitter) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1">
          <div className="container-1200 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Not Found</h1>
              <p className="text-gray-600 mb-4">Pet sitter not found</p>
              <button
                onClick={() => router.back()}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1">
        <div className="container-1200 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-orange-500 hover:text-orange-600 mb-6 flex items-center gap-2 transition-colors"
          >
            ← Back to Search
          </button>
          
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center gap-4">
              {/* Profile Image */}
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {sitter.name.charAt(0).toUpperCase()}
              </div>
              
              {/* Basic Info */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{sitter.name}</h1>
                <p className="text-gray-600 mb-2">{sitter.location_description}</p>
                
                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-sm ${
                          i < Math.floor(sitter.averageRating || 0) ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {sitter.averageRating ? sitter.averageRating.toFixed(1) : '0.0'} ({sitter.reviews?.length || 0} reviews)
                  </span>
                </div>
              </div>
              
              {/* Contact Button */}
              <button className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors">
                Contact Now
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed">{sitter.introduction || 'No introduction available.'}</p>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium text-gray-900">{sitter.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{sitter.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Experience</p>
                  <p className="font-medium text-gray-900">{sitter.experience || 0} years</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Starting Price</p>
                  <p className="font-medium text-gray-900">${sitter.base_price || '0'}</p>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
              <div className="space-y-2">
                <p className="text-gray-700">{sitter.address_detail || 'Address not provided'}</p>
                <p className="text-gray-600">
                  {sitter.address_sub_district}, {sitter.address_district}, {sitter.address_province}
                </p>
                <p className="text-gray-500">Postal Code: {sitter.address_post_code}</p>
              </div>
            </div>

            {/* Reviews */}
            {sitter.reviews && sitter.reviews.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Reviews</h2>
                <div className="space-y-4">
                  {sitter.reviews.slice(0, 3).map((review: any) => (
                    <div key={review.id} className="border-l-4 border-orange-500 pl-4 py-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-sm ${
                                i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(review.created_at).toLocaleDateString('en-US')}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Rating Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Rating</h2>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500 mb-2">
                  {sitter.averageRating ? sitter.averageRating.toFixed(1) : '0.0'}
                </div>
                <div className="flex justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-xl ${
                        i < Math.floor(sitter.averageRating || 0) ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-gray-600 text-sm">{sitter.reviews?.length || 0} reviews</p>
              </div>
            </div>

            {/* Pet Types */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pet Types</h2>
              <div className="flex flex-wrap gap-2">
                {sitter.sitter_pet_type.map((petType, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium"
                  >
                    {petType.pet_type.pet_type_name}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Contact */}
            <div className="bg-orange-500 rounded-xl shadow-lg p-6 text-white">
              <h2 className="text-lg font-semibold mb-2">Ready to Book?</h2>
              <p className="text-orange-100 text-sm mb-4">Contact this pet sitter now.</p>
              <button className="w-full bg-white text-orange-600 py-2 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                Send Message
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
