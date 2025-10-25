import { createNotification } from '@/pages/api/notifications/create';

/**
 * 🔔 Pet Sitter App - Essential Notifications
 * 
 * ระบบ notification ที่จำเป็นสำหรับ Pet Sitter App
 * ครอบคลุมทุก user journey และ business logic
 */

// ===== BOOKING NOTIFICATIONS =====

/**
 * การจองใหม่ - แจ้ง sitter
 */
export async function notifyNewBooking(sitterId: number, customerName: string, petNames: string[], bookingDate: string) {
  return await createNotification({
    userId: sitterId,
    type: 'booking',
    title: 'New Booking Request! 🐕',
    message: `${customerName} wants to book pet sitting for ${petNames.join(', ')} on ${bookingDate}`,
  });
}

/**
 * การยืนยันการจอง - แจ้ง customer
 */
export async function notifyBookingConfirmed(customerId: number, sitterName: string, bookingDate: string) {
  return await createNotification({
    userId: customerId,
    type: 'booking',
    title: 'Booking Confirmed! 🎉',
    message: `Your booking with ${sitterName} on ${bookingDate} has been confirmed`,
  });
}

/**
 * การยกเลิกการจอง - แจ้ง customer
 */
export async function notifyBookingCancelled(customerId: number, sitterName: string, reason?: string) {
  return await createNotification({
    userId: customerId,
    type: 'booking',
    title: 'Booking Cancelled ❌',
    message: `Your booking with ${sitterName} has been cancelled${reason ? `. Reason: ${reason}` : ''}`,
  });
}

/**
 * การจองเสร็จสิ้น - แจ้ง customer
 */
export async function notifyBookingCompleted(customerId: number, sitterName: string) {
  return await createNotification({
    userId: customerId,
    type: 'booking',
    title: 'Service Completed! ✅',
    message: `Your pet sitting service with ${sitterName} has been completed. Please leave a review!`,
  });
}

// ===== PAYMENT NOTIFICATIONS =====

/**
 * การชำระเงินสำเร็จ - แจ้ง customer
 */
export async function notifyPaymentSuccess(customerId: number, amount: number, bookingDate: string) {
  console.log('Creating payment notification with type: payment');
  const result = await createNotification({
    userId: customerId,
    type: 'payment',
    title: 'Payment Successful! 💳',
    message: `Payment of ฿${amount} for booking on ${bookingDate} has been processed successfully`,
  });
  console.log('Payment notification result:', result);
  return result;
}

/**
 * การชำระเงินล้มเหลว - แจ้ง customer
 */
export async function notifyPaymentFailed(customerId: number, amount: number) {
  return await createNotification({
    userId: customerId,
    type: 'system',
    title: 'Payment Failed ❌',
    message: `Payment of ฿${amount} could not be processed. Please try again or contact support.`,
  });
}

// ===== CHAT NOTIFICATIONS =====

/**
 * ข้อความใหม่ - แจ้งผู้รับ
 */
export async function notifyNewMessage(receiverId: number, senderName: string, messagePreview: string) {
  return await createNotification({
    userId: receiverId,
    type: 'message',
    title: `New Message from ${senderName} 💬`,
    message: messagePreview.length > 50 ? `${messagePreview.substring(0, 50)}...` : messagePreview,
  });
}

// ===== REVIEW NOTIFICATIONS =====

/**
 * รีวิวใหม่ - แจ้ง sitter
 */
export async function notifyNewReview(sitterUserId: number, customerName: string, rating: number) {
  const stars = '⭐'.repeat(rating);
  return await createNotification({
    userId: sitterUserId,
    type: 'system',
    title: 'New Review Received! 🌟',
    message: `${customerName} left you a ${rating}-star review: ${stars}`,
  });
}

/**
 * รีวิวตอบกลับ - แจ้ง customer
 */
export async function notifyReviewResponse(customerId: number, sitterName: string) {
  return await createNotification({
    userId: customerId,
    type: 'system',
    title: 'Review Response 💬',
    message: `${sitterName} has responded to your review`,
  });
}

// ===== ADMIN NOTIFICATIONS =====

/**
 * บัญชีถูกแบน - แจ้ง user
 */
export async function notifyAccountBanned(userId: number, reason: string, adminName: string) {
  return await createNotification({
    userId,
    type: 'admin',
    title: 'Account Suspended ⚠️',
    message: `Your account has been suspended by ${adminName}. Reason: ${reason}`,
  });
}

/**
 * บัญชีถูกปลดแบน - แจ้ง user
 */
export async function notifyAccountUnbanned(userId: number, adminName: string) {
  return await createNotification({
    userId,
    type: 'admin',
    title: 'Account Restored ✅',
    message: `Your account has been restored by ${adminName}. You can now use our services again.`,
  });
}

/**
 * Pet ถูกแบน - แจ้ง owner
 */
export async function notifyPetBanned(ownerId: number, petName: string, reason: string) {
  return await createNotification({
    userId: ownerId,
    type: 'admin',
    title: 'Pet Profile Suspended 🐾⚠️',
    message: `Your pet "${petName}" profile has been suspended. Reason: ${reason}`,
  });
}

// ===== SYSTEM NOTIFICATIONS =====

/**
 * การอัปเดตระบบ - แจ้งทุกคน
 */
export async function notifySystemUpdate(userId: number, updateTitle: string, updateMessage: string) {
  return await createNotification({
    userId,
    type: 'system',
    title: `System Update: ${updateTitle} 🔄`,
    message: updateMessage,
  });
}

/**
 * การบำรุงรักษาระบบ - แจ้งล่วงหน้า
 */
export async function notifyMaintenance(userId: number, maintenanceDate: string, duration: string) {
  return await createNotification({
    userId,
    type: 'system',
    title: 'Scheduled Maintenance 🔧',
    message: `System maintenance scheduled for ${maintenanceDate}. Expected downtime: ${duration}`,
  });
}

// ===== SECURITY NOTIFICATIONS =====

/**
 * การเข้าสู่ระบบจากอุปกรณ์ใหม่ - แจ้ง user
 */
export async function notifyNewDeviceLogin(userId: number, deviceInfo: string, location: string) {
  return await createNotification({
    userId,
    type: 'system',
    title: 'New Device Login 🔐',
    message: `Your account was accessed from ${deviceInfo} in ${location}. If this wasn't you, please secure your account.`,
  });
}

/**
 * การเปลี่ยนรหัสผ่าน - แจ้ง user
 */
export async function notifyPasswordChanged(userId: number) {
  return await createNotification({
    userId,
    type: 'system',
    title: 'Password Changed 🔑',
    message: 'Your password has been successfully changed. If you did not make this change, please contact support immediately.',
  });
}

// ===== PROMOTIONAL NOTIFICATIONS =====

/**
 * โปรโมชั่นใหม่ - แจ้ง user
 */
export async function notifyPromotion(userId: number, promotionTitle: string, discount: string, validUntil: string) {
  return await createNotification({
    userId,
    type: 'system',
    title: `Special Offer: ${promotionTitle} 🎉`,
    message: `Get ${discount} off your next booking! Valid until ${validUntil}`,
  });
}

/**
 * ฟีเจอร์ใหม่ - แจ้ง user
 */
export async function notifyNewFeature(userId: number, featureName: string, featureDescription: string) {
  return await createNotification({
    userId,
    type: 'system',
    title: `New Feature: ${featureName} ✨`,
    message: featureDescription,
  });
}

// ===== REMINDER NOTIFICATIONS =====

/**
 * เตือนการจองใกล้เข้ามา - แจ้ง customer
 */
export async function notifyBookingReminder(customerId: number, sitterName: string, bookingDate: string, timeUntil: string) {
  return await createNotification({
    userId: customerId,
    type: 'booking',
    title: 'Booking Reminder ⏰',
    message: `Your booking with ${sitterName} on ${bookingDate} is ${timeUntil}. Please prepare your pet!`,
  });
}

/**
 * เตือนให้รีวิว - แจ้ง customer
 */
export async function notifyReviewReminder(customerId: number, sitterName: string, daysSince: number) {
  return await createNotification({
    userId: customerId,
    type: 'system',
    title: 'Please Leave a Review ⭐',
    message: `How was your experience with ${sitterName}? It's been ${daysSince} days since your service.`,
  });
}

/**
 * Pet Registration - แจ้ง user เมื่อเพิ่ม pet ใหม่
 */
export async function notifyPetRegistration(userId: number, petName: string, petType: string) {
  return await createNotification({
    userId,
    type: 'system',
    title: 'Pet Added Successfully! 🐾',
    message: `Your pet "${petName}" (${petType}) has been added to your profile.`,
  });
}

/**
 * Profile Update - แจ้ง user เมื่ออัปเดต profile
 */
export async function notifyProfileUpdate(userId: number) {
  return await createNotification({
    userId,
    type: 'system',
    title: 'Profile Updated! 👤',
    message: 'Your profile information has been successfully updated.',
  });
}

/**
 * Pet Ban - แจ้ง owner เมื่อ pet ถูก ban
 */
export async function notifyPetBan(userId: number, petName: string, reason?: string) {
  return await createNotification({
    userId,
    type: 'admin',
    title: `Pet "${petName}" Banned 🚫`,
    message: `Your pet "${petName}" has been banned. Reason: ${reason || 'Violated policy'}.`,
  });
}

/**
 * Pet Unban - แจ้ง owner เมื่อ pet ถูก unban
 */
export async function notifyPetUnban(userId: number, petName: string) {
  return await createNotification({
    userId,
    type: 'admin',
    title: `Pet "${petName}" Unbanned ✅`,
    message: `Your pet "${petName}" has been unbanned.`,
  });
}
