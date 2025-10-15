import * as React from "react";
import { PetFormProps, PetFormValues } from "@/types/pet.types";
import { 
  EMPTY_PET_FORM_VALUES, 
  PET_FORM_FIELDS, 
  PET_TYPE_OPTIONS, 
  PET_SEX_OPTIONS,
  PET_FORM_STYLES 
} from "./pet-form.config";
import { 
  fileToDataURL, 
  sanitizeAgeInput, 
  sanitizeWeightInput 
} from "@/lib/pet/pet-utils";
import { TextInputField } from "@/components/fields/TextInputField";
import { SelectField } from "@/components/fields/SelectField";
import { TextAreaField } from "@/components/fields/TextAreaField";
import { PetImageField } from "@/components/fields/PetImageField";
import { ActionButtons } from "@/components/fields/ActionButtons";

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className={PET_FORM_STYLES.error}>{message}</div>
);

const DeleteButton: React.FC<{ onDelete: () => void }> = ({ onDelete }) => (
  <div className="mt-2 flex justify-center md:justify-start">
    <button type="button" onClick={onDelete} className={PET_FORM_STYLES.button.delete}>
      <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 3h6a1 1 0 0 1 1v1h4v2H4V5h4V4a1 1 0 0 1 1-1Zm2 4h2v12h-2V7ZM7 7h2v12H7V7Zm8 0h2v12h-2V7Z" />
      </svg>
      Delete Pet
    </button>
  </div>
);

export default function PetForm({
  mode,
  initialValues,
  loading = false,
  serverError,
  onSubmit,
  onCancel,
  onDelete,
}: PetFormProps) {
  
  const [values, setValues] = React.useState<PetFormValues>({
    ...EMPTY_PET_FORM_VALUES,
    ...initialValues,
  });

  React.useEffect(() => {
    if (!initialValues) return;
    setValues((prev) => ({ ...prev, ...initialValues }));
  }, [initialValues]);

  // เช็คว่าฟอร์มครบหรือยัง
  const isFormValid = React.useMemo(() => {
    return (
      values.type.trim() !== "" &&
      values.name.trim() !== "" &&
      values.breed.trim() !== "" &&
      values.sex.trim() !== "" &&
      values.ageMonth.trim() !== "" &&
      values.color.trim() !== "" &&
      values.weightKg.trim() !== "" &&
      Number(values.ageMonth) >= 0 &&
      Number(values.weightKg) > 0
    );
  }, [values]);

  //  Log เพื่อดูค่า //
  React.useEffect(() => {
    console.log("Initial values:", EMPTY_PET_FORM_VALUES);
    console.log("Current type:", values.type);
    console.log("Current sex:", values.sex);
    console.log("isFormValid:", isFormValid);
  }, [values, isFormValid]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "ageMonth") {
      const cleanedAge = sanitizeAgeInput(value);
      setValues((prev) => ({ ...prev, ageMonth: cleanedAge }));
      return;
    }

    if (name === "weightKg") {
      const cleanedWeight = sanitizeWeightInput(value);
      setValues((prev) => ({ ...prev, weightKg: cleanedWeight }));
      return;
    }

    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (file: File | null) => {
    if (!file) {
      setValues((prev) => ({ ...prev, image: "" }));
      return;
    }
    
    const dataURL = await fileToDataURL(file);
    setValues((prev) => ({ ...prev, image: dataURL }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // เช็คอีกครั้งก่อน submit
    if (!isFormValid) {
      console.log(" Form is not valid, preventing submit");
      return;
    }
    
    console.log(" Form is valid, submitting...");
    onSubmit(values);
  };

  const isEdit = mode === "edit";
  const showDelete = onDelete && isEdit;

  return (
    <form onSubmit={handleSubmit} className={PET_FORM_STYLES.form} aria-label="Pet form">
      
      {serverError && <ErrorMessage message={serverError} />}

      <div className={PET_FORM_STYLES.grid.main}>
        
        <PetImageField 
          imageUrl={values.image} 
          onChange={handleImageChange} 
        />

        <div className="grid gap-4">
          
          <div className={PET_FORM_STYLES.grid.fields}>
            
            <TextInputField
              config={PET_FORM_FIELDS.name}
              value={values.name}
              onChange={handleInputChange}
              autoComplete="off"
            />
            
            <TextInputField
              config={PET_FORM_FIELDS.breed}
              value={values.breed}
              onChange={handleInputChange}
              autoComplete="off"
            />
            
            <TextInputField
              config={PET_FORM_FIELDS.ageMonth}
              value={values.ageMonth}
              onChange={handleInputChange}
              pattern="[0-9]*"
              autoComplete="off"
            />
            
            <TextInputField
              config={PET_FORM_FIELDS.color}
              value={values.color}
              onChange={handleInputChange}
              autoComplete="off"
            />
            
            <TextInputField
              config={PET_FORM_FIELDS.weightKg}
              value={values.weightKg}
              onChange={handleInputChange}
              autoComplete="off"
            />
            
            <SelectField
              name="type"
              label="Pet Type*"
              value={values.type}
              options={PET_TYPE_OPTIONS}
              onChange={handleInputChange}
            />
            
            <SelectField
              name="sex"
              label="Sex*"
              value={values.sex}
              options={PET_SEX_OPTIONS}
              onChange={handleInputChange}
            />
          </div>

          <TextAreaField 
            value={values.about} 
            onChange={handleInputChange} 
          />

          {showDelete && <DeleteButton onDelete={onDelete} />}

          <ActionButtons 
            mode={mode} 
            loading={loading} 
            onCancel={onCancel}
            disabled={!isFormValid || loading}
            isMobile 
          />
          <ActionButtons 
            mode={mode} 
            loading={loading} 
            onCancel={onCancel}
            disabled={!isFormValid || loading}
          />
        </div>
      </div>
    </form>
  );
}