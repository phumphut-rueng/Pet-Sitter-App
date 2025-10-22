"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import InputText from "@/components/input/InputText";
import { getLatLngFromAddress } from "@/lib/utils/nominatim";
import { Controller } from "react-hook-form";
import type {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import type { SitterFormValues } from "../types/SitterForms";
import { CustomSelect } from "../dropdown/CustomSelect";

const LeafletMap = dynamic(() => import("@/components/form/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full rounded-xl border border-gray-200 grid place-items-center">
      <span className="text-sm text-gray-500">Loading map…</span>
    </div>
  ),
});

type Province = { code: string; name: string };
type District = { code: string; name: string };
type Subdistrict = { code: string; name: string; postalCode: string };
type AddressData = {
  provinces: Province[];
  districtsByProvince: Record<string, District[]>;
  subdistrictsByDistrict: Record<string, Subdistrict[]>;
};

type Props = {
  control: Control<SitterFormValues>;
  register: UseFormRegister<SitterFormValues>;
  errors: FieldErrors<SitterFormValues>;
  watch: UseFormWatch<SitterFormValues>;
  setValue: UseFormSetValue<SitterFormValues>;
  setError: (
    name: keyof SitterFormValues,
    error: { type: string; message?: string }
  ) => void;
  title?: string;
};

export default function AddressSection({
  control,
  register,
  errors,
  watch,
  setValue,
  setError,
  title = "Address",
}: Props) {
  const [addr, setAddr] = useState<AddressData | null>(null);
  const [provinceOpts, setProvinceOpts] = useState<Province[]>([]);
  const [districtOpts, setDistrictOpts] = useState<District[]>([]);
  const [subdistrictOpts, setSubdistrictOpts] = useState<Subdistrict[]>([]);
  const [latLng, setLatLng] = useState({ lat: 13.736717, lng: 100.523186 }); // BKK default
  const [addressWarning, setAddressWarning] = useState<string | null>(null);

  const [initialProvince] = useState(watch("address_province"));
  const [initialDistrict] = useState(watch("address_district"));
  const [initialSubdistrict] = useState(watch("address_sub_district"));

  const watchProvince = watch("address_province");
  const watchDistrict = watch("address_district");
  const watchSubdistrict = watch("address_sub_district");

  useEffect(() => {
    fetch("/th-address.json")
      .then((r) => r.json())
      .then((json: AddressData) => {
        setAddr(json);
        setProvinceOpts(json.provinces || []);
      })
      .catch((e) => console.error("load th-address.json failed:", e));
  }, []);

  //preload districts/subdistricts จากค่า initial ที่มาจาก DB
  useEffect(() => {
    if (!addr || !initialProvince) return;

    const p = addr.provinces.find((x) => x.name === initialProvince);
    if (p) {
      const dList = addr.districtsByProvince[p.code] ?? [];
      setDistrictOpts(dList);

      if (initialDistrict) {
        const d = dList.find((x) => x.name === initialDistrict);
        if (d) {
          const subs = addr.subdistrictsByDistrict[d.code] ?? [];
          setSubdistrictOpts(subs);

          if (initialSubdistrict) {
            const s = subs.find((x) => x.name === initialSubdistrict);
            if (s) {
              setValue("address_post_code", s.postalCode ?? "", {
                shouldDirty: false,
              });
            }
          }
        }
      }
    }
  }, [addr, initialProvince, initialDistrict, initialSubdistrict, setValue]);

  // province -> districts
  useEffect(() => {
    if (!addr || !watchProvince) return;
    const p = addr.provinces.find((x) => x.name === watchProvince);
    const dList = p ? addr.districtsByProvince[p.code] ?? [] : [];
    setDistrictOpts(dList);
    // reset เฉพาะตอน user เปลี่ยน province จากค่า initial
    if (watchProvince !== initialProvince) {
      setValue("address_district", "");
      setValue("address_sub_district", "");
      setValue("address_post_code", "");
    }
  }, [addr, watchProvince, initialProvince, setValue]);

  // district -> subdistricts
  useEffect(() => {
    if (!addr || !watchProvince || !watchDistrict) return;
    const p = addr.provinces.find((x) => x.name === watchProvince);
    const dList = p ? addr.districtsByProvince[p.code] ?? [] : [];
    const d = dList.find((x) => x.name === watchDistrict);
    const subs = d ? addr.subdistrictsByDistrict[d.code] ?? [] : [];
    setSubdistrictOpts(subs);
    // reset เฉพาะตอน user เปลี่ยน district จากค่า initial
    if (watchDistrict !== initialDistrict) {
      setValue("address_sub_district", "");
      setValue("address_post_code", "");
    }
  }, [addr, watchProvince, watchDistrict, initialDistrict, setValue]);

  // subdistrict -> postcode
  useEffect(() => {
    if (!watchSubdistrict) return;
    const s = subdistrictOpts.find((x) => x.name === watchSubdistrict);
    setValue("address_post_code", s?.postalCode ?? "", { shouldDirty: false });
  }, [watchSubdistrict, subdistrictOpts, setValue]);

  // full address string (สำหรับ geocoding)
  const addressDetail = watch("address_detail");
  const subDistrict = watch("address_sub_district");
  const district = watch("address_district");
  const province = watch("address_province");
  const postCode = watch("address_post_code");
  const fullAddress = useMemo(() => {
    return [addressDetail, subDistrict, district, province, postCode]
      .filter(Boolean)
      .join(", ");
  }, [addressDetail, subDistrict, district, province, postCode]);

  // debounce geocoding เมื่อ address เปลี่ยน (ต้องมี province+district อย่างน้อย)
  useEffect(() => {
    if (!watchProvince || !watchDistrict) return;
    if (!fullAddress) return;

    const t = setTimeout(async () => {
      try {
        const result = await getLatLngFromAddress(fullAddress);
        if (!result) {
          setAddressWarning(
            "Map pin couldn't be moved to this address, but you can still save the address."
          );
          return;
        } else {
          setAddressWarning(null);
        }

        const { lat, lng } = result;
        setLatLng({ lat, lng });
        setValue("latitude", lat, { shouldDirty: true });
        setValue("longitude", lng, { shouldDirty: true });

        // ✅ เคลียร์ error ถ้าหา location ได้
        setValue("address_detail", watch("address_detail"), {
          shouldValidate: true,
        });
      } catch (err) {
        console.error("Geocoding error:", err);
        setError("address_detail", {
          type: "manual",
          message: "Unknown error occurred while finding location.",
        });
      }
    }, 700);

    return () => clearTimeout(t);
  }, [fullAddress, watchProvince, watchDistrict, setValue, setError, watch]);

  return (
    <section className="bg-white rounded-xl pt-4 pb-7 px-12 mt-4">
      <h4 className="text-gray-4 font-bold text-xl pt-4">{title}</h4>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {/* Province */}
        <div className="flex flex-col gap-1 relative z-0">
          <label className="font-medium text-black">Province*</label>
          <Controller
            name="address_province"
            control={control}
            rules={{ required: "Please select a province." }}
            render={({ field }) => (
              <CustomSelect
                value={field.value || ""}
                onChange={(val) => field.onChange(val)}
                options={provinceOpts}
                getOptionValue={(p) => p.name}
                getOptionLabel={(p) => p.name}
                placeholder="Select province"
                variant="default"
                triggerSize="w-full !h-12"
                error={errors.address_province?.message}
              />
              // <Select
              //   value={field.value || ""}
              //   onValueChange={(val) => field.onChange(val)}
              // >
              //   <SelectTrigger
              //     className={`!h-12 w-full rounded-xl border px-4 text-left ${errors.address_province
              //       ? "!border-red focus:ring-red"
              //       : "border-gray-2"
              //       }`}
              //   >
              //     <SelectValue placeholder="Select province" />
              //   </SelectTrigger>
              //   <SelectContent className="bg-white border border-gray-2 max-h-72 overflow-auto cursor-pointer">
              //     {provinceOpts.map((p, i) => (
              //       <SelectItem
              //         key={`${p.code}-${p.name}-${i}`} value={p.name}>
              //         {p.name}
              //       </SelectItem>
              //     ))}
              //   </SelectContent>
              // </Select>
            )}
          />
          {/* {errors.address_province && (
            <p className="mt-1 text-sm text-red">
              {errors.address_province.message as string}
            </p>
          )} */}
        </div>

        {/* District */}
        <div className="flex flex-col gap-1 relative z-0">
          <label className="font-medium text-black">District*</label>
          <Controller
            name="address_district"
            control={control}
            rules={{ required: "Please select a district." }}
            render={({ field }) => (
              <CustomSelect
                value={field.value || ""}
                onChange={(val) => field.onChange(val)}
                options={districtOpts}
                getOptionValue={(d) => d.name}
                getOptionLabel={(d) => d.name}
                placeholder="Select district"
                disabled={!watchProvince}
                variant="default"
                triggerSize="w-full !h-12"
                error={errors.address_district?.message}
              />
              // <Select
              //   value={field.value || ""}
              //   onValueChange={(val) => field.onChange(val)}
              //   disabled={!watchProvince}
              // >
              //   <SelectTrigger
              //     className={`!h-12 w-full rounded-xl border border-gray-2 px-4 text-left ${errors.address_district
              //       ? "!border-red focus:ring-red"
              //       : "border-gray-2"
              //       }`}
              //   >
              //     <SelectValue placeholder="Select district" />
              //   </SelectTrigger>
              //   <SelectContent className="bg-white border border-gray-2 max-h-72 overflow-auto">
              //     {districtOpts.map((d, i) => (
              //       <SelectItem
              //         key={`${d.code}-${d.name}-${i}`}
              //         value={d.name}>
              //         {d.name}
              //       </SelectItem>
              //     ))}
              //   </SelectContent>
              // </Select>
            )}
          />
          {/* {errors.address_district && (
            <p className="mt-1 text-sm text-red">
              {errors.address_district.message as string}
            </p>
          )} */}
        </div>

        {/* Sub-district */}
        <div className="flex flex-col gap-1 relative z-0">
          <label className="font-medium text-black">Sub-district*</label>
          <Controller
            name="address_sub_district"
            control={control}
            rules={{ required: "Please select a sub-district." }}
            render={({ field }) => (
              <CustomSelect
                value={field.value || ""}
                onChange={(val) => field.onChange(val)}
                options={subdistrictOpts}
                getOptionValue={(s) => s.name}
                getOptionLabel={(s) => s.name}
                placeholder="Select sub-district"
                disabled={!watchDistrict}
                variant="default"
                triggerSize="w-full !h-12"
                error={errors.address_sub_district?.message}
              />
              // <Select
              //   value={field.value || ""}
              //   onValueChange={(val) => field.onChange(val)}
              //   disabled={!watchDistrict}
              // >
              //   <SelectTrigger
              //     className={`!h-12 w-full rounded-xl border px-4 text-left 
              //       ${errors.address_sub_district
              //         ? "!border-red focus:ring-red"
              //         : "border-gray-2"
              //       }`}
              //   >
              //     <SelectValue placeholder="Select sub-district" />
              //   </SelectTrigger>
              //   <SelectContent className="bg-white border border-gray-2 max-h-72 overflow-auto">
              //     {subdistrictOpts.map((s, i) => (
              //       <SelectItem
              //         key={`${s.code}-${s.name}-${i}`}
              //         value={s.name}>
              //         {s.name}
              //       </SelectItem>
              //     ))}
              //   </SelectContent>
              // </Select>
            )}
          />
          {/* {errors.address_sub_district && (
            <p className="mt-1 text-sm text-red">
              {errors.address_sub_district.message as string}
            </p>
          )} */}
        </div>

        {/* Post code (readOnly) */}
        <div>
          <InputText
            placeholder=""
            label="Post code*"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            readOnly
            disabled={!watchSubdistrict}
            variant={errors.address_post_code ? "error" : "default"}
            {...register("address_post_code", {
              required: "Please select a sub-district to get the postcode.",
            })}
          />
          {errors.address_post_code && (
            <p className="mt-1 text-sm text-red">
              {errors.address_post_code.message as string}
            </p>
          )}
        </div>

        {/* Address detail */}
        <div className="md:col-span-2">
          <InputText
            placeholder=""
            label="Address detail*"
            type="text"
            variant={errors.address_detail ? "error" : "default"}
            {...register("address_detail", {
              required: "Please enter your address detail.",
            })}
          />
          {errors.address_detail && (
            <p className="mt-1 text-sm text-red">
              {errors.address_detail.message as string}
            </p>
          )}
          {addressWarning && !errors.address_detail && (
            <p className="mt-1 text-sm text-orange-4">
              <div className="flex gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
                  />
                </svg>
                {addressWarning}
              </div>
            </p>
          )}
        </div>
        {/* Map */}
        <div className="md:col-span-2 z-0">
          <LeafletMap latitude={latLng.lat} longitude={latLng.lng} />
        </div>
      </div>
    </section>
  );
}
