import type { user } from "@prisma/client";

type UserProfileFields = Pick<
  user,
  "id" | "name" | "email" | "phone" | "dob" | "profile_image"
>;

type OwnerProfileDto = {
  id: number;
  name: string;
  email: string;
  phone: string;
  idNumber: string;
  dob: string;
  profileImage: string;
};

const DEFAULT_VALUES = {
  PHONE: "",
  ID_NUMBER: "",
  DOB: "",
  PROFILE_IMAGE: "",
} as const;

const formatters = {
  dateToString: (date: Date | null): string =>
    date ? date.toISOString().slice(0, 10) : DEFAULT_VALUES.DOB,

  // รองรับทั้ง null/undefined → string
  nullableStringToString: (value: string | null | undefined): string =>
    value ?? "",
};

export const toOwnerProfileDto = (u: UserProfileFields): OwnerProfileDto => ({
  id: u.id,
  name: formatters.nullableStringToString(u.name),         
  email: formatters.nullableStringToString(u.email),        
  phone: formatters.nullableStringToString(u.phone),
  idNumber: DEFAULT_VALUES.ID_NUMBER,
  dob: formatters.dateToString(u.dob),
  profileImage: formatters.nullableStringToString(u.profile_image),
});

export const userMappers = {
  toOwnerProfile: toOwnerProfileDto,

  toPublicProfile: (u: UserProfileFields) => ({
    id: u.id,
    name: formatters.nullableStringToString(u.name),       
    profileImage: formatters.nullableStringToString(u.profile_image),
  }),

  toMinimalProfile: (u: Pick<user, "id" | "name">) => ({
    id: u.id,
    name: formatters.nullableStringToString(u.name),        
  }),
} as const;