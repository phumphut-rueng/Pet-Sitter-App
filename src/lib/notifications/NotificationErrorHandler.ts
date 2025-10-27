import { ERROR_MESSAGES, extractErrorMessage } from '@/lib/constants/messages';
import toast from 'react-hot-toast';

export class NotificationErrorHandler {
  /**
   * Handle notification fetch errors
   */
  static handleFetchError(error: unknown): string {
    console.error('Notification fetch error:', error);
    
    // Don't show toast for silent errors (401, 500)
    const message = extractErrorMessage(error);
    if (message.includes('401') || message.includes('500')) {
      return ERROR_MESSAGES.NOTIFICATION_FETCH_FAILED;
    }
    
    toast.error(ERROR_MESSAGES.NOTIFICATION_FETCH_FAILED);
    return ERROR_MESSAGES.NOTIFICATION_FETCH_FAILED;
  }

  /**
   * Handle notification create errors
   */
  static handleCreateError(error: unknown): string {
    console.error('Notification create error:', error);
    
    // Don't show toast for notification creation failures
    // as they are secondary features
    return ERROR_MESSAGES.NOTIFICATION_CREATE_FAILED;
  }

  /**
   * Handle notification update errors
   */
  static handleUpdateError(error: unknown): string {
    console.error('Notification update error:', error);
    
    toast.error(ERROR_MESSAGES.NOTIFICATION_UPDATE_FAILED);
    return ERROR_MESSAGES.NOTIFICATION_UPDATE_FAILED;
  }

  /**
   * Handle notification delete errors
   */
  static handleDeleteError(error: unknown): string {
    console.error('Notification delete error:', error);
    
    toast.error(ERROR_MESSAGES.NOTIFICATION_DELETE_FAILED);
    return ERROR_MESSAGES.NOTIFICATION_DELETE_FAILED;
  }

  /**
   * Handle generic notification errors
   */
  static handleGenericError(error: unknown, context: string): string {
    console.error(`Notification ${context} error:`, error);
    
    return ERROR_MESSAGES.unknown;
  }
}
