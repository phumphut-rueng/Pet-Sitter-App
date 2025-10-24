import { X } from "lucide-react";

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  rejectReason: string;
  onRejectReasonChange: (reason: string) => void;
  onConfirm: () => void;
}

export function RejectModal({
  isOpen,
  onClose,
  rejectReason,
  onRejectReasonChange,
  onConfirm,
}: RejectModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 opacity-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-ink">
            Reject Confirmation
          </h2>
          <button
            onClick={onClose}
            className="text-muted-text hover:text-ink transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xl font-medium text-ink">
                Reason and suggestion
              </label>
            </div>
            <textarea
              value={rejectReason}
              onChange={(e) => {
                if (e.target.value.length <= 200) {
                  onRejectReasonChange(e.target.value);
                }
              }}
              placeholder="Admin's suggestion here"
              className="w-full h-32 px-3 py-2 border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-xl"
            />
          </div>
          <div className="mt-3 flex justify-end">
            <div
              className={`inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-full shadow-sm border ${
                rejectReason.length >= 180
                  ? "text-red bg-red-bg border-red"
                  : rejectReason.length >= 100
                  ? "text-yellow bg-yellow-bg border-yellow"
                  : "text-muted-text bg-muted border-border"
              }`}
            >
              <span className="font-medium">
                {rejectReason.length}
              </span>
              <span
                className={
                  rejectReason.length >= 180
                    ? "text-red"
                    : rejectReason.length >= 100
                    ? "text-yellow"
                    : "text-muted-text"
                }
              >
                /
              </span>
              <span className="font-medium">200</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-brand bg-brand-bg rounded-full font-medium hover:bg-brand-bg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-brand text-brand-text rounded-full font-medium hover:bg-brand-dark transition-colors cursor-pointer"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
