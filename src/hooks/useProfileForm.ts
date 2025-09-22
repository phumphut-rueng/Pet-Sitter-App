import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { OwnerProfileSchema, OwnerProfileValues } from "@/lib/validators/account";

// API endpoints 
const API_ENDPOINTS = {
  getProfile: "/api/user/profile",
  updateProfile: "/api/user/put-owner",
};


const EMPTY_FORM_VALUES = {
  name: "",
  email: "",
  phone: "",
  idNumber: "",
  dob: "",
  profileImage: "",
};

export function useProfileForm() {
  // Form setup with validation
  const form = useForm<OwnerProfileValues>({
    resolver: zodResolver(OwnerProfileSchema),
    defaultValues: EMPTY_FORM_VALUES,
    mode: "onBlur",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);


  const getErrorMessage = (error: any, defaultMessage: string) => {
    return error?.response?.data?.error || defaultMessage;
  };

  const resetFormWithData = (data: any) => {
    form.reset({
      name: data?.name || "",
      email: data?.email || "",
      phone: data?.phone || "",
      idNumber: data?.idNumber || "",
      dob: data?.dob || "",
      profileImage: data?.profileImage || "",
    });
  };


  useEffect(() => {
    let isCancelled = false;

    const loadProfile = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.getProfile);
        
        if (isCancelled) return;

        resetFormWithData(response.data);
      } catch (error) {
        console.error("Load profile failed:", error);
        
        if (!isCancelled) {
          const message = getErrorMessage(error, "Failed to load profile");
          setErrorMessage(message);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isCancelled = true;
    };
  }, [form]);

  const handleSubmit = async () => {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const formData = form.getValues();
      await axios.put(API_ENDPOINTS.updateProfile, formData);
      

      if (typeof window !== "undefined") {
        window.alert("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Update profile failed:", error);
      
      const message = getErrorMessage(error, "Failed to update profile");
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    form,
    loading: isLoading,
    saving: isSaving,
    serverError: errorMessage,
    onSubmit: handleSubmit,
  };
}