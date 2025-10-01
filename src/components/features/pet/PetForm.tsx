import * as React from "react";
import AvatarUploader from "@/components/form/AvatarUpload";

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

type PetFormProps = {
  mode: "create" | "edit";
  initialValues?: Partial<PetFormValues>;
  loading?: boolean;
  serverError?: string | null;
  onSubmit: (values: PetFormValues) => void;
  onCancel: () => void;
  onDelete?: () => void;
};

type FieldConfig = {
  name: keyof PetFormValues;
  label: string;
  placeholder: string;
  inputMode?: "text" | "numeric" | "decimal";
};

type SelectOption = {
  value: string;
  label: string;
};

const EMPTY_VALUES: PetFormValues = {
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

const FORM_CONFIG = {
  fields: {
    name: { name: "name", label: "Pet Name*", placeholder: "Your pet name" },
    breed: { name: "breed", label: "Breed*", placeholder: "Breed of your pet" },
    ageMonth: { name: "ageMonth", label: "Age (Month)*", placeholder: "e.g., 6", inputMode: "numeric" },
    color: { name: "color", label: "Color*", placeholder: "Describe color of your pet" },
    weightKg: { name: "weightKg", label: "Weight (Kilogram)*", placeholder: "e.g., 3.5", inputMode: "decimal" },
  } as const,
  petTypeOptions: [
    { value: "", label: "Select your pet type" },
    { value: "Dog", label: "Dog" },
    { value: "Cat", label: "Cat" },
    { value: "Bird", label: "Bird" },
    { value: "Rabbit", label: "Rabbit" },
  ] as SelectOption[],
  sexOptions: [
    { value: "", label: "Select sex of your pet" },
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
  ] as SelectOption[],
  styles: {
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
    // ใส่ cursor-pointer ตั้งแต่ container (สืบทอดไปยังลูก)
    imageContainer: "w-fit cursor-pointer",
    imageLabel: "text-[14px] font-medium text-muted-text mb-3 block cursor-pointer",
    input: {
      base: "mt-1 h-10 w-full rounded-md border border-border bg-white px-3 text-[14px] text-ink placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-brand ring-offset-2 ring-offset-bg",
      textarea: "mt-1 w-full rounded-md border border-border bg-white p-3 text-[14px] text-ink placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-brand ring-offset-2 ring-offset-bg",
    },
    button: {
      cancel: "h-11 rounded-full bg-orange-1/40 text-orange-6 font-semibold hover:bg-orange-1/60 transition cursor-pointer disabled:cursor-not-allowed",
      submit: "h-11 rounded-full bg-brand text-white font-bold hover:brightness-95 hover:shadow disabled:opacity-50 transition cursor-pointer disabled:cursor-not-allowed",
      delete: "inline-flex items-center gap-2 text-orange-600 font-semibold hover:text-orange-700 cursor-pointer",
    },
    label: "text-[14px] font-medium text-muted-text",
  },
};

const handleFileToDataURL = (file: File): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
  });

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className={FORM_CONFIG.styles.error}>{message}</div>
);

const FormLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className={FORM_CONFIG.styles.label}>{children}</label>
);


const PetImageField: React.FC<{
  imageUrl: string;
  onChange: (file: File | null) => void;
}> = ({ imageUrl, onChange }) => {
  return (
    <div className={`${FORM_CONFIG.styles.imageContainer} cursor-pointer`}>
      <label className={`${FORM_CONFIG.styles.imageLabel} cursor-pointer`}>Pet Image</label>


      <div className="inline-block cursor-pointer [&_button]:cursor-pointer [&_button]:outline-none">
        <AvatarUploader imageUrl={imageUrl} onChange={onChange} diameterPx={176} />
      </div>
    </div>
  );
};

const TextInputField: React.FC<{
  config: FieldConfig;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ config, value, onChange }) => (
  <div>
    <FormLabel>{config.label}</FormLabel>
    <input
      name={config.name}
      value={value}
      onChange={onChange}
      placeholder={config.placeholder}
      inputMode={config.inputMode}
      className={FORM_CONFIG.styles.input.base}
    />
  </div>
);


const SelectField: React.FC<{
  name: string;
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}> = ({ name, label, value, options, onChange }) => (
  <div>
    <FormLabel>{label}</FormLabel>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={`${FORM_CONFIG.styles.input.base} cursor-pointer`}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const TextAreaField: React.FC<{
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}> = ({ value, onChange }) => (
  <div>
    <FormLabel>About</FormLabel>
    <textarea
      name="about"
      value={value}
      onChange={onChange}
      placeholder="Describe more about your pet..."
      rows={4}
      className={FORM_CONFIG.styles.input.textarea}
    />
  </div>
);

const DeleteButton: React.FC<{ onDelete: () => void }> = ({ onDelete }) => (
  <div className="mt-2 flex justify-center md:justify-start">
    <button type="button" onClick={onDelete} className={FORM_CONFIG.styles.button.delete}>
      <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 3h6a1 1 0 0 1 1 1v1h4v2H4V5h4V4a1 1 0 0 1 1-1Zm2 4h2v12h-2V7ZM7 7h2v12H7V7Zm8 0h2v12h-2V7Z" />
      </svg>
      Delete Pet
    </button>
  </div>
);

const ActionButtons: React.FC<{
  mode: "create" | "edit";
  loading: boolean;
  onCancel: () => void;
  isMobile?: boolean;
}> = ({ mode, loading, onCancel, isMobile = false }) => {
  const submitLabel = mode === "edit" ? "Update Pet" : "Create Pet";
  const loadingLabel = loading ? "Saving..." : submitLabel;
  const gridClass = isMobile ? FORM_CONFIG.styles.grid.buttons.mobile : FORM_CONFIG.styles.grid.buttons.desktop;
  const buttonSpacing = isMobile ? "" : "px-6";
  const cancelClass = isMobile ? "" : "justify-self-start";
  const submitClass = isMobile ? "" : "justify-self-end";
  
  return (
    <div className={gridClass}>
      <button 
        type="button" 
        onClick={onCancel} 
        className={`${FORM_CONFIG.styles.button.cancel} ${buttonSpacing} ${cancelClass}`}
      >
        Cancel
      </button>
      <button 
        type="submit" 
        disabled={loading} 
        className={`${FORM_CONFIG.styles.button.submit} ${buttonSpacing} ${submitClass}`}
      >
        {loadingLabel}
      </button>
    </div>
  );
};

export default function PetForm({
  mode,
  initialValues,
  loading = false,
  serverError,
  onSubmit,
  onCancel,
  onDelete,
}: PetFormProps) {
  const [values, setValues] = React.useState<PetFormValues>({ ...EMPTY_VALUES, ...initialValues });

  React.useEffect(() => {
    if (!initialValues) return;
    setValues((prev) => ({ ...prev, ...initialValues }));
  }, [initialValues]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (file: File | null) => {
    if (!file) {
      setValues((prev) => ({ ...prev, image: "" }));
      return;
    }
    const dataURL = await handleFileToDataURL(file);
    setValues((prev) => ({ ...prev, image: dataURL }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  const isEdit = mode === "edit";
  const showDelete = onDelete && isEdit;

  return (
    <form onSubmit={handleSubmit} className={FORM_CONFIG.styles.form} aria-label="Pet form">
      {serverError && <ErrorMessage message={serverError} />}

      <div className={FORM_CONFIG.styles.grid.main}>
        <PetImageField imageUrl={values.image} onChange={handleImageChange} />

        <div className="grid gap-4">
          <div className={FORM_CONFIG.styles.grid.fields}>
            <TextInputField 
              config={FORM_CONFIG.fields.name} 
              value={values.name} 
              onChange={handleInputChange} 
            />
            <TextInputField 
              config={FORM_CONFIG.fields.breed} 
              value={values.breed} 
              onChange={handleInputChange} 
            />
            <TextInputField 
              config={FORM_CONFIG.fields.ageMonth} 
              value={values.ageMonth} 
              onChange={handleInputChange} 
            />
            <TextInputField 
              config={FORM_CONFIG.fields.color} 
              value={values.color} 
              onChange={handleInputChange} 
            />
            <TextInputField 
              config={FORM_CONFIG.fields.weightKg} 
              value={values.weightKg} 
              onChange={handleInputChange} 
            />
            
            <SelectField 
              name="type"
              label="Pet Type*" 
              value={values.type}
              options={FORM_CONFIG.petTypeOptions} 
              onChange={handleInputChange}
            />
            
            <SelectField 
              name="sex"
              label="Sex*" 
              value={values.sex}
              options={FORM_CONFIG.sexOptions} 
              onChange={handleInputChange}
            />
          </div>

          <TextAreaField value={values.about} onChange={handleInputChange} />

          {showDelete && <DeleteButton onDelete={onDelete} />}

          <ActionButtons mode={mode} loading={loading} onCancel={onCancel} isMobile />
          <ActionButtons mode={mode} loading={loading} onCancel={onCancel} />
        </div>
      </div>
    </form>
  );
}