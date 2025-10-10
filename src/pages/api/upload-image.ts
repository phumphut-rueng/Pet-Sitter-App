import type { NextApiRequest, NextApiResponse } from "next";
// [ADDED] นำเข้าชนิดจาก formidable เพื่อเลิกใช้ any และได้ type safety
import {
  IncomingForm,
  type Fields,
  type Files,
  type File as FormidableFile,
} from "formidable";
import { cloudinary } from "@/lib/cloudinary/server";

export const config = {
  api: {
    bodyParser: false, // [ADDED] ปิด bodyParser ของ Next เพื่อให้ formidable อ่านไฟล์ได้จาก stream
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  } // [UNCHANGED] guard เมธอด

  // [ADDED] สร้างฟอร์มพร้อม keepExtensions เพื่อคงนามสกุลไฟล์ชั่วคราว
  const form = new IncomingForm({ keepExtensions: true });

  // [CHANGED] ใส่ชนิด arguments ให้ callback ของ form.parse → (err, fields, files)
  form.parse(req, async (err: Error | null, fields: Fields, files: Files) => {
    try {
      // [CHANGED] เข้าถึงไฟล์แบบมีชนิด ไม่ใช้ any และรองรับทั้ง single/array
      const fileField = (files as Files & {
        file?: FormidableFile | FormidableFile[];
      }).file;

      // [CHANGED] จัดการกรณี error หรือไม่มีไฟล์ ส่ง 400 ชัดเจน
      if (err || !fileField) {
        return res.status(400).json({ message: "Invalid upload" });
      }

      // [CHANGED] รองรับทั้งเดี่ยวและ array เอาตัวแรกพอ
      const file = Array.isArray(fileField) ? fileField[0] : fileField;

      // [ADDED] รองรับการส่งชื่อโฟลเดอร์จาก client ผ่าน form-data: folder
      // Fields ของ formidable มีชนิดเป็น string | string[] ต่อคีย์
      const folderField = (fields["folder"] ?? undefined) as string | string[] | undefined;
      const folder =
        (Array.isArray(folderField) ? folderField[0] : folderField) || "pet-sitter-app"; // [ADDED] fallback โฟลเดอร์เริ่มต้น

      // [CHANGED] อัปโหลดขึ้น Cloudinary โดยใช้ folder แบบ dynamic และไม่ overwrite ชื่อซ้ำ
      const upload = await cloudinary.uploader.upload(file.filepath, {
        folder,
        resource_type: "image",
        unique_filename: true,
        overwrite: false,
      });

      // [CHANGED] ส่งคืนทั้ง secure_url (ไว้ preview ฝั่ง FE) และ public_id (ให้เก็บลง DB)
      // ข้อแนะนำ: เก็บ "public_id" ลง DB เท่านั้น เลี่ยงการเก็บ URL เต็มเพื่อลดปัญหา 404/เวอร์ชัน
      return res.status(200).json({ url: upload.secure_url, public_id: upload.public_id });
    } catch (error: unknown) {
      console.error("Upload error:", error);
      return res.status(500).json({ message: "Upload failed" }); // [ADDED] แคปเจอร์ error รวม
    }
  });
}