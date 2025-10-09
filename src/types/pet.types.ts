export interface PetType {
  id: number;
  name: string;
}

export type PetStatus = "selected" | "unselected" | "disabled";

export interface Pet {
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
  selected?: boolean;
  disabled?: boolean;
  status?: PetStatus;
}

export interface PetFormValues {
  name: string;
  type: string;
  breed: string;
  sex: string;           // "Male" | "Female" | ""
  ageMonth: string;      // เก็บเป็น string ในฟอร์ม
  color: string;
  weightKg: string;      // เก็บเป็น string ในฟอร์ม
  about: string;
  image: string;         // dataURL หรือ URL
}

// 🆕 เพิ่มส่วนนี้เข้าไป
export interface PetFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<PetFormValues>;
  loading?: boolean;
  serverError?: string | null;
  onSubmit: (values: PetFormValues) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export interface PetFieldConfig {
  name: keyof PetFormValues;
  label: string;
  placeholder: string;
  inputMode?: "text" | "numeric" | "decimal";
}

export interface SelectOption {
  value: string;
  label: string;
}