import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { StatusBadge } from "@/components/badges/StatusBadge";
import { getStatusKey } from "@/lib/utils/adminUtils";
import type { SitterDetail } from "@/types/admin";

interface SitterHeaderProps {
  sitter: SitterDetail;
  onRejectClick: () => void;
  onApproveClick: () => void;
}

export function SitterHeader({ sitter, onRejectClick, onApproveClick }: SitterHeaderProps) {
  const statusKey = getStatusKey(sitter.approval_status);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/petsitter"
            className="inline-flex items-center gap-2 text-muted-text hover:text-ink group"
          >
            <ChevronLeft className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-1" />
          </Link>
          <div className="flex gap-6">
            <h1 className="text-2xl font-bold text-ink">
              {sitter.user_name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={statusKey} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {sitter.approval_status === "Approved" ? (
            <button
              onClick={onRejectClick}
              className="px-6 py-3 text-brand bg-brand-bg border-0 rounded-full font-medium hover:bg-brand-bg hover:shadow-md hover:scale-105 transition-all duration-200 ease-in-out cursor-pointer"
            >
              Reject
            </button>
          ) : sitter.approval_status === "Waiting for approve" ? (
            <>
              <button
                onClick={onRejectClick}
                className="px-6 py-3 text-brand bg-brand-bg border-0 rounded-full font-medium hover:bg-brand-bg hover:shadow-md hover:scale-105 transition-all duration-200 ease-in-out cursor-pointer"
              >
                Reject
              </button>
              <button
                onClick={onApproveClick}
                className="px-6 py-3 bg-brand text-brand-text border-0 rounded-full font-medium hover:bg-brand-dark hover:shadow-md hover:scale-105 transition-all duration-200 ease-in-out cursor-pointer"
              >
                Approve
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
