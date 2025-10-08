// src/components/common/ConfirmModal.tsx
import * as React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";

type ConfirmModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  /** ปุ่มแอคชันต่าง ๆ (Cancel/Confirm) */
  footer?: React.ReactNode;
  /** ข้อความอธิบาย — จะถูกใส่ใน AlertDialogDescription เสมอ */
  children?: React.ReactNode;
  /** ใช้ id เองได้ ถ้าอยากควบคุม aria-describedby เอง */
  descriptionId?: string;
};

export default function ConfirmModal({
  open,
  onOpenChange,
  title,
  footer,
  children,
  descriptionId,
}: ConfirmModalProps) {
  const contentProps = descriptionId ? { "aria-describedby": descriptionId } : {};
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent {...contentProps}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {/* ✅ ใส่ Description เสมอ เพื่อให้ Radix ไม่เตือน */}
          <AlertDialogDescription id={descriptionId}>
            {children ?? "This action requires confirmation."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>{footer}</AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}