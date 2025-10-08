/** แยก public_id ออกจาก Cloudinary URL เต็ม */
export const extractPublicIdFromCloudinaryUrl = (url?: string): string | undefined => {
    if (!url) return undefined;
    try {
      const u = new URL(url);
      const i = u.pathname.indexOf("/upload/");
      if (i === -1) return undefined;
      let id = u.pathname.slice(i + "/upload/".length); // หลัง /upload/
      id = id.replace(/^v\d+\//, "");                   // ตัดเวอร์ชัน v123/
      id = id.replace(/\.(png|jpg|jpeg|webp|gif|svg)$/i, ""); // ตัดนามสกุล
      id = decodeURIComponent(id);
      return id || undefined;
    } catch {
      return undefined;
    }
  };