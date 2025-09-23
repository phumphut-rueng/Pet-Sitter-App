import Sidebar from "@/components/layout/SitterSidebar";
import PetSitterNavbar from "@/components/PetSitterNavbar";
import { StatusBadge } from "@/components/badges/StatusBadge";
import PrimaryButton from "@/components/buttons/primaryButton";
import AvatarUploader from "@/components/form/AvatarUpload";
import InputText from "@/components/input/InputText";
import InputTextArea from "@/components/input/InputTextArea";
import ImageGallery from "@/components/form/ImageGalleryUpload";
import PetTypeSelect from "@/components/fields/PetTypeSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useState } from "react";
import Image from "next/image";

type ValidationErrors = {
  fullName?: string;
  experience?: string;
  phone?: string;
  email?: string;
  tradeName?: string;
  petTypes?: string;
};

export default function PetSitterProfilePage() {
  const [petTypes, setPetTypes] = useState<string[]>([]);

  const [formValues, setFormValues] = useState({
    fullName: "",
    experience: "",
    phone: "",
    email: "",
    tradeName: "",
    petTypes: [] as string[],
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const phonePattern = /^0\d{9}$/;
  const emailPattern = /^[^\s@]+@[^\s@]+\.com$/i;

  function handleFormSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: ValidationErrors = {};

    const fullNameLength = formValues.fullName.length;
    if (!fullNameLength) nextErrors.fullName = "Please enter your full name.";
    else if (fullNameLength < 6 || fullNameLength > 20)
      nextErrors.fullName = "Full name must be 6–20 characters.";

    if (!formValues.experience)
      nextErrors.experience = "Please select your experience.";

    if (!formValues.phone) nextErrors.phone = "Please enter your phone number.";
    else if (!phonePattern.test(formValues.phone))
      nextErrors.phone = "Phone number must start with 0 and be 10 digits.";

    if (!formValues.email)
      nextErrors.email = "Please enter your email address.";
    else if (!emailPattern.test(formValues.email))
      nextErrors.email = "Email address must include '@' and end with '.com'.";

    if (!formValues.tradeName.trim())
      nextErrors.tradeName = "Please enter your trade name.";

    if (!Array.isArray(formValues.petTypes) || formValues.petTypes.length === 0)
      nextErrors.petTypes = "Please select at least one pet type.";

    setValidationErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      setIsSubmitting(true);
      setTimeout(() => {
        alert("✅ All inputs are valid (demo, no API call).");
        setIsSubmitting(false);
      }, 200);
    }
  }

  return (
    <main className="flex container-1200 !px-0 bg-gray-1">
      <aside className="min-w-0">
        <Sidebar />
      </aside>
      <section className="flex-1 min-w-0">
        <PetSitterNavbar
          avatarUrl="/images/cards/jane-maison.svg"
          name="Jane Maison"
        />
        <form onSubmit={handleFormSubmit} className="mr-auto px-6 py-8">
          <div className="flex justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-gray-9 font-semibold text-2xl">
                Pet Sitter Profile
              </h3>
              <StatusBadge status="approved" className="font-medium" />
            </div>
            <div>
              <PrimaryButton
                text={isSubmitting ? "Checking..." : "Update"}
                type="submit"
                bgColor="primary"
                textColor="white"
              />
            </div>
          </div>

          {/* basic information */}
          <section className="bg-white rounded-xl pt-4 pb-7 px-12 mt-4">
            <h4 className="text-gray-4 font-bold text-xl py-4">
              Basic Information
            </h4>
            <div className="grid grid-cols-1">
              <div className="pb-4 col-span-1">
                <p className="pb-4 font-medium text-black">Profile Image</p>
                <AvatarUploader />
              </div>
              <div className="md:col-span-2">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <InputText
                      label="Your full name*"
                      type="text"
                      value={formValues.fullName}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          fullName: event.target.value,
                        }))
                      }
                      variant={validationErrors.fullName ? "error" : "default"}
                      className="w-full"
                    />
                    {validationErrors.fullName && (
                      <p className="mt-1 text-sm text-red">
                        {validationErrors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Experience เป็น dropdown */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[16px] font-medium text-black">
                      Experience*
                    </label>
                    <Select
                      value={formValues.experience}
                      onValueChange={(value) =>
                        setFormValues((prev) => ({
                          ...prev,
                          experience: value,
                        }))
                      }
                    >
                      <SelectTrigger
                        className={` w-full rounded-xl !h-12 px-4 py-2 border border-gray-2 ${
                          validationErrors.experience
                            ? "border-red focus:ring-red"
                            : "border-gray-3"
                        }`}
                      >
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-2">
                        <SelectItem value="0-2 Years">0-2 Years</SelectItem>
                        <SelectItem value="3-5 Years">3-5 Years</SelectItem>
                        <SelectItem value="5+ Years">5+ Years</SelectItem>
                      </SelectContent>
                    </Select>
                    {validationErrors.experience && (
                      <p className="mt-1 text-sm text-red">
                        {validationErrors.experience}
                      </p>
                    )}
                  </div>
                  <div>
                    <InputText
                      label="Phone Number*"
                      type="tel"
                      inputMode="numeric"
                      value={formValues.phone}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          phone: event.target.value.trim(),
                        }))
                      }
                      variant={validationErrors.phone ? "error" : "default"}
                      className="w-full"
                    />
                    {validationErrors.phone && (
                      <p className="mt-1 text-sm text-red">
                        {validationErrors.phone}
                      </p>
                    )}
                  </div>
                  <div>
                  <InputText
                    label="Email*"
                    type="email"
                    value={formValues.email}
                    onChange={(event) => setFormValues((prev) => ({ ...prev, email: event.target.value}))}
                    variant={validationErrors.email ? "error" : "default"}
                    className="w-full"
                  />
                  {validationErrors.email && (
                  <p className="mt-1 text-sm text-red">{validationErrors.email}</p>
                )}
                  </div>
                  <div className="md:col-span-2">
                    <InputTextArea
                      label="Introduction (Describe about yourself as pet sitter)"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* pet sitter */}
          <section className="bg-white rounded-xl py-4 px-12 mt-4 pb-7">
            <h4 className="text-gray-4 font-bold text-xl py-4">Pet Sitter</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-1">
                <InputText
                  label="Pet sitter name (Trade Name)*"
                  type="text"
                  value={formValues.tradeName}
                  onChange={(event) => setFormValues((prev) => ({ ...prev, tradeName: event.target.value}))}
                  variant={validationErrors.tradeName ? "error" : "default"}
                />
                {validationErrors.tradeName && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.tradeName}</p>
                )}
              </div>
              <div className="col-span-2">
                <label className="block text-[16px] font-medium text-black mb-2">
                  Pet type
                </label>
                <PetTypeSelect value={formValues.petTypes} onChange={(newValues) => setFormValues((prev) => ({ ...prev, petTypes: newValues}))} />
                {validationErrors.petTypes && (
                  <p className="mt-2 text-sm text-red">{validationErrors.petTypes}</p>
                )}
              </div>
              <div className="col-span-2">
                <InputTextArea label="Services (Describe all of your service for pet sitting)" />
              </div>
              <div className="col-span-2">
                <InputTextArea label="My Place (Describe you place)" />
              </div>
              <div className="col-span-2">
                <p className="font-medium text-black pb-4">
                  Image Gellery (Maximum 10 images)
                </p>
                <ImageGallery />
              </div>
            </div>
          </section>

          {/* address */}
          <section className="bg-white rounded-xl py-4 px-12 mt-4 pb-7">
            <h4 className="text-gray-4 font-bold text-xl pt-4">Address</h4>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {/* Address detail เต็มแถว */}
              <div className="md:col-span-2">
                <InputText
                  label="Address detail*"
                  type="text"
                  variant="default"
                />
              </div>

              {/* District */}
              <div>
                <label htmlFor="district" className="font-medium text-black">
                  District*
                </label>
                <Select>
                  <SelectTrigger className="!h-12 w-full rounded-xl border border-gray-2 px-4 text-left">
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-2">
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sub-district */}
              <div>
                <label htmlFor="subdistrict" className="font-medium text-black">
                  Sub-district*
                </label>
                <Select>
                  <SelectTrigger className="!h-12 w-full rounded-xl border border-gray-2 px-4 text-left">
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-2">
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Province */}
              <div>
                <label htmlFor="province" className="font-medium text-black">
                  Province*
                </label>
                <Select>
                  <SelectTrigger className="!h-12 w-full rounded-xl border border-gray-2 px-4 text-left">
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-2">
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <InputText
                  label="Post code*"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  variant="default"
                />
              </div>

              <div className="md:col-span-2">
                <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-gray-2 bg-gray-1">
                  <Image
                    src="/images/map.svg"
                    alt="Map preview"
                    fill
                    className="object-cover"
                    priority={false}
                  />
                </div>
              </div>
            </div>
          </section>
        </form>
      </section>
    </main>
  );
}
