'use client';

import * as L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import PinSelection from '@/components/PinSelection';

export function makePinIcon(isSelected: boolean) {
  const html = renderToStaticMarkup(
    <PinSelection defaultSelected={isSelected} className="pointer-events-none" />
  );

  return L.divIcon({
    html,
    className: 'custom-pin', 
    iconSize: [72, 84],        // ขนาดจาก SVG ของคุณ
    iconAnchor: [36, 84],      // กลางล่าง = [width/2, height]
    popupAnchor: [0, -84],
  });
}
