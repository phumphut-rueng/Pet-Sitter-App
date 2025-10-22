import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useForm, Controller } from "react-hook-form";
import Sidebar from "@/components/layout/SitterSidebar";
import PetSitterNavbar from "@/components/PetSitterNavbar";
import { StatusBadge, StatusKey } from "@/components/badges/StatusBadge";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import AvatarUploader from "@/components/form/AvatarUpload";
import InputText from "@/components/input/InputText";
import InputTextArea from "@/components/input/InputTextArea";
import ImageGallery from "@/components/form/ImageGalleryUpload";
import PetTypeSelect, { PetType } from "@/components/fields/PetTypeSelect";
import { numberToLabel } from "@/lib/utils/experience";
import toast, { Toaster } from "react-hot-toast";
import { uploadToCloudinary } from "@/lib/cloudinary/upload-to-cloudinary";
import AddressSection from "@/components/form/AddressSection";
import type { SitterFormValues } from "@/components/types/SitterForms";
import { validatePhone, validateEmail } from "@/lib/validators/validation";
import { PetPawLoading } from "@/components/loading/PetPawLoading";
import { CustomSelect } from "@/components/dropdown/CustomSelect";
import { experienceNotAllSelect } from "@/lib/utils/data-select";

type GetSitterResponse = {
  exists: boolean;
  user: {
    id: number;
    email: string;
    phone: string | null;
    name: string;
    profile_image: string | null;
    sitter_approval_status?: {
      status_name: string;
    };
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
    latitude: number | null;
    longitude: number | null;
    images: string[];
    petTypes: { id: number; name: string }[];
  };
};

const phonePattern = /^0\d{9}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getStatusKey(status: string): StatusKey {
  switch (status) {
    case "Pending submission":
      return "pendingSubmission";
    case "Waiting for approve":
      return "waitingApprove";
    case "Approved":
      return "approved";
    case "Rejected":
      return "rejected";
    default:
      return "waitingApprove"; // fallback
  }
}

export default function PetSitterProfilePage() {
  const { status, update } = useSession();
  const [initialGallery, setInitialGallery] = useState<string[]>([]); //รูปที่โหลดมาจาก database
  const [approvalStatus, setApprovalStatus] = useState<string>("");
  const [currentPhone, setCurrentPhone] = useState<string>("");
  const [currentEmail, setCurrentEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [sitterData, setSitterData] = useState<{
    id: number;
    name: string | null;
    location_description: string | null;
    phone: string | null;
    introduction: string | null;
    address_detail: string | null;
    address_province: string | null;
    address_district: string | null;
    address_sub_district: string | null;
    address_post_code: string | null;
    base_price: string | null;
    experience: number | null;
    service_description: string | null;
    approval_status_id: number;
    admin_note?: string | null;
    sitter_image?: Array<{ id: number; image_url: string }>;
    sitter_pet_type?: Array<{ pet_type: { pet_type_name: string } }>;
    petTypes?: Array<{ pet_type: { pet_type_name: string } }>;
  } | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    getValues,
    setError,
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
      latitude: undefined,
      longitude: undefined,
      profileImageUrl: "",
      images: [],
      newImageFiles: [],
    },
    mode: "onBlur",
    shouldUnregister: false,
  });

  useEffect(() => {
    if (status === "loading") return;
    (async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get<GetSitterResponse>(
          "/api/sitter/get-profile-sitter"
        );
        setCurrentPhone(data.sitter?.phone || data.user.phone || "");
        setCurrentEmail(data.user.email || "");
        setApprovalStatus(
          data.user.sitter_approval_status?.status_name || "Waiting for approve"
        );
        setSitterData(data.sitter as typeof sitterData);

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
          latitude: data.sitter?.latitude ?? undefined,
          longitude: data.sitter?.longitude ?? undefined,
          profileImageUrl: data.user.profile_image || "",
          images: data.sitter?.images || [],
        });
        setInitialGallery(data.sitter?.images || []);
      } catch (error) {
        console.error("load profile error:", error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [status, reset]);

  {/* nuk แก้ Loading */ }
  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center h-screen">
  //       <PetPawLoading
  //         message="Loading Pet"
  //         size="lg"
  //         baseStyleCustum="flex items-center justify-center w-full h-full"
  //       />
  //     </div>
  //   );
  // }

  //ฟังก์ชันตรวจสอบข้อมูลพื้นฐานที่จำเป็นสำหรับ Request for Approval
  const validateBasicFields = () => {
    const values = getValues();
    const basicErrors: string[] = [];

    // ตรวจสอบเฉพาะฟิลด์พื้นฐาน
    if (!values.fullName || values.fullName.trim() === "") {
      basicErrors.push("Full name is required");
    }

    if (!values.experience || values.experience === "") {
      basicErrors.push("Experience is required");
    }

    if (!values.phone || values.phone.trim() === "") {
      basicErrors.push("Phone number is required");
    } else if (!phonePattern.test(values.phone)) {
      basicErrors.push(
        "Phone number must be in format 0XXXXXXXXX (10 digits starting with 0)"
      );
    }

    if (!values.email || values.email.trim() === "") {
      basicErrors.push("Email is required");
    } else if (!emailPattern.test(values.email)) {
      basicErrors.push("Email format is invalid");
    }

    if (!values.introduction || values.introduction.trim() === "") {
      basicErrors.push("Introduction is required");
    }

    return basicErrors;
  };

  // ฟังก์ชันสำหรับ Request for Approval
  const handleRequestApproval = async () => {
    // ตรวจสอบข้อมูลพื้นฐานที่จำเป็นก่อน
    const basicErrors = validateBasicFields();

    if (basicErrors.length > 0) {
      toast.error("Please complete and verify all required information.", {
        duration: 5000,
        style: {
          maxWidth: "400px",
          fontSize: "14px",
        },
      });
      return;
    }

    try {
      const values = getValues();
      console.log("📤 Sending data:", {
        fullName: values.fullName,
        experience: values.experience,
        phone: values.phone,
        email: values.email,
        introduction: values.introduction,
      });

      const response = await fetch("/api/sitter/request-approval", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: values.fullName,
          experience: values.experience,
          phone: values.phone,
          email: values.email,
          introduction: values.introduction,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(" Success response:", result);

        // แสดง toast แจ้งเตือนสำเร็จ (2 วินาที)
        toast.success("Request for approval submitted successfully!", {
          duration: 3000,
        });

        // แสดง toast บอกว่าจะ refresh (2 วินาที)
        setTimeout(() => {
          toast("Refreshing page to update status...", {
            duration: 3000,
            style: {
              background: "#3b82f6",
              color: "white",
            },
          });
        }, 1000);

        // รีเฟรชหน้าหลังจาก 4 วินาที
        setTimeout(() => {
          window.location.reload();
        }, 4000);
      } else {
        const errorData = await response.json();
        console.error("❌ Error response:", errorData);
        toast.error(
          `Failed to submit request for approval: ${errorData.message || "Unknown error"
          }`
        );
      }
    } catch (error) {
      console.error("Error requesting approval:", error);
      toast.error("An error occurred while submitting request");
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    await toast.promise(
      (async () => {
        //อัปโหลดรูปใหม่ไป cloudinary
        const uploadedUrls: string[] = [];
        if (values.newImageFiles && values.newImageFiles.length > 0) {
          for (const file of values.newImageFiles) {
            const url = await uploadToCloudinary(file);
            uploadedUrls.push(url);
          }
        }

        //รวมรูปเก่ากับรูปใหม่
        const allImageUrls = [...values.images, ...uploadedUrls];

        const payload = {
          ...values,
          images: allImageUrls,
          latitude: values.latitude ?? undefined,
          longitude: values.longitude ?? undefined,
        };
        delete (payload as Record<string, unknown>).newImageFiles;

        await axios.put("/api/sitter/put-sitter", payload);

        //โหลดภาพล่าสุดมาแสดง
        await update();
        const { data: refreshed } = await axios.get<GetSitterResponse>(
          "/api/sitter/get-profile-sitter"
        );
        const latestImages = refreshed.sitter?.images || [];
        setValue("images", latestImages);
        setInitialGallery(latestImages);
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
      <Sidebar className="min-w-0" />
      <section className="flex-1 min-w-0">
        <PetSitterNavbar
          avatarUrl={
            watch("profileImageUrl") || "/icons/avatar-placeholder.svg"
          }
          name={watch("fullName") || ""}
        />
        {/* nuk แก้ Loading */}
        {
          isLoading
            ? <PetPawLoading
              message="Loading Pet Sitter Profile"
              size="lg"
            />
            : <>
              <form onSubmit={onSubmit} className="mr-auto px-6 py-8">
                <div className="flex justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-gray-9 font-semibold text-2xl">
                      Pet Sitter Profile
                    </h3>
                    <StatusBadge
                      status={getStatusKey(approvalStatus)}
                      className="font-medium"
                    />
                  </div>
                  {approvalStatus === "Approved" ? (
                    <PrimaryButton
                      text={isSubmitting ? "Saving..." : "Update"}
                      type="submit"
                      bgColor="primary"
                      textColor="white"
                    />
                  ) : (
                    <PrimaryButton
                      text="Request for Approval"
                      type="button"
                      bgColor="primary"
                      textColor="white"
                      onClick={handleRequestApproval}
                    />
                  )}
                </div>

                {/* Rejected Status Banner */}
                {approvalStatus === "Rejected" && sitterData?.admin_note && (
                  <div className="mt-4 p-4 bg-gray-200 border-l-4 border-red rounded-r-md">
                    <div className="flex items-start gap-3">
                      <div className="text-red flex-shrink-0 mt-0.5">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-red font-medium break-words">
                          <span className="font-medium">
                            Your request has not been approved:
                          </span>{" "}
                          &apos;{sitterData.admin_note}&apos;
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Basic Information */}
                <section className="bg-white rounded-xl pt-4 pb-7 px-12 mt-4">
                  <h4 className="text-gray-4 font-bold text-xl py-4">
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-1">
                    <div className="pb-4 col-span-1">
                      <p className="pb-4 font-medium text-black">Profile Image</p>
                      <AvatarUploader
                        imageUrl={watch("profileImageUrl")}
                        onChange={async (file) => {
                          if (file) {
                            const url = await uploadToCloudinary(file);
                            setValue("profileImageUrl", url, { shouldDirty: true });
                          }
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
                              <CustomSelect
                                value={field.value}
                                onChange={field.onChange}
                                options={experienceNotAllSelect}
                                variant="default"
                                triggerSize="w-full !h-12"
                                placeholder=""
                                error={errors.experience?.message}
                              />
                              // <Select
                              //   value={field.value}
                              //   onValueChange={field.onChange}
                              // >
                              //   <SelectTrigger
                              //     className={` w-full rounded-xl !h-12 px-4 py-2 border !border-gray-2 ${errors.experience
                              //       ? "!border-red focus:ring-red"
                              //       : "border-gray-3"
                              //       }`}
                              //   >
                              //     <SelectValue placeholder="" />
                              //   </SelectTrigger>
                              //   <SelectContent className="bg-white border border-gray-2 ">
                              //     <SelectItem value="0-2 Years"
                              //       className="bg-white hover:bg-gray-1 cursor-pointer">
                              //       0-2 Years
                              //     </SelectItem>
                              //     <SelectItem value="3-5 Years"
                              //       className="bg-white hover:bg-gray-1 cursor-pointer">
                              //       3-5 Years
                              //     </SelectItem>
                              //     <SelectItem value="5+ Years"
                              //       className="bg-white hover:bg-gray-1 cursor-pointer">
                              //       5+ Years
                              //     </SelectItem>
                              //   </SelectContent>
                              // </Select>
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
                            maxLength={10}
                            onInput={(e) => {
                              const input = e.target as HTMLInputElement;
                              // ลบทุกตัวที่ไม่ใช่ตัวเลขออก
                              input.value = input.value.replace(/\D/g, "");
                            }}
                            variant={errors.phone ? "error" : "default"}
                            className="w-full"
                            {...register("phone", {
                              validate: async (v) => {
                                // ✅ ถ้าเบอร์ที่กรอกเหมือนเดิม → ไม่ต้องเช็กซ้ำ
                                if (v === currentPhone) return true;

                                const { message } = await validatePhone(v);
                                return message || true;
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
                              required: "Please enter your email.",
                              validate: async (v) => {
                                //  ถ้าอีเมลที่กรอกเหมือนกับของตัวเอง → ข้ามไม่เช็กซ้ำ
                                if (v === currentEmail) return true;

                                const base = await validateEmail(v, undefined, false);
                                if (base.message) return base.message;

                                try {
                                  const res = await fetch("/api/user/get-role", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ email: v }),
                                  });

                                  if (res.ok) {
                                    const data = await res.json();
                                    if (data.exists) {
                                      return "This email is already registered";
                                    }
                                  }
                                } catch (e) {
                                  console.error("Email duplicate check failed:", e);
                                }
                                return true;
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
                            label="Introduction (Describe about yourself as pet sitter)*"
                            className={`w-full ${errors.introduction ? "!border-red focus:ring-red" : ""}`}
                            {...register("introduction", {
                              required: "Please enter introduction.",
                            })}
                          />
                          {errors.introduction && (
                            <p className="mt-1 text-sm text-red">
                              {errors.introduction.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Pet Sitter - แสดงเฉพาะเมื่อสถานะเป็น Approved */}
                {approvalStatus === "Approved" && (
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
                            setValue("newImageFiles", state.newImageFiles, {
                              shouldDirty: true,
                            });
                          }}
                        />
                      </div>
                    </div>
                  </section>
                )}

                {/* Address - แสดงเฉพาะเมื่อสถานะเป็น Approved */}
                {approvalStatus === "Approved" && (
                  <AddressSection
                    control={control}
                    register={register}
                    errors={errors}
                    watch={watch}
                    setValue={setValue}
                    setError={setError}
                  />
                )}
              </form>
            </>
        }
      </section>
      <Toaster position="top-right" />
    </main>
  );
}
