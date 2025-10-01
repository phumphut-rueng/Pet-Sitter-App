import * as React from "react";
import { useEffect, useState } from "react";
import type { GetServerSideProps, NextPage } from "next";
import toast from "react-hot-toast";
import { getServerSession } from "next-auth/next";

import AccountPageShell from "@/components/layout/AccountPageShell";
import ProfileForm from "@/components/features/account/ProfileForm";
import PageToaster from "@/components/ui/PageToaster";
import { useOwnerProfileForm } from "@/hooks/useOwnerProfileForm";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import type { OwnerProfileInput } from "@/lib/validators/account";

const ERROR_MESSAGES = {
  loadFailed: "Failed to load profile.",
  saveFailed: "Something went wrong. Please try again.",
  fixFields: "Please fix the highlighted fields.",
  unknown: "Something went wrong.",
} as const;

const SUCCESS_MESSAGES = {
  profileUpdated: "Profile updated!",
} as const;

const getErrorMessage = (error: unknown): string => {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
};

const useProfileLoader = (loadProfileFn: () => Promise<void>) => {
  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        await loadProfileFn();
      } catch (error) {
        if (!isMounted) return;
        console.error("Profile load error:", error);
        toast.error(ERROR_MESSAGES.loadFailed);
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [loadProfileFn]);
};

const useProfileSubmission = (
  saveProfileFn: (values: OwnerProfileInput) => Promise<boolean>
) => {
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const submitProfile = async (values: OwnerProfileInput) => {
    setServerError(null);
    setSaving(true);

    try {
      const success = await saveProfileFn(values);
      if (success) {
        toast.success(SUCCESS_MESSAGES.profileUpdated);
      } else {
        toast.error(ERROR_MESSAGES.fixFields);
      }
    } catch (error) {
      console.error("Profile save error:", error);
      const errorMessage = getErrorMessage(error);
      setServerError(errorMessage || ERROR_MESSAGES.unknown);
      toast.error(ERROR_MESSAGES.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  return {
    saving,
    serverError,
    submitProfile,
  };
};

const AccountProfilePage: NextPage = () => {
  const { form, load, save } = useOwnerProfileForm();
  const { saving, serverError, submitProfile } = useProfileSubmission(save);

  useProfileLoader(load);

  const handleSubmit = form.handleSubmit(submitProfile);

  return (
    <AccountPageShell title="Profile" showTitle>
      <PageToaster />
      <ProfileForm
        control={form.control}
        saving={saving}
        serverError={serverError}
        onSubmit={handleSubmit}
      />
    </AccountPageShell>
  );
};

export default AccountProfilePage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    const callbackUrl = encodeURIComponent(context.resolvedUrl || "/account/profile");
    return {
      redirect: {
        destination: `/api/auth/signin?callbackUrl=${callbackUrl}`,
        permanent: false, // 302
      },
    };
  }

  return { props: {} };
};