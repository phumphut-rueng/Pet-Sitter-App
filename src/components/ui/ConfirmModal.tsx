import * as React from "react";

type Props = {
  open: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({ open, title = "Confirm", message = "Are you sure?", onConfirm, onCancel }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9995] bg-black/40">
      <div className="min-h-full w-full grid place-items-center p-4">
        <div className="w-full max-w-md rounded-xl bg-white ring-1 ring-slate-200 shadow-xl p-5">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-slate-600 mt-1">{message}</p>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200">Cancel</button>
            <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-rose-600 text-white hover:opacity-90">Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}