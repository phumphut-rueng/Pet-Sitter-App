import { PetSitterCardLarge } from "@/components/cards/PetSitterCard";
import { PetSitterCardSkeletonLarge } from "@/components/cards/PetSitterCardSkeleton";
import { NoResultsFound } from "@/components/empty-states/NoResultsFound";
import { MapViewPlaceholder } from "@/components/empty-states/MapViewPlaceholder";
import { Sitter } from "@/types/sitter.types";
import Link from "next/link";

interface PetSitterListProps {
  sitters: Sitter[];
  loading: boolean;
  viewMode: "list" | "map";
  onClear: () => void;
  onSwitchToList: () => void;
  variant?: "desktop" | "mobile";
}

export function PetSitterList({
  sitters,
  loading,
  viewMode,
  onClear,
  onSwitchToList,
  variant = "desktop",
}: PetSitterListProps) {
  if (viewMode === "map") {
    return (
      <MapViewPlaceholder onSwitchToList={onSwitchToList} variant={variant} />
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
      {sitters.map((sitterData) => (
          <PetSitterCardLarge
            key={sitterData.id}
            title={sitterData.location_description}
            hostName={sitterData.name}
            location={`${sitterData.address_district}, ${sitterData.address_province}`}
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
    </>
  );
}
