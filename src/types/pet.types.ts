export type PetType = {
  id: number;
  name: string;
};

export type Pet = {
  id: number;
  name: string;
  petTypeId: number;
  petTypeName?: string | null;
  breed?: string | null;
  sex?: "Male" | "Female" | null;
  ageMonth?: number | null;
  color?: string | null;
  weightKg?: number | null;
  about?: string | null;
  imageUrl?: string | null;
};


export type PetFormValues = {
  name: string;
  type: string;          
  breed: string;
  sex: string;           // "Male" | "Female" | ""
  ageMonth: string;      // เก็บเป็น string ในฟอร์ม
  color: string;
  weightKg: string;      // เก็บเป็น string ในฟอร์ม
  about: string;
  image: string;         // dataURL หรือ URL
};