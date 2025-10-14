import * as React from "react";
import { PET_FORM_STYLES } from "../features/pet/pet-form.config";

type ActionButtonsProps = {
  mode: "create" | "edit";
  loading: boolean;
  onCancel: () => void;
  disabled?: boolean;  // ✨ เพิ่มบรรทัดนี้
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
    ? PET_FORM_STYLES.grid.buttons.mobile
    : PET_FORM_STYLES.grid.buttons.desktop;
  const buttonSpacing = isMobile ? "" : "px-6";
  const cancelClass = isMobile ? "" : "justify-self-start";
  const submitClass = isMobile ? "" : "justify-self-end";

  return (
    <div className={gridClass}>
      <button
        type="button"
        onClick={onCancel}
        className={`${PET_FORM_STYLES.button.cancel} ${buttonSpacing} ${cancelClass}`}
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={disabled || loading} 
        className={`${PET_FORM_STYLES.button.submit} ${buttonSpacing} ${submitClass} ${
          (disabled || loading) ? "opacity-50 cursor-not-allowed" : "" 
        }`}
      >
        {loadingLabel}
      </button>
    </div>
  );
};