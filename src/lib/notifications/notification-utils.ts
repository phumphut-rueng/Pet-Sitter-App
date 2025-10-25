import { createNotification } from '@/pages/api/notifications/create';

/**
 * สร้าง notification สำหรับข้อความใหม่
 */
export async function createMessageNotification(userId: number, senderName: string) {
  return await createNotification({
    userId,
    type: 'message',
    title: 'New Message',
    message: `You have a new message from ${senderName}`,
  });
}

/**
 * สร้าง notification สำหรับการจอง
 */
export async function createBookingNotification(userId: number, sitterName: string, action: 'confirmed' | 'cancelled' | 'completed' | 'in_service') {
  const actionText = {
    confirmed: 'confirmed',
    cancelled: 'cancelled',
    completed: 'completed',
    in_service: 'in service',
  }[action];

  const titleText = {
    confirmed: 'Booking Confirmed! 🎉',
    cancelled: 'Booking Cancelled',
    completed: 'Service Completed! ✅',
    in_service: 'Service Started! 🚀',
  }[action];

  return await createNotification({
    userId,
    type: 'booking',
    title: titleText,
    message: `Your booking with ${sitterName} has been ${actionText}`,
  });
}

/**
 * สร้าง notification สำหรับระบบ
 */
export async function createSystemNotification(userId: number, title: string, message: string) {
  return await createNotification({
    userId,
    type: 'system',
    title,
    message,
  });
}

/**
 * สร้าง notification สำหรับ Admin
 */
export async function createAdminNotification(userId: number, title: string, message: string) {
  return await createNotification({
    userId,
    type: 'admin',
    title,
    message,
  });
}

/**
 * สร้าง notification สำหรับการแบน/ปลดแบน
 */
export async function createBanNotification(userId: number, action: 'banned' | 'unbanned', reason?: string) {
  const actionText = action === 'banned' ? 'banned' : 'unbanned';
  const reasonText = reason ? ` Reason: ${reason}` : '';
  
  return await createNotification({
    userId,
    type: 'admin',
    title: `Account ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`,
    message: `Your account has been ${actionText}.${reasonText}`,
  });
}

/**
 * สร้าง notification สำหรับ Pet ban
 */
export async function createPetBanNotification(userId: number, petName: string, action: 'banned' | 'unbanned', reason?: string) {
  const actionText = action === 'banned' ? 'suspended' : 'unsuspended';
  const reasonText = reason ? ` Reason: ${reason}` : '';
  
  return await createNotification({
    userId,
    type: 'admin',
    title: `Pet ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`,
    message: `Your pet "${petName}" has been ${actionText}.${reasonText}`,
  });
}
