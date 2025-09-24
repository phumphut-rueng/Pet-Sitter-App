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
  image: string; // เก็บเป็น URL / data URL
};

type PetFormProps = {
  mode: "create" | "edit";
  initialValues?: Partial<PetFormValues>;
  loading?: boolean;
  serverError?: string | null;
  onSubmit: (values: PetFormValues) => void;
  onCancel: () => void;
  onDelete?: () => void; // โชว์ปุ่มลบเมื่อมี
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

  const [preview, setPreview] = React.useState<string>(initialValues?.image ?? "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  };

  const handleImageFile = async (file?: File) => {
    if (!file) {
      setValues((v) => ({ ...v, image: "" }));
      setPreview("");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const url = typeof reader.result === "string" ? reader.result : "";
      setPreview(url);
      setValues((v) => ({ ...v, image: url }));
    };
    reader.readAsDataURL(file);
  };

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <form onSubmit={submitForm} className="space-y-6">

      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-bold text-ink">{mode === "edit" ? "Edit Pet" : "Create Pet"}</h2>
        <div className="flex items-center gap-2">
          {onDelete && mode === "edit" && (
            <button
              type="button"
              onClick={onDelete}
              className="h-10 rounded-full bg-orange-1/40 px-4 text-[14px] font-medium text-orange-6 hover:bg-orange-1/60 transition"
            >
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="h-10 rounded-full border border-border bg-white px-4 text-[14px] font-medium text-ink hover:bg-muted/40 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="h-10 rounded-full bg-brand px-5 text-[14px] font-bold text-white hover:brightness-95 hover:shadow disabled:opacity-50 transition"
          >
            {loading ? "Saving..." : mode === "edit" ? "Save Changes" : "Create"}
          </button>
        </div>
      </div>

      {serverError && (
        <div className="rounded-lg bg-pink/10 p-3 text-[14px] text-pink ring-1 ring-pink/30">{serverError}</div>
      )}


      <div className="grid gap-6 md:grid-cols-[220px,1fr]">

        <div className="space-y-3">
          <div className="text-[14px] font-medium text-muted-text">Pet Image</div>


          <div className="relative h-24 w-24 overflow-hidden rounded-md bg-muted ring-1 ring-border">
            {preview ? (
              <Image src={preview} alt="Pet preview" fill sizes="96px" className="object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center text-[12px] text-muted-text">No image</div>
            )}
          </div>

          <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-border px-3 py-2 text-[13px] font-medium text-ink hover:bg-muted/40 transition">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageFile(e.target.files?.[0])}
            />
            Upload Image
          </label>
        </div>


        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-[14px] font-medium text-muted-text">Name</label>
              <input
                name="name"
                value={values.name}
                onChange={handleChange}
                placeholder="Your pet name"
                className="mt-1 h-10 w-full rounded-md border border-border bg-white px-3 text-[14px] text-ink placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-brand ring-offset-2 ring-offset-bg"
              />
            </div>

            <div>
              <label className="text-[14px] font-medium text-muted-text">Type</label>
              <select
                name="type"
                value={values.type}
                onChange={handleChange}
                className="mt-1 h-10 w-full rounded-md border border-border bg-white px-3 text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-brand ring-offset-2 ring-offset-bg"
              >
                <option value="">Select type</option>
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
                <option value="Bird">Bird</option>
                <option value="Rabbit">Rabbit</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-[14px] font-medium text-muted-text">Breed</label>
              <input
                name="breed"
                value={values.breed}
                onChange={handleChange}
                placeholder="e.g., Pomeranian"
                className="mt-1 h-10 w-full rounded-md border border-border bg-white px-3 text-[14px] text-ink placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-brand ring-offset-2 ring-offset-bg"
              />
            </div>

            <div>
              <label className="text-[14px] font-medium text-muted-text">Sex</label>
              <select
                name="sex"
                value={values.sex}
                onChange={handleChange}
                className="mt-1 h-10 w-full rounded-md border border-border bg-white px-3 text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-brand ring-offset-2 ring-offset-bg"
              >
                <option value="">Select sex</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label className="text-[14px] font-medium text-muted-text">Age (months)</label>
              <input
                name="ageMonth"
                value={values.ageMonth}
                onChange={handleChange}
                placeholder="e.g., 6"
                inputMode="numeric"
                className="mt-1 h-10 w-full rounded-md border border-border bg-white px-3 text-[14px] text-ink placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-brand ring-offset-2 ring-offset-bg"
              />
            </div>

            <div>
              <label className="text-[14px] font-medium text-muted-text">Color</label>
              <input
                name="color"
                value={values.color}
                onChange={handleChange}
                placeholder="e.g., Brown"
                className="mt-1 h-10 w-full rounded-md border border-border bg-white px-3 text-[14px] text-ink placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-brand ring-offset-2 ring-offset-bg"
              />
            </div>

            <div>
              <label className="text-[14px] font-medium text-muted-text">Weight (kg)</label>
              <input
                name="weightKg"
                value={values.weightKg}
                onChange={handleChange}
                placeholder="e.g., 3.5"
                inputMode="decimal"
                className="mt-1 h-10 w-full rounded-md border border-border bg-white px-3 text-[14px] text-ink placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-brand ring-offset-2 ring-offset-bg"
              />
            </div>
          </div>

          <div>
            <label className="text-[14px] font-medium text-muted-text">About</label>
            <textarea
              name="about"
              value={values.about}
              onChange={handleChange}
              placeholder="Short description, habits, etc."
              rows={4}
              className="mt-1 w-full rounded-md border border-border bg-white p-3 text-[14px] text-ink placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-brand ring-offset-2 ring-offset-bg"
            />
          </div>
        </div>
      </div>
    </form>
  );
}