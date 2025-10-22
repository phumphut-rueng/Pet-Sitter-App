import * as React from "react";
import ConfirmDialog from "@/components/common/ConfirmDialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  petName: string;
  isSuspended: boolean;
  onConfirm: () => Promise<void>;
  loading?: boolean;
};

export default function PetSuspendConfirmDialog({
  open,
  onOpenChange,
  petName,
  isSuspended,
  onConfirm,
  loading = false,
}: Props) {
  return (
    <ConfirmDialog
      open={open}
      loading={loading}
      title={isSuspended ? "Unsuspend Pet" : "Suspend Pet"}
      description={
        isSuspended
          ? `Are you sure to unsuspend ${petName}?`
          : `Are you sure to suspend ${petName}?`
      }
      confirmLabel={isSuspended ? "Unsuspend This Pet" : "Suspend This Pet"}
      confirmLoadingLabel="Processing..."
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
    />
  );
}