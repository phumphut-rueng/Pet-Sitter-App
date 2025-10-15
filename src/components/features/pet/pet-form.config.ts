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

/* Tailwind Styles*/
export const PET_FORM_STYLES = {
  form: "space-y-6",
  error: "rounded-lg bg-pink/10 p-3 text-[14px] text-pink ring-1 ring-pink/30",
  grid: {
    main: "grid gap-6 md:grid-cols-[240px,1fr]",
    fields: "grid gap-4 md:grid-cols-2",
    buttons: {
      mobile: "mt-3 grid grid-cols-2 gap-3 md:hidden",
      desktop: "mt-3 hidden md:grid grid-cols-2 gap-3",
    },
  },
  imageContainer: "w-fit cursor-pointer",
  imageLabel: "text-[14px] font-medium text-muted-text mb-3 block cursor-pointer",
  input: {
    base: "mt-1 h-10 w-full rounded-md border border-border bg-white px-3 text-[14px] text-ink placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-brand ring-offset-2 ring-offset-bg",
    textarea:
      "mt-1 w-full rounded-md border border-border bg-white p-3 text-[14px] text-ink placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-brand ring-offset-2 ring-offset-bg",
  },
  button: {
    cancel:
      "h-11 rounded-full bg-orange-1/40 text-orange-6 font-semibold hover:bg-orange-1/60 transition cursor-pointer disabled:cursor-not-allowed",
    submit:
      "h-11 rounded-full bg-brand text-white font-bold hover:brightness-95 hover:shadow disabled:opacity-50 transition cursor-pointer disabled:cursor-not-allowed",
    delete:
      "inline-flex items-center gap-2 text-orange-600 font-semibold hover:text-orange-700 cursor-pointer",
  },
  label: "text-[14px] font-medium text-muted-text",
} as const;