export type PetTypeEnum = "Dog" | "Cat" | "Bird" | "Rabbit" | "Other";
export type PetSex = "Male" | "Female";


export type Pet = {
  id: number;
  name: string;
  petTypeName?: string;
  breed?: string;
  sex?: PetSex | "" | null;
  ageMonth?: number | null;
  color?: string;
  weightKg?: number | null;
  about?: string;
  imageUrl?: string | null;
};

export type PetType = { 
  id: number; 
  name: string; 
};


export type PetFormValues = {
  name: string;
  type: string;
  breed: string;
  sex: string;
  ageMonth: string;
  color: string;
  weightKg: string;
  about: string;
  image: string;
};


export type PetResponse = {
  id: number;
  name: string | null;
  petTypeName: string | null;
  breed: string | null;
  sex: PetSex | "" | null;
  ageMonth: number | null;
  color: string | null;
  weightKg: number | null;
  about: string | null;
  imageUrl: string | null;
};

export type PetCreatePayload = {
  petTypeId: number;
  name: string;
  breed: string;
  sex: PetSex;
  ageMonth: number;
  color: string;
  weightKg: number;
  about: string;
  imageUrl: string;
};

export type PetUpdatePayload = Partial<PetCreatePayload>;


export type PetCardData = {
  id: number;
  name: string;
  type: string;
  image?: string;
};

export type PetListItem = {
  id: number;
  name: string;
  petTypeName?: string;
  imageUrl?: string | null;
};


export const PET_TYPES: readonly PetTypeEnum[] = [
  "Dog",
  "Cat", 
  "Bird",
  "Rabbit",
  "Other"
] as const;

export const PET_SEXES: readonly PetSex[] = [
  "Male",
  "Female"
] as const;


export const isPetType = (value: string): value is PetTypeEnum => {
  return PET_TYPES.includes(value as PetTypeEnum);
};

export const isPetSex = (value: string): value is PetSex => {
  return PET_SEXES.includes(value as PetSex);
};


export type PetWithOwner = Pet & {
  ownerId: number;
  ownerName?: string;
};

export type PetFormData = Omit<PetFormValues, 'image'> & {
  image?: File | string;
};