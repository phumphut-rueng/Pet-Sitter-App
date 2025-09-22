import { z } from "zod";

export const OwnerProfileSchema = z.object({
  name: z.string().min(6, "ชื่อขั้นต่ำ 6 ตัวอักษร").max(20, "ชื่อยาวเกิน 20 ตัวอักษร"),
  email: z
    .string()
    .email("รูปแบบอีเมลไม่ถูกต้อง"),
  phone: z
    .string()
    .regex(/^0\d{9}$/, "เบอร์โทรต้องขึ้นต้นด้วย 0 และยาว 10 หลัก"),
  // UI มี แต่ DB ยังไม่มีคอลัมน์
  idNumber: z.string().optional().or(z.literal("")),
  // UI: ใช้ input type=date (string 'YYYY-MM-DD') -> backend แปลงเป็น Date
  dob: z.string().optional().or(z.literal("")),
  profileImage: z.string().url().optional().or(z.literal("")),
});

export type OwnerProfileValues = z.infer<typeof OwnerProfileSchema>;