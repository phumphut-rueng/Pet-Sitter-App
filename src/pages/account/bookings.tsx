import React, { useEffect } from "react";
import AccountPageShell from "@/components/layout/AccountPageShell";

export default function AccountBookingsPage() {
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) window.location.replace("/login");
  }, []);

  return (
    <AccountPageShell title="Booking History">
      <p className="text-slate-600">Coming soon: booking history…</p>
    </AccountPageShell>
  );
}