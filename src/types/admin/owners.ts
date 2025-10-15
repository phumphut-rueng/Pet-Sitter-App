
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
  status: UserStatus; // "normal" | "ban"
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

  // คีย์โทน "ban" (รองรับถ้า API แมปชื่อคีย์)
  banned_at?: string | null;
  ban_reason?: string | null;

  //  Legacy (ยังคงไว้ให้คอมไพล์ผ่านถ้ามีโค้ดเก่าใช้อยู่)
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
    image_url: string | null;
    created_at: string;             // list ใช้ sort/render
    is_banned?: boolean | null;
    pet_type_name?: string;
  }>;
};

export type PetItem = OwnerDetail["pets"][number];

/**
 * Sitter ที่ทำการรีวิว
 */
export type ReviewSitter = {
  id: number;
  name: string;
  avatarUrl: string;
  userId: number | null;
};

/**
 * รีวิวแต่ละรายการ
 */
export type ReviewItem = {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  sitter: ReviewSitter;
};

/**
 * Props สำหรับ OwnerReviewsList Component
 */
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

/**
 * Props สำหรับ ReviewCard Component
 */
export type ReviewCardProps = {
  review: ReviewItem;
};

/**
 * Props สำหรับ StarRating Component
 */
export type StarRatingProps = {
  rating: number;
};

/**
 * Props สำหรับ SitterAvatar Component
 */
export type SitterAvatarProps = {
  avatarUrl: string | null;
  name: string;
};