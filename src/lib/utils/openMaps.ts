// src/lib/utils/openMaps.ts
export type OpenMapsParams = {
  lat: number;
  lng: number;
  name?: string;
};

/** เปิดแผนที่ด้วย logic เดิม (iOS/Android/Web) */
export function openMaps({ lat, lng, name = "" }: OpenMapsParams): void {
  if (typeof window === "undefined") return;

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  const urls = {
    ios: `maps://maps.google.com/maps?q=${lat},${lng}`,
    android: `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(name)})`,
    web: `https://www.google.com/maps?q=${lat},${lng}`,
  };

  if (isMobile && isIOS) {
    // iOS
    window.location.href = urls.ios;
    setTimeout(() => {
      window.location.href = urls.web;
    }, 1500);
    return;
  }

  if (isMobile) {
    // Android
    window.location.href = urls.android;
    return;
  }

  // Desktop
  window.open(urls.web, "_blank", "noopener,noreferrer");
}
