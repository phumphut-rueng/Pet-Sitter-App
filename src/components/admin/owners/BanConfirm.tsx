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
      <AlertDialogContent className="w-[400px] max-w-[400px] p-0 gap-0">
        <AlertDialogHeader className="p-6 pb-4 space-y-0">
          <AlertDialogTitle className="text-2xl font-bold text-left">
            {title}
          </AlertDialogTitle>
          {/*  มี description เสมอ แก้ warning ของ Radix */}
          <AlertDialogDescription className="text-base text-gray-5 pt-6 text-left">
            {isUnban
              ? "Are you sure to unban this user?"
              : "Are you sure to ban this user?"}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="p-6 pt-4 flex-row gap-4">
          <AlertDialogCancel className="flex-1 rounded-full px-8 py-3 text-base font-semibold text-orange-5 bg-orange-1 hover:bg-orange-100 border-0 m-0">
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-full px-8 py-3 text-base font-semibold bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60"
          >
            {loading ? (isUnban ? "Unbanning..." : "Banning...") : cta}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}