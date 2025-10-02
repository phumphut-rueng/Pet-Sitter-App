export function getAvatarUrl(opts: {
    profileImage?: string | null;            // ถ้าเก็บเป็น full URL
    profileImagePublicId?: string | null;    // ถ้าเก็บเป็น public_id ของ Cloudinary
    cloudName?: string;                      // ชื่อ cloud ของทีม
  }) {
    const { profileImage, profileImagePublicId, cloudName = "YOUR_CLOUD_NAME" } = opts;
  
    // ถ้า DB เก็บ full url ไว้ (https://res.cloudinary.com/...)
    if (profileImage && /^https?:\/\//.test(profileImage)) return profileImage;
  
    // ถ้า DB เก็บเป็น public_id  สร้าง URL
    if (profileImagePublicId) {
      return `https://res.cloudinary.com/${cloudName}/image/upload/${profileImagePublicId}.jpg`;
    }
  
    // default avatar (วางไฟล์ไว้ที่ /public/images/avatar-default.png)
    return "/images/avatar-default.png";
  }