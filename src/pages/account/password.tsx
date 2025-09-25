import React, { useEffect } from "react";
import AccountPageShell from "@/components/layout/AccountPageShell";
import { useSession } from "next-auth/react"; // NextAuth session hook
import { useRouter } from "next/router";

export default function AccountPasswordPage() {
  const { data: session, status } = useSession(); // NextAuth session
  const router = useRouter();

  useEffect(() => {
    // Replace localStorage token check with NextAuth session check
    if (status === 'loading') return; // Wait for session to load
    if (!session?.user) {
      router.push("/auth/login");
    }
  }, [session, status, router]); // Add NextAuth dependencies

  return (
    <AccountPageShell title="Change Password">
      <p className="text-slate-600">Coming soon: change password form…</p>
    </AccountPageShell>
  );
}