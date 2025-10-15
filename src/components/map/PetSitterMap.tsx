'use client';

import { useEffect, useState, useRef } from 'react';
import { Sitter } from '@/types/sitter.types';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { PetSitterCardSmall } from '@/components/cards/PetSitterCard';

// ใช้ LeafletMap component ที่มีอยู่แล้ว
const LeafletMap = dynamic(() => import('@/components/form/LeafletMap'), { 
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center">
      <div className="text-gray-500">Loading map...</div>
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
    const selectedSitter = pins.find(pin => pin.id === pinId)?.sitter;
    if (selectedSitter) {
      onSitterSelect?.(selectedSitter);
    }
  };

  const handleCardClick = (sitter: Sitter) => {
    router.push(`/findpetsitter/${sitter.id}`);
  };

  const handleCardNavigation = (sitter: Sitter) => {
    // เลือก pin ที่ตรงกับ card ที่คลิก
    const pin = pins.find(p => p.sitter.id === sitter.id);
    if (pin) {
      setSelectedPinId(pin.id);
      onSitterSelect?.(sitter);
    }
  };

  // ฟังก์ชันเลื่อน carousel ไปยัง card ที่เลือก
  const scrollToSelectedCard = (pinId: number) => {
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
  };

  // เลื่อนไปยัง card ที่เลือกเมื่อ selectedPinId เปลี่ยน
  useEffect(() => {
    if (selectedPinId) {
      scrollToSelectedCard(selectedPinId);
    }
  }, [selectedPinId, pins]);

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
          className="h-full w-full rounded-xl border border-gray-200"
        />
      </div>
      
      {/* Sitter Cards Carousel on the right side */}
      {pins.length > 0 && (
        <div className="absolute flex justify-center w-full bottom-4 left-0 right-0 z-999">
          <div 
            ref={carouselRef}
            className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {pins.map(pin => {
              const sitter = pin.sitter;
              const isSelected = selectedPinId === pin.id;
              return (
                <div key={sitter.id} className="flex-shrink-0">
                  <div onClick={() => handleCardNavigation(sitter)}>
                    <PetSitterCardSmall
                      title={sitter.name || 'Happy House!'}
                      hostName={sitter.user_name || 'Jame Maison'}
                      location={`${sitter.address_district || ''}, ${sitter.address_province || ''}`}
                      rating={Math.floor(sitter.averageRating || 4)}
                      tags={sitter.sitter_pet_type.map(petType => petType.pet_type.pet_type_name)}
                      coverUrl={sitter.sitter_image[0]?.image_url || "/images/cards/pet-sitter-cover.svg"}
                      smPreset="wide"
                      className={`cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 max-w-[400px] ${
                        isSelected 
                          ? 'border-orange-6 border-2 rounded-xl' 
                          : 'border-gray-200 border hover:border-gray-300'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}