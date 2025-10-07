export type UserStatus = "ACTIVE" | "SUSPENDED";

/* ---------- LIST TYPES ---------- */
export type OwnerRow = {
  id: number;
  name: string | null;
  email: string;
  phone: string | null;
  created_at: string;
  pet_count: number;
  profile_image?: string | null;
  profile_image_public_id?: string | null;
  status: UserStatus;
};

export type OwnerListResponse = {
  items: OwnerRow[];
  total: number;
  page: number;
  limit: number;
};

/* ---------- DETAIL TYPE ---------- */
export type OwnerDetail = {
  id: number;
  name: string | null;
  email: string;
  phone: string | null;
  profile_image: string | null;
  profile_image_public_id?: string | null;

  id_number?: string | null;
  dob?: string | null;

  created_at: string;

  status?: UserStatus;
  suspended_at?: string | null;
  suspend_reason?: string | null;

  pets: Array<{
    id: number;
    name: string | null;
    breed: string | null;
    sex: string | null;
    age_month: number | null;
    color: string | null;
    image_url: string | null;
    created_at: string;             //  จำเป็น (ฝั่ง list ใช้ sort/render)
    is_banned?: boolean | null;
    pet_type_name?: string;
  }>;
};


export type PetItem = OwnerDetail["pets"][number];