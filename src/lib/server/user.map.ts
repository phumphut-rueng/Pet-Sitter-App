import type { user } from "@prisma/client";


type UserProfileFields = Pick<user, "id" | "name" | "email" | "phone" | "dob" | "profile_image">;

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
  dateToString: (date: Date | null): string => {
    return date ? date.toISOString().slice(0, 10) : DEFAULT_VALUES.DOB;
  },

  nullableStringToString: (value: string | null): string => {
    return value ?? "";
  }
};


export const toOwnerProfileDto = (user: UserProfileFields): OwnerProfileDto => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: formatters.nullableStringToString(user.phone),
  idNumber: DEFAULT_VALUES.ID_NUMBER,
  dob: formatters.dateToString(user.dob),
  profileImage: formatters.nullableStringToString(user.profile_image),
});


export const userMappers = {
  toOwnerProfile: toOwnerProfileDto,
  
  // สำหรับ mapping แบบอื่นในอนาคต
  toPublicProfile: (user: UserProfileFields) => ({
    id: user.id,
    name: user.name,
    profileImage: formatters.nullableStringToString(user.profile_image),
  }),

  toMinimalProfile: (user: Pick<user, "id" | "name">) => ({
    id: user.id,
    name: user.name,
  }),
} as const;