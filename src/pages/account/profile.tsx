import React, { useEffect, useState } from "react";
import { useOwnerProfileForm } from "@/hooks/useOwnerProfileForm";
import AccountPageShell from "@/components/layout/AccountPageShell";
import ProfileForm from "@/components/features/account/ProfileForm";
import Navbar from "@/components/navbar/Navbar";
import toast, { Toaster } from "react-hot-toast"; 

function getErrorMessage(e: unknown, fallback: string): string {
  return e instanceof Error ? e.message : fallback;
}

export default function AccountProfilePage() {
  const { form, load, save } = useOwnerProfileForm();
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      window.location.replace("/login");
      return;
    }
    (async () => {
      try {
        await load();
      } catch (e: unknown) {
        const msg = getErrorMessage(e, "Failed to load profile");
        setServerError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, [load]);

  const onSubmit = form.handleSubmit(async (values) => {
    setServerError(null);
    const t = toast.loading("Updating profile…");
    try {
      await save(values);
      toast.success("Profile updated!", { id: t });
    } catch (e: unknown) {
      const msg = getErrorMessage(e, "Failed to save");
      setServerError(msg);
      toast.error(msg, { id: t });
    }
  });

  return (
    <>
      <Navbar />
      <AccountPageShell title="Profile">
        {loading ? (
          <p className="text-slate-500">Loading…</p>
        ) : (
          <ProfileForm
            control={form.control}
            onSubmit={onSubmit}
            saving={form.formState.isSubmitting}
            serverError={serverError}
          />
        )}
      </AccountPageShell>

   
      <Toaster
  position="top-right"
  containerStyle={{ zIndex: 2147483647 }}
  toastOptions={{
    style: {
      background: "var(--brand)",
      color: "var(--on-brand)",
    },
    className: "toast-brand",
    success: {

      iconTheme: {
        primary: "var(--brand)",
        secondary: "var(--on-brand)",
      },
 
      className: "toast-brand",
      style: {
        background: "var(--brand)",
        color: "var(--on-brand)",
      },
    },
    error: {
      iconTheme: {
        primary: "var(--brand)",
        secondary: "var(--on-brand)",
      },
      className: "toast-brand",
      style: {
        background: "var(--brand)",
        color: "var(--on-brand)",
      },
    },
  }}
/>
    </>
  );
}