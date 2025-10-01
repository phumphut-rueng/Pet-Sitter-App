// src/types/user.types.ts

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profile_image?: string; // ชื่อให้ตรงกับ DB/Prisma
  roles?: string[];       
}


export type OwnerProfile = {
  name: string;
  email: string;
  phone: string;
  dob?: string;           // "YYYY-MM-DD"
  profileImage?: string;  // URL/base64/blob
};


export type UpdateOwnerProfilePayload = Partial<OwnerProfile>;