import { PetFormValues, PetFieldConfig, SelectOption } from "@/types/pet.types";

/*Form Default Values*/
export const EMPTY_PET_FORM_VALUES: PetFormValues = {
  name: "",
  type: "",
  breed: "",
  sex: "",
  ageMonth: "",
  color: "",
  weightKg: "",
  about: "",
  image: "",
};


 /*  Form Field Configuration*/
export const PET_FORM_FIELDS: Record<string, PetFieldConfig> = {
  name: {
    name: "name",
    label: "Pet Name*",
    placeholder: "Your pet name",
  },
  breed: {
    name: "breed",
    label: "Breed*",
    placeholder: "Breed of your pet",
  },
  ageMonth: {
    name: "ageMonth",
    label: "Age (Month)*",
    placeholder: "e.g., 6",
    inputMode: "numeric",
  },
  color: {
    name: "color",
    label: "Color*",
    placeholder: "Describe color of your pet",
  },
  weightKg: {
    name: "weightKg",
    label: "Weight (Kilogram)*",
    placeholder: "e.g., 3.5",
    inputMode: "decimal",
  },
} as const;

/* Select Options*/
export const PET_TYPE_OPTIONS: SelectOption[] = [
  { value: "", label: "Select your pet type" },
  { value: "Dog", label: "Dog" },
  { value: "Cat", label: "Cat" },
  { value: "Bird", label: "Bird" },
  { value: "Rabbit", label: "Rabbit" },
];

export const PET_SEX_OPTIONS: SelectOption[] = [
  { value: "", label: "Select sex of your pet" },
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
];


export const PET_FORM_STYLES = {
  form: "space-y-6",
  error: "rounded-lg bg-pink-bg p-3 text-sm text-pink ring-1 ring-pink/30",
  grid: {
    main: "grid gap-6 md:grid-cols-[240px,1fr]",
    fields: "grid gap-4 md:grid-cols-2",
    buttons: {
      mobile: "mt-3 grid grid-cols-2 gap-3 md:hidden",
      desktop: "mt-3 hidden md:grid grid-cols-2 gap-3",
    },
  },
  imageContainer: "w-fit cursor-pointer",
  imageLabel: "text-sm font-medium text-gray-6 mb-3 block cursor-pointer",
  input: {
    base: "mt-1 h-11 w-full rounded-lg border border-gray-2 bg-white px-4 text-sm2-regular text-black placeholder:text-gray-4 focus:outline-none focus:border-orange-5",
    textarea: "mt-1 w-full rounded-lg border border-gray-2 bg-white p-3 text-sm2-regular text-black placeholder:text-gray-4 focus:outline-none focus:border-orange-5",
  },
  button: {
    cancel: "h-11 rounded-full bg-orange-1 text-sm2-bold text-orange-5 font-semibold hover:bg-orange-1/60 transition cursor-pointer disabled:cursor-not-allowed",
    submit: "h-11 rounded-full bg-orange-5 text-sm2-bold text-white hover:bg-orange-6 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
    delete: "inline-flex items-center gap-2 text-sm2-bold text-orange-5 font-semibold hover:text-orange-6/80 cursor-pointer",
  },
  label: "text-sm2-medium text-black",
} as const;