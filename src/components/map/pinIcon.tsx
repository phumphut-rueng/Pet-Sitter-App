'use client';

import * as L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import PinSelection from '@/components/PinSelection';

export function makePinIcon(isSelected: boolean) {
  //แปลง jsx -> HTML string
  const html = renderToStaticMarkup(
    <PinSelection defaultSelected={isSelected} className="pointer-events-none" />
  );

  //สร้าง leaflet marker
  return L.divIcon({
    html,
    className: 'custom-pin', 
    iconSize: [72, 84],        
    iconAnchor: [36, 84],      
    popupAnchor: [0, -84],
  });
}
