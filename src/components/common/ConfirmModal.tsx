import * as React from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Props = {
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  width?: number;
  children?: React.ReactNode; // description
  footer?: React.ReactNode;   // custom actions
};

export default function ConfirmModal({
  title,
  open,
  onOpenChange,
  width = 520,
  children,
  footer,
}: Props) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        style={{ width }}
        className="p-0 rounded-2xl border-0 shadow-xl"
      >
        {/* header */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-gray-200">
          <AlertDialogTitle className="text-[22px] font-semibold text-black">
            {title}
          </AlertDialogTitle>
          <AlertDialogCancel className="text-gray-500 hover:text-gray-900 border-0 shadow-none">
            ✕
          </AlertDialogCancel>
        </div>

        {/* body */}
        <div className="px-6 pt-6 pb-2 text-[18px] text-gray-500">
          {children}
        </div>

        {/* footer (actions) */}
        <div className="flex items-center justify-end gap-4 px-6 py-6">
          {footer}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}