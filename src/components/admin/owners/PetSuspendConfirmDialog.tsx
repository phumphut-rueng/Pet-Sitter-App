// src/components/admin/owners/PetSuspendConfirmDialog.tsx
import * as React from "react";

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
  loading,
}: Props) {
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) dialog.showModal();
    else dialog.close();
  }, [open]);

  const title = isSuspended ? "Unsuspend Pet" : "Suspend Pet";
  const message = isSuspended
    ? `Are you sure to unsuspend ${petName}?`
    : `Are you sure to suspend ${petName}?`;
  const actionLabel = isSuspended ? "Unsuspend This Pet" : "Suspend This Pet";

  return (
    <dialog
      ref={dialogRef}
      onClose={() => onOpenChange(false)}
      className="w-[400px] p-0 rounded-2xl bg-white backdrop:bg-black/50"
    >
      {/* Header: 400×60, padding 16px 24px, border-bottom */}
      <div className="w-[400px] h-[60px] px-6 py-4 border-b border-[#E4E6ED]">
        <h2 className="text-xl font-bold leading-7">{title}</h2>
      </div>

      {/* Content: 400×148, padding 24px, gap 24px */}
      <div className="w-[400px] h-[148px] p-6 flex flex-col gap-6">
        <p className="text-base font-medium leading-7 text-gray-700">{message}</p>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={() => onOpenChange(false)}
            className="px-6 py-2.5 rounded-full font-medium border-2 border-orange-500 text-orange-500 hover:bg-orange-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              await onConfirm();
              onOpenChange(false);
            }}
            disabled={loading}
            className="px-6 py-2.5 rounded-full font-medium bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 transition-colors"
          >
            {loading ? "Processing..." : actionLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}