import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function BanConfirm({
  open,
  loading,
  mode = "ban",
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  loading: boolean;
  mode?: "ban" | "unban";
  onOpenChange: (o: boolean) => void;
  onConfirm: () => void;
}) {
  const isUnban = mode === "unban";
  const title = isUnban ? "Unban User" : "Ban User";
  const cta = isUnban ? "Unban User" : "Ban User";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {/* ✅ มี description เสมอ แก้ warning ของ Radix */}
          <AlertDialogDescription>
            {isUnban
              ? "Are you sure to unban this user?"
              : "Are you sure to ban this user?"}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-full px-6 py-3 bg-orange-50 text-orange-500 hover:bg-orange-100">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="rounded-full px-6 py-3 bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60"
          >
            {loading ? (isUnban ? "Unbanning..." : "Banning...") : cta}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}