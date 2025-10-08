export type errorType = "" | "Conflict";

export interface FieldValidation {
    error?: errorType
    message: string
    data?: object;
}
