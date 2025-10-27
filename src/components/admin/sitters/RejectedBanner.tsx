import type { SitterDetail } from "@/types/admin";

interface RejectedBannerProps {
  sitter: SitterDetail;
}

export function RejectedBanner({ sitter }: RejectedBannerProps) {
  if (sitter.approval_status !== "Rejected" || !sitter.admin_note) {
    return null;
  }

  return (
    <div className="mb-6 p-4 bg-muted border-l-4 border-red rounded-r-md">
      <div className="flex items-start gap-3">
        <div className="text-red flex-shrink-0 mt-0.5">
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-red font-medium break-words">
            <span className="font-medium">
              Their request has not been approved:
            </span>{" "}
            &apos;{sitter.admin_note}&apos;
          </p>
        </div>
      </div>
    </div>
  );
}
