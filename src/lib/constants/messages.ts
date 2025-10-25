// ข้อความ error/success 
export const ERROR_MESSAGES = {
  // Generic errors
  loadFailed: "Failed to load data.",
  saveFailed: "Something went wrong. Please try again.",
  fixFields: "Please fix the highlighted fields.",
  unknown: "Something went wrong.",
  
  // Network errors
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.',
  
  // Authentication errors
  UNAUTHORIZED: 'Please log in to continue.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  
  // Notification errors
  NOTIFICATION_FETCH_FAILED: 'Failed to load notifications',
  NOTIFICATION_CREATE_FAILED: 'Failed to create notification',
  NOTIFICATION_UPDATE_FAILED: 'Failed to update notification',
  NOTIFICATION_DELETE_FAILED: 'Failed to delete notification',
  
  // Booking errors
  BOOKING_NOT_FOUND: 'Booking not found',
  BOOKING_UPDATE_FAILED: 'Failed to update booking status',
  BOOKING_CREATE_FAILED: 'Failed to create booking',
  
  // Review errors
  REVIEW_SUBMIT_FAILED: 'Failed to submit review',
  REVIEW_ALREADY_EXISTS: 'You have already reviewed this sitter',
  
  // Payment errors
  PAYMENT_FAILED: 'Payment processing failed',
  PAYMENT_INVALID: 'Invalid payment information',
  
  // Chat errors
  CHAT_CREATE_FAILED: 'Failed to create chat',
  MESSAGE_SEND_FAILED: 'Failed to send message',
  
  // Server errors
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
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
  imageTooLarge: "Image is too large", 
} as const;

// Re-export for backward compatibility
export const PET_SUCCESS_MESSAGES = SUCCESS_MESSAGES;

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

// Helper functions for error handling
export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;

export function getErrorMessage(key: ErrorMessageKey, fallback?: string): string {
  return ERROR_MESSAGES[key] || fallback || ERROR_MESSAGES.unknown;
}

export function extractErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error;
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  
  return ERROR_MESSAGES.unknown;
}