import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useForm, Controller } from "react-hook-form";
import Sidebar from "@/components/layout/SitterSidebar";
import PetSitterNavbar from "@/components/PetSitterNavbar";
import { StatusBadge } from "@/components/badges/StatusBadge";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import AvatarUploader from "@/components/form/AvatarUpload";
import InputText from "@/components/input/InputText";
import InputTextArea from "@/components/input/InputTextArea";
import ImageGallery from "@/components/form/ImageGalleryUpload";
import PetTypeSelect, { PetType } from "@/components/fields/PetTypeSelect";
import { numberToLabel } from "@/lib/experience";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";

type SitterFormValues = {
  fullName: string;
  experience: string;
  phone: string;
  email: string;
  tradeName: string;
  petTypes: PetType[];
  introduction: string;
  location_description: string;
  service_description: string;
  address_detail: string;
  address_province: string;
  address_district: string;
  address_sub_district: string;
  address_post_code: string;
  profileImageUrl: string;
  images: string[];
};

type GetSitterResponse = {
  exists: boolean;
  user: {
    id: number;
    email: string;
    phone: string | null;
    name: string;
    profile_image: string | null;
  };
  sitter: null | {
    id: number;
    name: string | null;
    phone: string | null;
    experience: number | null;
    introduction: string | null;
    location_description: string | null;
    service_description: string | null;
    address_detail: string | null;
    address_province: string | null;
    address_district: string | null;
    address_sub_district: string | null;
    address_post_code: string | null;
    images: string[];
    petTypes: { id: number; name: string }[];
  };
};

const phonePattern = /^0\d{9}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function checkPhoneDuplicate(
  phone: string,
  excludeUserId?: number
): Promise<boolean> {
  try {
    const res = await fetch("/api/sitter/check-phone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, excludeUserId }),
    });
    if (res.status === 409) return true;
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.exists);
  } catch (err) {
    console.error("checkPhoneDuplicate error:", err);
    return false;
  }
}

async function checkEmailDuplicate(
  email: string,
  excludeUserId?: number
): Promise<boolean> {
  try {
    const res = await fetch("/api/sitter/check-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, excludeUserId }),
    });
    if (res.status === 409) return true;
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.exists);
  } catch (err) {
    console.error("checkEmailDuplicate error:", err);
    return false;
  }
}

export default function PetSitterProfilePage() {
  const [userId, setUserId] = useState<number | null>(null);
  const { status, update } = useSession();
  const [initialGallery, setInitialGallery] = useState<string[]>([]);

  type Province = { code: string; name: string };
  type District = { code: string; name: string };
  type Subdistrict = { code: string; name: string; postalCode: string };
  type AddressData = {
    provinces: Province[];
    districtsByProvince: Record<string, District[]>;
    subdistrictsByDistrict: Record<string, Subdistrict[]>;
  };

  const [addr, setAddr] = useState<AddressData | null>(null);
  const [provinceOpts, setProvinceOpts] = useState<Province[]>([]);
  const [districtOpts, setDistrictOpts] = useState<District[]>([]);
  const [subdistrictOpts, setSubdistrictOpts] = useState<Subdistrict[]>([]);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<SitterFormValues>({
    defaultValues: {
      fullName: "",
      experience: "",
      phone: "",
      email: "",
      tradeName: "",
      petTypes: [],
      introduction: "",
      location_description: "",
      service_description: "",
      address_detail: "",
      address_province: "",
      address_district: "",
      address_sub_district: "",
      address_post_code: "",
      profileImageUrl: "",
      images: [],
    },
    mode: "onBlur",
  });

  const watchProvince = watch("address_province");
  const watchDistrict = watch("address_district");
  const watchSubdistrict = watch("address_sub_district");

  useEffect(() => {
    register("address_province");
    register("address_district");
    register("address_sub_district");
  }, [register]);

  useEffect(() => {
    fetch("/th-address.json")
      .then((r) => r.json())
      .then((json: AddressData) => {
        setAddr(json);
        setProvinceOpts(json.provinces || []);
      })
      .catch((e) => console.error("load th-address.json failed:", e));
  }, []);

  // เมื่อเลือก province → สร้างลิสต์อำเภอ
  useEffect(() => {
    if (!addr || !watchProvince) {
      setDistrictOpts([]);
      setSubdistrictOpts([]);
      return;
    }
    const p = addr.provinces.find((x) => x.name === watchProvince);
    const districts = p ? addr.districtsByProvince[p.code] ?? [] : [];
    setDistrictOpts(districts);
  }, [addr, watchProvince]);

  // เมื่อเลือก district → สร้างลิสต์ตำบล + เติมรหัสไปรษณีย์ตามตำบลที่เลือก
  useEffect(() => {
    if (!addr || !watchProvince) {
      setSubdistrictOpts([]);
      return;
    }
    const p = addr.provinces.find((x) => x.name === watchProvince);
    const dList = p ? addr.districtsByProvince[p.code] ?? [] : [];
    const d = dList.find((x) => x.name === watchDistrict);
    const subs = d ? addr.subdistrictsByDistrict[d.code] ?? [] : [];
    setSubdistrictOpts(subs);

    // auto postcode เมื่อมีการเลือก subdistrict
    const s = subs.find((x) => x.name === watchSubdistrict);
    setValue("address_post_code", s?.postalCode ?? "", { shouldDirty: true });
  }, [addr, watchProvince, watchDistrict, watchSubdistrict, setValue]);

  const onProvinceChange = (provName: string) => {
    setValue("address_province", provName, { shouldDirty: true });
    setValue("address_district", "", { shouldDirty: true });
    setValue("address_sub_district", "", { shouldDirty: true });
    setValue("address_post_code", "", { shouldDirty: true });
  };
  
  const onDistrictChange = (distName: string) => {
    setValue("address_district", distName, { shouldDirty: true });
    setValue("address_sub_district", "", { shouldDirty: true });
    setValue("address_post_code", "", { shouldDirty: true });
  };
  
  const onSubdistrictChange = (subName: string) => {
    setValue("address_sub_district", subName, { shouldDirty: true });
  };

  useEffect(() => {
    if (!addr || !profileLoaded) return;
  
    const pName = getValues("address_province");
    const dName = getValues("address_district");
    const sName = getValues("address_sub_district");
  
    const p = addr.provinces.find(x => x.name === pName);
    const dList = p ? addr.districtsByProvince[p.code] ?? [] : [];
    setDistrictOpts(dList);
  
    const d = dList.find(x => x.name === dName);
    const subs = d ? addr.subdistrictsByDistrict[d.code] ?? [] : [];
    setSubdistrictOpts(subs);
  
    const s = subs.find(x => x.name === sName);
    setValue("address_post_code", s?.postalCode ?? "", { shouldDirty: false });
  }, [addr, profileLoaded, getValues, setValue]);

  useEffect(() => {
    if (status === "loading") return;
    (async () => {
      try {
        const res = await fetch("/api/sitter/get-profile-sitter");
        if (res.status === 401) return;
        if (!res.ok) {
          console.warn("get-sitter failed", res.status);
          return;
        }
        const data: GetSitterResponse = await res.json();
        setUserId(data.user.id);

        reset({
          fullName: data.user.name || "",
          experience: numberToLabel(data.sitter?.experience), // map number -> label
          phone: data.sitter?.phone || data.user.phone || "",
          email: data.user.email || "",
          tradeName: data.sitter?.name || "",
          petTypes: (data.sitter?.petTypes || []).map(
            (p) => p.name
          ) as PetType[],
          introduction: data.sitter?.introduction || "",
          location_description: data.sitter?.location_description || "",
          service_description: data.sitter?.service_description || "",
          address_detail: data.sitter?.address_detail || "",
          address_province: data.sitter?.address_province || "",
          address_district: data.sitter?.address_district || "",
          address_sub_district: data.sitter?.address_sub_district || "",
          address_post_code: data.sitter?.address_post_code || "",
          profileImageUrl: data.user.profile_image || "",
          images: data.sitter?.images || [],
        });
        setInitialGallery(data.sitter?.images || []);
        setProfileLoaded(true);
      } catch (error) {
        console.error("load profile error:", error);
      }
    })();
  }, [status, reset]);

  const onSubmit = handleSubmit(async (values) => {
    await toast.promise(
      (async () => {
        const res = await fetch("/api/sitter/put-sitter", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.message || "Failed to update sitter");
        }
        await update(); // refresh session ถ้ามีการเปลี่ยนอีเมล/ชื่อ ฯลฯ
      })(),
      {
        loading: "Saving profile...",
        success: "Profile updated successfully",
        error: (e) => e.message || "Failed to update sitter",
      }
    );
  });

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
        <form onSubmit={onSubmit} className="mr-auto px-6 py-8">
          <div className="flex justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-gray-9 font-semibold text-2xl">
                Pet Sitter Profile
              </h3>
              <StatusBadge status="approved" className="font-medium" />
            </div>
            <PrimaryButton
              text={isSubmitting ? "Saving..." : "Update"}
              type="submit"
              bgColor="primary"
              textColor="white"
            />
          </div>

          {/* Basic Information */}
          <section className="bg-white rounded-xl pt-4 pb-7 px-12 mt-4">
            <h4 className="text-gray-4 font-bold text-xl py-4">
              Basic Information
            </h4>
            <div className="grid grid-cols-1">
              <div className="pb-4 col-span-1">
                <p className="pb-4 font-medium text-black">Profile Image</p>
                <AvatarUploader
                  onChange={(file) => {
                    // preview เท่านั้น;
                  }}
                />
              </div>

              <div className="md:col-span-2">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Full name */}
                  <div>
                    <InputText
                      placeholder=""
                      label="Your full name*"
                      type="text"
                      variant={errors.fullName ? "error" : "default"}
                      className="w-full"
                      {...register("fullName", {
                        required: "Please enter your full name.",
                        minLength: {
                          value: 6,
                          message: "Full name must be 6–20 characters.",
                        },
                        maxLength: {
                          value: 20,
                          message: "Full name must be 6–20 characters.",
                        },
                      })}
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red">
                        {errors.fullName.message}
                      </p>
                    )}
                  </div>

                  {/* Experience */}
                  <div className="flex flex-col gap-1">
                    <label className="font-medium text-black">
                      Experience*
                    </label>
                    <Controller
                      name="experience"
                      control={control}
                      rules={{ required: "Please select your experience." }}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger
                            className={` w-full rounded-xl !h-12 px-4 py-2 border !border-gray-2 ${
                              errors.experience
                                ? "!border-red focus:ring-red"
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
                      )}
                    />
                    {errors.experience && (
                      <p className="mt-1 text-sm text-red">
                        {errors.experience.message}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <InputText
                      placeholder=""
                      label="Phone Number*"
                      type="tel"
                      inputMode="numeric"
                      variant={errors.phone ? "error" : "default"}
                      className="w-full"
                      {...register("phone", {
                        required: "Please enter your phone number.",
                        validate: {
                          format: (v) =>
                            phonePattern.test(v)
                              ? true
                              : "Phone number must start with 0 and be 10 digits.",
                          unique: async (v) => {
                            if (!v || !userId) return true;
                            try {
                              const dup = await checkPhoneDuplicate(v, userId);
                              return dup
                                ? "Phone number already exists."
                                : true;
                            } catch {
                              return true;
                            }
                          },
                        },
                      })}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <InputText
                      placeholder=""
                      label="Email*"
                      type="email"
                      variant={errors.email ? "error" : "default"}
                      className="w-full"
                      {...register("email", {
                        required: "Please enter your email address.",
                        validate: {
                          format: (v) =>
                            emailPattern.test(v)
                              ? true
                              : "Invalid email format.",
                          unique: async (v) => {
                            if (!v || !userId) return true;
                            try {
                              const dup = await checkEmailDuplicate(v, userId);
                              return dup ? "Email already exists." : true;
                            } catch {
                              return true;
                            }
                          },
                        },
                      })}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Introduction */}
                  <div className="md:col-span-2">
                    <InputTextArea
                      placeholder=""
                      label="Introduction (Describe about yourself as pet sitter)"
                      className="w-full"
                      {...register("introduction")}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Pet Sitter */}
          <section className="bg-white rounded-xl py-4 px-12 mt-4 pb-7">
            <h4 className="text-gray-4 font-bold text-xl py-4">Pet Sitter</h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-1">
                <InputText
                  placeholder=""
                  label="Pet sitter name (Trade Name)*"
                  type="text"
                  variant={errors.tradeName ? "error" : "default"}
                  {...register("tradeName", {
                    required: "Please enter your trade name.",
                  })}
                />
                {errors.tradeName && (
                  <p className="mt-1 text-sm text-red">
                    {errors.tradeName.message}
                  </p>
                )}
              </div>

              <div className="col-span-2">
                <label className="block text-[16px] font-medium text-black mb-2">
                  Pet type
                </label>
                <Controller
                  name="petTypes"
                  control={control}
                  rules={{
                    validate: (arr) =>
                      (Array.isArray(arr) && arr.length > 0) ||
                      "Please select at least one pet type.",
                  }}
                  render={({ field }) => (
                    <PetTypeSelect
                      value={field.value}
                      onChange={(vals) => field.onChange(vals)}
                      error={!!errors.petTypes}
                    />
                  )}
                />
                {errors.petTypes && (
                  <p className="mt-2 text-sm text-red">
                    {String(errors.petTypes.message)}
                  </p>
                )}
              </div>

              <div className="col-span-2">
                <InputTextArea
                  label="Services (Describe all of your service for pet sitting)"
                  {...register("service_description")}
                />
              </div>

              <div className="col-span-2">
                <InputTextArea
                  label="My Place (Describe you place)"
                  {...register("location_description")}
                />
              </div>

              <div className="col-span-2">
                <p className="font-medium text-black pb-4">
                  Image Gellery (Maximum 10 images)
                </p>
                <ImageGallery
                  initialImageUrls={initialGallery}
                  onChange={(state) => {
                    setValue("images", state.existingImageUrls, {
                      shouldDirty: true,
                    });
                  }}
                />
              </div>
            </div>
          </section>

          {/* Address */}
          <section className="bg-white rounded-xl py-4 px-12 mt-4 pb-7">
            <h4 className="text-gray-4 font-bold text-xl pt-4">Address</h4>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <InputText
                  placeholder=""
                  label="Address detail*"
                  type="text"
                  variant="default"
                  {...register("address_detail")}
                />
              </div>

              {/* Province */}
              <div className="flex flex-col gap-1">
                <label className="font-medium text-black">Province*</label>
                <Select
                  onValueChange={onProvinceChange}
                  value={watchProvince || undefined}
                >
                  <SelectTrigger className="!h-12 w-full rounded-xl border border-gray-2 px-4 text-left">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-2 max-h-72 overflow-auto">
                    {provinceOpts.map((p) => (
                      <SelectItem key={p.code} value={p.name}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* District */}
              <div className="flex flex-col gap-1">
                <label className="font-medium text-black">District*</label>
                <Select
                  onValueChange={onDistrictChange}
                  value={watchDistrict || undefined}
                >
                  <SelectTrigger className="!h-12 w-full rounded-xl border border-gray-2 px-4 text-left">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-2 max-h-72 overflow-auto">
                    {districtOpts.map((d) => (
                      <SelectItem key={d.code} value={d.name}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sub-district */}
              <div className="flex flex-col gap-1">
                <label className="font-medium text-black">Sub-district*</label>
                <Select
                  onValueChange={onSubdistrictChange}
                  value={watchSubdistrict || undefined}
                >
                  <SelectTrigger className="!h-12 w-full rounded-xl border border-gray-2 px-4 text-left">
                    <SelectValue/>
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-2 max-h-72 overflow-auto">
                    {subdistrictOpts.map((s) => (
                      <SelectItem key={s.code} value={s.name}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <InputText
                  placeholder=""
                  label="Post code*"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  variant="default"
                  readOnly
                  {...register("address_post_code")}
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
      <Toaster position="top-right" />
    </main>
  );
}
