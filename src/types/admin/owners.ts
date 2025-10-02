export type OwnerRow = {
  id: number
  name: string | null
  email: string
  phone: string | null
  created_at: string
  pet_count: number
  profile_image?: string | null;              
  profile_image_public_id?: string | null;    
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
  profile_image: string | null;                 // legacy
  profile_image_public_id?: string | null;      // ✅ new
  id_number?: string | null;                    // ✅ new
  dob?: string | null;                          // ✅ "YYYY-MM-DD"
  created_at: string;
  pets: Array<{
    id: number;
    name: string | null;
    breed: string | null;
    sex: string | null;
    age_month: number | null;
    color: string | null;
    image_url: string | null;
    created_at: string;
  }>;
};