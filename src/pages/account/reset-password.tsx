"use client";
import React, { useEffect, useState } from "react";
import AccountPageShell from "@/components/layout/AccountPageShell";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import InputText from "@/components/input/InputText";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { PetPawLoading } from "@/components/loading/PetPawLoading";
import { PASSWORD_ERROR_MESSAGES, PASSWORD_SUCCESS_MESSAGES } from "@/lib/constants/messages";

export default function AccountChangePasswordPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [authFlow, setAuthFlow] = useState<"checking" | "password" | "google" | "unknown">("checking");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showError, setShowError] = useState<string | null>(null);

  //  overlay ตอน "เข้าเพจ"
  const [opening, setOpening] = useState(true);
  //  overlay ตอน "submit"
  const [busy, setBusy] = useState(false);

  // ถ้าไม่ล็อกอิน → ไปหน้า Login
  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  // เช็คว่าเป็น user แบบไหน (password / google)
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.email) return;
    (async () => {
      try {
        const res = await fetch("/api/auth/check-auth-type", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: session.user.email.toLowerCase() }),
        });
        const data = await res.json();
        if (data?.flow === "google") {
          setAuthFlow("google");
          router.replace("/auth/forgot-password?email=" + encodeURIComponent(session.user.email));
        } else if (data?.flow === "password") {
          setAuthFlow("password");
        } else {
          setAuthFlow("unknown");
        }
      } catch {
        setAuthFlow("unknown");
      }
    })();
  }, [status, session?.user?.email, router]);

  // คุม overlay ตอนเข้าเพจให้เหมือนหน้า Pets (min 400ms กันแฟลช)
  useEffect(() => {
    if (status === "loading" || authFlow === "checking" || authFlow === "google") return;
    let mounted = true;
    const t = setTimeout(() => {
      if (mounted) setOpening(false);
    }, 400);
    return () => {
      mounted = false;
      clearTimeout(t);
    };
  }, [status, authFlow]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowError(null);

    if (!newPassword || !confirmPassword) {
      setShowError(PASSWORD_ERROR_MESSAGES.allFieldsRequired);
      return;
    }
    if (newPassword !== confirmPassword) {
      setShowError(PASSWORD_ERROR_MESSAGES.passwordMismatch);
      return;
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(newPassword)) {
      setShowError(PASSWORD_ERROR_MESSAGES.passwordRequirements);
      return;
    }

    try {
      setBusy(true);
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session?.user?.email?.toLowerCase(),
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data?.message || PASSWORD_ERROR_MESSAGES.changeFailed;
        setShowError(errorMsg);
        toast.error(errorMsg);
        return;
      }
      toast.success(PASSWORD_SUCCESS_MESSAGES.passwordChanged);
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      const errorMsg = PASSWORD_ERROR_MESSAGES.unknown;
      setShowError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setBusy(false);
    }
  };

  // กำลังเช็ค session/flow
  if (status === "loading" || authFlow === "checking") {
    return (
      <AccountPageShell title="Change password">
        <div className="p-8">Loading...</div>
      </AccountPageShell>
    );
  }

  // เป็น Google → ถูก redirect ไปแล้ว
  if (authFlow === "google") return null;

  return (
    <AccountPageShell title="Change password">
      {/* ทำเหมือนหน้า Pets: ครอบคอนเทนต์ด้วย relative แล้ว overlay absolute */}
      <div className="relative min-h-[60vh]">
        <main className="flex-1">
          <div className="w-full max-w-[956px] rounded-2xl border border-gray-2 bg-white p-10">
            <div className="flex flex-col gap-[60px]">
              <h2 className="h3-bold text-black">Change Password</h2>

              <form className="flex flex-col gap-6" onSubmit={onSubmit}>
                <div className="w-full max-w-[586px]">
                  <InputText
                    label="New Password"
                    type="password"
                    placeholder=""
                    variant={
                      newPassword && /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(newPassword)
                        ? "success"
                        : "default"
                    }
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={busy || opening}
                  />
                </div>

                <div className="w-full max-w-[586px]">
                  <InputText
                    label="Confirm Password"
                    type="password"
                    placeholder=""
                    variant={
                      confirmPassword &&
                      confirmPassword === newPassword &&
                      /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(confirmPassword)
                        ? "success"
                        : "default"
                    }
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={busy || opening}
                  />
                </div>

                {showError && (
                  <div className="w-full max-w-[586px] rounded-lg border border-orange-1 bg-orange-1/40 p-3 body3-regular text-red">
                    {showError}
                  </div>
                )}

                <div className="flex w-full justify-end">
                  <PrimaryButton
                    type="submit"
                    text="Change Password"
                    bgColor="primary"
                    textColor="white"
                    disabled={busy || opening}
                  />
                </div>
              </form>
            </div>
          </div>
        </main>

        {(opening || busy) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <PetPawLoading
              message={opening ? "Loading..." : "Updating..."}
              size="md"
              baseStyleCustum="flex items-center justify-center"
            />
          </div>
        )}
      </div>
    </AccountPageShell>
  );
}