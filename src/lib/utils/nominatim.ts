//ใช้แปลงข้อมูล address ไปเป็น latitude, longitude
export async function getLatLngFromAddress(address: string) {
    const url =
      `https://nominatim.openstreetmap.org/search?` +
      `format=json&addressdetails=1&limit=1&q=${encodeURIComponent(address)}`; //ป้องกันปัญหาสำหรับ address ที่มี space หรือ สัญลักษณ์พิเศษ
  
    const res = await fetch(url, {
      headers: { "Accept-Language": "en" },
    });
    if (!res.ok) throw new Error("Geocoding failed");
  
    const data: Array<{ lat: string; lon: string }> = await res.json();
    if (!data?.length) throw new Error("We couldn't find the location for this address.");
  
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }; //แปลงค่าพิกัดจาก string -> number
  }