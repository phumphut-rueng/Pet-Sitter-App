import { useCallback } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import type { OwnerProfile } from "@/types/user.types";

export function useOwnerProfileForm(initial?: Partial<OwnerProfile>) {
  const form = useForm<OwnerProfile>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      dob: "",
      profileImage: "",
      ...initial,
    },
  });

  const load = useCallback(async () => {
    const { data } = await axios.get<OwnerProfile>("/api/user/profile");
    form.reset({
      name: data.name ?? "",
      email: data.email ?? "",
      phone: data.phone ?? "",
      dob: data.dob ?? "",
      profileImage: data.profileImage ?? "",
    });
  }, [form]);

  const save = useCallback(
    async (values?: OwnerProfile) => {
      const payload = values ?? form.getValues();
      await axios.put("/api/user/profile", payload);
      alert("Profile updated successfully!");
    },
    [form]
  );

  return { form, load, save };
}