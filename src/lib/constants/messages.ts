// ข้อความ error/success 
export const ERROR_MESSAGES = {
  loadFailed: "Failed to load data.",
  saveFailed: "Something went wrong. Please try again.",
  fixFields: "Please fix the highlighted fields.",
  unknown: "Something went wrong.",
} as const;

export const SUCCESS_MESSAGES = {
  created: "Created successfully!",
  updated: "Updated successfully!",
  deleted: "Deleted successfully!",
  profileUpdated: "Profile updated!",
  petCreated: "Pet created!",
  petUpdated: "Pet updated!",
  petDeleted: "Pet deleted!",
} as const;

export const PET_ERROR_MESSAGES = {
  loadFailed: "Failed to load pet",
  updateFailed: "Update failed",
  deleteFailed: "Delete failed",
  createFailed: "Create failed",
  invalidPetType: "Please select a valid Pet Type",
  unknown: "Unknown error",
} as const;

export const PET_SUCCESS_MESSAGES = {
  petCreated: "Pet created!",
  petUpdated: "Pet updated!",
  petDeleted: "Pet deleted!",
} as const;

// Change Password messages
export const PASSWORD_ERROR_MESSAGES = {
  allFieldsRequired: "Please fill in all fields.",
  passwordMismatch: "Passwords do not match.",
  passwordRequirements: "Password must be at least 8 characters and contain both letters and numbers.",
  changeFailed: "Failed to change password.",
  unknown: "Something went wrong. Please try again.",
  userNotFound: "User not found.",
  googleAccountRestriction: "Google accounts cannot change password here.",
  invalidToken: "Invalid or expired token.",
  missingData: "Missing required data.",
} as const;

export const PASSWORD_SUCCESS_MESSAGES = {
  passwordChanged: "Password updated successfully!",
  passwordReset: "Password reset successfully!",
  resetEmailSent: "If this email exists, we've sent reset instructions.",
} as const;