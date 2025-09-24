import React, { useEffect } from "react";
import AccountPageShell from "@/components/layout/AccountPageShell";

export default function AccountPasswordPage() {
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) window.location.replace("/login");
  }, []);

  return (
    <AccountPageShell title="Change Password">
      <p className="text-slate-600">Coming soon: change password form…</p>
    </AccountPageShell>
  );
}