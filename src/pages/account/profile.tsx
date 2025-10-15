import * as React from "react";
import { useEffect, useState } from "react";
import type { GetServerSideProps, NextPage } from "next";
import toast from "react-hot-toast";
import { getServerSession } from "next-auth/next";

import AccountPageShell from "@/components/layout/AccountPageShell";
import ProfileForm from "@/components/features/account/profile/components/ProfileForm";
import { useOwnerProfileForm } from "@/hooks/useOwnerProfileForm";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import type { OwnerProfileInput } from "@/lib/validators/profile";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/lib/constants/messages";
import { getErrorMessage } from "@/lib/utils/error";

const AccountProfilePage: NextPage = () => {
  const { form, load, save } = useOwnerProfileForm();
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // โหลดโปรไฟล์ตอนเริ่มต้น
  useEffect(() => {
    load().catch((err) => {
      console.error("Profile load error:", err);
      toast.error(ERROR_MESSAGES.loadFailed);
    });
  }, [load]);

  // ฟังก์ชันบันทึกโปรไฟล์
  const handleSubmit = form.handleSubmit(async (values: OwnerProfileInput) => {
    setServerError(null);
    setSaving(true);

    try {
      const success = await save(values);
      
      if (success) {
        toast.success(SUCCESS_MESSAGES.profileUpdated);
      } else {
        toast.error(ERROR_MESSAGES.fixFields);
      }
    } catch (err) {
      console.error("Profile save error:", err);
      const errorMsg = getErrorMessage(err) || ERROR_MESSAGES.unknown;
      setServerError(errorMsg);
      toast.error(ERROR_MESSAGES.saveFailed);
    } finally {
      setSaving(false);
    }
  });

  return (
    <AccountPageShell title="Profile" showTitle>
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
        permanent: false,
      },
    };
  }

  return { props: {} };
};