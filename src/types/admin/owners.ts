export type UserStatus = "normal" | "ban";

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
  banned_at?: string | null;
  ban_reason?: string | null;
  
  /** @deprecated use `banned_at` instead */
  suspended_at?: string | null;
  /** @deprecated use `ban_reason` instead */
  suspend_reason?: string | null;

  pets: Array<{
    id: number;
    name: string | null;
    breed: string | null;
    sex: string | null;
    age_month: number | null;
    color: string | null;
    weight_kg?: string;
    about: string | null;  // ← เพิ่มบรรทัดนี้
    image_url: string | null;
    created_at: string;
    is_banned?: boolean | null;
    banned_at?: string | null;
    ban_reason?: string | null;
    pet_type_name?: string;
  }>;
};

export type PetItem = OwnerDetail["pets"][number];

export type ReviewSitter = {
  id: number;
  name: string;
  avatarUrl: string;
  userId: number | null;
};

export type ReviewItem = {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  sitter: ReviewSitter;
};

export type OwnerReviewsListProps = {
  reviews: ReviewItem[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    averageRating: string;
  };
  loading: boolean;
  error: string | null;
};

export type ReviewCardProps = {
  review: ReviewItem;
};

export type StarRatingProps = {
  rating: number;
};

export type SitterAvatarProps = {
  avatarUrl: string | null;
  name: string;
};