// src/components/CloudAvatar.tsx
import * as React from "react";
import Image from "next/image";

type Props = {
  publicId?: string | null;     // เช่น "owner-profile/abc123"
  legacyUrl?: string | null;    // full URL (Cloudinary เดิม/Google/etc.)
  alt?: string;
  size?: number;                // px (สี่เหลี่ยมจัตุรัส)
  className?: string;
  priority?: boolean;
};

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'df1j8dvg0';

if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
  console.warn('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not configured, using fallback');
}

// Base64 image placeholder (1x1 pixel transparent PNG)
const PLACEHOLDER_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

/** สร้าง URL แบบ fetch ไม่มี d_ เพื่อตรวจสอบว่ามีรูปจริงหรือไม่ */
const cldFetch = (rawUrl: string, w: number, h: number, q?: number) =>
  `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/f_auto,q_${q ?? "auto"},c_fill,w_${w},h_${h}/${encodeURIComponent(
    rawUrl
  )}`;

/** สำหรับ publicId (upload) -> สร้างเป็น fetch ที่ชี้ไปยัง upload URL ต้นทาง */
const cldUploadAsFetch = (pid: string, w: number, h: number, q?: number) => {
  const uploadSrc = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${pid}`;
  return cldFetch(uploadSrc, w, h, q);
};

function isCloudinaryUrl(url: string) {
  try {
    const u = new URL(url);
    return u.hostname === "res.cloudinary.com" && u.pathname.includes("/image/");
  } catch {
    return false;
  }
}

/** ดึง public_id จาก Cloudinary upload URL (ตัด vXXXX + นามสกุล) */
function extractPublicId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname !== "res.cloudinary.com") return null;
    const parts = u.pathname.split("/").filter(Boolean);
    const idx = parts.findIndex((p) => p === "upload");
    if (idx === -1 || idx + 1 >= parts.length) return null;
    const after = parts.slice(idx + 1);
    const rest = after[0]?.startsWith("v") ? after.slice(1) : after;
    if (rest.length === 0) return null;
    const last = rest[rest.length - 1].replace(/\.[a-z0-9]+$/i, "");
    return [...rest.slice(0, -1), last].join("/");
  } catch {
    return null;
  }
}

export default function CloudAvatar({
  publicId,
  legacyUrl,
  alt = "",
  size = 40,
  className = "",
  priority = false,
}: Props) {
  const buildSrc = React.useCallback(() => {
    // กันค่าผิดปกติ
    if (publicId === "undefined" || publicId === "null" || publicId === "") return "";
    if (legacyUrl === "undefined" || legacyUrl === "null") return "";

    // 1) มี publicId -> ห่อเป็น fetch (ไม่มี 404; ได้ d_ เสมอถ้าหาไม่เจอ)
    if (publicId) return cldUploadAsFetch(publicId, size, size);

    // 2) มี legacyUrl
    if (legacyUrl) {
      // ถ้าเป็น Cloudinary เดิม -> แปลงเป็น upload pid แล้วห่อ fetch
      if (isCloudinaryUrl(legacyUrl)) {
        const pid = extractPublicId(legacyUrl);
        if (pid) return cldUploadAsFetch(pid, size, size);
      }
      // ถ้าเป็นโดเมนภายนอก (เช่น Google) -> fetch โดยตรง + d_
      return cldFetch(legacyUrl, size, size);
    }

    return "";
  }, [publicId, legacyUrl, size]);

  const [src, setSrc] = React.useState<string>("");
  const [errored, setErrored] = React.useState(false);

  React.useEffect(() => {
    const url = buildSrc();
    if (!url) {
      setErrored(true);
      return;
    }

    // แสดง placeholder ก่อน แล้วค่อยโหลดรูปจริง
    setErrored(false);
    setSrc(PLACEHOLDER_BASE64);
    
    // โหลดรูปจริงแบบ silent (ไม่แสดง error ใน console)
    const img = new window.Image();
    img.onload = () => setSrc(url);
    img.onerror = () => setErrored(true);
    img.src = url;
  }, [buildSrc]);

  // === ตัวอักษร fallback ===
  if (!src || src === PLACEHOLDER_BASE64 || errored) {
    // แก้ไขการกำหนด letter ให้แสดงตัวอักษรแทน "?"
    let letter = "?";
    
    if (alt && alt.trim()) {
      // หาตัวอักษรแรกที่ไม่ใช่ช่องว่าง
      const firstChar = alt.trim().charAt(0);
      if (firstChar && firstChar !== " ") {
        letter = firstChar.toUpperCase();
      }
    }
    
    return (
      <div
        className={`inline-flex items-center justify-center rounded-full bg-gray-2 text-gray-6 font-bold ${className}`}
        style={{ width: size, height: size, fontSize: Math.max(12, size * 0.45) }}
        aria-label={alt}
      >
        {letter}
      </div>
    );
  }

  return (
    <div
      className={`relative inline-block rounded-full overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={`${size}px`}
        priority={priority}
        className="object-cover"
        placeholder="empty"
      />
    </div>
  );
}