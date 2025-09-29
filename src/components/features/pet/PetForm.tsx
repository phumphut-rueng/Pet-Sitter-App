import * as React from "react";
import Image from "next/image";

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

type FormFieldConfig = {
  name: keyof PetFormValues;
  label: string;
  placeholder: string;
  type?: string;
  inputMode?: "text" | "numeric" | "decimal";
  required?: boolean;
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

const FORM_FIELDS: FormFieldConfig[] = [
  { name: "name", label: "Pet Name*", placeholder: "Your pet name", required: true },
  { name: "breed", label: "Breed*", placeholder: "Breed of your pet", required: true },
  { name: "ageMonth", label: "Age (Month)*", placeholder: "e.g., 6", inputMode: "numeric", required: true },
  { name: "color", label: "Color*", placeholder: "Describe color of your pet", required: true },
  { name: "weightKg", label: "Weight (Kilogram)*", placeholder: "e.g., 3.5", inputMode: "decimal", required: true },
];

const PET_TYPE_OPTIONS: SelectOption[] = [
  { value: "", label: "Select your pet type" },
  { value: "Dog", label: "Dog" },
  { value: "Cat", label: "Cat" },
  { value: "Bird", label: "Bird" },
  { value: "Rabbit", label: "Rabbit" },
];

const SEX_OPTIONS: SelectOption[] = [
  { value: "", label: "Select sex of your pet" },
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
];

const STYLES = {
  form: "space-y-6",
  error: "rounded-lg bg-pink/10 p-3 text-[14px] text-pink ring-1 ring-pink/30",
  grid: {
    main: "grid gap-6 md:grid-cols-[220px,1fr]",
    fields: "grid gap-4 md:grid-cols-2",
    buttons: {
      mobile: "mt-3 grid grid-cols-2 gap-3 md:hidden",
      desktop: "mt-3 hidden md:grid grid-cols-2 gap-3",
    },
  },
  image: {
    container: "space-y-3",
    preview:
      "h-40 w-40 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-border flex items-center justify-center",
    upload:
      "inline-flex cursor-pointer items-center justify-center rounded-full border border-border px-3 py-2 text-[13px] font-medium text-ink hover:bg-muted/40 transition",
  },
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
};

const handleFileToDataURL = (file: File): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
  });

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className={STYLES.error}>{message}</div>
);

const FormLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className={STYLES.label}>{children}</label>
);

const FormInput: React.FC<{
  config: FormFieldConfig;
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
      className={STYLES.input.base}
    />
  </div>
);

const FormSelect: React.FC<{
  name: string;
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}> = ({ name, label, value, options, onChange }) => (
  <div>
    <FormLabel>{label}</FormLabel>
    <select name={name} value={value} onChange={onChange} className={STYLES.input.base}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const ImageUpload: React.FC<{ preview: string; onImageChange: (file?: File) => Promise<void>; }> = ({
  preview,
  onImageChange,
}) => {
  const hasImage = preview.trim().length > 0;
  return (
    <div className={STYLES.image.container}>
      <FormLabel>Pet Image</FormLabel>
      <div className={STYLES.image.preview}>
        {hasImage ? (
          <Image src={preview} alt="Pet image" width={160} height={160} className="object-cover" />
        ) : (
          <span className="text-slate-400 text-sm">No image</span>
        )}
      </div>
      <label className={STYLES.image.upload}>
        <input type="file" accept="image/*" className="hidden" onChange={(e) => onImageChange(e.target.files?.[0])} />
        Upload Image
      </label>
    </div>
  );
};

const DeleteButton: React.FC<{ onDelete: () => void }> = ({ onDelete }) => (
  <div className="mt-2 flex justify-center md:justify-start">
    <button type="button" onClick={onDelete} className={STYLES.button.delete}>
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
  const gridClass = isMobile ? STYLES.grid.buttons.mobile : STYLES.grid.buttons.desktop;
  const buttonSpacing = isMobile ? "" : "px-6";
  const cancelClass = isMobile ? "" : "justify-self-start";
  const submitClass = isMobile ? "" : "justify-self-end";
  return (
    <div className={gridClass}>
      <button type="button" onClick={onCancel} className={`${STYLES.button.cancel} ${buttonSpacing} ${cancelClass}`}>
        Cancel
      </button>
      <button type="submit" disabled={loading} className={`${STYLES.button.submit} ${buttonSpacing} ${submitClass}`}>
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
  const [preview, setPreview] = React.useState<string>((initialValues?.image ?? "").trim());

  React.useEffect(() => {
    if (!initialValues) return;
    setValues((prev) => ({ ...prev, ...initialValues }));
    setPreview((initialValues.image ?? "").trim());
  }, [initialValues]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (file?: File) => {
    if (!file) {
      setValues((prev) => ({ ...prev, image: "" }));
      setPreview("");
      return;
    }
    const dataURL = await handleFileToDataURL(file);
    setPreview(dataURL);
    setValues((prev) => ({ ...prev, image: dataURL }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  const isEdit = mode === "edit";
  const showDelete = onDelete && isEdit;

  return (
    <form onSubmit={handleSubmit} className={STYLES.form}>
      {serverError && <ErrorMessage message={serverError} />}

      <div className={STYLES.grid.main}>
        <ImageUpload preview={preview} onImageChange={handleImageChange} />

        <div className="grid gap-4">
          <div className={STYLES.grid.fields}>
            {FORM_FIELDS.map((config) => (
              <FormInput key={config.name} config={config} value={values[config.name]} onChange={handleInputChange} />
            ))}

            <FormSelect
              name="type"
              label="Pet Type*"
              value={values.type}
              options={PET_TYPE_OPTIONS}
              onChange={handleInputChange}
            />

            <FormSelect name="sex" label="Sex*" value={values.sex} options={SEX_OPTIONS} onChange={handleInputChange} />
          </div>

          <div>
            <FormLabel>About</FormLabel>
            <textarea
              name="about"
              value={values.about}
              onChange={handleInputChange}
              placeholder="Describe more about your pet..."
              rows={4}
              className={STYLES.input.textarea}
            />
          </div>

          {showDelete && <DeleteButton onDelete={onDelete} />}

          <ActionButtons mode={mode} loading={loading} onCancel={onCancel} isMobile />
          <ActionButtons mode={mode} loading={loading} onCancel={onCancel} />
        </div>
      </div>
    </form>
  );
}