import * as React from "react";
import { PET_FORM_STYLES } from "../features/pet/pet-form.config";

type ActionButtonsProps = {
  mode: "create" | "edit";
  loading: boolean;
  onCancel: () => void;
  disabled?: boolean;
  isMobile?: boolean;
};

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  mode,
  loading,
  onCancel,
  disabled = false,
  isMobile = false,
}) => {
  const submitLabel = mode === "edit" ? "Update Pet" : "Create Pet";
  const loadingLabel = loading ? "Saving..." : submitLabel;

  const gridClass = isMobile
    ? PET_FORM_STYLES.grid.buttons.mobile   // "mt-3 grid grid-cols-2 gap-3 md:hidden"
    : PET_FORM_STYLES.grid.buttons.desktop; // "mt-3 hidden md:grid grid-cols-2 gap-3"

  const buttonSpacing = isMobile ? "" : "px-6";
  const cancelClass = isMobile ? "" : "justify-self-start";
  const submitClass = isMobile ? "" : "justify-self-end";

  return (
    <div className={gridClass}>
      {/* Cancel */}
      <button
        type="button"
        onClick={onCancel}
        className={`${PET_FORM_STYLES.button.cancel} ${buttonSpacing} ${cancelClass}`}
        aria-label="Cancel"
      >
        Cancel
      </button>

      {/* Submit */}
      <button
        type="submit"
        disabled={disabled || loading}
        className={`${PET_FORM_STYLES.button.submit} ${buttonSpacing} ${submitClass} ${
          (disabled || loading) ? "opacity-50 cursor-not-allowed" : ""
        }`}
        aria-label={submitLabel}
      >
        {loadingLabel}
      </button>
    </div>
  );
};