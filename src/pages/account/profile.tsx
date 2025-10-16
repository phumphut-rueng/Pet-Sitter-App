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
import { PetPawLoading } from "@/components/loading/PetPawLoading";

const AccountProfilePage: NextPage = () => {
  const { form, load, save } = useOwnerProfileForm();
  const [saving, setSaving] = useState(false);
  const [opening, setOpening] = useState(true); // แสดงตอนเปิดหน้าแบบเดียวกับ Pets
  const [serverError, setServerError] = useState<string | null>(null);

  // โหลดโปรไฟล์ตอนเริ่มต้น + กันแฟลชเล็กน้อย
  useEffect(() => {
    let mounted = true;
    const minDelay = new Promise((r) => setTimeout(r, 400));
    (async () => {
      try {
        await Promise.all([load(), minDelay]);
      } catch (err) {
        console.error("Profile load error:", err);
        toast.error(ERROR_MESSAGES.loadFailed);
      } finally {
        if (mounted) setOpening(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [load]);

  const handleSubmit = form.handleSubmit(async (values: OwnerProfileInput) => {
    setServerError(null);
    setSaving(true);
    try {
      const ok = await save(values);
      if (ok) toast.success(SUCCESS_MESSAGES.profileUpdated);
      else toast.error(ERROR_MESSAGES.fixFields);
    } catch (err) {
      console.error("Profile save error:", err);
      const msg = getErrorMessage(err) || ERROR_MESSAGES.unknown;
      setServerError(msg);
      toast.error(ERROR_MESSAGES.saveFailed);
    } finally {
      setSaving(false);
    }
  });

  return (
    <AccountPageShell title="Profile" showTitle>
      {/* ให้ตำแหน่ง loader เหมือนหน้า Pets: ครอบด้วย relative + absolute overlay */}
      <div className="relative min-h-[400px]">
        <ProfileForm
          control={form.control}
          saving={saving || opening}
          serverError={serverError}
          onSubmit={handleSubmit}
        />

        {(opening || saving) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <PetPawLoading
              message={opening ? "Loading Your Profile..." : "Updating..."}
              size="md"
              baseStyleCustum="flex items-center justify-center"
            />
          </div>
        )}
      </div>
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