'use client';

import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { useEffect, useState } from 'react';
import { makePinIcon } from '@/components/map/pinIcon';

type Pin = { id: string | number; latitude: number; longitude: number };

type Props = {
  latitude: number;
  longitude: number;
  zoom?: number;
  pins?: Pin[];           // ถ้ามีหลายจุด ใช้อันนี้
  selectedId?: Pin['id'] | null;
  onSelectPin?: (id: Pin['id']) => void;
  className?: string;     // เพิ่ม className prop
};

//ย้ายตำแหน่งแผนที่ ทุกครั้งที่ latitude หรือ longitude เปลี่ยน
function Recenter({ latitude, longitude }: { latitude: number; longitude: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([latitude, longitude], map.getZoom(), { animate: true });
  }, [latitude, longitude, map]);
  return null;
}

export default function LeafletMap({
  latitude, longitude, zoom = 15, pins, selectedId, onSelectPin, className
}: Props) {
  const [internalSelected, setInternalSelected] = useState<Pin['id'] | null>(selectedId ?? null);
  useEffect(() => setInternalSelected(selectedId ?? null), [selectedId]);

  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={zoom}
      scrollWheelZoom={false}
      className={className || "h-[300px] w-full rounded-xl border border-gray-200"}
    >
      <TileLayer attribution="© OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Recenter latitude={latitude} longitude={longitude} />

      {/* โหมดจุดเดียว (หน้าโปรไฟล์) */}
      {!pins && (
        <Marker
          position={[latitude, longitude]}
          icon={makePinIcon(true)}
        />
      )}

      {/* โหมดหลายจุด (ใช้ที่หน้า Search)*/}
      {pins?.map(p => (
        <Marker
          key={p.id}
          position={[p.latitude, p.longitude]}
          icon={makePinIcon(internalSelected === p.id)}
          eventHandlers={{
            click: () => {
              setInternalSelected(p.id);
              onSelectPin?.(p.id);
            },
          }}
        />
      ))}
    </MapContainer>
  );
}

