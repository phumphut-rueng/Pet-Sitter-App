import { PetSitterCardLarge } from "@/components/cards/PetSitterCardLargeResponsive";
import { PetSitterCardSkeletonLarge } from "@/components/cards/PetSitterCardSkeleton";
import { NoResultsFound } from "@/components/empty-states/NoResultsFound";
import { MapViewPlaceholder } from "@/components/empty-states/MapViewPlaceholder";
import PetSitterMap from "@/components/map/PetSitterMap";
import { Sitter } from "@/types/sitter.types";
import Link from "next/link";

interface PetSitterListProps {
  sitters: Sitter[];
  loading: boolean;
  viewMode: "list" | "map";
  onClear: () => void;
  onSwitchToList: () => void;
  onSitterSelect?: (sitter: Sitter) => void;
  variant?: "desktop" | "mobile";
}

export function PetSitterList({
  sitters,
  loading,
  viewMode,
  onClear,
  onSwitchToList,
  onSitterSelect,
  variant = "desktop",
}: PetSitterListProps) {
  if (viewMode === "map") {
    // Check if sitters have location data
    const sittersWithLocation = sitters.filter(sitter => sitter.latitude && sitter.longitude);
    
    if (sittersWithLocation.length === 0 && !loading) {
      // Show placeholder if no sitters have location data
      const reason = sitters.length > 0 ? 'no-location' : 'no-data';
      return (
        <MapViewPlaceholder 
          onSwitchToList={onSwitchToList} 
          variant={variant}
          reason={reason}
        />
      );
    }
    
    return (
      <PetSitterMap 
        sitters={sitters} 
        loading={loading}
        onSitterSelect={onSitterSelect}
      />
    );
  }

  if (loading) {
    return (
      <>
        {[...Array(5)].map((_, index) => (
          <PetSitterCardSkeletonLarge key={index} className="min-h-[216px]" />
        ))}
      </>
    );
  }

  if (sitters.length === 0) {
    return <NoResultsFound onClear={onClear} variant={variant} />;
  }

  return (
    <>
      {sitters.map((sitterData, index) => {
        const coverUrl = sitterData.sitter_image[0]?.image_url || "https://placehold.co/400x192";
        const avatarUrl = sitterData.user_profile_image || coverUrl;
       
        return (
          <div key={sitterData.id} className="mb-4">
            <Link href={`/findpetsitter/${sitterData.id}`}>
              <PetSitterCardLarge
                title={sitterData.name}
                hostName={sitterData.user_name}
                location={`${sitterData.address_district}, ${sitterData.address_province}`}
                coverUrl={coverUrl}
                avatarUrl={avatarUrl}
                rating={sitterData.averageRating || 0}
                className="min-h-[216px] cursor-pointer"
                tags={sitterData.sitter_pet_type.map(
                  (petType) => petType.pet_type.pet_type_name
                )}
                priority={index < 2}
              />
            </Link>
          </div>
        );
      })}
    </>
  );
}
