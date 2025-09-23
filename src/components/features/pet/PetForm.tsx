import * as React from "react";
import type { PetFormValues } from "@/types/pet.types";

type PetFormProps = {
  mode: "create" | "edit";
  initialValues?: Partial<PetFormValues>;
  loading?: boolean;
  serverError?: string | null;
  onSubmit: (values: PetFormValues) => void;
  onCancel: () => void;
  onDelete?: () => void;
};

const emptyValues: PetFormValues = {
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
    ...emptyValues,
    ...initialValues,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
  };

  // อัปโหลดรูป + พรีวิวในวงกลม
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setValues((v) => ({ ...v, image: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-32 h-32 rounded-full bg-slate-200 grid place-items-center overflow-hidden ring-1 ring-slate-200">
          {values.image ? (
            <img
              src={values.image}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-slate-500">🐾</span>
          )}
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-orange-50 px-3 py-2 text-sm font-medium text-orange-600">
          <input type="file" className="hidden" accept="image/*" onChange={handleFile} />
          <span>Upload</span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="text-sm font-medium">Pet Name*</label>
          <input
            name="name"
            value={values.name}
            onChange={handleChange}
            className="mt-1 w-full rounded-xl px-3 py-2 ring-1 ring-slate-200 focus:outline-none"
            placeholder="e.g., Milo"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Breed*</label>
          <input
            name="breed"
            value={values.breed}
            onChange={handleChange}
            className="mt-1 w-full rounded-xl px-3 py-2 ring-1 ring-slate-200"
            placeholder="e.g., Golden Retriever"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Pet Type*</label>
          <input
            name="type"
            value={values.type}
            onChange={handleChange}
            className="mt-1 w-full rounded-xl px-3 py-2 ring-1 ring-slate-200"
            placeholder="e.g., Dog, Cat"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Sex*</label>
          <input
            name="sex"
            value={values.sex}
            onChange={handleChange}
            className="mt-1 w-full rounded-xl px-3 py-2 ring-1 ring-slate-200"
            placeholder="Male / Female"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Age (Month)*</label>
          <input
            name="ageMonth"
            value={values.ageMonth}
            onChange={handleChange}
            className="mt-1 w-full rounded-xl px-3 py-2 ring-1 ring-slate-200"
            placeholder="e.g., 8"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Weight (Kilogram)*</label>
          <input
            name="weightKg"
            value={values.weightKg}
            onChange={handleChange}
            className="mt-1 w-full rounded-xl px-3 py-2 ring-1 ring-slate-200"
            placeholder="e.g., 5.2"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-sm font-medium">Color*</label>
          <input
            name="color"
            value={values.color}
            onChange={handleChange}
            className="mt-1 w-full rounded-xl px-3 py-2 ring-1 ring-slate-200"
            placeholder="e.g., Brown/White"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">About</label>
        <textarea
          name="about"
          value={values.about}
          onChange={handleChange}
          className="mt-1 w-full rounded-xl px-3 py-2 ring-1 ring-slate-200 min-h-[120px]"
          placeholder="Tell us about your pet’s personality, habits, etc."
        />
      </div>

      {serverError ? (
        <p className="text-sm text-red-600">{serverError}</p>
      ) : null}

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full bg-orange-50 px-5 py-2.5 text-sm font-medium text-orange-600"
        >
          Cancel
        </button>
        <button
          disabled={loading}
          className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
        >
          {mode === "create" ? "Create Pet" : "Update Pet"}
        </button>

        {mode === "edit" && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="ml-auto text-sm font-medium text-red-600 hover:underline"
          >
            Delete Pet
          </button>
        )}
      </div>
    </form>
  );
}