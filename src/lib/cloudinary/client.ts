const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'df1j8dvg0';

if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
  console.warn('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not configured, using fallback');
}

export const cldUrl = (publicId: string, w = 256, h = 256) =>
  `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto,c_fill,w_${w},h_${h}/${publicId}`;

export const extractPublicId = (url?: string): string | undefined => {
  if (!url) return undefined;
  try {
    const u = new URL(url);
    const i = u.pathname.indexOf("/upload/");
    if (i === -1) return undefined;
    let id = u.pathname.slice(i + "/upload/".length);
    id = id.replace(/^v\d+\//, "");
    id = id.replace(/\.(png|jpg|jpeg|webp|gif|svg)$/i, "");
    return decodeURIComponent(id);
  } catch {
    return undefined;
  }
};