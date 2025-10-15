'use client';

import { useEffect, useState } from 'react';
import { Sitter } from '@/types/sitter.types';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { PetSitterCardSmall } from '@/components/cards/PetSitterCard';

// ใช้ LeafletMap component ที่มีอยู่แล้ว
const LeafletMap = dynamic(() => import('@/components/form/LeafletMap'), { 
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center">
      <div className="text-gray-500">กำลังโหลดแผนที่...</div>
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
  const [pins, setPins] = useState<Pin[]>([]);

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
    const selectedSitter = pins.find(pin => pin.id === pinId)?.sitter;
    if (selectedSitter) {
      onSitterSelect?.(selectedSitter);
    }
  };

  const handleCardClick = (sitter: Sitter) => {
    router.push(`/findpetsitter/${sitter.id}`);
  };

  const selectedSitter = pins.find(pin => pin.id === selectedPinId)?.sitter;

  if (loading) {
    return (
      <div className="h-[600px] w-full rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">กำลังโหลดแผนที่...</div>
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

  // คำนวณจุดกึ่งกลางของ pins ทั้งหมด
  const centerLat = pins.reduce((sum, pin) => sum + pin.latitude, 0) / pins.length;
  const centerLng = pins.reduce((sum, pin) => sum + pin.longitude, 0) / pins.length;

  return (
    <div className="relative">
      <div className="h-[600px] w-full">
        <LeafletMap
          latitude={centerLat}
          longitude={centerLng}
          zoom={pins.length === 1 ? 15 : 10}
          pins={pins.map(pin => ({
            id: pin.id,
            latitude: pin.latitude,
            longitude: pin.longitude
          }))}
          selectedId={selectedPinId}
          onSelectPin={(pinId) => handlePinClick(Number(pinId))}
        />
      </div>
      
      {/* Sitter Card Overlay */}
      {selectedSitter && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <div onClick={() => handleCardClick(selectedSitter)}>
            <PetSitterCardSmall
              title={selectedSitter.name || 'Happy House!'}
              hostName={selectedSitter.user_name || 'Jame Maison'}
              location={`${selectedSitter.address_district}, ${selectedSitter.address_province}`}
              rating={Math.floor(selectedSitter.averageRating || 4)}
              tags={selectedSitter.sitter_pet_type.map(petType => petType.pet_type.pet_type_name)}
              coverUrl={selectedSitter.sitter_image[0]?.image_url || "/images/cards/pet-sitter-cover.svg"}
              smPreset="wide"
              className="cursor-pointer shadow-lg hover:shadow-xl transition-shadow border-orange-6"
            />
          </div>
        </div>
      )}
    </div>
  );
}