import { z } from "zod";

const ERROR_MESSAGES = {
    isCreditCard: "Payment method is required",
    sitterId: "Sitter ID is required",
    petIds: "Pet ID(s) are required",
    customerName: "Customer name is required",
    customerEmail: "Invalid email address",
    customerPhone: "Phone number must be between 8 and 20 digits",
    startTime: "Start time is required",
    endTime: "End time is required",
    dateRange: "End time must be later than start time",
} as const;

/**
 * ตัวตรวจสอบความถูกต้องของข้อมูลแต่ละฟิลด์
 * ใช้ z.coerce เพื่อให้ค่าที่มาจาก form (string) แปลงอัตโนมัติเป็นชนิดที่ต้องการ
*/
const validators = {
    isCreditCard: z.boolean({ message: ERROR_MESSAGES.isCreditCard }),

    sitterId: z.coerce.number().int().positive(ERROR_MESSAGES.sitterId),

    // petIds อาจมาหลายตัวในรูป string เช่น "1,2,3" → แปลงเป็น array<number>
    petIds: z
        .string()
        .trim()
        .min(1, ERROR_MESSAGES.petIds)
        .transform((val) =>
            val
                .split(",")
                .map((v) => Number(v.trim()))
                .filter((v) => !isNaN(v))
        ),

    customerName: z.string().trim().min(1, ERROR_MESSAGES.customerName),

    customerEmail: z
        .string()
        .trim()
        .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, ERROR_MESSAGES.customerEmail),

    customerPhone: z
        .string()
        .trim()
        .min(8, ERROR_MESSAGES.customerPhone)
        .max(20, ERROR_MESSAGES.customerPhone),

    additionalMessage: z.string().trim().optional().or(z.literal("")),

    startTime: z.coerce
        .date()
        .refine((v) => v instanceof Date && !isNaN(v.getTime()), {
            message: ERROR_MESSAGES.startTime,
        }),

    endTime: z.coerce
        .date()
        .refine((v) => v instanceof Date && !isNaN(v.getTime()), {
            message: ERROR_MESSAGES.endTime,
        }),
};

/**
 * สร้าง Schema สำหรับ validate booking metadata
 * - ตรวจสอบทุกฟิลด์จาก metadata
 * - ตรวจว่า endTime ต้องหลัง startTime
*/
export const bookingMetadataSchema = z
    .object({
        isCreditCard: validators.isCreditCard,
        sitterId: validators.sitterId,
        petIds: validators.petIds,
        startTime: validators.startTime,
        endTime: validators.endTime,
        customerName: validators.customerName,
        customerEmail: validators.customerEmail,
        customerPhone: validators.customerPhone,
        additionalMessage: validators.additionalMessage,
    })
    .refine((data) => data.endTime > data.startTime, {
        message: ERROR_MESSAGES.dateRange,
        path: ["endTime"],
    });


    
/**
 * Type ที่ได้จาก schema (ใช้ใน TypeScript)
*/
export type BookingMetadata = z.infer<typeof bookingMetadataSchema>;

export const ReviewSchema = z.object({
    sitterId: z.coerce.number().int().positive(),
    userId: z.coerce.number().int().positive(),
    rating: z.coerce.number().min(1).max(5),
    comment: z.string().min(5).max(500),
  })
  
  export type ReviewInput = z.infer<typeof ReviewSchema>;
  
  /* --------------------------------------------------
   🚨 Report Schema
  -------------------------------------------------- */
  export const ReportSchema = z.object({
    userId: z.coerce.number().int().positive(),
    sitterId: z.coerce.number().int().positive().optional(),
    title: z.string().min(5).max(80),
    description: z.string().min(10).max(800),
  });
  
  export type ReportInput = z.infer<typeof ReportSchema>;
