import ConfirmModal from "@/components/common/ConfirmModal";

export default function BanConfirm({
  open,
  loading,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  loading: boolean;
  onOpenChange: (o: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <ConfirmModal
      title="Ban User"
      open={open}
      onOpenChange={onOpenChange}
      footer={(
        <>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-full px-6 py-3 text-orange-500 bg-orange-50 hover:bg-orange-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="rounded-full px-6 py-3 text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-60 transition-colors"
          >
            {loading ? "Banning..." : "Ban User"}
          </button>
        </>
      )}
    >
      Are you sure to ban this user?
    </ConfirmModal>
  );
}