import * as React from "react";
import ConfirmDialog from "@/components/common/ConfirmDialog";

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
  
  return (
    <ConfirmDialog
      open={open}
      loading={loading}
      title={isUnban ? "Unban User" : "Ban User"}
      description={isUnban 
        ? "Are you sure to unban this user?"
        : "Are you sure to ban this user?"
      }
      confirmLabel={isUnban ? "Unban User" : "Ban User"}
      confirmLoadingLabel={isUnban ? "Unbanning..." : "Banning..."}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
    />
  );
}