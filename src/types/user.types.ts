export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string; // รูปโปรไฟล์ (URL หรือ public_id)
  profile_image?: string; // ชื่อให้ตรงกับ DB/Prisma
  roles?: string[];
}

export type OwnerProfile = {
  name: string;
  email: string;
  phone: string;
  dob?: string; // "YYYY-MM-DD"
  idNumber?: string; // เลขบัตรประชาชน
  image?: string; // รูปโปรไฟล์ (URL, public_id, หรือ data URL)
  profileImage?: string; // URL/base64/blob (legacy)
  profileImagePublicId?: string; // Cloudinary public_id
};

export type UpdateOwnerProfilePayload = Partial<OwnerProfile>;