import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Sitter, Review } from '@/types/sitter.types';
import Footer from '@/components/Footer';
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
      } catch (err: unknown) {
        console.error('Axios error:', err);
        
        if (err && typeof err === 'object' && 'response' in err) {
          // Server responded with error status
          const axiosError = err as { response?: { data?: { message?: string } } };
          setError(axiosError.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
        } else if (err && typeof err === 'object' && 'request' in err) {
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
      <div className="min-h-screen bg-muted flex flex-col">
        <div className="flex-1">
          <div className="container-1200 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-2 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-2 rounded w-1/2 mb-8"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-2 rounded"></div>
                <div className="h-4 bg-gray-2 rounded w-3/4"></div>
                <div className="h-4 bg-gray-2 rounded w-1/2"></div>
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
      <div className="min-h-screen bg-muted flex flex-col">
        <div className="flex-1">
          <div className="container-1200 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-ink mb-4">Error Occurred</h1>
              <p className="text-muted-text mb-4">{error}</p>
              <button
                onClick={() => router.back()}
                className="px-6 py-2 bg-brand text-brand-text rounded-lg hover:bg-brand-dark transition-colors"
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
      <div className="min-h-screen bg-muted flex flex-col">
        <div className="flex-1">
          <div className="container-1200 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-ink mb-4">Not Found</h1>
              <p className="text-muted-text mb-4">Pet sitter not found</p>
              <button
                onClick={() => router.back()}
                className="px-6 py-2 bg-brand text-brand-text rounded-lg hover:bg-brand-dark transition-colors"
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
    <div className="min-h-screen bg-muted flex flex-col">
      <div className="flex-1">
        <div className="container-1200 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-brand hover:text-brand-dark mb-6 flex items-center gap-2 transition-colors"
          >
            ← Back to Search
          </button>
          
          <div className="bg-card rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center gap-4">
              {/* Profile Image */}
              <div className="w-16 h-16 bg-brand rounded-full flex items-center justify-center text-brand-text text-2xl font-bold">
                {sitter.name.charAt(0).toUpperCase()}
              </div>
              
              {/* Basic Info */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-ink mb-1">{sitter.name}</h1>
                <p className="text-muted-text mb-2">{sitter.location_description}</p>
                
                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-sm ${
                          i < Math.floor(sitter.averageRating || 0) ? 'text-yellow' : 'text-gray-4'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-muted-text">
                    {sitter.averageRating ? sitter.averageRating.toFixed(1) : '0.0'} ({sitter.reviews?.length || 0} reviews)
                  </span>
                </div>
              </div>
              
              {/* Contact Button */}
              <button className="bg-brand text-brand-text px-6 py-2 rounded-lg font-medium hover:bg-brand-dark transition-colors">
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
            <div className="bg-card rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-ink mb-4">About</h2>
              <p className="text-text leading-relaxed">{sitter.introduction || 'No introduction available.'}</p>
            </div>

            {/* Contact Information */}
            <div className="bg-card rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-ink mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-text">Name</p>
                  <p className="font-medium text-ink">{sitter.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-text">Phone</p>
                  <p className="font-medium text-ink">{sitter.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-text">Experience</p>
                  <p className="font-medium text-ink">{sitter.experience || 0} years</p>
                </div>
                <div>
                  <p className="text-sm text-muted-text">Starting Price</p>
                  <p className="font-medium text-ink">${sitter.base_price || '0'}</p>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-card rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-ink mb-4">Location</h2>
              <div className="space-y-2">
                <p className="text-text">{sitter.address_detail || 'Address not provided'}</p>
                <p className="text-muted-text">
                  {sitter.address_sub_district}, {sitter.address_district}, {sitter.address_province}
                </p>
                <p className="text-muted-text">Postal Code: {sitter.address_post_code}</p>
              </div>
            </div>

            {/* Reviews */}
            {sitter.reviews && sitter.reviews.length > 0 && (
              <div className="bg-card rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-ink mb-4">Reviews</h2>
                <div className="space-y-4">
                  {sitter.reviews.slice(0, 3).map((review: Review) => (
                    <div key={review.id} className="border-l-4 border-brand pl-4 py-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-sm ${
                                i < review.rating ? 'text-yellow' : 'text-gray-4'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-muted-text">
                          {new Date(review.created_at).toLocaleDateString('en-US')}
                        </span>
                      </div>
                      <p className="text-text text-sm">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Rating Summary */}
            <div className="bg-card rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-ink mb-4">Rating</h2>
              <div className="text-center">
                <div className="text-3xl font-bold text-brand mb-2">
                  {sitter.averageRating ? sitter.averageRating.toFixed(1) : '0.0'}
                </div>
                <div className="flex justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-xl ${
                        i < Math.floor(sitter.averageRating || 0) ? 'text-yellow' : 'text-gray-4'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-muted-text text-sm">{sitter.reviews?.length || 0} reviews</p>
              </div>
            </div>

            {/* Pet Types */}
            <div className="bg-card rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-ink mb-4">Pet Types</h2>
              <div className="flex flex-wrap gap-2">
                {sitter.sitter_pet_type.map((petType, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-brand-light text-brand-dark rounded-full text-sm font-medium"
                  >
                    {petType.pet_type.pet_type_name}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Contact */}
            <div className="bg-brand rounded-xl shadow-lg p-6 text-brand-text">
              <h2 className="text-lg font-semibold mb-2">Ready to Book?</h2>
              <p className="text-brand-light text-sm mb-4">Contact this pet sitter now.</p>
              <button className="w-full bg-card text-brand py-2 px-4 rounded-lg font-medium hover:bg-muted transition-colors">
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
