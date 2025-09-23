export type Pet = {
    id: number;
    name: string;
    type: "Dog" | "Cat" | "Bird" | "Other";
    image?: string;
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
    image?: string;
  };