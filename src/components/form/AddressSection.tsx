"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import InputText from "@/components/input/InputText";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getLatLngFromAddress } from "@/utils/nominatim";
import { Controller } from "react-hook-form";
import type {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import type { SitterFormValues } from "../types/SitterForms";

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
  title?: string;
};

export default function AddressSection({
  control,
  register,
  errors,
  watch,
  setValue,
  title = "Address",
}: Props) {
  const [addr, setAddr] = useState<AddressData | null>(null);
  const [provinceOpts, setProvinceOpts] = useState<Province[]>([]);
  const [districtOpts, setDistrictOpts] = useState<District[]>([]);
  const [subdistrictOpts, setSubdistrictOpts] = useState<Subdistrict[]>([]);
  const [latLng, setLatLng] = useState({ lat: 13.736717, lng: 100.523186 }); // BKK default

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
  }, [addr, watchProvince, setValue]);

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
  }, [addr, watchProvince, watchDistrict, setValue]);

  // subdistrict -> postcode
  useEffect(() => {
    if (!watchSubdistrict) return;
    const s = subdistrictOpts.find((x) => x.name === watchSubdistrict);
    setValue("address_post_code", s?.postalCode ?? "", { shouldDirty: false });
  }, [watchSubdistrict, subdistrictOpts, setValue]);

  // full address string (สำหรับ geocoding)
  const fullAddress = useMemo(() => {
    const d = watch("address_detail");
    const sd = watch("address_sub_district");
    const dt = watch("address_district");
    const pv = watch("address_province");
    const pc = watch("address_post_code");
    return [d, sd, dt, pv, pc].filter(Boolean).join(", ");
  }, [
    watch("address_detail"),
    watch("address_sub_district"),
    watch("address_district"),
    watch("address_province"),
    watch("address_post_code"),
  ]);

  // debounce geocoding เมื่อ address เปลี่ยน (ต้องมี province+district อย่างน้อย)
  useEffect(() => {
    if (!watchProvince || !watchDistrict) return;
    if (!fullAddress) return;
    const t = setTimeout(async () => {
      try {
        const { lat, lng } = await getLatLngFromAddress(fullAddress);
        setLatLng({ lat, lng });
        setValue("latitude", lat, { shouldDirty: true });
        setValue("longitude", lng, { shouldDirty: true });
      } catch (e) {}
    }, 700);
    return () => clearTimeout(t);
  }, [fullAddress, watchProvince, watchDistrict, setValue]);

  return (
    <section className="bg-white rounded-xl pt-4 pb-7 px-12 mt-4">
      <h4 className="text-gray-4 font-bold text-xl pt-4">{title}</h4>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
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
        </div>

        {/* Province */}
        <div className="flex flex-col gap-1 relative z-0">
          <label className="font-medium text-black">Province*</label>
          <Controller
            name="address_province"
            control={control}
            rules={{ required: "Please select a province." }}
            render={({ field }) => (
              <Select
                value={field.value || ""}
                onValueChange={(val) => field.onChange(val)}
              >
                <SelectTrigger
                  className={`!h-12 w-full rounded-xl border px-4 text-left ${
                    errors.address_province
                      ? "!border-red focus:ring-red"
                      : "border-gray-2"
                  }`}
                >
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-2 max-h-72 overflow-auto">
                  {provinceOpts.map((p) => (
                    <SelectItem key={p.code} value={p.name}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.address_province && (
            <p className="mt-1 text-sm text-red">
              {errors.address_province.message as string}
            </p>
          )}
        </div>

        {/* District */}
        <div className="flex flex-col gap-1 relative z-0">
          <label className="font-medium text-black">District*</label>
          <Controller
            name="address_district"
            control={control}
            rules={{ required: "Please select a district." }}
            render={({ field }) => (
              <Select
                value={field.value || ""}
                onValueChange={(val) => field.onChange(val)}
              >
                <SelectTrigger
                  className={`!h-12 w-full rounded-xl border px-4 text-left ${
                    errors.address_district
                      ? "!border-red focus:ring-red"
                      : "border-gray-2"
                  }`}
                >
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-2 max-h-72 overflow-auto">
                  {districtOpts.map((d) => (
                    <SelectItem key={d.code} value={d.name}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.address_district && (
            <p className="mt-1 text-sm text-red">
              {errors.address_district.message as string}
            </p>
          )}
        </div>

        {/* Sub-district */}
        <div className="flex flex-col gap-1 relative z-0">
          <label className="font-medium text-black">Sub-district*</label>
          <Controller
            name="address_sub_district"
            control={control}
            rules={{ required: "Please select a sub-district." }}
            render={({ field }) => (
              <Select
                value={field.value || ""}
                onValueChange={(val) => field.onChange(val)}
              >
                <SelectTrigger
                  className={`!h-12 w-full rounded-xl border px-4 text-left ${
                    errors.address_sub_district
                      ? "!border-red focus:ring-red"
                      : "border-gray-2"
                  }`}
                >
                  <SelectValue placeholder="Select sub-district" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-2 max-h-72 overflow-auto">
                  {subdistrictOpts.map((s) => (
                    <SelectItem key={s.code} value={s.name}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.address_sub_district && (
            <p className="mt-1 text-sm text-red">
              {errors.address_sub_district.message as string}
            </p>
          )}
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

        {/* Map */}
        <div className="md:col-span-2 z-0">
          <LeafletMap latitude={latLng.lat} longitude={latLng.lng} />
        </div>
      </div>
    </section>
  );
}
