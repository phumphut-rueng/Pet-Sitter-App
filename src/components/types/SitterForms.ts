import type { PetType } from '@/components/fields/PetTypeSelect';

export type SitterFormValues = {
  fullName: string;
  experience: string;
  phone: string;
  email: string;
  tradeName: string;
  petTypes: PetType[];
  introduction: string;
  location_description: string;
  service_description: string;
  address_detail: string;
  address_province: string;
  address_district: string;
  address_sub_district: string;
  address_post_code: string;
  profileImageUrl: string;
  images: string[];
  newImageFiles: File[];
  latitude?: number;
  longitude?: number;
};