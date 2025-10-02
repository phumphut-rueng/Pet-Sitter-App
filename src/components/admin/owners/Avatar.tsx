import Image from "next/image";

export default function Avatar({ src, alt = "" }: { src?: string | null; alt?: string }) {
  const url = src || "/images/avatar-default.png"; // fallback
  return (
    <div className="relative h-12 w-12 overflow-hidden rounded-full ring-1 ring-gray-200">
      <Image
        src={url}
        alt={alt}
        fill            // ใช้ fill แทนกําหนด width/height แบบไม่เท่ากัน
        sizes="48px"    // ให้เบราว์เซอร์คำนวณภาพ 48px
        className="object-cover"
      />
    </div>
  );
}