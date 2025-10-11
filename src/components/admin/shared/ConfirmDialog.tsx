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

export type ConfirmDialogProps = {
  open: boolean;
  loading?: boolean;
  title: string;
  description: string;
  cancelLabel?: string;
  confirmLabel: string;
  confirmLoadingLabel?: string;
  variant?: "default" | "danger";
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  /**  เพิ่ม children ไว้สำหรับ content เสริม (เช่น textarea) */
  children?: React.ReactNode;
};

export default function ConfirmDialog({
  open,
  loading = false,
  title,
  description,
  cancelLabel = "Cancel",
  confirmLabel,
  confirmLoadingLabel,
  variant = "default",
  onOpenChange,
  onConfirm,
  children,
}: ConfirmDialogProps) {
  const loadingText = confirmLoadingLabel || `${confirmLabel}ing...`;

  const confirmButtonClass =
    variant === "danger"
      ? "bg-red text-white hover:bg-red/90"
      : "bg-orange-5 text-white hover:bg-orange-6";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[400px] max-w-[400px] p-0 gap-0">
        <AlertDialogHeader className="p-6 pb-4 space-y-0">
          <AlertDialogTitle className="h4-bold text-left text-ink">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base-regular text-gray-6 pt-6 text-left">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* ⬇️ โซนเสริมสำหรับฟอร์มหรือข้อความเพิ่ม */}
        {children ? <div className="px-6 pb-2">{children}</div> : null}

        <AlertDialogFooter className="p-6 pt-4 flex-row gap-4">
          <AlertDialogCancel
            disabled={loading}
            className="flex-1 rounded-full px-8 py-3 text-base-bold text-orange-5 bg-orange-1 hover:bg-orange-2 border-0 m-0 disabled:opacity-50"
          >
            {cancelLabel}
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={async () => { await onConfirm(); }}
            disabled={loading}
            className={`flex-1 rounded-full px-8 py-3 text-base-bold disabled:opacity-60 ${confirmButtonClass}`}
          >
            {loading ? loadingText : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}