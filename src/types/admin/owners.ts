export type OwnerRow = {
  id: number
  name: string | null
  email: string
  phone: string | null
  created_at: string
  pet_count: number
  profile_image: string | null
}

export type OwnerListResponse = {
  items: OwnerRow[]
  total: number
  page: number
  limit: number
}

export type OwnerDetail = {
  id: number;
  name: string | null;
  email: string;
  phone: string | null;
  profile_image: string | null;
  created_at: string;  // ISO string
  pets: Array<{
    id: number;
    name: string;
    breed: string;
    sex: string;
    age_month: number;
    color: string;
    image_url: string | null;
    created_at: string; // ISO string
  }>;
};