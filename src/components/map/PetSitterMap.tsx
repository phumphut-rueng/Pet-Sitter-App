'use client';

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Sitter } from '@/types/sitter.types';
import dynamic from 'next/dynamic';
import { PetSitterCardSmall } from '@/components/cards/PetSitterCard';
import { PetPawLoadingSmall } from '@/components/loading/PetPawLoadingSmall';

// ใช้ LeafletMap component ที่มีอยู่แล้ว
const LeafletMap = dynamic(() => import('@/components/form/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center">
      <PetPawLoadingSmall message="Loading map..." />
    </div>
  )
});

type Pin = {
  id: number;
  latitude: number;
  longitude: number;
  sitter: Sitter;
};

interface PetSitterMapProps {
  sitters: Sitter[];
  loading?: boolean;
  onSitterSelect?: (sitter: Sitter) => void;
}

export default function PetSitterMap({
  sitters,
  loading = false,
  onSitterSelect
}: PetSitterMapProps) {
  const router = useRouter();
  const [selectedPinId, setSelectedPinId] = useState<number | null>(null);
  const [lastClickedSitterId, setLastClickedSitterId] = useState<number | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 13.7563, lng: 100.5018 }); // Default Bangkok
  const [pins, setPins] = useState<Pin[]>([]);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Convert sitters to pins, filtering out those without coordinates
  useEffect(() => {
    const validPins: Pin[] = sitters
      .filter(sitter => sitter.latitude && sitter.longitude)
      .map(sitter => ({
        id: sitter.id,
        latitude: sitter.latitude!,
        longitude: sitter.longitude!,
        sitter
      }));

    setPins(validPins);

    // Auto-select first pin if none selected and pins exist
    if (validPins.length > 0 && !selectedPinId) {
      setSelectedPinId(validPins[0].id);
    }
  }, [sitters, selectedPinId]);

  const handlePinClick = (pinId: number) => {
    setSelectedPinId(pinId);
    setLastClickedSitterId(pinId); // Also set this to allow second click nav
    const selectedSitter = pins.find(pin => pin.id === pinId)?.sitter;
    if (selectedSitter) {
      onSitterSelect?.(selectedSitter);
      setMapCenter({ lat: selectedSitter.latitude!, lng: selectedSitter.longitude! });
    }
  };


  const handleCardNavigation = (e: React.MouseEvent, sitter: Sitter) => {
    if (sitter.id === lastClickedSitterId) {
      // Second click: navigate to the page
      router.push(`/findpetsitter/${sitter.id}`);
    } else {
      // First click: prevent navigation, select pin, and center map
      e.preventDefault();
      setLastClickedSitterId(sitter.id);

      const pin = pins.find(p => p.sitter.id === sitter.id);
      if (pin) {
        setSelectedPinId(pin.id);
        onSitterSelect?.(sitter);
        setMapCenter({ lat: pin.latitude, lng: pin.longitude });
      }
    }
  };

  // ฟังก์ชันเลื่อน carousel ไปยัง card ที่เลือก
  const scrollToSelectedCard = useCallback((pinId: number) => {
    if (carouselRef.current) {
      const cardIndex = pins.findIndex(pin => pin.id === pinId);
      if (cardIndex !== -1) {
        const cardWidth = 320; // ความกว้างของ card + gap
        const scrollPosition = cardIndex * cardWidth - (carouselRef.current.clientWidth / 2) + (cardWidth / 2);

        carouselRef.current.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      }
    }
  }, [pins]);

  // เลื่อนไปยัง card ที่เลือกเมื่อ selectedPinId เปลี่ยน
  useEffect(() => {
    if (selectedPinId) {
      scrollToSelectedCard(selectedPinId);
    }
  }, [selectedPinId, scrollToSelectedCard]);

  // Set initial map center based on average of pins, but only when sitters data changes
  useEffect(() => {
    if (pins.length > 0) {
      const avgLat = pins.reduce((sum, pin) => sum + pin.latitude, 0) / pins.length;
      const avgLng = pins.reduce((sum, pin) => sum + pin.longitude, 0) / pins.length;
      
      // Only update if the center is still the default (or very close to it)
      // This prevents overriding the center after a user clicks a pin/card.
      if (Math.abs(mapCenter.lat - 13.7563) < 0.0001) {
        setMapCenter({ lat: avgLat, lng: avgLng });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pins]);

  // const selectedSitter = pins.find(pin => pin.id === selectedPinId)?.sitter;

  if (loading) {
    return (
      <div className="h-[600px] w-full rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center">
        <PetPawLoadingSmall message="Loading map..." />
      </div>
    );
  }

  if (pins.length === 0) {
    return (
      <div className="h-[600px] w-full rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 mb-2">ไม่พบ Pet Sitter</div>
          <div className="text-sm text-gray-400">ลองปรับเปลี่ยนตัวกรองการค้นหา</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10">
      <div className="h-[450px] sm:h-[600px] w-full">
        <LeafletMap
          latitude={mapCenter.lat}
          longitude={mapCenter.lng}
          zoom={pins.length === 1 ? 15 : 10}
          pins={pins.map(pin => ({
            id: pin.id,
            latitude: pin.latitude,
            longitude: pin.longitude
          }))}
          selectedId={selectedPinId}
          onSelectPin={(pinId) => handlePinClick(Number(pinId))}
          className="h-full w-full rounded-xl border border-gray-200"
        />
      </div>

      {/* Sitter Cards Carousel on the right side */}
      {pins.length > 0 && (
        <div className="absolute flex justify-center w-full bottom-4 left-0 right-0 z-[999]">
          <div
            ref={carouselRef}
            className="flex overflow-x-auto space-x-4 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {pins.map(pin => {
              const sitter = pin.sitter;
              const isSelected = selectedPinId === pin.id;
              return (
                <div key={sitter.id} className="flex-shrink-0">
                  <a
                    href={`/findpetsitter/${sitter.id}`}
                    onClick={(e) => handleCardNavigation(e, sitter)}
                  >
                    <PetSitterCardSmall
                      title={sitter.name || 'Happy House!'}
                      hostName={sitter.user_name || 'Jame Maison'}
                      location={`${sitter.address_district || ''}, ${sitter.address_province || ''}`}
                      rating={Math.floor(sitter.averageRating || 4)}
                      tags={sitter.sitter_pet_type.map(petType => petType.pet_type.pet_type_name)}
                      coverUrl={sitter.sitter_image[0]?.image_url || "/images/cards/pet-sitter-cover.svg"}
                      avatarUrl={sitter.user_profile_image || sitter.sitter_image[0]?.image_url || "/images/cards/pet-sitter-cover.svg"}
                      smPreset="compact"
                      className={`cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 max-w-[400px] 
                        origin-bottom scale-90 sm:scale-100
                        ${isSelected
                        ? 'border-orange-6 border-2 rounded-xl'
                        : 'border-gray-200 border hover:border-gray-300'
                        }`}
                    />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}