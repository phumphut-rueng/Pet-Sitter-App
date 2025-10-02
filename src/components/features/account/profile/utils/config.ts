export type FieldConfig = {
    id: string;
    label: string;
    placeholder?: string;
    type: string;
    autoComplete?: string;
    inputMode?:
      | "text"
      | "email"
      | "tel"
      | "numeric"
      | "search"
      | "none"
      | "url"
      | "decimal";
    pattern?: string;
    maxLength?: number;
  };
  
  export const FORM_CONFIG = {
    fields: {
      name: {
        id: "name",
        label: "Your Name*",
        placeholder: "John Wick",
        type: "text",
        autoComplete: "name",
      },
      email: {
        id: "email",
        label: "Email*",
        placeholder: "johnwick@dogorg.com",
        type: "email",
        autoComplete: "email",
      },
      phone: {
        id: "phone",
        label: "Phone*",
        placeholder: "099 996 6734",
        type: "tel",
        inputMode: "tel",
        pattern: "^0\\d{9}$",
        autoComplete: "tel",
      },
      idNumber: {
        id: "idNumber",
        label: "ID Number",
        placeholder: "13 digits",
        type: "text",
        inputMode: "numeric",
        pattern: "^\\d{13}$",
        maxLength: 13,
      },
      dob: {
        id: "dob",
        label: "Date of Birth",
        type: "date",
        placeholder: "YYYY-MM-DD",
      },
    } as const,
    styles: {
      form: "text-ink space-y-6",
      error: "rounded-md border border-red-300 bg-red-50 px-4 py-3 text-red-700",
      avatarContainer: "w-fit cursor-pointer",
      grid: "grid gap-4 md:grid-cols-2",
      buttonContainer: "flex justify-end",
      hiddenSubmit: "sr-only",
    },
  };
  
  export type InputVariant = "default" | "error" | "success";
  
  export const getInputVariant = (hasError: boolean): InputVariant =>
    hasError ? "error" : "default";