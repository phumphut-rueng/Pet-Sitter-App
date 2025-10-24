export interface SitterDetail {
  id: number;
  name: string;
  user_name: string;
  user_email: string;
  user_dob: string;
  user_profile_image: string;
  approval_status: string;
  approval_status_id: number;
  status_updated_at: string;
  location_description: string;
  created_at: string;
  introduction: string;
  phone: string;
  address_detail: string;
  address_province: string;
  address_district: string;
  address_sub_district: string;
  address_post_code: string;
  base_price: string;
  experience: number;
  service_description: string;
  admin_note: string;
  averageRating: number;
  latitude?: number;
  longitude?: number;
  sitter_image: Array<{
    id: number;
    image_url: string;
  }>;
  sitter_pet_type: Array<{
    pet_type: {
      pet_type_name: string;
    };
  }>;
}

export type BookingRowStatus =
  | "waitingConfirm"
  | "waitingService"
  | "inService"
  | "success"
  | "canceled";

export interface BookingRow {
  id: number;
  ownerName: string;
  petCount: number;
  duration: string;
  bookedDate: string;
  status: BookingRowStatus;
}

export interface Review {
  id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  user: {
    id: number;
    name: string | null;
    profile_image: string | null;
  };
}

export interface HistoryRow {
  id: number;
  status: string;
  approver: string;
  note: string;
  date: string;
}

export type TabType = "profile" | "booking" | "reviews" | "history";
