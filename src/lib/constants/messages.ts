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



