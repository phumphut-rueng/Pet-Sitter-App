import { useState, useEffect, useMemo } from "react";
import { PetFormProps, PetFormValues } from "@/types/pet.types";
import {
  EMPTY_PET_FORM_VALUES,
  PET_FORM_FIELDS,
  PET_TYPE_OPTIONS,
  PET_SEX_OPTIONS,
  PET_FORM_STYLES,
} from "./pet-form.config";
import {
  fileToDataURL,
  sanitizeAgeInput,
  sanitizeWeightInput,
} from "@/lib/pet/pet-utils";
import { TextInputField } from "@/components/fields/TextInputField";
import { SelectField } from "@/components/fields/SelectField";
import { TextAreaField } from "@/components/fields/TextAreaField";
import { PetImageField } from "@/components/fields/PetImageField";
import { ActionButtons } from "@/components/fields/ActionButtons";
import { Trash2 } from "lucide-react";

function ErrorMessage({ message }: { message: string }) {
  return <div className={PET_FORM_STYLES.error}>{message}</div>;
}

function DeleteButton({ onDelete }: { onDelete: () => void }) {
  return (
    <div className="mt-2 flex justify-center md:justify-start">
      <button
        type="button"
        onClick={onDelete}
        className={PET_FORM_STYLES.button.delete}
        aria-label="Delete pet"
      >
        <Trash2 className="w-5 h-5" strokeWidth={2.2} />
        <span>Delete Pet</span>
      </button>
    </div>
  );
}

export default function PetForm({
  mode,
  initialValues,
  loading = false,
  serverError,
  onSubmit,
  onCancel,
  onDelete,
}: PetFormProps) {
  const [values, setValues] = useState<PetFormValues>({
    ...EMPTY_PET_FORM_VALUES,
    ...initialValues,
  });

  useEffect(() => {
    if (!initialValues) return;
    setValues((prev) => ({ ...prev, ...initialValues }));
  }, [initialValues]);

  const isFormValid = useMemo(() => {
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

  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>
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
    if (!isFormValid) {
      return;
    }
    onSubmit(values);
  };

  const isEdit = mode === "edit";
  const showDelete = onDelete && isEdit;

  return (
    <form onSubmit={handleSubmit} className={PET_FORM_STYLES.form} aria-label="Pet form">
      {serverError && <ErrorMessage message={serverError} />}

      <div className={PET_FORM_STYLES.grid.main}>
        <PetImageField imageUrl={values.image} onChange={handleImageChange} />

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

          <TextAreaField value={values.about} onChange={handleInputChange} />

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