'use client';

import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { useEffect, useState } from 'react';
import { makePinIcon } from '@/components/map/pinIcon';

type Pin = { id: string | number; lat: number; lng: number };

type Props = {
  lat: number;
  lng: number;
  zoom?: number;
  pins?: Pin[];           // ถ้ามีหลายจุด ใช้อันนี้
  selectedId?: Pin['id'] | null;
  onSelectPin?: (id: Pin['id']) => void;
};

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);
  return null;
}

export default function LeafletMap({
  lat, lng, zoom = 15, pins, selectedId, onSelectPin
}: Props) {
  const [internalSelected, setInternalSelected] = useState<Pin['id'] | null>(selectedId ?? null);
  useEffect(() => setInternalSelected(selectedId ?? null), [selectedId]);

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={zoom}
      scrollWheelZoom={false}
      className="h-[300px] w-full rounded-xl border border-gray-200"
    >
      <TileLayer attribution="© OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Recenter lat={lat} lng={lng} />

      {/* โหมดจุดเดียว (หน้าโปรไฟล์) */}
      {!pins && (
        <Marker
          position={[lat, lng]}
          icon={makePinIcon(true)}
        />
      )}

      {/* โหมดหลายจุด (ใช้ที่หน้า Search)
      {pins?.map(p => (
        <Marker
          key={p.id}
          position={[p.lat, p.lng]}
          icon={makePinIcon(internalSelected === p.id)}
          eventHandlers={{
            click: () => {
              setInternalSelected(p.id);
              onSelectPin?.(p.id);
            },
          }}
        />
      ))} */}
    </MapContainer>
  );
}

