import type { NextApiRequest, NextApiResponse } from "next";
// [ADDED] ใส่ชนิดจาก formidable เพื่อตัด any ออกให้หมด
import {
  IncomingForm,
  type Fields,
  type Files,
  type File as FormidableFile,
} from "formidable";
import { cloudinary } from "@/lib/cloudinary";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const form = new IncomingForm({ keepExtensions: true });

  // [CHANGED] ใส่ชนิดให้ callback ของ form.parse (err, fields, files)
  form.parse(req, async (err: Error | null, fields: Fields, files: Files) => {
    try {
      // [CHANGED] เข้าถึงไฟล์แบบมีชนิด ไม่ใช้ any
      const fileField = (files as Files & {
        file?: FormidableFile | FormidableFile[];
      }).file;

      // [CHANGED] เช็ก err และกรณีไม่มีไฟล์อย่างชัดเจน
      if (err || !fileField) {
        return res.status(400).json({ message: "Invalid upload" });
      }

      // [CHANGED] รองรับทั้งเดี่ยวและ array
      const file = Array.isArray(fileField) ? fileField[0] : fileField;

      // [ADDED] รองรับการส่งโฟลเดอร์จากฝั่ง client (ถ้าไม่ส่ง จะ fallback เป็น "pet-sitter-app")
      // Fields ของ formidable คือ string | string[] ต่อคีย์
      const folderField = (fields["folder"] ?? undefined) as string | string[] | undefined;
      const folder =
        (Array.isArray(folderField) ? folderField[0] : folderField) || "pet-sitter-app";

      // [CHANGED] เพิ่ม option  และใช้ folder แบบกำหนดเองได้
      const upload = await cloudinary.uploader.upload(file.filepath, {
        folder,
        resource_type: "image",
        unique_filename: true,
        overwrite: false,
      });

      // [CHANGED] ส่งคืนทั้ง secure_url และ public_id เผื่อเก็บใน DB
      return res.status(200).json({ url: upload.secure_url, public_id: upload.public_id });
    } catch (error: unknown) {
      console.error("Upload error:", error);
      return res.status(500).json({ message: "Upload failed" });
    }
  });
}