import { useRouter } from "next/router";
import Footer from "@/components/Footer";
import ImageCarousel from "@/components/ImageCarousel";
import PetSitterProfileCard from "@/components/cards/PetSitterProfileCard";
import ReviewCard from "@/components/cards/ReviewCard";
import RatingSelect from "@/components/ratingStar";
import { useSitterDetail } from "@/hooks/useSitterDetail";
import { Pagination } from "@/components/pagination/Pagination";
import { useState } from "react";

export default function PetsitterSlug() {
  const router = useRouter();
  const { id } = router.query;

  const [selectedRating, setSelectedRating] = useState<number | string>(
    "All Reviews"
  );

  const {
    sitter,
    reviews,
    reviewPagination,
    loading,
    error,
    handleReviewPageChange,
  } = useSitterDetail(id);

  const filteredReviews =
    selectedRating === "All Reviews"
      ? reviews
      : reviews.filter((r) => r.rating === selectedRating);
  const handleRatingChange = (val: number | string) => {
    if (val === 0 || selectedRating === val) {
      setSelectedRating("All Reviews");
    } else {
      setSelectedRating(val);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
        <h1 className="text-4xl font-bold">loading... </h1>
      </div>
    );
  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
        <h1 className="text-4xl font-bold">{error}</h1>
      </div>
    );
  if (!sitter)
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
        <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
      </div>
    );

  return (
    <div>
      <ImageCarousel images={sitter.sitter_image.map((img) => img.image_url)} />

      <div className="container-1200 py-8">
        <div className="flex flex-col lg:grid lg:grid-cols-3 lg:grid-rows-[auto_1fr] gap-10 py-6">
          {/* Content */}
          <div className="order-1 lg:order-1 lg:row-start-1 lg:col-span-2 space-y-6 min-w-0">
            <h1 className="text-5xl font-bold">{sitter.name}</h1>

            <section className="section pt-8">
              <h2 className="text-2xl font-bold">Introduction</h2>
              <p className="text-lg whitespace-pre-line pt-3">
                {sitter.introduction}
              </p>
            </section>

            <section className="section pt-8">
              <h2 className="text-2xl font-bold">Services</h2>
              <p className="text-lg whitespace-pre-line pt-3">
                {sitter.service_description || "No description"}
              </p>
            </section>

            <section className="section pt-8">
              <h2 className="text-2xl font-bold">My Place</h2>
              <p className="text-lg whitespace-pre-line pt-3">
                {sitter.location_description || "No details"}
              </p>
            </section>
          </div>

          {/* ProfileCard */}
          <div className="order-2 lg:order-3 lg:row-start-1 lg:col-span-1 min-w-0">
            <PetSitterProfileCard
              title={sitter.name}
              hostName={sitter.owner.name}
              experience={sitter.experience?.toString() || "0"}
              location={
                sitter.address_district || sitter.address_province || ""
              }
              rating={sitter.averageRating || 0}
              tags={sitter.sitter_pet_type.map(
                (pt) => pt.pet_type.pet_type_name
              )}
              avatarUrl={sitter.owner.profile_image || null}
              ownerId={sitter.owner.id}
              sitterId={sitter.id}
            />
          </div>

          {/* Reviews */}
          <section className="mt-6 order-3 lg:order-2 lg:row-start-2 lg:col-span-2 section space-y-3 rounded-2xl rounded-tl-[99px] bg-gray-1 p-6">
            <div className="bg-white rounded-2xl rounded-tl-[99px] lg:rounded-bl-[99px] shadow-sm p-4 flex flex-col lg:p-6 lg:flex-row lg:items-start ">
              <div className="w-36 h-36 bg-black rounded-[99px] rounded-br-none flex flex-col items-center justify-center text-white">
                <span className="text-4xl font-bold">
                  {sitter.averageRating?.toFixed(1) || 0}
                </span>
                <span className="text-sm font-medium">
                  {reviewPagination.totalCount} Reviews
                </span>
              </div>
              <div className="lg:ml-10 flex-1">
                <h2 className="text-2xl font-bold mb-3">Rating & Reviews</h2>
                <div className="flex flex-wrap gap-2">
                  <RatingSelect
                    value="All Reviews"
                    selectRating={selectedRating}
                    onChange={handleRatingChange}
                  />
                  {Array.from({ length: 5 }).map((_, index) => (
                    <RatingSelect
                      key={index}
                      value={5 - index}
                      selectRating={selectedRating}
                      onChange={handleRatingChange}
                    />
                  ))}
                </div>
              </div>
            </div>

            {filteredReviews.length > 0 ? (
              <ReviewCard reviews={filteredReviews} />
            ) : (
              <p className="text-center text-gray-6 mt-4">
                No reviews for {selectedRating} star
                {selectedRating !== 1 ? "s" : ""}
              </p>
            )}

            {/* Review Pagination Buttons */}
            <Pagination
              currentPage={reviewPagination.page}
              totalPages={reviewPagination.totalPages}
              onClick={handleReviewPageChange}
            />
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
