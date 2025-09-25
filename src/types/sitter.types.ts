export interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: Date;
}

export interface PetType {
  id: number;
  pet_type_name: string;
}

export interface SitterPetType {
  sitter_id: number;
  pet_type_id: number;
  pet_type: PetType;
}

export interface SitterImage {
  id: number;
  sitter_id: number;
  image_url: string;
}

export interface Sitter {
  id: number;
  user_sitter_id: number;
  name: string;
  location_description: string;
  phone: string;
  introduction: string;
  address_detail: string;
  address_province: string;
  address_district: string;
  address_sub_district: string;
  address_post_code: string;
  base_price: string;
  created_at: string;
  updated_at: string | null;
  experience: number;
  sitter_image: SitterImage[];
  sitter_pet_type: SitterPetType[];
  reviews: Review[];
  averageRating: number | null;
}
