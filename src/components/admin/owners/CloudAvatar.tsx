import * as React from "react";
import Image from "next/image";

type Props = {
  publicId?: string | null;
  legacyUrl?: string | null;
  alt?: string;
  size?: number;
  className?: string;
  priority?: boolean;
};

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "df1j8dvg0";
const cldUrl = (pid: string, w: number, h: number, q?: number) =>
  `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_${q ?? "auto"},c_fill,w_${w},h_${h}/${pid}`;

// ดึง public_id ออกจาก URL เต็มๆ (ตัด vXXXX และนามสกุลทิ้ง)
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
    const last = rest[rest.length - 1];
    const lastNoExt = last.replace(/\.[a-z0-9]+$/i, "");
    return [...rest.slice(0, -1), lastNoExt].join("/") || null;
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
    if (publicId) return cldUrl(publicId, size, size);
    if (legacyUrl) {
      const pid = extractPublicId(legacyUrl);
      if (pid) return cldUrl(pid, size, size);
      return legacyUrl;
    }
    return "";
  }, [publicId, legacyUrl, size]);

  const [src, setSrc] = React.useState(buildSrc);
  const [errored, setErrored] = React.useState(false);

  React.useEffect(() => {
    setSrc(buildSrc());
    setErrored(false);
  }, [buildSrc]);

  if (!src || errored) {
    const letter = (alt || "?").trim().charAt(0).toUpperCase() || "?";
    return (
      <div
        className={`inline-flex items-center justify-center rounded-full bg-gray-200 text-gray-600 ${className}`}
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
        onError={() => { setErrored(true); setSrc(""); }}
        className="object-cover"
      />
    </div>
  );
}