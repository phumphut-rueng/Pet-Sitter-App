/**
 * Shared types for API responses
 */

export type ErrorResponse = {
  message: string;
  [key: string]: unknown;
};

export type SuccessResponse<T = unknown> = {
  data: T;
  message?: string;
};

export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

